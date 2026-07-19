/* 욕망의 칼 (가제) — 웹 리더
   누리 스펙 구현: 화 파싱 / 시각 스타일 / 읽음 판정 / 다음 화 잠금 / 진행 저장
   원고는 content.js 의 window.KOD_RAW 에서 읽는다(file:// fetch CORS 회피). */
(function () {
  "use strict";

  // 뷰 라우팅 가드(신규): 기획서(deck)·트리트먼트 뷰에서는 시나리오 리더를 기동하지 않는다.
  // view 파라미터가 없거나 그 외 값이면 기존 동작(?ep=N / 무파라미터 = 시나리오 리더) 그대로.
  var _view = new URLSearchParams(window.location.search).get("view");
  if (_view === "deck" || _view === "treatment") return;

  var STORAGE_KEY = "kod_reader_progress";

  /* -------------------------------------------------------------------
     1. 파싱
     ------------------------------------------------------------------- */

  // 렌더링에서 제외할 라인: 문서 제목/막 구분(# ...), 라인 전체 이탤릭 메타(*...*), 구분선(---)
  function isExcludedLine(line) {
    var t = line.trim();
    if (t === "") return false; // 빈 줄은 블록 구분용으로 보존
    if (/^#\s/.test(t)) return true;            // # 제목 / # N막 ...
    if (/^---+$/.test(t)) return true;          // 구분선
    if (/^\*[^*].*\*$/.test(t)) return true;    // 라인 전체 이탤릭 메타 *...*
    return false;
  }

  var EP_RE = /^##\s+(\d+)화\.\s*(.+)$/;

  // 원고 전체 → 화 배열 [{ no, title, blocks }]
  function parseEpisodes(raw) {
    var lines = raw.replace(/\r\n/g, "\n").split("\n");
    var episodes = [];
    var current = null;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var m = line.match(EP_RE);
      if (m) {
        current = { no: parseInt(m[1], 10), title: m[2].trim(), raw: [] };
        episodes.push(current);
        continue;
      }
      if (current) current.raw.push(line);
    }

    episodes.forEach(function (ep) {
      ep.blocks = parseBlocks(ep.raw);
      delete ep.raw;
    });
    return episodes;
  }

  // 화 본문 라인 → 블록 배열. 빈 줄로 분리, 제외 라인은 걸러냄.
  function parseBlocks(rawLines) {
    // 제외 라인 제거(빈 줄 구조는 유지)
    var kept = rawLines.map(function (l) {
      return isExcludedLine(l) ? "" : l;
    });

    var blocks = [];
    var buf = [];
    function flush() {
      if (buf.length) {
        blocks.push(classifyBlock(buf.slice()));
        buf = [];
      }
    }
    for (var i = 0; i < kept.length; i++) {
      if (kept[i].trim() === "") {
        flush();
      } else {
        buf.push(kept[i].replace(/\s+$/, ""));
      }
    }
    flush();
    return blocks;
  }

  var NAME_RE = /^[가-힣A-Za-z0-9 ]{1,10}$/;
  var SENTENCE_END_RE = /[.!?…。？！]$/;

  function classifyBlock(bl) {
    var first = bl[0].trim();

    // (1) 씬 헤딩 — 첫 줄이 S# 로 시작
    if (/^S#\S*/.test(first)) {
      return { type: "scene", text: bl.join(" ").trim() };
    }

    // (2) 대사 블록 — 2줄 이상 + 첫 줄이 캐릭터명 패턴이며 종결부호로 안 끝남
    if (
      bl.length >= 2 &&
      NAME_RE.test(first) &&
      !SENTENCE_END_RE.test(first)
    ) {
      var rest = bl.slice(1);
      var paren = null;
      if (rest.length && /^\(.*\)$/.test(rest[0].trim())) {
        paren = rest[0].trim();
        rest = rest.slice(1);
      }
      return { type: "dialogue", name: first, paren: paren, lines: rest };
    }

    // (3) 지문
    return { type: "action", lines: bl };
  }

  /* -------------------------------------------------------------------
     2. 렌더링
     ------------------------------------------------------------------- */

  function esc(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // 지문 내 인라인 이탤릭 *...* → <em> (라인 전체 이탤릭 메타는 이미 제외됨)
  function inlineEmphasis(s) {
    return esc(s).replace(/\*([^*]+)\*/g, "<em>$1</em>");
  }

  function renderEpisode(ep) {
    var host = document.getElementById("episode");
    document.getElementById("epno").textContent = ep.no + "화";
    document.getElementById("eptitle").textContent = ep.title;

    var html = "";
    ep.blocks.forEach(function (b) {
      if (b.type === "scene") {
        html += '<p class="blk blk--scene">' + esc(b.text) + "</p>";
      } else if (b.type === "dialogue") {
        html += '<div class="blk blk--dialogue">';
        html += '<p class="dlg__name">' + esc(b.name) + "</p>";
        if (b.paren) {
          html += '<p class="dlg__paren">' + esc(b.paren) + "</p>";
        }
        b.lines.forEach(function (ln) {
          html += '<p class="dlg__line">' + inlineEmphasis(ln) + "</p>";
        });
        html += "</div>";
      } else {
        b.lines.forEach(function (ln) {
          html += '<p class="blk blk--action">' + inlineEmphasis(ln) + "</p>";
        });
      }
    });
    host.innerHTML = html;
  }

  /* -------------------------------------------------------------------
     3. 진행 상태 저장
     ------------------------------------------------------------------- */

  function loadProgress() {
    try {
      var v = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (v && typeof v.maxReadEpisode === "number") return v;
    } catch (e) {}
    return { maxReadEpisode: 0, lastEpisode: 0 };
  }

  function saveProgress(p) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch (e) {}
  }

  /* -------------------------------------------------------------------
     4. 앱
     ------------------------------------------------------------------- */

  var episodes = [];
  var progress = null;
  var currentNo = 1;
  var reachedEnd = false;
  var observer = null;

  var fab, fabIcon, toastEl, sentinel;
  var toastTimer = null;

  function totalCount() {
    return episodes.length;
  }
  function maxAccessible() {
    // 접근 가능한 최대 화 = maxReadEpisode + 1 (단, 전체 화 수 이내)
    return Math.min(progress.maxReadEpisode + 1, totalCount());
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2000);
  }

  function setFabLocked(locked) {
    if (locked) {
      fab.classList.add("is-locked");
      fab.classList.remove("is-unlocked");
      fabIcon.innerHTML = "&#128274;"; // 자물쇠
    } else {
      fab.classList.remove("is-locked");
      fab.classList.add("is-unlocked");
      fabIcon.innerHTML = "&#8594;"; // →
    }
  }

  function hasNext() {
    return currentNo < totalCount();
  }

  function markRead() {
    if (reachedEnd) return;
    reachedEnd = true;
    if (currentNo > progress.maxReadEpisode) {
      progress.maxReadEpisode = currentNo;
    }
    progress.lastEpisode = currentNo;
    saveProgress(progress);
    if (hasNext()) setFabLocked(false);
  }

  function observeSentinel() {
    if (observer) observer.disconnect();
    if (!("IntersectionObserver" in window)) {
      // 폴백: 스크롤로 하단 근접 판정
      return;
    }
    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) markRead();
        });
      },
      { root: null, threshold: 0 }
    );
    observer.observe(sentinel);
  }

  function scrollFallback() {
    if ("IntersectionObserver" in window) return;
    var rect = sentinel.getBoundingClientRect();
    if (rect.top <= window.innerHeight) markRead();
  }

  // 화 로드. push=true 면 URL 히스토리 갱신.
  function loadEpisode(no, opts) {
    opts = opts || {};
    var ep = episodes[no - 1];
    if (!ep) return;

    currentNo = no;
    reachedEnd = false;

    renderEpisode(ep);

    // 이미 읽은 화면 재진입 시엔 바로 해제 상태로
    var alreadyRead = no <= progress.maxReadEpisode;
    progress.lastEpisode = no;
    saveProgress(progress);

    setFabLocked(!(alreadyRead && hasNext()));

    // URL 파라미터 동기화
    var url = new URL(window.location.href);
    url.searchParams.set("ep", String(no));
    if (opts.replace) {
      window.history.replaceState({ ep: no }, "", url);
    } else {
      window.history.pushState({ ep: no }, "", url);
    }

    if (opts.scrollTop !== false) window.scrollTo(0, 0);

    observeSentinel();
    // 콘텐츠가 짧아 sentinel이 이미 보이는 경우 즉시 판정
    setTimeout(scrollFallback, 0);
  }

  function onFabClick() {
    if (fab.classList.contains("is-locked")) {
      if (!hasNext()) {
        showToast("마지막 화예요");
      } else {
        showToast("끝까지 읽으면 열려요");
      }
      return;
    }
    if (hasNext()) {
      loadEpisode(currentNo + 1, { scrollTop: true });
    }
  }

  // 진입 시 표시할 화 결정 (URL ep > lastEpisode > 1), 순차 잠금 리다이렉트 포함
  function resolveEntryEpisode() {
    var url = new URL(window.location.href);
    var epParam = parseInt(url.searchParams.get("ep"), 10);
    var target;

    if (!isNaN(epParam)) {
      target = epParam;
    } else if (progress.lastEpisode >= 1) {
      target = progress.lastEpisode;
    } else {
      target = 1;
    }

    if (target < 1) target = 1;
    // 미해금 화 직접 접근 → 마지막 허용 화로 리다이렉트
    var limit = maxAccessible();
    if (target > limit) target = limit;
    return target;
  }

  function init() {
    if (!window.KOD_RAW) {
      var host = document.getElementById("episode");
      if (host) host.textContent = "콘텐츠를 불러오지 못했습니다.";
      return;
    }

    episodes = parseEpisodes(window.KOD_RAW);
    progress = loadProgress();

    fab = document.getElementById("nextFab");
    fabIcon = document.getElementById("nextFabIcon");
    toastEl = document.getElementById("toast");
    sentinel = document.getElementById("sentinel");

    fab.addEventListener("click", onFabClick);
    window.addEventListener("scroll", scrollFallback, { passive: true });
    window.addEventListener("popstate", function () {
      var target = resolveEntryEpisode();
      loadEpisode(target, { replace: true, scrollTop: false });
    });

    var entry = resolveEntryEpisode();
    loadEpisode(entry, { replace: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
