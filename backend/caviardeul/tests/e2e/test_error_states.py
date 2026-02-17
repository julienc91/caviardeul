from playwright.async_api import Page, expect


class TestErrorStates:
    async def test_404_for_unknown_route(self, skip_tutorial_page: Page):
        page = skip_tutorial_page
        await page.goto("/this-route-does-not-exist")

        await expect(page.get_by_text("404")).to_be_visible()

    async def test_error_for_non_existent_archived_article(
        self, skip_tutorial_page: Page
    ):
        page = skip_tutorial_page
        await page.goto("/archives/99999")

        await expect(
            page.get_by_text("404").or_(page.get_by_text("erreur"))
        ).to_be_visible()

    async def test_error_for_non_existent_custom_article(
        self, skip_tutorial_page: Page
    ):
        page = skip_tutorial_page
        response = await page.goto("/custom/nonexistentarticleid00")

        assert response.status == 404
