from datetime import timedelta

import httpx
from django.core.cache import cache
from django.utils import timezone

from caviardeul.exceptions import ArticleFetchError
from caviardeul.models.article import Article
from caviardeul.services.encryption import encrypt_data, generate_encryption_key
from caviardeul.services.logging import logger
from caviardeul.services.parsing import strip_html_article


async def get_article_content(article: Article) -> str:
    content = await _get_article_content_from_cache(article.page_id)
    if content is not None:
        logger.debug("retrieved article from cache", extra={"page_id": article.page_id})
        return content

    _, html_content = await get_article_html_from_wikipedia(article.page_id)
    logger.info("retrieved article from wikipedia", extra={"page_id": article.page_id})

    article_content = _prepare_article_content_from_html(
        article.page_name, html_content
    )
    await _set_article_to_cache(article.page_id, article_content)
    return article_content


async def _get_article_content_from_cache(page_id: str) -> str | None:
    return await cache.aget(f"wikipedia::{page_id}")


async def burst_cache_for_article(page_ids: list[str]) -> None:
    keys = [f"wikipedia::{page_id}" for page_id in page_ids]
    await cache.adelete_many(keys)


async def _set_article_to_cache(page_id: str, content: str) -> None:
    now = timezone.now()
    tomorrow = (now + timedelta(days=1)).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    cache_timeout = int((tomorrow - now).total_seconds())
    await cache.aset(f"wikipedia::{page_id}", content, timeout=cache_timeout)


async def get_article_html_from_wikipedia(page_id: str) -> tuple[str, str]:
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


def _prepare_article_content_from_html(page_title: str, html_content: str) -> str:
    return f"<h1>{page_title}</h1>" + strip_html_article(html_content)


def prepare_encrypted_article(article: Article, content: str) -> None:
    article.key = generate_encryption_key()
    article.page_name = encrypt_data(article.page_name, article.key)
    article.content = encrypt_data(content, article.key)
