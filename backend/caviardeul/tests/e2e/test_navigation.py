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
        await expect(modal).to_contain_text("Retrouvez l'article Wikipédia caché")

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

    async def test_settings_link_navigates_to_settings_page(
        self, skip_tutorial_page: Page
    ):
        page = skip_tutorial_page
        await page.goto("/")

        await page.locator("nav").get_by_role("link", name="Paramètres").click()
        await expect(page).to_have_url(re.compile(r"/parametres$"))

    async def test_current_page_is_highlighted_in_navbar(
        self, skip_tutorial_page: Page
    ):
        page = skip_tutorial_page
        await page.goto("/archives")

        await expect(page.locator("nav li.active")).to_have_text("Archives")

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
