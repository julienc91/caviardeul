import uuid

import pytest
from django.test import RequestFactory

from caviardeul.services.authentication import UserIDAuthentication
from caviardeul.tests.factories import UserFactory

pytestmark = pytest.mark.django_db


class TestAuthentication:
    @pytest.fixture()
    def user(self):
        return UserFactory()

    def test_authenticated(self, user):
        cookies = {"userId": str(user.id)}
        request = RequestFactory().get("/")
        request.COOKIES = cookies

        last_login = user.last_login
        res = UserIDAuthentication().authenticate(request)
        assert res == (user, None)

        user.refresh_from_db()
        assert user.last_login > last_login

    def test_no_cookie(self, user):
        request = RequestFactory().get("/")
        res = UserIDAuthentication().authenticate(request)
        assert res is None

    def test_invalid_cookie(self, user):
        request = RequestFactory().get("/")
        request.COOKIES = {"userId": "not-a-uuid"}
        res = UserIDAuthentication().authenticate(request)
        assert res is None

    def test_unknown_user_id(self, user):
        request = RequestFactory().get("/")
        request.COOKIES = {"userId": str(uuid.uuid4())}
        res = UserIDAuthentication().authenticate(request)
        assert res is None
