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

    async def test_settings_page_shows_qr_code(
        self, skip_tutorial_page: Page, login, user1
    ):
        page = skip_tutorial_page
        await login(user1)
        await page.goto("/parametres")

        section = page.locator(".page-section").filter(
            has=page.get_by_role("heading", name="Synchronisation entre appareils")
        )
        await expect(section).to_be_visible()

        await section.locator(".qr-code .mask").click()
        await expect(section.locator(".qr-code svg")).to_be_visible()
        await expect(section.locator("input")).to_have_value(
            re.compile(rf"/login\?user={user1.id}$")
        )

    async def test_sync_section_hidden_when_not_logged_in(
        self, skip_tutorial_page: Page
    ):
        page = skip_tutorial_page
        await page.goto("/parametres")

        await expect(
            page.get_by_role("heading", name="Options", exact=True)
        ).to_be_visible()
        await expect(
            page.get_by_role("heading", name="Synchronisation entre appareils")
        ).not_to_be_visible()

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

        score_section = page.locator(".user-stats")
        await expect(score_section).to_contain_text("Parties terminées")
        await expect(score_section.locator(".finished .stat-value")).to_have_text("1")

        items = page.locator(".archive-grid .archive-item")
        completed = items.filter(
            has=page.locator("h3", has_text=completed_article.page_name)
        )
        await expect(completed).to_have_count(1)
        non_completed = items.filter(has=page.locator("h3 .caviarded-title"))
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

        score_section = page.locator(".user-stats")
        await expect(score_section).to_contain_text("Parties terminées")
        await expect(score_section.locator(".finished .stat-value")).to_have_text("1")

        items = page.locator(".archive-grid .archive-item")
        completed = items.filter(
            has=page.locator("h3", has_text=completed_article.page_name)
        )
        await expect(completed).to_have_count(1)
        non_completed = items.filter(has=page.locator("h3 .caviarded-title"))
        await expect(non_completed).to_have_count(len(past_articles) - 1)
