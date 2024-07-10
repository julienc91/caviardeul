import uuid

from django.db import transaction
from django.utils import timezone

from caviardeul.models import CustomArticle, DailyArticleScore, User


def create_user_for_request(request, response=None):
    now = timezone.now()
    user_id = uuid.uuid4()
    user = User.objects.create(
        id=user_id,
        username=str(user_id),
        date_joined=now,
        last_login=now,
    )
    request.auth = user
    if response:
        response.set_cookie("userId", str(user.id))
    return user


@transaction.atomic()
def merge_users(current_user: User, target_user: User) -> None:
    if current_user == target_user:
        raise ValueError("Merging needs distinct users")

    current_user_scores = DailyArticleScore.objects.filter(user=current_user)
    target_user_scores_by_article_id = {
        score.daily_article_id: score
        for score in DailyArticleScore.objects.filter(user=target_user)
    }

    scores_to_create = []
    scores_to_update = []
    for score in current_user_scores:
        if score.daily_article_id not in target_user_scores_by_article_id:
            new_score = score
            new_score.pk = None
            new_score.user = target_user
            scores_to_create.append(new_score)
        else:
            target_score = target_user_scores_by_article_id[score.daily_article_id]
            if target_score.created_at > score.created_at:
                target_score.created_at = score.created_at
                target_score.nb_attempts = score.nb_attempts
                target_score.nb_correct = score.nb_correct
                scores_to_update.append(target_score)

    DailyArticleScore.objects.bulk_create(scores_to_create)
    DailyArticleScore.objects.bulk_update(
        scores_to_update, fields=["created_at", "nb_attempts", "nb_correct"]
    )

    CustomArticle.objects.filter(created_by=current_user).exclude(
        page_id__in=CustomArticle.objects.filter(created_by=target_user).values_list(
            "page_id", flat=True
        )
    ).update(created_by=target_user)

    current_user.delete()
