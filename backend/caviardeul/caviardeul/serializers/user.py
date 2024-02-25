from rest_framework import serializers

from caviardeul.models import User


class UserSerializer(serializers.Serializer):
    def to_representation(self, instance: User):
        return {"id": instance.id}
