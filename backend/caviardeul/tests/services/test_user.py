import pytest
from django.test import RequestFactory

from caviardeul.models import CustomArticle, DailyArticleScore, User
from caviardeul.services.user import create_user_for_request, merge_users
from caviardeul.tests.factories import (
    CustomArticleFactory,
    DailyArticleFactory,
    DailyArticleScoreFactory,
    UserFactory,
)

pytestmark = pytest.mark.django_db


def test_create_user_for_request():
    request = RequestFactory().get("/")
    user = create_user_for_request(request)

    assert str(user.id) == user.username
    assert user.date_joined is not None
    assert user.last_login is not None
    assert user == User.objects.get()
    assert request.auth == user
    assert request.user == user


class TestMergeUsers:
    def test_merge_same_user(self):
        user = UserFactory()
        with pytest.raises(ValueError, match="Merging needs distinct users"):
            merge_users(user, user)

    def test_merge_custom_articles(self):
        user1, user2, other_user = UserFactory.create_batch(3)

        (CustomArticleFactory(created_by=user1, page_id="foo"),)
        (CustomArticleFactory(created_by=user2, page_id="foo"),)
        (CustomArticleFactory(created_by=user2, page_id="bar"),)
        (CustomArticleFactory(created_by=user1, page_id="baz"),)
        (CustomArticleFactory(created_by=other_user, page_id="baz"),)

        merge_users(user1, user2)

        with pytest.raises(User.DoesNotExist):
            user1.refresh_from_db()

        expected_custom_articles = [
            ("foo", user2.id),
            ("bar", user2.id),
            ("baz", user2.id),
            ("baz", other_user.id),
        ]
        assert set(CustomArticle.objects.values_list("page_id", "created_by")) == set(
            expected_custom_articles
        )

    def test_merge_daily_article_scores(self):
        user1, user2, other_user = UserFactory.create_batch(3)

        articles = DailyArticleFactory.create_batch(5, trait_past=True)

        scores = [
            DailyArticleScoreFactory(daily_article=articles[0], user=user1),
            DailyArticleScoreFactory(daily_article=articles[0], user=user2),
            DailyArticleScoreFactory(daily_article=articles[1], user=other_user),
            DailyArticleScoreFactory(daily_article=articles[1], user=user2),
            DailyArticleScoreFactory(daily_article=articles[1], user=user1),
            DailyArticleScoreFactory(daily_article=articles[2], user=user1),
            DailyArticleScoreFactory(daily_article=articles[3], user=user2),
        ]

        merge_users(user1, user2)

        with pytest.raises(User.DoesNotExist):
            user1.refresh_from_db()

        expected_scores = [
            (articles[0].id, user2.id, scores[0]),
            (articles[1].id, other_user.id, scores[2]),
            (articles[1].id, user2.id, scores[3]),
            (articles[2].id, user2.id, scores[5]),
            (articles[3].id, user2.id, scores[6]),
        ]

        assert set(
            DailyArticleScore.objects.values_list(
                "daily_article_id", "user_id", "created_at", "nb_attempts", "nb_correct"
            )
        ) == {
            (article_id, user_id, score.created_at, score.nb_attempts, score.nb_correct)
            for article_id, user_id, score in expected_scores
        }
