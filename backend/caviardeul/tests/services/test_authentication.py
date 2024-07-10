import uuid

import pytest
from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory

from caviardeul.services.authentication import (
    APIAuthentication,
    OptionalAPIAuthentication,
)
from caviardeul.tests.factories import UserFactory

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize(
    "authentication_class", [APIAuthentication, OptionalAPIAuthentication]
)
class TestAuthentication:
    @pytest.fixture()
    def user(self):
        return UserFactory()

    def test_authenticated(self, authentication_class, user):
        cookies = {"userId": str(user.id)}
        request = RequestFactory().get("/")
        request.COOKIES = cookies

        last_login = user.last_login
        res = authentication_class()(request)
        assert res == user

        user.refresh_from_db()
        assert user.last_login > last_login

    def test_no_cookie(self, authentication_class, user):
        request = RequestFactory().get("/")
        res = authentication_class()(request)
        if authentication_class == OptionalAPIAuthentication:
            assert isinstance(res, AnonymousUser)
        else:
            assert res is None

    def test_invalid_cookie(self, authentication_class, user):
        request = RequestFactory().get("/")
        request.COOKIES = {"userId": "not-a-uuid"}
        res = authentication_class()(request)
        if authentication_class == OptionalAPIAuthentication:
            assert isinstance(res, AnonymousUser)
        else:
            assert res is None

    def test_unknown_user_id(self, authentication_class, user):
        request = RequestFactory().get("/")
        request.COOKIES = {"userId": str(uuid.uuid4())}
        res = authentication_class()(request)
        if authentication_class == OptionalAPIAuthentication:
            assert isinstance(res, AnonymousUser)
        else:
            assert res is None
