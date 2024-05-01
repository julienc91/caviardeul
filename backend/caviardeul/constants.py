from django.db.models import TextChoices


class Safety(TextChoices):
    SAFE = "safe", "Safe"
    UNSAFE = "unsafe", "Unsafe"
    UNKNOWN = "unknown", "Unknown"
