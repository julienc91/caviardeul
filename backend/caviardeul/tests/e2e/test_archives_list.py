import pytest
from playwright.async_api import Page, expect

from caviardeul.tests.factories import DailyArticleScoreFactory


def _difficulty_title(median: int) -> str:
    if median >= 10:
        return f"{median} coups en moyenne"
    return "Moins de 10 coups en moyenne"


async def _get_difficulty_titles(page: Page) -> list[str]:
    items = page.locator(".archive-grid .archive-item")
    count = await items.count()
    titles = []
    for i in range(count):
        title = await items.nth(i).locator(".article-difficulty").get_attribute("title")
        titles.append(title)
    return titles


@pytest.fixture()
async def completed_article(past_articles, user1):
    completed_article = past_articles[0]
    await DailyArticleScoreFactory.acreate(user=user1, daily_article=completed_article)
    return completed_article


class TestArchivesList:
    async def test_lists_past_articles(self, skip_tutorial_page: Page, past_articles):
        page = skip_tutorial_page
        await page.goto("/archives")

        await expect(page.locator("main h1").first).to_have_text("Archives")

        archive_grid = page.locator(".archive-grid")
        await expect(archive_grid).to_be_visible()
        items = archive_grid.locator(".archive-item")
        await expect(items.first).to_be_visible()

        titles = await _get_difficulty_titles(page)
        assert titles == [
            _difficulty_title(article.median) for article in past_articles
        ]

    async def test_shows_user_stats_when_authenticated(
        self, skip_tutorial_page: Page, login, user1, past_articles, completed_article
    ):
        page = skip_tutorial_page
        await login(user1)
        await page.goto("/archives")

        score_section = page.locator(".right-container")
        await expect(score_section.locator("h1")).to_have_text("Score")
        await expect(score_section).to_contain_text("Parties terminées")
        await expect(score_section).to_contain_text("Nombre d'essais moyen")
        await expect(score_section).to_contain_text("Précision moyenne")

        items = page.locator(".archive-grid .archive-item")
        completed = items.filter(
            has=page.locator("h3", has_text=completed_article.page_name)
        )
        await expect(completed).to_have_count(1)
        non_completed = items.filter(has=page.locator("h3", has_text="?"))
        await expect(non_completed).to_have_count(len(past_articles) - 1)

    async def test_filter_by_termines_and_a_faire(
        self, skip_tutorial_page: Page, login, user1, past_articles, completed_article
    ):
        page = skip_tutorial_page
        await login(user1)
        await page.goto("/archives")

        filter_select = page.locator(".filter-selection select")
        await filter_select.select_option("finished")
        await page.wait_for_timeout(500)

        titles = await _get_difficulty_titles(page)
        assert titles == [_difficulty_title(completed_article.median)]

        await filter_select.select_option("not_finished")
        await page.wait_for_timeout(500)

        titles = await _get_difficulty_titles(page)
        assert titles == [
            _difficulty_title(article.median)
            for article in sorted(past_articles, key=lambda obj: obj.date, reverse=True)
            if article != completed_article
        ]

        await filter_select.select_option("")
        await page.wait_for_timeout(500)

        titles = await _get_difficulty_titles(page)
        assert titles == [
            _difficulty_title(article.median) for article in past_articles
        ]

    async def test_completed_article_shows_user_score_details(
        self, skip_tutorial_page: Page, login, user1, past_articles, completed_article
    ):
        page = skip_tutorial_page
        await login(user1)
        await page.goto("/archives")

        completed_item = page.locator(".archive-item.completed").filter(
            has=page.locator("h3", has_text=completed_article.page_name)
        )
        await expect(completed_item).to_be_visible()
        await expect(completed_item).to_contain_text("Essais")
        await expect(completed_item).to_contain_text("Précision")
        await expect(completed_item).not_to_contain_text("Jouer")

    async def test_completed_article_is_not_a_link(
        self, skip_tutorial_page: Page, login, user1, past_articles, completed_article
    ):
        page = skip_tutorial_page
        await login(user1)
        await page.goto("/archives")

        completed_item = page.locator(".archive-item.completed").filter(
            has=page.locator("h3", has_text=completed_article.page_name)
        )
        await expect(completed_item).to_be_visible()

        # Completed articles should NOT be wrapped in a link
        parent = completed_item.locator("xpath=..")
        parent_tag = await parent.evaluate("el => el.tagName.toLowerCase()")
        assert parent_tag != "a", "Completed article should not be wrapped in a link"

    async def test_filter_finished_with_no_results_shows_empty_message(
        self, skip_tutorial_page: Page, login, user1, past_articles
    ):
        page = skip_tutorial_page
        await login(user1)
        await page.goto("/archives")

        filter_select = page.locator(".filter-selection select")
        await filter_select.select_option("finished")
        await page.wait_for_timeout(500)

        await expect(page.locator(".empty-state")).to_be_visible()
        await expect(page.locator(".empty-state")).to_contain_text(
            "terminé aucune partie"
        )

    async def test_sort_by_date_and_difficulty(
        self, skip_tutorial_page: Page, past_articles
    ):
        page = skip_tutorial_page
        await page.goto("/archives")

        sort_select = page.locator("select").last
        await expect(sort_select).to_have_value("date")

        await expect(page.locator(".archive-grid .archive-item").first).to_be_visible()
        titles = await _get_difficulty_titles(page)
        assert titles == [
            _difficulty_title(article.median) for article in past_articles
        ]

        await sort_select.select_option("difficulty")
        await page.wait_for_timeout(500)

        titles = await _get_difficulty_titles(page)
        assert titles == [
            _difficulty_title(article.median)
            for article in sorted(
                past_articles, key=lambda obj: obj.median, reverse=True
            )
        ]

        await sort_select.select_option("date")
        await page.wait_for_timeout(500)

        titles = await _get_difficulty_titles(page)
        assert titles == [
            _difficulty_title(article.median) for article in past_articles
        ]
