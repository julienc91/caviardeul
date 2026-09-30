from django.http import HttpRequest
from ninja import Status

from .api import api


@api.get("/health", response={204: None})
async def health(request: HttpRequest):
    return Status(204, None)
