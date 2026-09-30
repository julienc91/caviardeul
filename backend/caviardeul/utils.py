from django.db.models import Model, QuerySet


async def alist[T: Model](queryset: QuerySet[T]) -> list[T]:
    return [obj async for obj in queryset]


async def aset[T: Model](queryset: QuerySet[T]) -> set[T]:
    return {obj async for obj in queryset}
