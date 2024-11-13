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
from caviardeul.utils import aset

pytestmark = pytest.mark.django_db


async def test_create_user_for_request():
    request = RequestFactory().get("/")
    user = await create_user_for_request(request)

    assert str(user.id) == user.username
    assert user.date_joined is not None
    assert user.last_login is not None
    assert user == await User.objects.aget()
    assert request.auth == user


class TestMergeUsers:
    async def test_merge_same_user(self):
        user = await UserFactory.acreate()
        with pytest.raises(ValueError, match="Merging needs distinct users"):
            await merge_users(user, user)

    async def test_merge_custom_articles(self):
        user1, user2, other_user = await UserFactory.acreate_batch(3)

        await CustomArticleFactory.acreate(created_by=user1, page_id="foo")
        await CustomArticleFactory.acreate(created_by=user2, page_id="foo")
        await CustomArticleFactory.acreate(created_by=user2, page_id="bar")
        await CustomArticleFactory.acreate(created_by=user1, page_id="baz")
        await CustomArticleFactory.acreate(created_by=other_user, page_id="baz")

        await merge_users(user1, user2)

        with pytest.raises(User.DoesNotExist):
            await user1.arefresh_from_db()

        expected_custom_articles = [
            ("foo", user2.id),
            ("bar", user2.id),
            ("baz", user2.id),
            ("baz", other_user.id),
        ]
        assert await aset(
            CustomArticle.objects.values_list("page_id", "created_by")
        ) == set(expected_custom_articles)

    async def test_merge_daily_article_scores(self):
        user1, user2, user3 = await UserFactory.acreate_batch(3)

        articles = await DailyArticleFactory.acreate_batch(5, trait_past=True)

        scores = await DailyArticleScore.objects.abulk_create(
            [
                DailyArticleScoreFactory.build(daily_article=articles[0], user=user1),
                DailyArticleScoreFactory.build(daily_article=articles[0], user=user2),
                DailyArticleScoreFactory.build(daily_article=articles[1], user=user3),
                DailyArticleScoreFactory.build(daily_article=articles[1], user=user2),
                DailyArticleScoreFactory.build(daily_article=articles[1], user=user1),
                DailyArticleScoreFactory.build(daily_article=articles[2], user=user1),
                DailyArticleScoreFactory.build(daily_article=articles[3], user=user2),
            ]
        )

        await merge_users(user1, user2)

        with pytest.raises(User.DoesNotExist):
            await user1.arefresh_from_db()

        expected_scores = [
            (articles[0].id, user2.id, scores[0]),
            (articles[1].id, user3.id, scores[2]),
            (articles[1].id, user2.id, scores[3]),
            (articles[2].id, user2.id, scores[5]),
            (articles[3].id, user2.id, scores[6]),
        ]

        assert await aset(
            DailyArticleScore.objects.values_list(
                "daily_article_id", "user_id", "created_at", "nb_attempts", "nb_correct"
            )
        ) == {
            (article_id, user_id, score.created_at, score.nb_attempts, score.nb_correct)
            for article_id, user_id, score in expected_scores
        }
