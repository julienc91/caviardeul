from caviardeul.services.user import set_user_cookie


class RefreshCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if getattr(request, "auth", None) and request.auth.is_authenticated:
            set_user_cookie(response, request.auth)
        return response
