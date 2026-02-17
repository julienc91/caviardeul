from playwright.async_api import Page, expect


class TestAboutPage:
    async def test_loads_with_all_sections(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/a-propos")

        await expect(page.locator("main h1")).to_contain_text("À propos de Caviardeul")
        await expect(page.get_by_text("Présentation")).to_be_visible()
        await expect(page.get_by_text("Données personnelles")).to_be_visible()
        await expect(page.get_by_role("heading", name="Cookies")).to_be_visible()
        await expect(page.get_by_role("heading", name="Contact")).to_be_visible()
