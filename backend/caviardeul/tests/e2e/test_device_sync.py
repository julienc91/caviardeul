import re

import pytest
from playwright.async_api import Page, expect

from caviardeul.tests.factories import DailyArticleScoreFactory, UserFactory


@pytest.mark.usefixtures("past_articles")
class TestDeviceSync:
    async def test_login_redirects_to_archives(self, skip_tutorial_page: Page, user1):
        page = skip_tutorial_page
        await page.goto(f"/login?user={user1.id}")

        await expect(page).to_have_url(re.compile(r"/archives"), timeout=10000)

    async def test_sync_modal_shows_qr_code(
        self, skip_tutorial_page: Page, login, user1
    ):
        page = skip_tutorial_page
        await login(user1)
        await page.goto("/archives")

        await page.get_by_text("Synchroniser un appareil").click()

        modal = page.locator(".sync-modal")
        await expect(modal).to_be_visible()
        await expect(modal.locator("h1")).to_have_text(
            "Synchronisation entre appareils"
        )

        await modal.locator(".qr-code .mask").click()
        await expect(modal.locator(".qr-code svg")).to_be_visible()

    async def test_login_as_same_user_preserves_stats(
        self, skip_tutorial_page: Page, login, context, user1, past_articles
    ):
        completed_article = past_articles[0]
        await DailyArticleScoreFactory.acreate(
            user=user1, daily_article=completed_article
        )
        page = skip_tutorial_page
        await login(user1)
        await page.goto(f"/login?user={user1.id}")
        await expect(page).to_have_url(re.compile(r"/archives"), timeout=10000)

        cookies = await context.cookies()
        user_cookie = next(c for c in cookies if c["name"] == "userId")
        assert user_cookie["value"] == str(user1.id)

        score_section = page.locator(".right-container")
        await expect(score_section).to_contain_text("Parties terminées")
        await expect(score_section).to_contain_text("1/")

        items = page.locator(".archive-grid .archive-item")
        completed = items.filter(
            has=page.locator("h3", has_text=completed_article.page_name)
        )
        await expect(completed).to_have_count(1)
        non_completed = items.filter(has=page.locator("h3", has_text="?"))
        await expect(non_completed).to_have_count(len(past_articles) - 1)

    async def test_login_as_different_user_merges_and_shows_stats(
        self, skip_tutorial_page: Page, login, context, user1, past_articles
    ):
        completed_article = past_articles[0]
        await DailyArticleScoreFactory.acreate(
            user=user1, daily_article=completed_article
        )
        page = skip_tutorial_page
        user2 = await UserFactory.acreate()
        await login(user2)
        await page.goto(f"/login?user={user1.id}")
        await expect(page).to_have_url(re.compile(r"/archives"), timeout=10000)

        cookies = await context.cookies()
        user_cookie = next(c for c in cookies if c["name"] == "userId")
        assert user_cookie["value"] == str(user1.id)

        score_section = page.locator(".right-container")
        await expect(score_section).to_contain_text("Parties terminées")
        await expect(score_section).to_contain_text("1/")

        items = page.locator(".archive-grid .archive-item")
        completed = items.filter(
            has=page.locator("h3", has_text=completed_article.page_name)
        )
        await expect(completed).to_have_count(1)
        non_completed = items.filter(has=page.locator("h3", has_text="?"))
        await expect(non_completed).to_have_count(len(past_articles) - 1)
