import uuid

from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from caviardeul.models import User
from caviardeul.serializers.user import UserSerializer
from caviardeul.services.user import merge_users


class UserViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.all()

    @action(methods=("GET", "DELETE"), detail=False)
    def me(self, request):
        if request.method == "DELETE":
            request.user.delete()
            return Response(None, status=204)

        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(methods=("POST",), url_path="me/merge", detail=False)
    def merge(self, request):
        target_user_id = request.data.get("target_id")
        try:
            target_user = User.objects.get(id=uuid.UUID(target_user_id))
        except (ValueError, User.DoesNotExist):
            raise ValidationError("Target user doesn't exist")

        response = Response(None, 204)
        if target_user == self.request.user:
            return response

        merge_users(self.request.user, target_user)
        request.user = target_user
        response.set_cookie("userId", str(target_user.id))
        return response
