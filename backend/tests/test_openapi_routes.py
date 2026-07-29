"""API smoke tests for shopping modules (no DB required for import checks)."""

from app.main import app


def test_app_title():
    assert app.title


def test_openapi_has_new_paths():
    schema = app.openapi()
    paths = schema["paths"]
    assert "/api/v1/search" in paths
    assert "/api/v1/notifications" in paths
    assert "/api/v1/recently-viewed" in paths
    assert "/api/v1/recommendations/home" in paths
    assert "/api/v1/ratings/summary/{product_id}" in paths
    assert "/api/v1/tracking/awb/{awb}" in paths
    assert "/api/v1/support/tickets" in paths


def test_health_route_registered():
    routes = {getattr(r, "path", None) for r in app.routes}
    assert "/health" in routes
