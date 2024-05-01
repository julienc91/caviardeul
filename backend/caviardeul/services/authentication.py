from rest_framework.authentication import BaseAuthentication

from caviardeul.models import User
from uuid import UUID


class UserIDAuthentication(BaseAuthentication):
    def authenticate(self, request):
        user_id = request.COOKIES.get("userId")
        if not user_id:
            return None

        try:
            user = User.objects.get(id=UUID(user_id))
        except (ValueError, User.DoesNotExist):
            return None

        return user, None
