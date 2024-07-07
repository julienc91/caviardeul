import pytest
from django.core.management import call_command

from caviardeul.tests.factories import (
    DailyArticleFactory,
    DailyArticleScoreFactory,
)

pytestmark = pytest.mark.django_db


def test_repair_scores():
    article1 = DailyArticleFactory(
        trait_past=True, stats={"distribution": {"1": 1, "2": 3}}
    )
    article2 = DailyArticleFactory(
        trait_past=True, stats={"distribution": {"1": 2, "3": 1}}
    )

    DailyArticleScoreFactory(daily_article=article1, nb_attempts=3)
    DailyArticleScoreFactory(daily_article=article1, nb_attempts=12)
    DailyArticleScoreFactory(daily_article=article1, nb_attempts=14)
    DailyArticleScoreFactory(daily_article=article1, nb_attempts=35)
    DailyArticleScoreFactory(daily_article=article1, nb_attempts=36)
    DailyArticleScoreFactory(daily_article=article1, nb_attempts=26)
    DailyArticleScoreFactory(daily_article=article1, nb_attempts=12)

    call_command("repair_scores")

    article1.refresh_from_db()
    assert article1.stats["distribution"] == {"0": 1, "1": 3, "2": 3, "3": 2}

    article2.refresh_from_db()
    assert article2.stats["distribution"] == {"1": 2, "3": 1}
