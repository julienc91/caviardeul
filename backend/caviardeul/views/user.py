import uuid

from django.http import HttpRequest, HttpResponse

from caviardeul.models import User
from caviardeul.serializers.user import LoginSchema, UserSchema
from caviardeul.services.authentication import (
    api_authentication,
    optional_api_authentication,
)
from caviardeul.services.user import merge_users, set_user_cookie

from .api import api


@api.get("/users/me", auth=api_authentication, response=UserSchema)
def get_current_user(request: HttpRequest):
    return request.auth


@api.delete("/users/me", auth=api_authentication, response={204: None})
def delete_current_user(request: HttpRequest):
    request.auth.delete()
    return None


@api.post("/login", auth=optional_api_authentication, response={204: None})
def login(request: HttpRequest, payload: LoginSchema, response: HttpResponse):
    response.status_code = 204

    target_user_id = payload.userId
    if not target_user_id:
        return response

    try:
        target_user = User.objects.get(id=uuid.UUID(target_user_id))
    except (ValueError, User.DoesNotExist):
        return response

    current_user = request.auth

    set_user_cookie(response, target_user)
    request.auth = target_user
    if not current_user.is_authenticated or current_user == target_user:
        return response

    merge_users(current_user, target_user)
    return response
