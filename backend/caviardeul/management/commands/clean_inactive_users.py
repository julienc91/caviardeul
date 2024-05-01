from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from caviardeul.models import User


class Command(BaseCommand):
    def handle(self, *args, **options):
        threshold = timezone.now() - timedelta(days=180)
        count = User.objects.filter(is_staff=False, last_login__lt=threshold).delete()
        return f"{count} inactive user(s) deleted"
