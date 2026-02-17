from playwright.async_api import Page, expect


class TestDebugPage:
    async def test_hides_info_by_default_and_reveals_on_click(
        self, skip_tutorial_page: Page
    ):
        page = skip_tutorial_page
        await page.goto("/debug")

        await expect(page.locator("main h1")).to_have_text("Debug")

        await expect(page.locator("pre")).not_to_be_visible()
        await expect(
            page.get_by_text("Les informations de debug peuvent contenir")
        ).to_be_visible()

        await page.get_by_text("Afficher").click()
        pre = page.locator("pre")
        await expect(pre).to_be_visible()
        await expect(pre).to_contain_text("Version:")
        await expect(pre).to_contain_text("User-Agent:")

        await page.get_by_text("Masquer").click()
        await expect(pre).not_to_be_visible()
