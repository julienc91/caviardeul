def test_health(client):
    res = client.get("/health")
    assert res.status_code == 204
