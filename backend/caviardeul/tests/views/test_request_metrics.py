import pytest

from caviardeul.tests.factories import CustomArticleFactory

pytestmark = pytest.mark.django_db


def test_records_request_duration(mock_wiki_api, client, captured_metrics):
    article = CustomArticleFactory()
    mock_wiki_api(article.page_id, article.page_name, "content")

    res = client.get(f"/articles/custom/{article.public_id}")
    assert res.status_code == 200, res.content

    [metric] = captured_metrics.named("http.request.duration")
    assert metric.type == "distribution"
    assert metric.value >= 0
    assert metric.unit == "millisecond"
    assert metric.attributes == {
        "route": "articles/custom/<public_id>",
        "method": "GET",
        "status": "200",
    }


def test_unknown_route(client, captured_metrics):
    res = client.get("/unknown")
    assert res.status_code == 404

    [metric] = captured_metrics.named("http.request.duration")
    assert metric.attributes == {"route": "unknown", "method": "GET", "status": "404"}


def test_health_check_is_ignored(client, captured_metrics):
    res = client.get("/health")
    assert res.status_code == 204

    assert captured_metrics.named("http.request.duration") == []
