# MereCinema.net 마이그레이션 가이드

이 폴더는 www.merecinema.net (WordPress 사이트)의 자료들을 마이그레이션하기 위한 폴더입니다.

## 빠른 시작

### 방법 1: Python 스크립트 사용 (권장)

#### 1단계: 필수 패키지 설치
```bash
pip install requests
```

#### 2단계: WordPress Application Password 생성
1. WordPress 관리자 페이지 (http://www.merecinema.net/wp-admin) 로그인
2. 사용자 > 프로필 > 애플리케이션 비밀번호 섹션으로 이동
3. 새 애플리케이션 비밀번호 생성 (이름: "Migration")
4. 생성된 비밀번호 복사

#### 3단계: 스크립트 설정
`download-media.py`와 `download-posts.py` 파일을 열고 다음 정보 입력:
```python
USERNAME = "your_username"  # WordPress 사용자명
PASSWORD = "xxxx xxxx xxxx xxxx"  # 생성한 Application Password
```

#### 4단계: 실행
```bash
# 미디어 파일 다운로드
python download-media.py

# 포스트 및 페이지 다운로드
python download-posts.py
```

### 방법 2: WordPress Export 기능 사용

1. WordPress 관리자 페이지 로그인
2. 도구 > 내보내기 메뉴 이동
3. "모든 컨텐츠" 선택 후 "다운로드" 클릭
4. 다운로드된 XML 파일을 `data/wordpress-export.xml`로 저장

### 방법 3: FTP를 통한 직접 다운로드

WordPress 미디어 파일은 일반적으로 다음 경로에 저장됩니다:
```
/wp-content/uploads/
```

FTP 클라이언트를 사용하여 이 폴더의 모든 내용을 `media/` 폴더로 다운로드하세요.

## 폴더 구조

```
merecinema-migration/
├── content/          # 포스트 및 페이지 HTML 파일
│   ├── posts/       # 포스트 HTML
│   └── pages/       # 페이지 HTML
├── media/            # 미디어 파일 (이미지, 비디오 등)
├── data/             # 메타데이터 및 백업 파일
│   ├── posts.json   # 포스트 JSON 데이터
│   ├── pages.json   # 페이지 JSON 데이터
│   ├── media_metadata.json  # 미디어 메타데이터
│   └── featured_images.txt  # 대표 이미지 URL 목록
└── README.md         # 이 파일
```

## 다운로드된 데이터 설명

### JSON 파일
- **posts.json**: 모든 포스트의 메타데이터 및 내용 (JSON 형식)
- **pages.json**: 모든 페이지의 메타데이터 및 내용 (JSON 형식)
- **media_metadata.json**: 미디어 라이브러리의 모든 파일 정보

### HTML 파일
- **content/posts/**: 각 포스트가 개별 HTML 파일로 저장됨
- **content/pages/**: 각 페이지가 개별 HTML 파일로 저장됨

### 미디어 파일
- **media/**: WordPress에 업로드된 모든 이미지, 비디오 등

## 다음 단계

데이터 다운로드가 완료된 후:

1. 다운로드된 데이터 검토
2. 새 Film Production 페이지에 통합
3. 이미지 경로 업데이트
4. 컨텐츠 마이그레이션

## 문제 해결

### 인증 오류
- WordPress Application Password가 올바른지 확인
- 사용자명과 비밀번호에 공백이 없는지 확인

### API 접근 불가
- WordPress REST API가 활성화되어 있는지 확인
- .htaccess 파일에서 REST API가 차단되지 않았는지 확인

### 미디어 파일 다운로드 실패
- 네트워크 연결 확인
- 파일이 공개적으로 접근 가능한지 확인
- 파일 크기가 너무 큰 경우 수동으로 다운로드 고려

## 참고사항

- 스크립트는 공개 API를 통해 데이터를 가져옵니다
- 민감한 정보는 자동으로 제외됩니다
- 대용량 다운로드의 경우 시간이 걸릴 수 있습니다
- 데이터베이스 백업이 필요한 경우 phpMyAdmin을 사용하세요