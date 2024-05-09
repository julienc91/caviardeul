from uuid import UUID

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

        return user, None
