import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    USERNAME_FIELD = "id"
    REQUIRED_FIELDS = ["username"]

    id = models.UUIDField(default=uuid.uuid4, primary_key=True)
