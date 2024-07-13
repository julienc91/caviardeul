import uuid

from ninja import Schema


class UserSchema(Schema):
    id: uuid.UUID


class LoginSchema(Schema):
    userId: str | None = None
