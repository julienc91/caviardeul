from datetime import datetime, timedelta
from typing import Literal

from django.utils import timezone
from ninja import Schema
from pydantic import Field, computed_field, field_validator, model_validator

from caviardeul.constants import Safety
from caviardeul.models import DailyArticle
from caviardeul.serializers.article import BaseEncryptedArticleSchema


class DailyArticleScoreSchema(Schema):
    nbAttempts: int = Field(alias="nb_attempts")
    nbCorrect: int = Field(alias="nb_correct")


class DailyArticleStatsSchema(Schema):
    median: int = Field(alias="median")
    nbWinners: int = Field(alias="nb_winners")

    @computed_field
    def category(self) -> int:
        thresholds = [20, 40, 80, 100]
        for category, threshold in enumerate(thresholds):
            if self.median < threshold:
                return category
        return len(thresholds)


class DailyArticleSchema(BaseEncryptedArticleSchema):
    articleId: int = Field(alias="id")
    safety: Literal[Safety.SAFE] = Safety.SAFE
    archive: bool = Field(alias="date")
    custom: Literal[False] = False
    pageName: str = Field(alias="page_name")
    content: str
    userScore: DailyArticleScoreSchema | None = Field(alias="user_score", default=None)
    stats: DailyArticleStatsSchema = Field(alias="_self")

    @model_validator(mode="before")
    @classmethod
    def set_stats(cls, obj: DailyArticle):
        obj._self = obj
        return obj

    @field_validator("archive", mode="before")
    @classmethod
    def set_archive(cls, value: datetime) -> bool:
        return timezone.now() - value > timedelta(days=1)


class DailyArticleListSchema(Schema):
    articleId: int = Field(alias="id")
    safety: Literal[Safety.SAFE] = Safety.SAFE
    archive: bool = Field(alias="date")
    custom: Literal[False] = False
    pageName: str | None = Field(alias="page_name")
    userScore: DailyArticleScoreSchema | None = Field(alias="user_score", default=None)
    stats: DailyArticleStatsSchema = Field(alias="_self")

    @model_validator(mode="before")
    @classmethod
    def set_stats(cls, obj: DailyArticle):
        obj._self = obj
        return obj

    @model_validator(mode="after")
    def set_page_name(self):
        if not self.userScore:
            self.pageName = None
        return self

    @field_validator("archive", mode="before")
    @classmethod
    def set_archive(cls, value: datetime) -> bool:
        return timezone.now() - value > timedelta(days=1)
