import json

import pytest

from caviardeul.models import DailyArticleScore, User
from caviardeul.tests.factories import (
    CustomArticleFactory,
    DailyArticleFactory,
    DailyArticleScoreFactory,
    UserFactory,
)

pytestmark = pytest.mark.django_db


class TestPostArticleScore:
    @pytest.mark.parametrize("is_first_win", [True, False])
    def test_post_custom_article_score(
        self, client, is_first_win, captured_metrics, django_capture_on_commit_callbacks
    ):
        article = CustomArticleFactory(
            nb_winners=0 if is_first_win else 10,
            stats={} if is_first_win else {"distribution": {"1": 3, "5": 7}},
        )
        initial_stats = article.stats
        initial_nb_winners = article.nb_winners

        payload = {
            "nbAttempts": 72,
            "nbCorrect": 26,
            "articleId": article.public_id,
            "custom": True,
        }
        with django_capture_on_commit_callbacks(execute=True):
            res = client.post(
                "/scores", json.dumps(payload), content_type="application/json"
            )
        assert res.status_code == 204, res.content

        article.refresh_from_db()
        assert article.median == (70 if is_first_win else 50)
        assert article.nb_winners == initial_nb_winners + 1

        if is_first_win:
            expected_stats = {"distribution": {"7": 1}}
        else:
            expected_stats = {"distribution": {**initial_stats["distribution"]}}
            expected_stats["distribution"]["7"] = 1
        assert article.stats == expected_stats

        assert captured_metrics.without_requests() == [
            ("count", "user.created", 1, None, {"source": "score"}),
            ("count", "score.submitted", 1, None, {"type": "custom", "user": "new"}),
            ("distribution", "score.attempts", 72, None, {"type": "custom"}),
        ]

    @pytest.mark.parametrize("authenticated", [True, False])
    @pytest.mark.parametrize("is_first_win", [True, False])
    @pytest.mark.parametrize("is_current", [True, False])
    def test_post_daily_article_score(
        self,
        client,
        authenticated,
        is_first_win,
        is_current,
        captured_metrics,
        django_capture_on_commit_callbacks,
    ):
        user = UserFactory()
        if authenticated:
            client.cookies.load({"userId": str(user.id)})

        article = DailyArticleFactory(
            trait_past=not is_current,
            trait_current=is_current,
            nb_winners=0 if is_first_win else 10,
            stats={} if is_first_win else {"distribution": {"1": 3, "5": 7}},
        )
        initial_stats = article.stats
        initial_nb_winners = article.nb_winners
        initial_nb_daily_winners = article.nb_daily_winners

        payload = {
            "nbAttempts": 72,
            "nbCorrect": 26,
            "articleId": article.id,
            "custom": False,
        }
        with django_capture_on_commit_callbacks(execute=True):
            res = client.post(
                "/scores", json.dumps(payload), content_type="application/json"
            )
        assert res.status_code == 204, res.content

        score = DailyArticleScore.objects.get()
        assert score.daily_article_id == article.id
        assert score.nb_attempts == payload["nbAttempts"]
        assert score.nb_correct == payload["nbCorrect"]
        if authenticated:
            assert score.user_id == user.id
        else:
            new_user = User.objects.exclude(id=user.id).get()
            assert str(new_user.id) == client.cookies["userId"].value
            assert score.user_id == new_user.id

        article.refresh_from_db()
        assert article.median == (70 if is_first_win else 50)
        assert article.nb_winners == initial_nb_winners + 1
        assert article.nb_daily_winners == initial_nb_daily_winners + (
            1 if is_current else 0
        )

        if is_first_win:
            expected_stats = {"distribution": {"7": 1}}
        else:
            expected_stats = {"distribution": {**initial_stats["distribution"]}}
            expected_stats["distribution"]["7"] = 1
        assert article.stats == expected_stats

        article_type = "daily" if is_current else "archive"
        user_type = "existing" if authenticated else "new"
        expected_metrics = [
            (
                "count",
                "score.submitted",
                1,
                None,
                {"type": article_type, "user": user_type},
            ),
            ("distribution", "score.attempts", 72, None, {"type": article_type}),
        ]
        if not authenticated:
            expected_metrics.insert(
                0, ("count", "user.created", 1, None, {"source": "score"})
            )
        assert captured_metrics.without_requests() == expected_metrics

    def test_post_already_saved_score(
        self, client, captured_metrics, django_capture_on_commit_callbacks
    ):
        user = UserFactory()
        client.cookies.load({"userId": str(user.id)})

        article = DailyArticleFactory(trait_past=True)
        initial_median = article.median
        initial_stats = article.stats
        initial_nb_winners = article.nb_winners
        initial_nb_daily_winners = article.nb_daily_winners
        score = DailyArticleScoreFactory(user=user, daily_article=article)

        payload = {
            "nbAttempts": 52,
            "nbCorrect": 26,
            "articleId": article.id,
            "custom": False,
        }
        with django_capture_on_commit_callbacks(execute=True):
            res = client.post(
                "/scores", json.dumps(payload), content_type="application/json"
            )
        assert res.status_code == 204, res.content

        article.refresh_from_db()
        assert article.median == initial_median
        assert article.stats == initial_stats
        assert article.nb_winners == initial_nb_winners
        assert article.nb_daily_winners == initial_nb_daily_winners

        score_ = DailyArticleScore.objects.get()
        assert score_.id == score.id
        assert score_.created_at == score.created_at

        assert captured_metrics.without_requests() == []

    def test_post_score_on_future_article(self, client):
        article = DailyArticleFactory(trait_future=True)
        payload = {
            "nbAttempts": 52,
            "nbCorrect": 26,
            "articleId": article.id,
            "custom": False,
        }
        res = client.post(
            "/scores", json.dumps(payload), content_type="application/json"
        )
        assert res.status_code == 400, res.content
        assert not DailyArticleScore.objects.exists()

    @pytest.mark.parametrize("custom", [True, False])
    def test_post_invalid_score(self, client, custom):
        daily_article = DailyArticleFactory(trait_past=True)
        custom_article = CustomArticleFactory()

        payload = {
            "nbAttempts": 12,
            "nbCorrect": 53,
            "articleId": custom_article.public_id if custom else daily_article.id,
            "custom": custom,
        }
        res = client.post(
            "/scores", json.dumps(payload), content_type="application/json"
        )
        assert res.status_code == 422, res.content
