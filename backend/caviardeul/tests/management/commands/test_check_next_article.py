import pytest
from django.core.management import CommandError, call_command
from django.utils import timezone

from caviardeul.tests.factories import DailyArticleFactory

pytestmark = pytest.mark.django_db


def test_check_next_article_valid(mock_wiki_api):
    articles = [
        DailyArticleFactory(trait_past=True),
        DailyArticleFactory(trait_current=True),
        *DailyArticleFactory.create_batch(3, trait_future=True),
    ]
    articles.sort(key=lambda a: a.date)

    now = timezone.now()
    next_article = next(article for article in articles if article.date > now)

    mock_wiki_api(next_article.page_id, next_article.page_name, "article content")

    call_command("check_next_article")


def test_check_next_article_invalid(mock_wiki_api_error):
    articles = DailyArticleFactory.create_batch(3, trait_future=True)
    articles.sort(key=lambda a: a.date)

    now = timezone.now()
    next_article = next(article for article in articles if article.date > now)

    mock_wiki_api_error(next_article.page_id)

    with pytest.raises(CommandError, match="Error when retrieving daily article"):
        call_command("check_next_article")


def test_check_next_article_has_redirect(mock_wiki_api):
    articles = DailyArticleFactory.create_batch(3, trait_future=True)
    articles.sort(key=lambda a: a.date)

    now = timezone.now()
    next_article = next(article for article in articles if article.date > now)

    mock_wiki_api(
        next_article.page_id,
        next_article.page_name,
        '<div class="redirectMsg"><p>Rediriger vers :</p>'
        '<ul class="redirectText"><li><a href="/wiki/foo" title="Foo">Foo</a></li></ul></div>',
    )

    with pytest.raises(CommandError, match="Error when retrieving daily article"):
        call_command("check_next_article")


def test_check_next_article_missing(mock_wiki_api):
    DailyArticleFactory.create_batch(3, trait_past=True)
    DailyArticleFactory(trait_current=True)

    with pytest.raises(CommandError, match="No daily article left"):
        call_command("check_next_article")
