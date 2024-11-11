from ninja import Schema


class ErrorSchema(Schema):
    detail: str
