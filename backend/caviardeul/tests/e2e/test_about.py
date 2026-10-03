from playwright.async_api import Page, expect


class TestAboutPage:
    async def test_loads_with_all_sections(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/a-propos")

        await expect(page.locator("main h1")).to_contain_text("Caviardeul")
        await expect(page.locator(".eyebrow")).to_have_text("À propos")
        await expect(page.get_by_role("heading", name="Présentation")).to_be_visible()
        await expect(page.get_by_role("heading", name="Comment jouer")).to_be_visible()
        await expect(
            page.get_by_role("heading", name="Données personnelles")
        ).to_be_visible()
        await expect(page.get_by_role("heading", name="Cookies")).to_be_visible()
        await expect(page.get_by_role("heading", name="Contact")).to_be_visible()
