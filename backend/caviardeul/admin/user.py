from django.contrib import admin

from caviardeul.models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ["id", "username", "date_joined", "last_login", "is_staff"]
    list_filter = ("is_staff",)
    search_fields = ("id", "username")
    ordering = ("-date_joined",)
