import json
import re
from datetime import datetime
from pathlib import Path

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
NEWS_FILE = ROOT / 'data' / 'news.json'
AUTO_BOOKS_FILE = ROOT / 'data' / 'books' / 'autoBooks.json'
BOOKS_DB_FILE = ROOT / 'data' / 'books' / 'booksDatabase.js'

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}

URLS_TO_CHECK = [
    'https://rajeduboard.rajasthan.gov.in/',
    'https://rajeduboard.rajasthan.gov.in/notifications.aspx',
    'https://rajeduboard.rajasthan.gov.in/SchoolEducation/public/Notification/AllNotification.aspx'
]

TEXTBOOK_KEYWORDS = ['textbook', 'text book', 'पाठ्यपुस्तक', 'textbooks']
NEWS_KEYWORDS = ['circular', 'notification', 'notice', 'परीक्षा', 'सूचना', 'परिपत्रक']


def fetch_page(url):
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        return response.text
    except requests.RequestException:
        return ''


def parse_links(html, keywords):
    soup = BeautifulSoup(html, 'html.parser')
    items = []
    for link in soup.find_all('a', href=True):
        title = link.get_text(strip=True)
        href = link['href']
        if not title or not href:
            continue
        query = title.lower() + ' ' + href.lower()
        if any(keyword in query for keyword in keywords):
            if href.startswith('javascript:'):
                continue
            if href.startswith('/'):
                href = 'https://rajeduboard.rajasthan.gov.in' + href
            if href.startswith('./'):
                href = 'https://rajeduboard.rajasthan.gov.in/' + href[2:]
            items.append({'headline': title, 'link': href})
    return items


def normalize_date(value: str):
    matches = re.findall(r'\d{4}-\d{2}-\d{2}', value)
    if matches:
        return matches[0]
    matches = re.findall(r'\d{2}/\d{2}/\d{4}', value)
    if matches:
        day, month, year = matches[0].split('/')
        return f'{year}-{month}-{day}'
    return datetime.utcnow().strftime('%Y-%m-%d')


def load_json(path, default):
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except json.JSONDecodeError:
        return default


def save_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')


def unique_items(items, key):
    seen = set()
    unique = []
    for item in items:
        value = item.get(key)
        if value in seen:
            continue
        seen.add(value)
        unique.append(item)
    return unique


def update_news(news_items):
    existing = load_json(NEWS_FILE, [])
    existing_headlines = {item.get('headline') for item in existing}
    new_entries = []
    for item in news_items:
        if item['headline'] not in existing_headlines:
            entry = {
                'id': max([n.get('id', 0) for n in existing] + [0]) + len(new_entries) + 1,
                'headline': item['headline'],
                'source': 'RBSE',
                'date': normalize_date(item.get('date', ''))
            }
            new_entries.append(entry)
    if new_entries:
        existing = new_entries + existing
        save_json(NEWS_FILE, existing)
        print(f'Added {len(new_entries)} news items to {NEWS_FILE}')
    else:
        print('No new news items found.')


def update_books(book_items):
    auto_books = load_json(AUTO_BOOKS_FILE, [])
    existing_links = {item.get('downloadUrl') for item in auto_books}
    updated = list(auto_books)
    for item in book_items:
        if item['downloadUrl'] not in existing_links:
            entry = {
                'id': max([book.get('id', 0) for book in auto_books] + [100]) + 1,
                'class': item.get('class', 12),
                'subject': item.get('subject', 'RBSE Book'),
                'title': item.get('title', item.get('headline', 'RBSE Textbook')),
                'language': item.get('language', 'english'),
                'author': item.get('author', 'RBSE'),
                'size': item.get('size', 'PDF'),
                'board': item.get('board', 'cbse'),
                'downloadUrl': item['downloadUrl']
            }
            updated.append(entry)
            existing_links.add(item['downloadUrl'])
    if len(updated) != len(auto_books):
        save_json(AUTO_BOOKS_FILE, updated)
        print(f'Added {len(updated) - len(auto_books)} textbook links to {AUTO_BOOKS_FILE}')
    else:
        print('No new textbook links found.')


def scrape_rbse():
    news_candidates = []
    book_candidates = []

    for url in URLS_TO_CHECK:
        html = fetch_page(url)
        if not html:
            continue

        news_candidates.extend(parse_links(html, NEWS_KEYWORDS))
        textbooks = parse_links(html, TEXTBOOK_KEYWORDS)
        for item in textbooks:
            if item['link'].lower().endswith('.pdf'):
                book_candidates.append({
                    'headline': item['headline'],
                    'downloadUrl': item['link'],
                    'subject': 'RBSE Textbook',
                    'language': 'english',
                    'author': 'RBSE',
                    'size': 'PDF',
                    'board': 'state'
                })

    news_candidates = unique_items(news_candidates, 'headline')
    book_candidates = unique_items(book_candidates, 'downloadUrl')
    update_news(news_candidates)
    update_books(book_candidates)


if __name__ == '__main__':
    scrape_rbse()
