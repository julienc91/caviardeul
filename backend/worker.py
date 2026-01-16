import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "caviardeul.settings")
django.setup()

from caviardeul.broker import broker, scheduler  # noqa E402

__all__ = ["broker", "scheduler"]
