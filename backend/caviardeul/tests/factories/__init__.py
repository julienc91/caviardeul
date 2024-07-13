import random
from datetime import datetime, time, timedelta
from datetime import timezone as tz
from typing import Literal

import factory
from django.utils import timezone
from django.utils.text import slugify
from factory.django import DjangoModelFactory

from caviardeul.constants import Safety
from caviardeul.services.custom_article import generate_public_id
from caviardeul.services.score import compute_median_from_distribution


class Faker(factory.Faker):
    def evaluate(self, instance, step, extra):
        locale = extra.pop("locale")
        subfaker = self._get_faker(locale)
        if extra.pop("unique", False):
            subfaker = subfaker.unique
        return subfaker.format(self.provider, **extra)


class UserFactory(DjangoModelFactory):
    class Meta:
        model = "caviardeul.User"

    username = Faker("user_name", unique=True)
    date_joined = Faker(
        "date_time_between", start_date="-1y", end_date="-30d", tzinfo=tz.utc
    )
    last_login = Faker(
        "date_time_between", start_date="-30d", end_date="now", tzinfo=tz.utc
    )


class _ArticleFactory(DjangoModelFactory):
    page_name = Faker("city", unique=True)
    page_id = factory.LazyAttribute(lambda obj: slugify(obj.page_name))
    nb_winners = Faker("pyint")
    stats = factory.LazyAttribute(
        lambda obj: {"distribution": {"10": obj.nb_winners}}
        if obj.nb_winners > 0
        else {}
    )
    median = factory.LazyAttribute(
        lambda obj: compute_median_from_distribution(obj.stats.get("distribution", {}))
    )


def _create_date(mode: Literal["past", "current", "future"]):
    date = timezone.now()
    if mode == "past":
        date = date - timedelta(days=random.randint(1, 5000))
    elif mode == "future":
        date = date + timedelta(days=random.randint(1, 5000))
    return datetime.combine(date, time(), tzinfo=tz.utc)


class DailyArticleFactory(_ArticleFactory):
    class Meta:
        model = "caviardeul.DailyArticle"
        django_get_or_create = ("date",)

    nb_winners = factory.LazyAttribute(
        lambda obj: random.randint(0, 100) if obj.date < timezone.now() else 0
    )
    nb_daily_winners = factory.LazyAttribute(
        lambda obj: random.randint(0, obj.nb_winners)
    )

    class Params:
        trait_future = factory.Trait(
            date=factory.LazyFunction(lambda: _create_date(mode="future"))
        )
        trait_current = factory.Trait(
            date=factory.LazyFunction(lambda: _create_date(mode="current"))
        )
        trait_past = factory.Trait(
            date=factory.LazyFunction(lambda: _create_date(mode="past"))
        )


class CustomArticleFactory(_ArticleFactory):
    class Meta:
        model = "caviardeul.CustomArticle"

    public_id = factory.LazyFunction(generate_public_id)
    safety = Faker("random_element", elements=Safety.values)
    created_at = Faker("date_time_between", start_date="-1y", tzinfo=tz.utc)
    created_by = factory.SubFactory(UserFactory)


class DailyArticleScoreFactory(DjangoModelFactory):
    class Meta:
        model = "caviardeul.DailyArticleScore"
        django_get_or_create = ("user", "daily_article")

    user = factory.SubFactory(UserFactory)
    daily_article = factory.SubFactory(DailyArticleFactory, trait_past=True)
    nb_attempts = Faker("pyint")
    nb_correct = Faker("pyint")
