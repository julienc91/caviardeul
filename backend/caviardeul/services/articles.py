import random
import time
import zlib
from datetime import timedelta
from typing import Literal

import httpx
from django.core.cache import cache
from django.utils import timezone

from caviardeul.exceptions import ArticleFetchError
from caviardeul.models import DailyArticle
from caviardeul.models.article import Article
from caviardeul.services import metrics
from caviardeul.services.encryption import encrypt_data, generate_encryption_key
from caviardeul.services.logging import logger
from caviardeul.services.parsing import strip_html_article

CACHE_TIMEOUT = timedelta(days=7)
CACHE_TIMEOUT_JITTER = timedelta(days=1)


async def get_article_content(article: Article) -> str:
    content = await _get_article_content_from_cache(article.page_id)
    metrics.count(
        "article.cache", attributes={"result": "miss" if content is None else "hit"}
    )
    if content is not None:
        logger.debug("retrieved article from cache", extra={"page_id": article.page_id})
    else:
        _, content = await fetch_article(article.page_id)
        await set_article_last_checked_at(article)
        logger.info(
            "retrieved article from wikipedia", extra={"page_id": article.page_id}
        )
    return prepare_article_content(article.page_name, content)


async def fetch_article(page_id: str) -> tuple[str, str]:
    title, html_content = await get_article_html_from_wikipedia(page_id)
    content = strip_html_article(html_content)
    await _set_article_to_cache(page_id, content)
    return title, content


async def set_article_last_checked_at(article: Article) -> None:
    if isinstance(article, DailyArticle):
        article.last_checked_at = timezone.now()
        await article.asave(update_fields=["last_checked_at"])


def _get_cache_key(page_id: str) -> str:
    return f"article::{page_id}"


async def _get_article_content_from_cache(page_id: str) -> str | None:
    data = await cache.aget(_get_cache_key(page_id))
    if data is None:
        return None
    return zlib.decompress(data).decode()


async def burst_cache_for_article(page_ids: list[str]) -> None:
    keys = [_get_cache_key(page_id) for page_id in page_ids]
    await cache.adelete_many(keys)


async def _set_article_to_cache(page_id: str, content: str) -> None:
    cache_timeout = CACHE_TIMEOUT + random.random() * CACHE_TIMEOUT_JITTER
    await cache.aset(
        _get_cache_key(page_id),
        zlib.compress(content.encode()),
        timeout=int(cache_timeout.total_seconds()),
    )


async def get_article_html_from_wikipedia(page_id: str) -> tuple[str, str]:
    start = time.monotonic()
    status: Literal["success", "error"] = "error"
    try:
        result = await _fetch_article_html_from_wikipedia(page_id)
        status = "success"
        return result
    finally:
        attributes = {"status": status}
        metrics.count("wikipedia.fetch", attributes=attributes)
        metrics.distribution(
            "wikipedia.fetch.duration",
            (time.monotonic() - start) * 1000,
            unit="millisecond",
            attributes=attributes,
        )


async def _fetch_article_html_from_wikipedia(page_id: str) -> tuple[str, str]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://fr.wikipedia.org/w/api.php",
            params={
                "action": "parse",
                "format": "json",
                "prop": "text",
                "formatversion": 2,
                "origin": "*",
                "page": page_id,
            },
            headers={
                "User-Agent": "Caviardeul/1.0 (https://caviardeul.fr; contact@caviardeul.fr)",
                "Accept-Encoding": "gzip",
            },
        )
    if response.status_code != 200:
        raise ArticleFetchError(f"Unexected response from API: {response.status_code}")

    data = response.json()
    if "error" in data:
        raise ArticleFetchError("Error received in API response")

    data = data["parse"]
    html_content = data["text"]

    if 'class="redirectMsg"' in html_content:
        raise ArticleFetchError("Redirection received in article payload")

    return data["title"], html_content


def prepare_article_content(page_title: str, content: str) -> str:
    return f"<h1>{page_title}</h1>{content}"


def prepare_encrypted_article(article: Article, content: str) -> None:
    article.key = generate_encryption_key()
    article.page_name = encrypt_data(article.page_name, article.key)
    article.content = encrypt_data(content, article.key)
