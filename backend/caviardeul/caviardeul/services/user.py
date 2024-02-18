import uuid
from django.utils import timezone

from caviardeul.models import User


def create_user_for_request(request):
    now = timezone.now()
    user = User.objects.create(
        id=uuid.uuid4(),
        created_at=now,
        last_login=now,
    )
    request.user = user
    return user
