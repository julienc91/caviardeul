import sys
from datetime import timedelta

from django.core.management.base import BaseCommand

from caviardeul.models import DailyArticle

data: list[tuple[str, str]] = []  # list of (page_id, page_name) must be shuffled!
name_mismatches: set[str] = set()  # exceptions to page_id <-> page_name match


class Command(BaseCommand):
    def add_arguments(self, parser):
        super().add_arguments(parser)
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, *args, **options):
        current_articles = DailyArticle.objects.only("page_id", "page_name")
        current_page_ids = {article.page_id.lower() for article in current_articles}
        current_page_names = {article.page_name.lower() for article in current_articles}

        duplicates = []
        invalid = []

        for page_id, page_name in data:
            key = page_id.lower()
            if key in current_page_ids or page_name.lower() in current_page_names:
                duplicates.append(page_id)
            elif " " in page_id or "_" in page_name:
                invalid.append(page_id)
            elif (
                page_id.replace("_", " ") != page_name
                and page_id not in name_mismatches
            ):
                invalid.append(page_id)
            else:
                current_page_ids.add(key)

        if duplicates:
            self.stdout.write(self.style.ERROR("Duplicated articles"))
            self.stdout.write(", ".join(duplicates))
        if invalid:
            self.stdout.write(
                self.style.ERROR("Invalid articles"),
            )
            self.stdout.write(", ".join(invalid))

        if invalid or duplicates:
            sys.exit(1)

        if options["dry_run"]:
            return

        latest_article = DailyArticle.objects.order_by("-id").first()
        index = latest_article.id
        date = latest_article.date

        DailyArticle.objects.bulk_create(
            DailyArticle(
                id=index + i,
                date=date + timedelta(days=i),
                page_id=page_id,
                page_name=page_name,
                median=0,
                stats={},
                nb_winners=0,
                nb_daily_winners=0,
            )
            for i, (page_id, page_name) in enumerate(data, start=1)
        )
