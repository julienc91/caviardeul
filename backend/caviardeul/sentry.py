import os

try:
    import sentry_sdk
except ImportError:
    print("Sentry integration is disabled")
else:
    sentry_dsn = os.environ["SENTRY_DSN"]
    sentry_environment = os.environ.get("SENTRY_ENVIRONMENT", "dev")
    sentry_release = os.environ.get("SENTRY_RELEASE", None)
    sentry_sdk.init(
        dsn=sentry_dsn,
        environment=sentry_environment,
        release=sentry_release,
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
    )
