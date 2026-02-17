import re

from playwright.async_api import Page, expect

from caviardeul.tests.factories import DailyArticleScoreFactory


class TestArchivesPlay:
    async def test_navigate_to_an_archived_article_and_play(
        self, skip_tutorial_page: Page, past_articles
    ):
        page = skip_tutorial_page
        await page.goto("/archives")
        await expect(page.locator(".archive-grid")).to_be_visible()

        playable_article = page.locator(".archive-item").filter(has_text="Jouer")
        await expect(playable_article.first).to_be_visible()
        await playable_article.first.click()

        await expect(page.locator("#game")).to_be_visible()
        await expect(page.locator(".article-container")).to_be_visible()
        await expect(page.locator('input[placeholder="Un mot ?"]')).to_be_visible()
        await expect(page.locator('input[value="Valider"]')).to_be_visible()

    async def test_complete_an_archived_article(
        self, skip_tutorial_page: Page, past_articles
    ):
        page = skip_tutorial_page
        # Navigate to the archives
        await page.goto("/archives")
        await expect(page.locator(".archive-grid")).to_be_visible()

        # Click the first playable article
        playable_article = page.locator(".archive-item").filter(has_text="Jouer")
        await expect(playable_article.first).to_be_visible()
        await playable_article.first.click()

        await expect(page.locator("#game")).to_be_visible()

        # The first playable article (sorted by date desc) is Python (langage)
        input_el = page.locator('input[placeholder="Un mot ?"]')

        for word in ["Python", "langage"]:
            await input_el.fill(word)
            await input_el.press("Enter")

        await expect(page.locator(".game-information h2")).to_contain_text("Bravo")
        await expect(page.locator(".game-information")).to_contain_text("cet article")

    async def test_completed_archive_redirects_to_archives_list(
        self, skip_tutorial_page: Page, login, user1, past_articles
    ):
        completed_article = past_articles[0]
        await DailyArticleScoreFactory.acreate(
            user=user1, daily_article=completed_article
        )
        page = skip_tutorial_page
        await login(user1)
        await page.goto("/archives")
        await expect(page.locator(".archive-grid")).to_be_visible()

        # Find the completed article card to extract its article ID
        completed_item = page.locator(".archive-item.completed").filter(
            has=page.locator("h3", has_text=completed_article.page_name)
        )
        await expect(completed_item).to_be_visible()
        heading_text = await completed_item.locator("h3").text_content()
        # Extract article ID from "N°{id} - Python (langage)"
        match = re.search(r"N°(\d+)", heading_text)
        assert match, f"Could not extract article ID from: {heading_text}"
        article_id = match.group(1)

        # Navigate directly to the completed article's URL
        await page.goto(f"/archives/{article_id}")

        # Should redirect to /archives
        await expect(page).to_have_url(re.compile(r"/archives$"), timeout=10000)
