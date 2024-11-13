from django.http import HttpRequest, HttpResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie

from .api import api


@api.post("/csrf")
@ensure_csrf_cookie
@csrf_exempt
async def set_csrf_token(request: HttpRequest):
    return HttpResponse()
