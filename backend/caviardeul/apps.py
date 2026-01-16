from django.apps import AppConfig


class Caviardeul(AppConfig):
    name = "caviardeul"

    def ready(self):
        from caviardeul import tasks  # noqa F401
