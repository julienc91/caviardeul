import re

import pytest
from playwright.async_api import Page, expect


@pytest.mark.usefixtures("daily_article")
class TestNavigation:
    async def test_shows_introduction_modal_on_first_visit(self, page: Page):
        await page.goto("/")
        modal = page.locator(".modal")
        await expect(modal).to_be_visible()
        await expect(modal.locator("h1")).to_have_text("Caviardeul")
        await expect(modal).to_contain_text("jeu de réflexion")

        await modal.get_by_text("Commencer").click()
        await expect(modal).not_to_be_visible()

        await page.reload()
        await expect(page.locator(".modal")).not_to_be_visible()

    async def test_home_link_navigates_to_daily_game(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/archives")

        await page.locator("nav h1").get_by_text("Caviardeul").click()
        await expect(page).to_have_url(re.compile(r"/$"))
        await expect(page.locator("#game")).to_be_visible()

    async def test_options_link_opens_settings_modal(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/")

        await page.locator("nav").get_by_text("Options").click()

        modal = page.locator(".settings-modal")
        await expect(modal).to_be_visible()
        await expect(modal.locator("h1")).to_have_text("Options")

    async def test_navbar_links_navigate_correctly(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/")

        archives_link = page.locator("nav").get_by_text("Archives")
        await expect(archives_link).to_be_visible()
        await archives_link.click()
        await expect(page).to_have_url(re.compile(r"/archives"))

        custom_link = page.locator("nav").get_by_text("Partie personnalisée")
        await expect(custom_link).to_be_visible()
        await custom_link.click()
        await expect(page).to_have_url(re.compile(r"/custom/nouveau"))

        about_link = page.locator("nav").get_by_text("À propos")
        await expect(about_link).to_be_visible()
        await about_link.click()
        await expect(page).to_have_url(re.compile(r"/a-propos"))
