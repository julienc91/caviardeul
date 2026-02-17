import pytest
from playwright.async_api import Page, expect


@pytest.mark.usefixtures("daily_article")
class TestSettings:
    async def test_opens_settings_modal_from_navbar(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/")

        await page.locator("nav").get_by_text("Options").click()

        modal = page.locator(".settings-modal")
        await expect(modal).to_be_visible()
        await expect(modal.locator("h1")).to_have_text("Options")

    async def test_toggle_dark_mode(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/")

        await page.locator("nav").get_by_text("Options").click()
        modal = page.locator(".settings-modal")
        await expect(modal).to_be_visible()

        # Dark mode is ON by default (checked={!lightMode}, lightMode defaults to false)
        dark_mode_checkbox = modal.get_by_label("Activer le mode sombre")
        await expect(dark_mode_checkbox).to_be_checked()

        await dark_mode_checkbox.uncheck()
        await expect(dark_mode_checkbox).not_to_be_checked()

        settings = await page.evaluate("localStorage.getItem('settings')")
        assert '"lightMode":true' in settings

    async def test_toggle_auto_scroll(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/")

        await page.locator("nav").get_by_text("Options").click()
        modal = page.locator(".settings-modal")
        await expect(modal).to_be_visible()

        auto_scroll_checkbox = modal.get_by_label(
            "Défilement automatique vers le mot sélectionné"
        )
        await expect(auto_scroll_checkbox).to_be_checked()

        await auto_scroll_checkbox.uncheck()
        await expect(auto_scroll_checkbox).not_to_be_checked()

        settings = await page.evaluate("localStorage.getItem('settings')")
        assert '"autoScroll":false' in settings

    async def test_settings_persist_on_reload(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/")

        # Toggle dark mode off (it's ON by default)
        await page.locator("nav").get_by_text("Options").click()
        modal = page.locator(".settings-modal")
        await expect(modal).to_be_visible()

        dark_mode_checkbox = modal.get_by_label("Activer le mode sombre")
        await expect(dark_mode_checkbox).to_be_checked()
        await dark_mode_checkbox.uncheck()
        await expect(dark_mode_checkbox).not_to_be_checked()

        # Close modal and reload
        await modal.locator("button").first.click()
        await page.reload()

        # Re-open settings and verify the setting persisted
        await page.locator("nav").get_by_text("Options").click()
        modal = page.locator(".settings-modal")
        await expect(modal).to_be_visible()

        dark_mode_checkbox = modal.get_by_label("Activer le mode sombre")
        await expect(dark_mode_checkbox).not_to_be_checked()
