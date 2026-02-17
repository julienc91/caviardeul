import pytest
from playwright.async_api import Page, expect


class TestCustomGameCreation:
    async def test_displays_the_creation_form(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/custom/nouveau")

        await expect(page.locator("main h1").first).to_contain_text(
            "Créer une partie personnalisée"
        )
        await expect(page.locator('input[placeholder="Jeu"]')).to_be_visible()
        await expect(page.locator('input[value="Créer"]')).to_be_visible()

    @pytest.mark.network
    async def test_error_message_for_invalid_article(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        page.set_default_timeout(90_000)
        await page.goto("/custom/nouveau")

        input_el = page.locator('input[placeholder="Jeu"]')
        await input_el.fill("xyznonexistentarticle12345")

        await page.locator('input[value="Créer"]').click()

        await expect(
            page.get_by_text("Impossible de créer une partie personnalisée")
        ).to_be_visible(timeout=30000)

    @pytest.mark.network
    async def test_creates_a_custom_game_from_wikipedia_article(
        self, skip_tutorial_page: Page
    ):
        page = skip_tutorial_page
        page.set_default_timeout(90_000)
        await page.goto("/custom/nouveau")

        input_el = page.locator('input[placeholder="Jeu"]')
        await input_el.fill("France")

        await page.locator('input[value="Créer"]').click()

        await expect(page.get_by_text("Voici le lien de votre partie")).to_be_visible(
            timeout=30000
        )
        await expect(page.locator('input[value="Copier"]')).to_be_visible()
        await expect(page.locator('input[value="Ouvrir"]')).to_be_visible()
