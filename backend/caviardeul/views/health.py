from django.http import HttpRequest

from .api import api


@api.get("/health", response={204: None})
async def health(request: HttpRequest):
    return 204, None
