from django.contrib import admin

from caviardeul.models import CustomArticle, DailyArticle


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


@admin.register(DailyArticle)
class DailyArticleAdmin(admin.ModelAdmin):
    list_display = ["id", "page_name", "date", "nb_daily_winners"]
    search_fields = ("page_id", "page_name")
    ordering = ("-id",)
