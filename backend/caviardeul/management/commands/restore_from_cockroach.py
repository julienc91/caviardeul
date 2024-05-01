from collections.abc import Callable
from typing import TypedDict, Any

import psycopg
from django.core.management.base import BaseCommand, CommandError
from django.db.models import Model
from django.utils.timezone import make_aware

from caviardeul.models import User, DailyArticle, CustomArticle, DailyArticleScore


class RestoreConfig(TypedDict):
    table_name: str
    model: type[Model]
    columns: list[tuple[str, str]]
    adapters: dict[str, Callable[[Any], Any]]
    ordering: str | None


class Command(BaseCommand):
    _restore_configs: list[RestoreConfig] = [
        {
            "table_name": "User",
            "model": User,
            "columns": [
                ("id", "id"),
                ("id", "username"),
                ("createdAt", "date_joined"),
                ("lastSeenAt", "last_login"),
            ],
            "adapters": {
                "date_joined": lambda v: make_aware(v),
                "last_login": lambda v: make_aware(v),
            },
            "ordering": "createdAt",
        },
        {
            "table_name": "DailyArticle",
            "model": DailyArticle,
            "columns": [
                ("id", "id"),
                ("pageId", "page_id"),
                ("pageName", "page_name"),
                ("date", "date"),
                ("nbWinners", "nb_winners"),
                ("nbDailyWinners", "nb_daily_winners"),
                ("stats", "stats"),
            ],
            "adapters": {"date": lambda v: make_aware(v), "stats": lambda v: v or {}},
            "ordering": "id",
        },
        {
            "table_name": "CustomArticle",
            "model": CustomArticle,
            "columns": [
                ("id", "public_id"),
                ("pageId", "page_id"),
                ("pageName", "page_name"),
                ("createdAt", "created_at"),
                ("createdById", "created_by_id"),
                ("safety", "safety"),
                ("nbWinners", "nb_winners"),
                ("stats", "stats"),
            ],
            "adapters": {
                "created_at": lambda v: make_aware(v),
                "stats": lambda v: v or {},
            },
            "ordering": "createdAt",
        },
        {
            "table_name": "DailyArticleScore",
            "model": DailyArticleScore,
            "columns": [
                ("dailyArticleId", "daily_article_id"),
                ("userId", "user_id"),
                ("createdAt", "created_at"),
                ("nbAttempts", "nb_attempts"),
                ("nbCorrect", "nb_correct"),
            ],
            "adapters": {"created_at": lambda v: make_aware(v)},
            "ordering": "createdAt",
        },
    ]

    def _check_db_is_empty(self):
        if DailyArticle.objects.exists() or User.objects.exists():
            raise CommandError("The database is not empty")

    def _restore_model(self, conn: psycopg.Connection, config: RestoreConfig):
        query = "SELECT "
        query += ", ".join(f'"{old_column}"' for old_column, _ in config["columns"])
        query += f" FROM \"{config['table_name']}\""
        if config["ordering"]:
            query += f" ORDER BY \"{config['ordering']}\""

        model = config["model"]
        adapters = config["adapters"]

        with conn.cursor() as cursor:
            cursor.execute(query)
            model.objects.bulk_create(
                model(
                    **{
                        new_field: adapters[new_field](row[i])
                        if new_field in adapters
                        else row[i]
                        for i, (_, new_field) in enumerate(config["columns"])
                    }
                )
                for row in cursor.fetchall()
            )

    def _restore_data(self, conn):
        for config in self._restore_configs:
            self._restore_model(conn, config)

    def handle(self, *args, **options):
        self._check_db_is_empty()
        connection_string = input("Connection string: ")
        conn = psycopg.connect(connection_string)
        try:
            self._restore_data(conn)
        finally:
            conn.close()
