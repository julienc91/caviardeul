"""
URL configuration for caviardeul project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from caviardeul.views.custom_article import CustomArticleViewSet
from caviardeul.views.daily_article import DailyArticleViewSet
from caviardeul.views.score import ScoreViewSet
from caviardeul.views.user import UserViewSet

api_router = DefaultRouter(trailing_slash=False)
api_router.register("articles", DailyArticleViewSet)
api_router.register("articles/custom", CustomArticleViewSet)
api_router.register("scores", ScoreViewSet)
api_router.register("users", UserViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include(api_router.urls)),
]
