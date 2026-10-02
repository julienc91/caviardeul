from unittest.mock import Mock

import sentry_sdk

from caviardeul.services import metrics


def test_count(monkeypatch):
    monkeypatch.setattr(sentry_sdk.metrics, "count", mock := Mock())

    metrics.count("user.created", attributes={"source": "score"})

    mock.assert_called_once_with("user.created", 1, attributes={"source": "score"})


def test_distribution(monkeypatch):
    monkeypatch.setattr(sentry_sdk.metrics, "distribution", mock := Mock())

    metrics.distribution("wikipedia.fetch.duration", 12.5, unit="millisecond")

    mock.assert_called_once_with(
        "wikipedia.fetch.duration", 12.5, unit="millisecond", attributes=None
    )
