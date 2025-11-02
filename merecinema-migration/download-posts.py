#!/usr/bin/env python3
"""
WordPress 포스트 및 페이지 다운로드 스크립트
사용법: python download-posts.py
"""

import requests
from requests.auth import HTTPBasicAuth
import os
import json
from datetime import datetime
import time

# 설정
WORDPRESS_URL = "http://www.merecinema.net"
POSTS_ENDPOINT = "/wp-json/wp/v2/posts"
PAGES_ENDPOINT = "/wp-json/wp/v2/pages"

# 인증 정보
USERNAME = ""  # WordPress 사용자명
PASSWORD = ""  # WordPress Application Password

def create_directories():
    """필요한 디렉토리 생성"""
    os.makedirs("content", exist_ok=True)
    os.makedirs("data", exist_ok=True)

def fetch_all_items(endpoint, item_type):
    """모든 포스트 또는 페이지 가져오기"""
    items = []
    page = 1
    per_page = 100
    
    print(f"{item_type} 목록을 가져오는 중...")
    
    while True:
        url = f"{WORDPRESS_URL}{endpoint}"
        params = {
            "page": page,
            "per_page": per_page,
            "orderby": "date",
            "order": "desc",
            "_embed": True  # 이미지 등 포함된 정보도 가져오기
        }
        
        try:
            if USERNAME and PASSWORD:
                response = requests.get(url, params=params,
                                      auth=HTTPBasicAuth(USERNAME, PASSWORD),
                                      timeout=30)
            else:
                response = requests.get(url, params=params, timeout=30)
            
            response.raise_for_status()
            data = response.json()
            
            if not data or len(data) == 0:
                break
                
            items.extend(data)
            print(f"  페이지 {page}: {len(data)}개 항목 (총 {len(items)}개)")
            
            if len(data) < per_page:
                break
                
            page += 1
            time.sleep(0.5)
            
        except requests.exceptions.RequestException as e:
            print(f"에러 발생: {e}")
            break
    
    return items

def extract_featured_images(items):
    """포스트의 대표 이미지 URL 추출"""
    image_urls = []
    for item in items:
        if '_embedded' in item and 'wp:featuredmedia' in item['_embedded']:
            featured_media = item['_embedded']['wp:featuredmedia']
            if featured_media and len(featured_media) > 0:
                source_url = featured_media[0].get('source_url', '')
                if source_url:
                    image_urls.append(source_url)
    return image_urls

def save_items_json(items, filename):
    """아이템을 JSON 파일로 저장"""
    filepath = f"data/{filename}"
    
    # 민감한 정보 제외하고 필요한 정보만 저장
    clean_items = []
    for item in items:
        clean_item = {
            "id": item.get("id"),
            "date": item.get("date"),
            "modified": item.get("modified"),
            "title": item.get("title", {}).get("rendered", ""),
            "content": item.get("content", {}).get("rendered", ""),
            "excerpt": item.get("excerpt", {}).get("rendered", ""),
            "slug": item.get("slug"),
            "status": item.get("status"),
            "categories": item.get("categories", []),
            "tags": item.get("tags", []),
            "featured_media": item.get("featured_media"),
            "link": item.get("link"),
        }
        
        # 대표 이미지 URL 포함
        if '_embedded' in item and 'wp:featuredmedia' in item['_embedded']:
            featured_media = item['_embedded'].get('wp:featuredmedia', [])
            if featured_media and len(featured_media) > 0:
                clean_item["featured_image_url"] = featured_media[0].get('source_url', '')
        
        clean_items.append(clean_item)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(clean_items, f, ensure_ascii=False, indent=2)
    
    print(f"저장 완료: {filepath}")
    return filepath

def save_items_html(items, item_type):
    """아이템을 개별 HTML 파일로 저장"""
    content_dir = f"content/{item_type}"
    os.makedirs(content_dir, exist_ok=True)
    
    for item in items:
        title = item.get("title", {}).get("rendered", "Untitled")
        content = item.get("content", {}).get("rendered", "")
        date = item.get("date", "")
        slug = item.get("slug", f"item-{item.get('id', 'unknown')}")
        
        # HTML 파일명 생성
        safe_title = "".join(c for c in slug if c.isalnum() or c in ('-', '_')).rstrip()
        filename = f"{safe_title}.html"
        filepath = os.path.join(content_dir, filename)
        
        # HTML 템플릿
        html_content = f"""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }}
        .meta {{ color: #666; font-size: 0.9rem; margin-bottom: 2rem; }}
        .content {{ margin-top: 2rem; }}
    </style>
</head>
<body>
    <article>
        <h1>{title}</h1>
        <div class="meta">작성일: {date}</div>
        <div class="content">{content}</div>
    </article>
</body>
</html>"""
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)
    
    print(f"HTML 파일 저장 완료: {content_dir} ({len(items)}개 파일)")

def main():
    print("=" * 60)
    print("WordPress 포스트 및 페이지 다운로더")
    print("=" * 60)
    
    if not USERNAME or not PASSWORD:
        print("\n경고: 인증 정보가 설정되지 않았습니다.")
        print("공개 컨텐츠만 다운로드할 수 있습니다.")
        print("\n인증 정보를 설정하려면 스크립트의 USERNAME과 PASSWORD를 입력하세요.")
        response = input("\n계속하시겠습니까? (y/n): ")
        if response.lower() != 'y':
            return
    
    create_directories()
    
    # 포스트 가져오기
    print("\n[1/2] 포스트 다운로드 중...")
    posts = fetch_all_items(POSTS_ENDPOINT, "포스트")
    
    # 페이지 가져오기
    print("\n[2/2] 페이지 다운로드 중...")
    pages = fetch_all_items(PAGES_ENDPOINT, "페이지")
    
    # JSON으로 저장
    if posts:
        save_items_json(posts, "posts.json")
    if pages:
        save_items_json(pages, "pages.json")
    
    # HTML로 저장
    if posts:
        save_items_html(posts, "posts")
    if pages:
        save_items_html(pages, "pages")
    
    # 대표 이미지 URL 추출
    all_featured_images = []
    if posts:
        all_featured_images.extend(extract_featured_images(posts))
    if pages:
        all_featured_images.extend(extract_featured_images(pages))
    
    if all_featured_images:
        with open("data/featured_images.txt", "w", encoding="utf-8") as f:
            f.write("\n".join(all_featured_images))
        print(f"\n대표 이미지 URL 저장: data/featured_images.txt ({len(all_featured_images)}개)")
    
    print("\n" + "=" * 60)
    print(f"다운로드 완료: 포스트 {len(posts)}개, 페이지 {len(pages)}개")
    print("=" * 60)

if __name__ == "__main__":
    main()
