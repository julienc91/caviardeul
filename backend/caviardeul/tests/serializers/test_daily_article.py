import pytest

from caviardeul.serializers.daily_article import DailyArticleStatsSchema


@pytest.mark.parametrize(
    "median, expected_category",
    [
        (0, 0),
        (20, 0),
        (29, 0),
        (30, 1),
        (49, 1),
        (50, 2),
        (79, 2),
        (80, 3),
        (109, 3),
        (110, 4),
        (500, 4),
    ],
)
def test_difficulty_category(median, expected_category):
    stats = DailyArticleStatsSchema.model_validate(
        {"median": median, "nb_winners": 100}
    )
    assert stats.category == expected_category
