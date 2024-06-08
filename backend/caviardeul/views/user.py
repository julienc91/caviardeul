import uuid

from django.http import HttpResponseRedirect
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
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


class LoginView(APIView):
    permission_classes = []

    def get(self, request):
        response = HttpResponseRedirect("/archives")

        target_user_id = request.query_params.get("user")
        if not target_user_id:
            return response

        try:
            target_user = User.objects.get(id=uuid.UUID(target_user_id))
        except (ValueError, User.DoesNotExist):
            return response

        current_user = request.user

        response.set_cookie("userId", str(target_user.id))
        request.user = target_user
        if not current_user.is_authenticated or current_user == target_user:
            return response

        merge_users(current_user, target_user)
        return response
