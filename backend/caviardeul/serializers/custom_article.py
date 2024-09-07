from typing import Literal

from ninja import Schema
from pydantic import Field

from caviardeul.serializers.article import BaseEncryptedArticleSchema


class CustomArticleSchema(BaseEncryptedArticleSchema):
    articleId: str = Field(alias="public_id")
    safety: str
    archive: Literal[False] = False
    custom: Literal[True] = True
    pageName: str = Field(alias="page_name")
    content: str
    userScore: Literal[None] = None


class CustomArticleCreateSchema(Schema):
    page_id: str = Field(alias="pageId")
