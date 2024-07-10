from datetime import timedelta
from uuid import UUID

from django.contrib.auth.models import AnonymousUser
from django.utils import timezone
from ninja.security import APIKeyCookie

from caviardeul.models import User


class APIAuthentication(APIKeyCookie):
    param_name = "userId"

    def authenticate(self, request, key):
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


class OptionalAPIAuthentication(APIAuthentication):
    def authenticate(self, request, key):
        res = super().authenticate(request, key)
        if res is None:
            return AnonymousUser()
        return res
