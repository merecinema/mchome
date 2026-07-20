/* 욕망의 칼 (가제) — 기획서 뷰어 (좌우 페이지 넘김 · 7장)
   누리 화면 명세 v2 확정본 구현. 시나리오 리더(main.js)와 무관한 신규 넘김 패턴.
   장 순서: 표지 → 로그라인 → 작품개요 → 시놉시스 → 캐릭터 바이블 → 감독소개 → 제작사소개
   잠금/해금·이어보기 없음. 색상·폰트는 기존 다크 테마 변수 상속. */
(function () {
  "use strict";
  if (document.body.getAttribute("data-view") !== "deck") return;

  var host = document.getElementById("view-deck");
  if (!host) return;

  /* ---------------- 콘텐츠 데이터 ---------------- */

  // 시놉시스: 트리트먼트(V3) "1. 전체 서사 요약" 정리
  var SYNOPSIS = [
    "열여덟, 강도현은 수능 전날 밤 눈앞에서 부모가 도륙당하는 것을 방문 문틈으로 본다. 몸이 얼어 손바닥을 문에 붙인 채 죽은 듯 정지한 그는 살아남고, 살아남았다는 죄책감과 원수가 씌운 패륜살인범이라는 낙인을 함께 뒤집어쓴다. 경찰과 조직 양쪽에 쫓기다 남해의 외딴 섬으로 흘러든 그는 허름한 낚시 노인 ‘섬영감’을 만난다. 노인은 사실 전설의 칼잡이 보스, 하경천 — 도현의 친할아버지다. 도현의 아버지 강경우는 하경천이 숨겨 신분세탁해 조직 대표 자리에 앉힌 아들이었고, 그 자리를 핏줄 없는 오른팔 전태연이 도륙으로 빼앗은 것이 ‘거사의 밤’이었다.",
    "도현은 섬에서 자기가 3대 상속의 마지막 핏줄임을 알게 된다. 5년간 칼을 익힌 그는 ‘서진우’라는 운전기사로 위장해 태연의 세계에 잠입한다. 그러나 도현이 섬을 떠난 직후, 태연은 자기를 거둬 키운 스승 하경천마저 자연사로 위장해 조용히 지운다. 도현은 그 손이 태연임을 알지만, 하경천을 ‘할아버지’라 부르며 따른 딸 전이서는 ‘오래 앓다 임종’으로 전해 듣는다 — 같은 죽음이 두 사람에게 정반대 얼굴로 도착한다.",
    "이서는 도현이 예상한 온실 인형이 아니다. 유리 감옥을 답답해하며 바깥세상의 냄새가 나는 서진우에게 끌리는, 진실에 굶주린 여자다. 두 사람은 사랑에 빠진다 — 이용하려던 계획이 도현 자신을 되찾는 유일한 길이 되어버린다. 사랑의 정점마다 도현은 자기도 통제 못 하는 조건반사 「검은 방」으로 잠깐 사라지고, 이서가 그 어둠 속에 함께 있어 주는 단 한 번의 밤이 도현의 임무를 진심으로 바꾼다. 그리고 그 어둠의 정체를 알고 싶어진 이서는, ‘기다리는 여자’가 되는 대신 사랑하는 남자의 정체를 스스로 추적하기 시작한다.",
    "문제는 이 사랑이 성립하는 순간 비극이 예약된다는 것. 도현이 이서를 사랑하는 것은 죽은 아버지·할아버지에 대한 복수를 배신하는 것이고, 이서가 도현을 사랑하는 것은 산 어머니를 죽이는 데 가담하는 것이다. 두 사람의 사랑은 서로에게 각자의 혈육을 죽이는 칼이 된다. 전태연은 그 두 칼끝이 만나는 단 하나의 교차점.",
    "이서의 추적은 도현이 지닌 문양 단검이 어린 시절 ‘할아버지의 손’으로 각인된 바로 그 칼임을 알아보는 데서 넘어가고, 그 비밀의 바닥에서 마침내 도현의 부모를 죽인 거사의 밤 실행자가 자기 어머니라는 진실과 마주친다. 두 미스터리는 처음부터 하나였다. 사랑하는 남자는 복수자이고 다정한 어머니는 그 복수를 받아 마땅한 괴물이라는 이중의 붕괴 속에서, 어머니의 ‘도현의 씨를 말려야 한다’는 혈통 말살 선언이 이서의 마지막 핏줄의 정을 경멸로 확정시킨다.",
    "클라이맥스는 방 하나, 인물 넷. 도현의 조용한 처형이 행동대장 곽의 난입으로 엉망진창의 사투가 되고, 곽을 죽인 도현이 만신창이의 태연 앞에 설 때 이서가 밀실로 난입한다 — ‘엄마를 살려줘, 내가 죗값을 치를게.’ 그 애원의 무게중심은 실은 어머니가 아니라 도현(‘당신이 살인자가 되지 않기를’) 쪽에 있다. 도현은 태연을 죽이지 않고 두 눈을 찔러 실명시킨다. 복수는 완성되지도 무너지지도 않은 채 미완으로 남는다."
  ];

  var HEART =
    "복수는 죽은 자를 위한 것이고 사랑은 산 자를 위한 것이다. 둘 다 자기 혈육일 때, 인간은 물려받은 칼을 누구에게 겨누는가 — 아니면, 처음으로 그 칼을 내리는 법을 스스로 택하는가.";

  // 캐릭터 바이블: 주요 3인 풀 카드 + 4인 간략 카드
  var CHARS = [
    {
      name: "강도현", sub: "위장명 서진우", pos: "주인공 · 3대 상속자이자 복수자", full: true,
      line: "남이 정해준 삶을 살아온 아이가, 자기 뿌리를 처음 마주하고, 사랑을 무기로 쓰는 법까지 배운 자.",
      want: "부모를 죽인 원수 전태연을 죽이고, 뒤집어쓴 패륜 낙인을 벗어 결백을 증명한다.",
      need: "다시 조건 없이 받아들여지는 것, 그리고 물려받은 뿌리를 운명이 아니라 자기 선택으로 다시 쥘 권리.",
      wound: "수능 전날 밤 문틈으로 부모의 도륙을 지켜보며 얼어붙었다 — 살아남은 죄책감과 패륜살인범 낙인의 이중 상실."
    },
    {
      name: "전태연", sub: "여, 50대", pos: "원수 · 찬탈자 / 이서의 친어머니", full: true,
      line: "은인의 아들과 유산을 찬탈하고도 그것을 정당한 승계라 믿는 자. 딸에겐 다정한 악마.",
      want: "조직을 통째로 자기 것으로, 그리고 유일한 친핏줄 딸 이서에게 흠집 없이 물려주는 것.",
      need: "자기 찬탈을 ‘정당한 승계’로 인정받고 죄의식으로부터 면제받는 것. 딸에게만은 좋은 어머니이고 싶은 강박이 그 다른 얼굴.",
      wound: "고아·미혼모로 떠돌다 하경천에게 처음 소속을 얻었으나, 그 자리가 핏줄이라는 이유로 낯선 아들에게 넘어가자 거사의 밤 강경우 일가를 직접 도륙했다."
    },
    {
      name: "전이서", sub: "20대 중반", pos: "딸 · 제2주인공 / 능동적 추적의 엔진", full: true,
      line: "세상에서 가장 다정한 어머니가 가장 잔인한 사람이었음을, 사랑하는 남자의 정체를 스스로 파고든 끝에 마주치는 여자.",
      want: "어머니의 그늘에서 벗어나 자기 삶을 살고 싶다. 그래서 바깥세상의 냄새가 나는 도현에게 끌린다.",
      need: "진실. 보호라는 이름의 거짓 속에 살아온 자의, 자기 삶에 대한 정직한 앎.",
      wound: "완벽하게 안전해서 완벽하게 비어 있는 세계 — 무엇을 잃었는지조차 알 수 없게 관리당한 유리 감옥."
    },
    {
      name: "하경천", sub: "별칭 섬영감 · 60대", pos: "조부 · 도현의 뿌리", full: false,
      line: "손자를 살리려면 칼을 쥐여줘야 하고, 쥐여주면 칼의 세계로 미는 진퇴양난의 조부.",
      brief: "은퇴한 전설의 칼잡이 보스. 숨긴 아들을 지키려던 모든 선택이 아들을 표적으로 만들었고, 끝내 자기가 거둬 키운 2인자 태연에게 자연사로 위장돼 지워진다. 손자에게 ‘안 벨 줄도 알아야 한다’는 마지막 반례를 남긴 시체."
    },
    {
      name: "강경우", sub: "유령 · 회상/사진으로만", pos: "도현의 부 · 도현의 거울", full: false,
      line: "자기 삶이 남이 써준 각본 같다는 위화감을 안고 살다, 바로 그 위장 때문에 죽은 남자.",
      brief: "하경천의 숨겨진 아들. 신분세탁돼 대표 자리에 앉혀진 설계된 존재. 자기 정체를 알면서도 거리를 둔 채 살았고, 그 어정쩡한 위장이 결국 그를 죽였다. 도현이 넘어서야 할 미래상."
    },
    {
      name: "곽", sub: "기능 인물", pos: "태연의 행동대장", full: false,
      line: "조용한 복수를 엉망진창의 사투로 뒤집는, 발각의 뇌관.",
      brief: "짐승 같은 직감과 개 같은 충성으로 태연 곁을 지킨다(태연에겐 도구일 뿐인 일방적 충성). 클라이맥스 밀실에서 도현의 조용한 처형을 난투로 뒤집고, 그 자리에서 도현의 손에 죽는다."
    },
    {
      name: "정만복", sub: "가제 · 기능 인물", pos: "부패 형사",  full: false,
      line: "이 세계에서 유일하게 가면을 쓰지 않은 자 — 그냥 돈을 밝히는 형사.",
      brief: "태연이 강도현 사건을 통째로 사들여 냉동시켰음을 손 벌리는 몸짓 하나로 육화하는 리빌의 얼굴. 사연도 자기정당화도 없이 돈이 좋아 돈을 받는, 가면들 사이의 유일한 민낯."
    }
  ];

  /* ---------------- HTML 빌드 ---------------- */

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function placeholderBox(lead, desc) {
    return (
      '<div class="placeholder deck-ph">' +
      '<p class="placeholder__lead">' + esc(lead) + "</p>" +
      '<p class="placeholder__desc">' + esc(desc) + "</p>" +
      "</div>"
    );
  }

  // 재사용 패턴: 풀블리드 16:9 이미지 + 하단 그라디언트 위 텍스트 오버레이
  // (추후 감독소개/제작사소개 페이지에도 src·내용만 바꿔 동일 클래스 적용 예정)
  function pageCover() {
    return (
      '<div class="deck-page__inner deck-page--photo deck-cover">' +
      '<div class="deck-photo">' +
      '<img class="deck-photo__img" src="scenaverse/images/cover.jpg" alt="욕망의 칼 키 비주얼" />' +
      '<div class="deck-photo__scrim"></div>' +
      '<div class="deck-photo__overlay">' +
      '<h1 class="deck-cover__title">욕망의 칼<span class="deck-cover__tag">(가제)</span></h1>' +
      '<p class="deck-cover__genre">숏폼 드라마 70부작 · 현대 조직범죄 상속 누아르 복수극 + 멜로 비극</p>' +
      '<p class="deck-cover__label">기획서</p>' +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function pageLogline() {
    return (
      '<div class="deck-page__inner deck-logline">' +
      '<p class="deck-section-label">로그라인</p>' +
      '<p class="deck-logline__text">물려받은 피와 물려받은 원한 사이에서, 사랑하는 여자를 무기로 써야만 빼앗긴 것을 되찾을 수 있을 때 — 그는 남이 써준 운명을 완성하는가, 자기를 잃는가, 아니면 처음으로 자기 뿌리를 스스로 선택하는가.</p>' +
      "</div>"
    );
  }

  function pageOverview() {
    var rows = [
      ["장르", "현대 조직범죄 상속 누아르 복수극 + 멜로 비극"],
      ["포맷", "숏폼 드라마 70부작 · 편당 1분 30초"],
      ["톤", "조여드는 누아르 위의 멜로 비극. 사랑이 곧 서스펜스의 전달체."],
      ["핵심 오브젝트", "손잡이에 고급 문양이 새겨진 수렵용 단검 한 자루"],
      ["세계관", "전설의 칼잡이가 세운 조직. 그 피와 자리를 둘러싼 3대(조부-아들-손자)의 상속 비극. 무기는 칼이 아니라 문양이 새겨진 단 한 자루의 단검 — 누가 그것을 쥐느냐가 곧 누가 이 세계의 주인이냐다."]
    ];
    var grid = rows.map(function (r) {
      return (
        '<div class="deck-ov__row">' +
        '<dt class="deck-ov__k">' + esc(r[0]) + "</dt>" +
        '<dd class="deck-ov__v">' + esc(r[1]) + "</dd>" +
        "</div>"
      );
    }).join("");
    return (
      '<div class="deck-page__inner">' +
      '<p class="deck-section-label">작품개요</p>' +
      '<dl class="deck-ov">' + grid + "</dl>" +
      "</div>"
    );
  }

  function pageSynopsis() {
    var paras = SYNOPSIS.map(function (p) {
      return '<p class="deck-syn__p">' + esc(p) + "</p>";
    }).join("");
    return (
      '<div class="deck-page__inner">' +
      '<p class="deck-section-label">시놉시스</p>' +
      paras +
      '<blockquote class="deck-syn__heart">' + esc(HEART) + "</blockquote>" +
      "</div>"
    );
  }

  function pageCharacters() {
    var cards = CHARS.map(function (c, i) {
      var detail;
      if (c.full) {
        detail =
          '<div class="deck-card__detail">' +
          '<div class="deck-card__item"><span class="deck-card__lbl">욕망</span><p>' + esc(c.want) + "</p></div>" +
          '<div class="deck-card__item"><span class="deck-card__lbl">결핍</span><p>' + esc(c.need) + "</p></div>" +
          '<div class="deck-card__item"><span class="deck-card__lbl">상처</span><p>' + esc(c.wound) + "</p></div>" +
          "</div>";
      } else {
        detail = '<div class="deck-card__detail"><p class="deck-card__brief">' + esc(c.brief) + "</p></div>";
      }
      return (
        '<article class="deck-card' + (c.full ? " is-full" : "") + '" data-idx="' + i + '">' +
        '<button type="button" class="deck-card__head" aria-expanded="false">' +
        '<span class="deck-card__avatar" aria-hidden="true">' + esc(c.name.charAt(0)) + "</span>" +
        '<span class="deck-card__meta">' +
        '<span class="deck-card__name">' + esc(c.name) +
        (c.sub ? ' <span class="deck-card__sub">' + esc(c.sub) + "</span>" : "") + "</span>" +
        '<span class="deck-card__pos">' + esc(c.pos) + "</span>" +
        '<span class="deck-card__line">' + esc(c.line) + "</span>" +
        "</span>" +
        '<span class="deck-card__chev" aria-hidden="true">▾</span>' +
        "</button>" +
        detail +
        "</article>"
      );
    }).join("");
    return (
      '<div class="deck-page__inner">' +
      '<p class="deck-section-label">캐릭터 바이블</p>' +
      '<p class="deck-hint">카드를 탭하면 상세가 열립니다.</p>' +
      '<div class="deck-cards">' + cards + "</div>" +
      "</div>"
    );
  }

  function pageDirector() {
    return (
      '<div class="deck-page__inner">' +
      '<p class="deck-section-label">감독소개</p>' +
      '<div class="placeholder deck-ph deck-ph--avatar"><span class="deck-ph__icon" aria-hidden="true">👤</span></div>' +
      placeholderBox("추후 업데이트 예정", "감독 성함·약력·사진은 아직 준비되지 않았습니다.") +
      "</div>"
    );
  }

  function pageCompany() {
    return (
      '<div class="deck-page__inner">' +
      '<p class="deck-section-label">제작사소개</p>' +
      '<div class="placeholder deck-ph deck-ph--avatar"><span class="deck-ph__icon" aria-hidden="true">🏢</span></div>' +
      placeholderBox("추후 업데이트 예정", "제작사 로고·소개는 아직 준비되지 않았습니다.") +
      "</div>"
    );
  }

  var PAGES = [
    { key: "cover", html: pageCover },
    { key: "logline", html: pageLogline },
    { key: "overview", html: pageOverview },
    { key: "synopsis", html: pageSynopsis },
    { key: "characters", html: pageCharacters },
    { key: "director", html: pageDirector },
    { key: "company", html: pageCompany }
  ];
  var TOTAL = PAGES.length;

  function build() {
    var pagesHtml = PAGES.map(function (p) {
      return '<div class="deck-page" data-page="' + p.key + '">' + p.html() + "</div>";
    }).join("");
    var dots = PAGES.map(function (p, i) {
      return '<button type="button" class="deck-dot" data-goto="' + i + '" aria-label="' + (i + 1) + '장으로 이동"></button>';
    }).join("");
    host.innerHTML =
      '<div class="deck__viewport" id="deckViewport">' +
      '<div class="deck__track" id="deckTrack">' + pagesHtml + "</div>" +
      '<button type="button" class="deck__arrow deck__arrow--prev" id="deckPrev" aria-label="이전 장">‹</button>' +
      '<button type="button" class="deck__arrow deck__arrow--next" id="deckNext" aria-label="다음 장">›</button>' +
      "</div>" +
      '<div class="deck__nav">' +
      '<div class="deck__dots" id="deckDots">' + dots + "</div>" +
      '<span class="deck__count" id="deckCount"></span>' +
      "</div>";
  }

  /* ---------------- 캐러셀 로직 ---------------- */

  var idx = 0;
  var track, viewport, prevBtn, nextBtn, dots, countEl;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia && window.matchMedia("(max-width: 640px)").matches;
  var DUR = isMobile ? 260 : 280;
  var EASE = "cubic-bezier(0.4, 0.0, 0.2, 1)";

  function slideTransition(on) {
    if (!on) { track.style.transition = "none"; return; }
    if (reduced) {
      track.style.transition = "none"; // 감속 모드: 슬라이드 생략
    } else {
      track.style.transition = "transform " + DUR + "ms " + EASE;
    }
  }

  function applyOffset(extra) {
    track.style.transform = "translateX(" + (-idx * viewport.clientWidth + (extra || 0)) + "px)";
  }

  function render() {
    applyOffset();
    prevBtn.classList.toggle("is-disabled", idx === 0);
    nextBtn.classList.toggle("is-disabled", idx === TOTAL - 1);
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === TOTAL - 1;
    countEl.textContent = (idx + 1) + " / " + TOTAL;
    var dotEls = dots.querySelectorAll(".deck-dot");
    for (var i = 0; i < dotEls.length; i++) {
      dotEls[i].classList.toggle("is-active", i === idx);
    }
  }

  function goTo(n) {
    n = Math.max(0, Math.min(TOTAL - 1, n));
    if (n === idx) { slideTransition(true); applyOffset(); return; }
    idx = n;
    if (reduced) {
      // 감속 모드: 슬라이드 없이 120ms opacity 크로스페이드
      slideTransition(false);
      viewport.classList.remove("is-fading");
      // 강제 리플로우 후 페이드
      void viewport.offsetWidth;
      viewport.classList.add("is-fading");
      applyOffset();
      window.setTimeout(function () { viewport.classList.remove("is-fading"); }, 130);
    } else {
      slideTransition(true);
      applyOffset();
    }
    render();
    // 새 장은 항상 맨 위에서
    var pageEl = track.children[idx];
    if (pageEl) pageEl.scrollTop = 0;
  }

  function next() { if (idx < TOTAL - 1) goTo(idx + 1); }
  function prev() { if (idx > 0) goTo(idx - 1); }

  /* --- 스와이프(터치) : 가로=장 이동, 세로=장 내부 스크롤 --- */
  var startX = 0, startY = 0, startT = 0, dragging = false, axisLocked = null;

  function onTouchStart(e) {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startT = Date.now();
    dragging = true;
    axisLocked = null;
    slideTransition(false);
  }

  function onTouchMove(e) {
    if (!dragging) return;
    var dx = e.touches[0].clientX - startX;
    var dy = e.touches[0].clientY - startY;
    if (axisLocked === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      axisLocked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (axisLocked !== "x") return; // 세로 제스처 → 장 내부 스크롤 허용
    e.preventDefault();
    // 끝단에서는 저항
    if ((idx === 0 && dx > 0) || (idx === TOTAL - 1 && dx < 0)) dx *= 0.35;
    applyOffset(dx);
  }

  function onTouchEnd() {
    if (!dragging) return;
    dragging = false;
    if (axisLocked !== "x") { return; }
    var dx = 0;
    // 현재 transform에서 드래그량 역산
    var m = /translateX\((-?[\d.]+)px\)/.exec(track.style.transform);
    if (m) dx = parseFloat(m[1]) + idx * viewport.clientWidth;
    var elapsed = Date.now() - startT || 1;
    var velocity = Math.abs(dx) / elapsed; // px/ms
    var threshold = viewport.clientWidth * 0.2; // 화면 폭의 20%
    var confirmed = Math.abs(dx) >= threshold || velocity >= 0.3; // 또는 0.3px/ms
    if (confirmed) {
      if (dx < 0) next(); else prev();
    }
    // 이동했으면 goTo가 스냅, 끝단이라 미이동이면 여기서 원위치 복귀 (둘 다 안전)
    slideTransition(true);
    applyOffset();
  }

  function bind() {
    track = document.getElementById("deckTrack");
    viewport = document.getElementById("deckViewport");
    prevBtn = document.getElementById("deckPrev");
    nextBtn = document.getElementById("deckNext");
    dots = document.getElementById("deckDots");
    countEl = document.getElementById("deckCount");

    prevBtn.addEventListener("click", prev);
    nextBtn.addEventListener("click", next);

    dots.addEventListener("click", function (e) {
      var t = e.target.closest(".deck-dot");
      if (t) goTo(parseInt(t.getAttribute("data-goto"), 10));
    });

    // 카드 확장(캐릭터 바이블) — 장 넘김과 축 충돌 없는 목록형
    host.addEventListener("click", function (e) {
      var head = e.target.closest(".deck-card__head");
      if (!head) return;
      var card = head.closest(".deck-card");
      var open = card.classList.toggle("is-open");
      head.setAttribute("aria-expanded", open ? "true" : "false");
    });

    viewport.addEventListener("touchstart", onTouchStart, { passive: true });
    viewport.addEventListener("touchmove", onTouchMove, { passive: false });
    viewport.addEventListener("touchend", onTouchEnd, { passive: true });
    viewport.addEventListener("touchcancel", onTouchEnd, { passive: true });

    document.addEventListener("keydown", function (e) {
      if (document.body.getAttribute("data-view") !== "deck") return;
      if (e.key === "ArrowLeft") { prev(); }
      else if (e.key === "ArrowRight") { next(); }
      else if (e.key === "Home") { goTo(0); }
      else if (e.key === "End") { goTo(TOTAL - 1); }
    });

    window.addEventListener("resize", function () {
      slideTransition(false);
      applyOffset();
    });

    slideTransition(false);
    render();
  }

  build();
  bind();
})();
