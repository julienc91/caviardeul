import json
from unittest.mock import AsyncMock, Mock

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
            assert res.status_code == 401, res.content
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
            assert res.status_code == 401, res.content
        else:
            assert res.status_code == 204, res.content

        assert User.objects.filter(id=user.id).exists() == (not authenticated)


class TestLogin:
    @pytest.mark.parametrize("authenticated", [True, False])
    @pytest.mark.parametrize("target", [None, "user", "other_user"])
    def test_login(self, monkeypatch, client, authenticated, target):
        monkeypatch.setattr(
            "caviardeul.views.user.merge_users", mock_merge_users := AsyncMock()
        )

        user, other_user = UserFactory.create_batch(2)
        if authenticated:
            client.cookies.load({"userId": str(user.id)})

        payload = {}
        if target:
            payload["userId"] = str(user.id) if target == "user" else str(other_user.id)

        res = client.post(
            "/login", json.dumps(payload), content_type="application/json"
        )
        assert res.status_code == 204

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

        res = client.post(
            "/login", json.dumps({"userId": "unknown"}), content_type="application/json"
        )
        assert res.status_code == 204

        mock_merge_users.assert_not_called()
        if authenticated:
            assert client.cookies["userId"].value == str(user.id)
        else:
            assert not client.cookies.get("userId")
