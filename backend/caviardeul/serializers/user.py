import uuid

from ninja import Schema


class UserSchema(Schema):
    id: uuid.UUID
