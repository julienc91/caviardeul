from rest_framework.exceptions import ValidationError
from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import RetrieveModelMixin, CreateModelMixin

from caviardeul.constants import Safety
from caviardeul.exceptions import ArticleFetchError
from caviardeul.models import CustomArticle
from caviardeul.serializers.custom_article import CustomArticleSerializer
from caviardeul.services.articles import get_article_html_from_wikipedia
from caviardeul.services.custom_article import generate_public_id
from caviardeul.services.user import create_user_for_request


class CustomArticleViewSet(RetrieveModelMixin, CreateModelMixin, GenericViewSet):
    queryset = CustomArticle.objects.all()
    lookup_field = "public_id"
    serializer_class = CustomArticleSerializer

    def perform_create(self, serializer: CustomArticleSerializer):
        serializer.is_valid(raise_exception=True)
        page_id = serializer.validated_data["pageId"]

        try:
            page_title, _ = get_article_html_from_wikipedia(page_id)
        except ArticleFetchError:
            raise ValidationError("L'article n'a pas été trouvé")

        if not self.request.user.is_authenticated:
            create_user_for_request(self.request)

        public_id = generate_public_id()
        custom_article, _ = CustomArticle.objects.get_or_create(
            page_id=page_id,
            created_by=self.request.user,
            defaults=dict(
                public_id=public_id,
                page_name=page_title,
                nb_winners=0,
                stats={},
                safety=Safety.UNKNOWN,
            ),
        )
        serializer.instance = custom_article

    def create(self, request, *args, **kwargs):
        is_authenticated = request.user.is_authenticated
        response = super().create(request, *args, **kwargs)
        if not is_authenticated and response.status_code == 201:
            response.set_cookie("userId", request.user.id)
        return response
