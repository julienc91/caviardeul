import os
from typing import Any

from django.conf import settings
from taskiq import (
    InMemoryBroker,
    TaskiqMessage,
    TaskiqMiddleware,
    TaskiqResult,
    TaskiqScheduler,
)
from taskiq.schedule_sources import LabelScheduleSource
from taskiq_redis import RedisStreamBroker

from caviardeul.services import metrics


class TaskMetricsMiddleware(TaskiqMiddleware):
    def post_execute(self, message: TaskiqMessage, result: TaskiqResult[Any]) -> None:
        metrics.distribution(
            "task.duration",
            result.execution_time * 1000,
            unit="millisecond",
            attributes={
                "task": message.task_name,
                "status": "error" if result.is_err else "success",
            },
        )


broker = RedisStreamBroker(url=f"{settings.REDIS_URL}/1")
if os.environ.get("ENVIRONMENT") == "pytest":
    broker = InMemoryBroker(await_inplace=True)
broker.add_middlewares(TaskMetricsMiddleware())

scheduler = TaskiqScheduler(
    broker=broker,
    sources=[LabelScheduleSource(broker)],
)
