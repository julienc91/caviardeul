from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from caviardeul.models import CustomArticle
from caviardeul.services.articles import get_article_content
from caviardeul.services.encryption import encrypt_data, generate_encryption_key


class CustomArticleSerializer(serializers.Serializer):
    page_id = serializers.CharField(required=True, write_only=True)

    def validate_page_id(self, value):
        if ":" in value or "/" in value:
            raise ValidationError("La page est invalide")
        return value

    def to_internal_value(self, data):
        if "pageId" in data:
            data["page_id"] = data.pop("pageId")
        return super().to_internal_value(data)

    def to_representation(self, instance: CustomArticle):
        content = get_article_content(instance)
        key = generate_encryption_key()
        encrypted_page_name = encrypt_data(instance.page_name, key)
        encrypted_content = encrypt_data(content, key)

        return {
            "key": key,
            "articleId": instance.public_id,
            "safety": instance.safety,
            "archive": False,
            "custom": True,
            "pageName": encrypted_page_name,
            "content": encrypted_content,
            "userScore": None,
        }
