import time

from caviardeul.services import metrics

IGNORED_ROUTES = {"health"}


class RequestMetricsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.monotonic()
        response = self.get_response(request)
        duration = (time.monotonic() - start) * 1000

        resolver_match = getattr(request, "resolver_match", None)
        route = resolver_match.route if resolver_match else "unknown"
        if route not in IGNORED_ROUTES:
            metrics.distribution(
                "http.request.duration",
                duration,
                unit="millisecond",
                attributes={
                    "route": route,
                    "method": request.method,
                    "status": str(response.status_code),
                },
            )
        return response
