import uuid

import pytest
from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory

from caviardeul.services.authentication import (
    api_authentication,
    optional_api_authentication,
)
from caviardeul.tests.factories import UserFactory

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize(
    "authentication_func", [api_authentication, optional_api_authentication]
)
class TestAuthentication:
    @pytest.fixture()
    def user(self):
        return UserFactory()

    def test_authenticated(self, authentication_func, user):
        cookies = {"userId": str(user.id)}
        request = RequestFactory().get("/")
        request.COOKIES = cookies

        last_login = user.last_login
        res = authentication_func(request)
        assert res == user

        user.refresh_from_db()
        assert user.last_login > last_login

    def test_no_cookie(self, authentication_func, user):
        request = RequestFactory().get("/")
        res = authentication_func(request)
        if authentication_func is optional_api_authentication:
            assert isinstance(res, AnonymousUser)
        else:
            assert res is None

    def test_invalid_cookie(self, authentication_func, user):
        request = RequestFactory().get("/")
        request.COOKIES = {"userId": "not-a-uuid"}
        res = authentication_func(request)
        if authentication_func is optional_api_authentication:
            assert isinstance(res, AnonymousUser)
        else:
            assert res is None

    def test_unknown_user_id(self, authentication_func, user):
        request = RequestFactory().get("/")
        request.COOKIES = {"userId": str(uuid.uuid4())}
        res = authentication_func(request)
        if authentication_func is optional_api_authentication:
            assert isinstance(res, AnonymousUser)
        else:
            assert res is None
