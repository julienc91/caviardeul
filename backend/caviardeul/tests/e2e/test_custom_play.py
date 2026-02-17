import re

import pytest
from playwright.async_api import Page, expect

from caviardeul.constants import Safety
from caviardeul.tests.e2e.conftest import _seed_article_cache
from caviardeul.tests.factories import CustomArticleFactory


@pytest.fixture
async def custom_article():
    article = await CustomArticleFactory.acreate(
        page_id="Article_de_test",
        page_name="Article de test",
        safety=Safety.SAFE,
    )
    await _seed_article_cache("Article_de_test", "Article de test")
    return article


@pytest.fixture
async def custom_article_unsafe():
    article = await CustomArticleFactory.acreate(
        page_id="Article_unsafe",
        page_name="Article unsafe",
        safety=Safety.UNSAFE,
    )
    await _seed_article_cache("Article_unsafe", "Article unsafe")
    return article


class TestCustomGamePlay:
    async def test_loads_custom_game_and_plays(
        self, skip_tutorial_page: Page, custom_article
    ):
        page = skip_tutorial_page
        await page.goto(f"/custom/{custom_article.public_id}")

        await expect(page.locator("#game")).to_be_visible()
        await expect(page.locator(".article-container")).to_be_visible()

        input_el = page.locator('input[placeholder="Un mot ?"]')
        await expect(input_el).to_be_visible()
        await input_el.fill("test")
        await input_el.press("Enter")

        await expect(page.locator(".guess-history table")).to_contain_text("test")

    async def test_complete_the_custom_game(
        self, skip_tutorial_page: Page, custom_article
    ):
        page = skip_tutorial_page
        await page.goto(f"/custom/{custom_article.public_id}")

        input_el = page.locator('input[placeholder="Un mot ?"]')

        for word in ["Article", "test"]:
            await input_el.fill(word)
            await input_el.press("Enter")

        info = page.locator(".game-information")
        await expect(info.locator("h2")).to_contain_text("Bravo")
        await expect(info).to_contain_text("cet article")
        await expect(info).to_contain_text(re.compile(r"en \d+ coups?"))
        await expect(info).to_contain_text(re.compile(r"précision de \d+%"))

    async def test_unsafe_article_shows_warning_banner(
        self, skip_tutorial_page: Page, custom_article_unsafe
    ):
        page = skip_tutorial_page
        await page.goto(f"/custom/{custom_article_unsafe.public_id}")

        await expect(page.locator("#game")).to_be_visible()

        banner = page.locator(".banner")
        await expect(banner).to_be_visible()
        await expect(banner).to_contain_text("Mise en garde")
        await expect(banner).to_contain_text("pas être adapté")

    async def test_banner_can_be_dismissed(
        self, skip_tutorial_page: Page, custom_article_unsafe
    ):
        page = skip_tutorial_page
        await page.goto(f"/custom/{custom_article_unsafe.public_id}")

        await expect(page.locator("#game")).to_be_visible()

        banner = page.locator(".banner")
        await expect(banner).to_be_visible()

        await banner.locator('[title="Masquer"]').click()
        await expect(banner).not_to_be_visible()

    async def test_completion_shows_create_another_link(
        self, skip_tutorial_page: Page, custom_article
    ):
        page = skip_tutorial_page
        await page.goto(f"/custom/{custom_article.public_id}")

        input_el = page.locator('input[placeholder="Un mot ?"]')

        for word in ["Article", "test"]:
            await input_el.fill(word)
            await input_el.press("Enter")

        await expect(page.locator(".game-information h2")).to_contain_text("Bravo")

        create_link = page.locator(".game-information").get_by_text(
            "partie personnalisée"
        )
        await expect(create_link).to_be_visible()
        await expect(create_link).to_have_attribute("href", "/custom/nouveau")
