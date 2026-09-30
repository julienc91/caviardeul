from caviardeul.settings import *

DEBUG = True
CSRF_COOKIE_SECURE = False
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_TRUSTED_ORIGINS = ["http://localhost:3000"]
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
SECURE_PROXY_SSL_HEADER = None
