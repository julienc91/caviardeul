import os

from django.conf import settings
from taskiq import InMemoryBroker
from taskiq_redis import RedisStreamBroker

broker = RedisStreamBroker(url=f"{settings.REDIS_URL}/1")
if os.environ.get("ENVIRONMENT") == "pytest":
    broker = InMemoryBroker(await_inplace=True)
