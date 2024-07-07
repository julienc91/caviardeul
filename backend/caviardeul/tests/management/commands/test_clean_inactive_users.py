from datetime import timedelta

import pytest
from django.core.management import call_command
from django.utils import timezone

from caviardeul.models import User
from caviardeul.tests.factories import UserFactory

pytestmark = pytest.mark.django_db


def test_clean_inactive_users():
    now = timezone.now()
    users = [
        *UserFactory.create_batch(5, last_login=now - timedelta(days=90)),
        UserFactory(last_login=now - timedelta(days=900)),
        UserFactory(last_login=now - timedelta(days=1800)),
    ]
    expected_deleted_users = [
        user for user in users if user.last_login < now - timedelta(days=180)
    ]

    res = call_command("clean_inactive_users")
    assert res == f"{len(expected_deleted_users)} inactive user(s) deleted"
    assert User.objects.count() == len(users) - len(expected_deleted_users)

    res = call_command("clean_inactive_users")
    assert res == "0 inactive user(s) deleted"
    assert User.objects.count() == len(users) - len(expected_deleted_users)

    assert set(User.objects.values_list("id", flat=True)) == {
        user.id for user in users if user not in expected_deleted_users
    }
