from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from caviardeul.views.api import api
from caviardeul.views.score import ScoreViewSet

api_router = DefaultRouter(trailing_slash=False)
api_router.register("scores", ScoreViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", api.urls),
    path("", include(api_router.urls)),
]
