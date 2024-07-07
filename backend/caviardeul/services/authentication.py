from datetime import timedelta
from uuid import UUID

from django.utils import timezone
from rest_framework.authentication import BaseAuthentication

from caviardeul.models import User


class UserIDAuthentication(BaseAuthentication):
    def authenticate(self, request):
        user_id = request.COOKIES.get("userId")
        if not user_id:
            return None

        try:
            user = User.objects.get(id=UUID(user_id))
        except (ValueError, User.DoesNotExist):
            return None

        now = timezone.now()
        if user.last_login and user.last_login <= now - timedelta(hours=1):
            user.last_login = now
            user.save(update_fields=["last_login"])

        return user, None
