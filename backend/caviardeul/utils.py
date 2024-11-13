from typing import TypeVar

from django.db.models import Model, QuerySet

T = TypeVar("T", bound=Model)


async def alist(queryset: QuerySet[T]) -> list[T]:
    return [obj async for obj in queryset]


async def aset(queryset: QuerySet[T]) -> set[T]:
    return {obj async for obj in queryset}
