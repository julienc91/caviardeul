from django.db.models import FilteredRelation, Q
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin
from rest_framework.viewsets import GenericViewSet

from caviardeul.models import DailyArticle
from caviardeul.serializers.daily_article import (
    DailyArticleDetailSerializer,
    DailyArticleListSerializer,
)


class DailyArticleViewSet(RetrieveModelMixin, ListModelMixin, GenericViewSet):
    lookup_value_regex = r"\d+"
    queryset = DailyArticle.objects.all()

    def get_serializer_class(self):
        if self.action == "list":
            return DailyArticleListSerializer
        return DailyArticleDetailSerializer

    def get_queryset(self):
        queryset = self.queryset.filter(date__lte=timezone.now())
        if self.request.user.is_authenticated:
            queryset = queryset.annotate(
                user_score=FilteredRelation(
                    "dailyarticlescore",
                    condition=Q(dailyarticlescore__user=self.request.user),
                )
            ).select_related("user_score")
        return queryset.order_by("date")

    def get_object(self):
        if self.action == "current":
            try:
                return self.get_queryset().order_by("-date")[:1].get()
            except DailyArticle.DoesNotExist:
                raise NotFound
        return super().get_object()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["current"] = self.action == "current"
        context["detail"] = self.action != "list"
        return context

    @action(methods=("GET",), detail=False)
    def current(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)
