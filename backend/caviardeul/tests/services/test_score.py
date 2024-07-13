import pytest

from caviardeul.services.score import compute_median_from_distribution


@pytest.mark.parametrize(
    "distribution, expected",
    [
        ({}, 0),
        ({"3": 5}, 30),
        ({"3": 5, "4": 3, "5": 6}, 40),
    ],
)
def test_compute_median_from_distribution(distribution, expected):
    assert compute_median_from_distribution(distribution) == expected
