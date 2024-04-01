import uuid

from django.db import transaction
from django.utils import timezone

from caviardeul.models import User, DailyArticleScore


def create_user_for_request(request):
    now = timezone.now()
    user = User.objects.create(
        id=uuid.uuid4(),
        created_at=now,
        last_login=now,
    )
    request.user = user
    return user


@transaction.atomic()
def merge_users(current_user: User, target_user: User):
    current_user_scores = DailyArticleScore.objects.filter(user=current_user)
    target_user_scores_by_article_id = DailyArticleScore.objects.filter(
        user=target_user
    ).in_bulk(["article_id"])

    scores_to_create = []
    scores_to_update = []
    for score in current_user_scores:
        if score.article_id not in target_user_scores_by_article_id:
            new_score = score
            new_score.pk = None
            new_score.user = target_user
            scores_to_create.append(new_score)
        else:
            target_score = target_user_scores_by_article_id[score.article_id]
            if target_score.created_at > score.created_at:
                target_score.created_at = score.created_at
                target_score.nb_attempts = score.nb_attempts
                target_score.nb_correct = score.nb_correct
                scores_to_update.append(target_score)

    DailyArticleScore.objects.bulk_create(scores_to_create)
    DailyArticleScore.objects.bulk_update(
        scores_to_update, update_fields=["created_at", "nb_attempts", "nb_correct"]
    )

    current_user.delete()