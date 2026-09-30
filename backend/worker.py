import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "caviardeul.settings")
django.setup()

from caviardeul.broker import broker, scheduler

__all__ = ["broker", "scheduler"]
