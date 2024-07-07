from unittest.mock import Mock

import pytest

from caviardeul.models import User
from caviardeul.tests.factories import UserFactory

pytestmark = pytest.mark.django_db


class TestGetCurrentUser:
    @pytest.mark.parametrize("authenticated", [True, False])
    def test_get_current_user(self, client, authenticated):
        user = UserFactory()
        if authenticated:
            client.cookies.load({"userId": str(user.id)})

        res = client.get("/users/me")
        if not authenticated:
            assert res.status_code == 403, res.content
        else:
            assert res.status_code == 200, res.content

            data = res.json()
            assert data == {"id": str(user.id)}


class TestDeleteCurrentUser:
    @pytest.mark.parametrize("authenticated", [True, False])
    def test_delete_current_user(self, client, authenticated):
        user = UserFactory()
        if authenticated:
            client.cookies.load({"userId": str(user.id)})

        res = client.delete("/users/me")
        if not authenticated:
            assert res.status_code == 403, res.content
        else:
            assert res.status_code == 204, res.content

        assert User.objects.filter(id=user.id).exists() == (not authenticated)


class TestLogin:
    @pytest.mark.parametrize("authenticated", [True, False])
    @pytest.mark.parametrize("target", [None, "user", "other_user"])
    def test_login(self, monkeypatch, client, authenticated, target):
        monkeypatch.setattr(
            "caviardeul.views.user.merge_users", mock_merge_users := Mock()
        )

        user, other_user = UserFactory.create_batch(2)
        if authenticated:
            client.cookies.load({"userId": str(user.id)})

        query_params = {}
        if target:
            query_params["user"] = (
                str(user.id) if target == "user" else str(other_user.id)
            )

        res = client.get("/login", query_params)
        assert res.status_code == 302
        assert res.url == "/archives"

        if target == "other_user" and authenticated:
            mock_merge_users.assert_called_once_with(user, other_user)
        else:
            mock_merge_users.assert_not_called()

        if target == "other_user":
            assert client.cookies["userId"].value == str(other_user.id)
        elif target == "user" or authenticated:
            assert client.cookies["userId"].value == str(user.id)
        else:
            assert not client.cookies.get("userId")

    @pytest.mark.parametrize("authenticated", [True, False])
    def test_unknown_target(self, monkeypatch, client, authenticated):
        monkeypatch.setattr(
            "caviardeul.views.user.merge_users", mock_merge_users := Mock()
        )
        user = UserFactory()
        if authenticated:
            client.cookies.load({"userId": str(user.id)})

        res = client.get("/login", {"user": "unknwon"})
        assert res.status_code == 302
        assert res.url == "/archives"

        mock_merge_users.assert_not_called()
        if authenticated:
            assert client.cookies["userId"].value == str(user.id)
        else:
            assert not client.cookies.get("userId")
