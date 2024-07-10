from ninja import Schema
from pydantic import Field, model_validator


class ArticleScoreCreateSchema(Schema):
    nb_attempts: int = Field(gt=0, alias="nbAttempts")
    nb_correct: int = Field(gt=0, alias="nbCorrect")
    article_id: str | int = Field(alias="articleId")
    custom: bool

    @model_validator(mode="after")
    def validate(self):
        if self.nb_correct > self.nb_attempts:
            raise ValueError()
        return self
