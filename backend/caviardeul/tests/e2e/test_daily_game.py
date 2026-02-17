import re

import pytest
from playwright.async_api import Page, expect


@pytest.mark.usefixtures("daily_article")
class TestDailyGame:
    async def test_loads_with_redacted_content(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/")

        await expect(page.locator("#game")).to_be_visible()
        await expect(page.locator(".article-container")).to_be_visible()
        await expect(page.locator('input[placeholder="Un mot ?"]')).to_be_visible()
        await expect(page.locator('input[value="Valider"]')).to_be_visible()

    async def test_submit_a_guess_and_see_it_in_history(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/")

        input_el = page.locator('input[placeholder="Un mot ?"]')
        await input_el.fill("python")
        await input_el.press("Enter")

        history_table = page.locator(".guess-history table")
        await expect(history_table).to_be_visible()
        await expect(history_table).to_contain_text("python")

    async def test_guess_all_title_words_to_complete_the_game(
        self, skip_tutorial_page: Page
    ):
        page = skip_tutorial_page
        await page.goto("/")

        input_el = page.locator('input[placeholder="Un mot ?"]')

        for word in ["Guido", "van", "Rossum"]:
            await input_el.fill(word)
            await input_el.press("Enter")

        await expect(page.locator(".game-information h2")).to_contain_text("Bravo")
        await expect(page.locator(".game-information")).to_contain_text(
            "le Caviardeul du jour"
        )

    async def test_completion_shows_attempt_count_and_accuracy(
        self, skip_tutorial_page: Page
    ):
        page = skip_tutorial_page
        await page.goto("/")

        input_el = page.locator('input[placeholder="Un mot ?"]')

        for word in ["Guido", "van", "Rossum"]:
            await input_el.fill(word)
            await input_el.press("Enter")

        info = page.locator(".game-information")
        await expect(info).to_contain_text(re.compile(r"en \d+ coups?"))
        await expect(info).to_contain_text(re.compile(r"précision de \d+%"))

    async def test_completion_shows_share_buttons(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/")

        input_el = page.locator('input[placeholder="Un mot ?"]')

        for word in ["Guido", "van", "Rossum"]:
            await input_el.fill(word)
            await input_el.press("Enter")

        share = page.locator(".share-action")
        await expect(share).to_contain_text("Partagez votre score")
        await expect(
            share.locator('button[title="Partager sur Bluesky"]')
        ).to_be_visible()
        await expect(
            share.locator('button[title="Partager sur Facebook"]')
        ).to_be_visible()
        await expect(
            share.locator('button[title="Partager sur WhatsApp"]')
        ).to_be_visible()
        await expect(
            share.locator('button[title="Partager sur Telegram"]')
        ).to_be_visible()

    async def test_completion_shows_come_back_tomorrow(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/")

        input_el = page.locator('input[placeholder="Un mot ?"]')

        for word in ["Guido", "van", "Rossum"]:
            await input_el.fill(word)
            await input_el.press("Enter")

        await expect(page.locator(".game-information")).to_contain_text(
            "Revenez demain"
        )

    async def test_completion_shows_wikipedia_link(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/")

        input_el = page.locator('input[placeholder="Un mot ?"]')

        for word in ["Guido", "van", "Rossum"]:
            await input_el.fill(word)
            await input_el.press("Enter")

        wikipedia_link = page.locator(".game-information").get_by_text("sur Wikipédia")
        await expect(wikipedia_link).to_be_visible()
        await expect(wikipedia_link).to_have_attribute(
            "href", re.compile(r"https://fr\.wikipedia\.org/wiki/")
        )

    async def test_input_disabled_after_game_completion(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/")

        input_el = page.locator('input[placeholder="Un mot ?"]')

        for word in ["Guido", "van", "Rossum"]:
            await input_el.fill(word)
            await input_el.press("Enter")

        await expect(page.locator(".game-information h2")).to_contain_text("Bravo")
        await expect(page.locator('input[placeholder="Un mot ?"]')).to_be_disabled()
        await expect(page.locator('input[value="Valider"]')).to_be_disabled()

    async def test_case_insensitive_guess(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/")

        input_el = page.locator('input[placeholder="Un mot ?"]')
        await input_el.fill("PYTHON")
        await input_el.press("Enter")

        row = page.locator(".guess-history table tbody tr").first
        await expect(row.locator("td").nth(1)).to_have_text("python")
        # "Python" appears in the article, so occurrence count should be > 0
        cell_text = await row.locator("td").nth(2).text_content()
        assert int(cell_text) > 0

    async def test_accent_insensitive_guess(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/")

        input_el = page.locator('input[placeholder="Un mot ?"]')
        await input_el.fill("developpeur")
        await input_el.press("Enter")

        row = page.locator(".guess-history table tbody tr").first
        await expect(row.locator("td").nth(1)).to_have_text("developpeur")
        # "développeur" appears in the Guido van Rossum article
        cell_text = await row.locator("td").nth(2).text_content()
        assert int(cell_text) > 0

    async def test_history_shows_occurrence_count(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/")

        input_el = page.locator('input[placeholder="Un mot ?"]')
        history_rows = page.locator(".guess-history table tbody tr")

        await input_el.fill("microsoft")
        await input_el.press("Enter")
        await expect(history_rows).to_have_count(1)
        row = history_rows.first
        await expect(row.locator("td").nth(1)).to_have_text("microsoft")
        await expect(row.locator("td").nth(2)).to_have_text("1")

        await input_el.fill("google")
        await input_el.press("Enter")
        await expect(history_rows).to_have_count(2)
        row = history_rows.first
        await expect(row.locator("td").nth(1)).to_have_text("google")
        await expect(row.locator("td").nth(2)).to_have_text("2")

    async def test_duplicate_guess_not_added_to_history(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/")

        input_el = page.locator('input[placeholder="Un mot ?"]')
        history_rows = page.locator(".guess-history table tbody tr")

        await input_el.fill("microsoft")
        await input_el.press("Enter")
        await expect(history_rows).to_have_count(1)

        await input_el.fill("microsoft")
        await input_el.press("Enter")
        await expect(history_rows).to_have_count(1)

    async def test_word_not_in_article_shows_zero_occurrences(
        self, skip_tutorial_page: Page
    ):
        page = skip_tutorial_page
        await page.goto("/")

        input_el = page.locator('input[placeholder="Un mot ?"]')
        await input_el.fill("platypus")
        await input_el.press("Enter")

        row = page.locator(".guess-history table tbody tr").first
        await expect(row.locator("td").nth(1)).to_have_text("platypus")
        await expect(row.locator("td").nth(2)).to_have_text("0")

    async def test_found_words_displayed_in_plain_text(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/")

        article = page.locator(".article-container")
        await expect(article).to_be_visible()

        # Before guessing, "Microsoft" should be redacted
        await expect(article.locator(".word.caviarded")).to_have_count(
            await article.locator(".word").count()
        )

        input_el = page.locator('input[placeholder="Un mot ?"]')
        await input_el.fill("microsoft")
        await input_el.press("Enter")

        revealed = article.locator(".word:not(.caviarded)", has_text="Microsoft")
        await expect(revealed).to_have_count(1)

        # Some words should still be redacted
        await expect(article.locator(".word.caviarded").first).to_be_visible()

    async def test_progress_persists_on_reload(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/")

        input_el = page.locator('input[placeholder="Un mot ?"]')
        await input_el.fill("python")
        await input_el.press("Enter")

        await expect(page.locator(".guess-history table")).to_contain_text("python")

        await page.reload()

        await expect(page.locator(".guess-history table")).to_contain_text("python")

    async def test_completed_game_persists_on_reload(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/")

        input_el = page.locator('input[placeholder="Un mot ?"]')

        for word in ["Guido", "van", "Rossum"]:
            await input_el.fill(word)
            await input_el.press("Enter")

        await expect(page.locator(".game-information h2")).to_contain_text("Bravo")

        await page.reload()

        await expect(page.locator(".game-information h2")).to_contain_text("Bravo")
        await expect(page.locator(".game-information")).to_contain_text(
            "le Caviardeul du jour"
        )
