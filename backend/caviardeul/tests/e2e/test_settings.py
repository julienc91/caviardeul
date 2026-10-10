import re

import pytest
from playwright.async_api import Page, expect


@pytest.mark.usefixtures("daily_article")
class TestSettings:
    async def test_opens_settings_page_from_navbar(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/")

        await page.locator("nav").get_by_role("link", name="Paramètres").click()

        await expect(page).to_have_url(re.compile(r"/parametres$"))
        await expect(page.locator("main h1")).to_have_text("Options et compte")

    async def test_toggle_dark_mode(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/parametres")
        settings_page = page.locator("#settings")

        # Dark mode is ON by default (checked={!lightMode}, lightMode defaults to false)
        dark_mode_checkbox = settings_page.get_by_label("Activer le mode sombre")
        await expect(dark_mode_checkbox).to_be_checked()

        await dark_mode_checkbox.uncheck()
        await expect(dark_mode_checkbox).not_to_be_checked()

        settings = await page.evaluate("localStorage.getItem('settings')")
        assert '"lightMode":true' in settings

    async def test_settings_persist_on_reload(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/parametres")

        # Toggle dark mode off (it's ON by default)
        settings_page = page.locator("#settings")

        dark_mode_checkbox = settings_page.get_by_label("Activer le mode sombre")
        await expect(dark_mode_checkbox).to_be_checked()
        await dark_mode_checkbox.uncheck()
        await expect(dark_mode_checkbox).not_to_be_checked()

        await page.reload()

        # Verify the setting persisted
        settings_page = page.locator("#settings")

        dark_mode_checkbox = settings_page.get_by_label("Activer le mode sombre")
        await expect(dark_mode_checkbox).not_to_be_checked()
