from django.contrib.auth.models import AbstractBaseUser
from django.db import models
from django.utils import timezone
import uuid


class User(AbstractBaseUser):
    USERNAME_FIELD = "id"

    id = models.UUIDField(default=uuid.uuid4, primary_key=True)
    created_at = models.DateTimeField(default=timezone.now)
