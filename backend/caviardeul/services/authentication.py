from datetime import timedelta
from uuid import UUID

from django.contrib.auth.models import AnonymousUser
from django.http import HttpRequest
from django.utils import timezone
from ninja.errors import HttpError
from ninja.utils import check_csrf

from caviardeul.models import User


def api_authentication(request: HttpRequest) -> User | None:
    error_response = check_csrf(request)
    if error_response:
        raise HttpError(403, "CSRF check Failed")

    key = request.COOKIES.get("userId")
    if not key:
        return None

    try:
        user = User.objects.get(id=UUID(key))
    except (ValueError, User.DoesNotExist):
        return None

    now = timezone.now()
    if user.last_login and user.last_login <= now - timedelta(hours=1):
        user.last_login = now
        user.save(update_fields=["last_login"])

    return user


def optional_api_authentication(request: HttpRequest) -> User | AnonymousUser:
    user = api_authentication(request)
    if user is None:
        return AnonymousUser()
    return user
