import sys
from datetime import timedelta

from django.core.management.base import BaseCommand

from caviardeul.models import DailyArticle

data: list[tuple[str, str]] = []  # list of (page_id, page_name) must be shuffled!
name_mismatches: set[str] = set()  # exceptions to page_id <-> page_name match


class Command(BaseCommand):
    def handle(self, *args, **options):
        current_page_ids = {
            page_id.lower()
            for page_id in DailyArticle.objects.values_list("page_id", flat=True)
        }

        duplicates = []
        invalid = []

        for page_id, page_name in data:
            key = page_id.lower()
            if key in current_page_ids:
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

            latest_article = DailyArticle.objects.order_by("-id").first()
            index = latest_article.id
            date = latest_article.date

            DailyArticle.objects.bulk_create(
                DailyArticle(
                    id=index + i,
                    date=date + timedelta(days=i),
                    page_id=page_id,
                    page_name=page_name,
                    stats={},
                    nb_winners=0,
                    nb_daily_winners=0,
                )
                for i, (page_id, page_name) in enumerate(data, start=1)
            )
