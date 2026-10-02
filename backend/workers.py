from uvicorn_worker import UvicornWorker


class DjangoUvicornWorker(UvicornWorker):
    # Django doesn't implement the ASGI lifespan protocol: with the default
    # "auto" mode, the startup probe raises a ValueError that Sentry reports.
    CONFIG_KWARGS = {**UvicornWorker.CONFIG_KWARGS, "lifespan": "off"}
