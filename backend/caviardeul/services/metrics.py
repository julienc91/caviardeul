"""Application metrics, backed by Sentry.

Only this module should know about the metrics backend: call sites use
`metrics.count(...)` / `metrics.distribution(...)` so that the backend can be
swapped without touching them.
"""

from typing import Literal

import sentry_sdk

type Attributes = dict[str, str]
type Unit = Literal["millisecond"]


def count(name: str, value: int = 1, *, attributes: Attributes | None = None) -> None:
    sentry_sdk.metrics.count(name, value, attributes=attributes)


def distribution(
    name: str,
    value: float,
    *,
    unit: Unit | None = None,
    attributes: Attributes | None = None,
) -> None:
    sentry_sdk.metrics.distribution(name, value, unit=unit, attributes=attributes)
