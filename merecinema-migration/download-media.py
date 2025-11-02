#!/usr/bin/env python3
"""
WordPress 미디어 라이브러리 다운로드 스크립트
사용법: python download-media.py
"""

import requests
from requests.auth import HTTPBasicAuth
import os
import json
from urllib.parse import urlparse, urljoin
import time

# 설정
WORDPRESS_URL = "http://www.merecinema.net"
MEDIA_ENDPOINT = "/wp-json/wp/v2/media"
UPLOAD_DIR = "media"

# 인증 정보 (환경 변수에서 가져오거나 직접 입력)
# WordPress Application Password 또는 기본 인증 사용
USERNAME = ""  # WordPress 사용자명
PASSWORD = ""  # WordPress Application Password 또는 일반 비밀번호

def create_directories():
    """필요한 디렉토리 생성"""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs("data", exist_ok=True)

def get_all_media_items():
    """모든 미디어 아이템 가져오기"""
    media_items = []
    page = 1
    per_page = 100
    
    print("미디어 파일 목록을 가져오는 중...")
    
    while True:
        url = f"{WORDPRESS_URL}{MEDIA_ENDPOINT}"
        params = {
            "page": page,
            "per_page": per_page,
            "orderby": "date",
            "order": "desc"
        }
        
        try:
            if USERNAME and PASSWORD:
                response = requests.get(url, params=params, 
                                      auth=HTTPBasicAuth(USERNAME, PASSWORD),
                                      timeout=30)
            else:
                print("인증 정보가 없습니다. 공개 API를 사용합니다...")
                response = requests.get(url, params=params, timeout=30)
            
            response.raise_for_status()
            data = response.json()
            
            if not data or len(data) == 0:
                break
                
            media_items.extend(data)
            print(f"페이지 {page}: {len(data)}개 항목 가져옴 (총 {len(media_items)}개)")
            
            if len(data) < per_page:
                break
                
            page += 1
            time.sleep(0.5)  # API 호출 제한 방지
            
        except requests.exceptions.RequestException as e:
            print(f"에러 발생: {e}")
            break
    
    return media_items

def download_media_file(media_item):
    """개별 미디어 파일 다운로드"""
    source_url = media_item.get('source_url', '')
    if not source_url:
        return None
    
    filename = os.path.basename(urlparse(source_url).path)
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    # 이미 다운로드된 파일이면 스킵
    if os.path.exists(filepath):
        print(f"  스킵: {filename} (이미 존재)")
        return filepath
    
    try:
        response = requests.get(source_url, timeout=30, stream=True)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"  다운로드 완료: {filename}")
        return filepath
        
    except requests.exceptions.RequestException as e:
        print(f"  다운로드 실패: {filename} - {e}")
        return None

def save_media_metadata(media_items):
    """미디어 메타데이터 저장"""
    metadata_file = "data/media_metadata.json"
    
    # 메타데이터만 추출 (민감한 정보 제외)
    clean_data = []
    for item in media_items:
        clean_item = {
            "id": item.get("id"),
            "date": item.get("date"),
            "title": item.get("title", {}).get("rendered", ""),
            "source_url": item.get("source_url"),
            "mime_type": item.get("mime_type"),
            "media_type": item.get("media_type"),
            "description": item.get("description", {}).get("rendered", ""),
            "caption": item.get("caption", {}).get("rendered", ""),
            "alt_text": item.get("alt_text"),
        }
        clean_data.append(clean_item)
    
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(clean_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n메타데이터 저장: {metadata_file}")

def main():
    print("=" * 60)
    print("WordPress 미디어 라이브러리 다운로더")
    print("=" * 60)
    
    if not USERNAME or not PASSWORD:
        print("\n경고: 인증 정보가 설정되지 않았습니다.")
        print("공개 미디어만 다운로드할 수 있습니다.")
        print("\n인증 정보를 설정하려면 스크립트의 USERNAME과 PASSWORD를 입력하세요.")
        print("WordPress Application Password 사용을 권장합니다.")
        print("(설정 > 사용자 > 애플리케이션 비밀번호)")
        response = input("\n계속하시겠습니까? (y/n): ")
        if response.lower() != 'y':
            return
    
    create_directories()
    
    # 미디어 아이템 가져오기
    media_items = get_all_media_items()
    
    if not media_items:
        print("가져올 미디어 파일이 없습니다.")
        return
    
    print(f"\n총 {len(media_items)}개의 미디어 항목을 찾았습니다.\n")
    
    # 메타데이터 저장
    save_media_metadata(media_items)
    
    # 파일 다운로드
    print("\n미디어 파일 다운로드 시작...\n")
    downloaded = 0
    failed = 0
    
    for i, item in enumerate(media_items, 1):
        print(f"[{i}/{len(media_items)}] {item.get('title', {}).get('rendered', 'Untitled')}")
        result = download_media_file(item)
        if result:
            downloaded += 1
        else:
            failed += 1
        time.sleep(0.2)  # 서버 부하 방지
    
    print("\n" + "=" * 60)
    print(f"다운로드 완료: {downloaded}개 성공, {failed}개 실패")
    print(f"파일 위치: {os.path.abspath(UPLOAD_DIR)}")
    print("=" * 60)

if __name__ == "__main__":
    main()
