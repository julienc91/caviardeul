from datetime import timedelta

from asgiref.sync import async_to_sync
from django.contrib import admin, messages
from django.core.exceptions import ValidationError
from import_export.admin import ImportMixin
from import_export.fields import Field
from import_export.resources import ModelResource
from import_export.widgets import BooleanWidget

from caviardeul.models import CustomArticle, DailyArticle
from caviardeul.services.articles import burst_cache_for_article


@admin.register(CustomArticle)
class CustomArticleAdmin(admin.ModelAdmin):
    list_display = [
        "public_id",
        "page_name",
        "safety",
        "created_by",
        "created_at",
        "nb_winners",
    ]
    list_select_related = ("created_by",)
    autocomplete_fields = ("created_by",)
    list_filter = ("safety",)
    search_fields = ("page_id", "page_name")
    ordering = ("-created_at",)


class DailyArticleResource(ModelResource):
    _page_ids: set[str]
    _page_names: set[str]
    _last_article: DailyArticle
    confirm_discrepancy = Field(widget=BooleanWidget(), default=False)

    class Meta:
        model = DailyArticle
        fields = ("page_id", "page_name", "confirm_discrepancy")
        use_bulk = True
        force_init_instance = True

    def before_import(self, dataset, **kwargs):
        super().before_import(dataset, **kwargs)

        articles = DailyArticle.objects.only("page_id", "page_name")
        self._page_ids = {article.page_id.lower() for article in articles}
        self._page_names = {article.page_name.lower() for article in articles}
        self._last_article = DailyArticle.objects.order_by("-id").first()

    def before_import_row(self, row, **kwargs):
        super().before_import_row(row, **kwargs)
        page_id = row["page_id"].lower()
        page_name = row["page_name"].lower()
        confirm = BooleanWidget().clean(row["confirm_discrepancy"]) or False

        if " " in page_id:
            raise ValidationError({"page_id": "Invalid character"})
        if "_" in page_name:
            raise ValidationError({"page_name": "Invalid character"})
        if page_id in self._page_ids:
            raise ValidationError({"page_id": "Duplicate entry"})
        if page_name in self._page_names:
            raise ValidationError({"page_name": "Duplicate entry"})
        if (page_id.replace("_", " ") == page_name) and confirm:
            raise ValidationError({"confirm_discrepancy": "Unexpected confirmation"})
        if (page_id.replace("_", " ") != page_name) and not confirm:
            raise ValidationError({"confirm_discrepancy": "Confirm discrepancy"})

        self._page_ids.add(page_id)
        self._page_names.add(page_name)

    def before_save_instance(self, instance, row, **kwargs):
        super().before_save_instance(instance, row, **kwargs)
        instance.id = self._last_article.id + 1
        instance.date = self._last_article.date + timedelta(days=1)
        instance.median = 0
        instance.stats = {}
        instance.nb_winners = 0
        instance.nb_daily_winners = 0

        self._last_article = instance


@admin.register(DailyArticle)
class DailyArticleAdmin(ImportMixin, admin.ModelAdmin):
    list_display = ["id", "page_name", "date", "nb_daily_winners"]
    search_fields = ("page_id", "page_name")
    ordering = ("-id",)

    resource_class = DailyArticleResource
    actions = ["burst_cache"]

    @admin.action(description="Burst article cache")
    def burst_cache(self, request, queryset) -> None:
        page_ids = list(queryset.values_list("page_id", flat=True))
        async_to_sync(burst_cache_for_article)(page_ids)
        self.message_user(request, "Cache burst was successful", messages.SUCCESS)
