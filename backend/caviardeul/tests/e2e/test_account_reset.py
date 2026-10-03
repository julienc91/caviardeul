from playwright.async_api import Page, expect


class TestAccountReset:
    async def test_shows_confirmation_modal_with_irreversible_warning(
        self, skip_tutorial_page: Page, login, context, user1
    ):
        page = skip_tutorial_page
        await login(user1)
        await page.goto("/parametres")

        await page.get_by_role("button", name="Réinitialiser", exact=True).click()

        modal = page.locator(".modal").filter(has_text="Réinitialiser")
        await expect(modal).to_be_visible()
        await expect(modal).to_contain_text("irréversible")
        await expect(modal.get_by_text("Confirmer")).to_be_visible()

        await modal.get_by_text("Confirmer").click()
        await page.wait_for_load_state("networkidle")

        cookies = await context.cookies()
        user_cookies = [c for c in cookies if c["name"] == "userId"]
        assert user_cookies == [], (
            f"Expected userId cookie to be deleted, found: {user_cookies}"
        )

        await expect(
            page.get_by_role("button", name="Réinitialiser", exact=True)
        ).not_to_be_visible()

    async def test_reset_button_not_visible_when_not_logged_in(
        self, skip_tutorial_page: Page
    ):
        page = skip_tutorial_page
        await page.goto("/parametres")

        await expect(
            page.get_by_role("button", name="Réinitialiser", exact=True)
        ).not_to_be_visible()

    async def test_reset_button_visible_with_invalid_user_cookie(
        self, skip_tutorial_page: Page, context
    ):
        await context.add_cookies(
            [
                {
                    "name": "userId",
                    "value": "00000000-0000-4000-a000-ffffffffffff",
                    "domain": "localhost",
                    "path": "/",
                },
            ]
        )

        page = skip_tutorial_page
        await page.goto("/parametres")

        await expect(
            page.get_by_role("button", name="Réinitialiser", exact=True)
        ).to_be_visible()

        await page.get_by_role("button", name="Réinitialiser", exact=True).click()
        modal = page.locator(".modal").filter(has_text="Réinitialiser")
        await modal.get_by_text("Confirmer").click()

        await page.wait_for_load_state("networkidle")
        await expect(
            page.get_by_role("button", name="Réinitialiser", exact=True)
        ).not_to_be_visible()
