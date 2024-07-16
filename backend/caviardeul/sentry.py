import os

try:
    import sentry_sdk
except ImportError:
    print("Sentry integration is disabled")
else:
    sentry_dsn = os.environ.get("SENTRY_DSN")
    if not sentry_dsn:
        print("Sentry integration is disabled")
    else:
        sentry_environment = os.environ.get("SENTRY_ENVIRONMENT", "dev")
        sentry_release = os.environ.get("SENTRY_RELEASE", None)
        traces_sample_rate = float(os.environ.get("SENTRY_TRACES_SAMPLE_RATE", 1.0))
        profiles_sample_rate = float(os.environ.get("SENTRY_PROFILES_SAMPLE_RATE", 1.0))
        sentry_sdk.init(
            dsn=sentry_dsn,
            environment=sentry_environment,
            release=sentry_release,
            traces_sample_rate=traces_sample_rate,
            profiles_sample_rate=profiles_sample_rate,
        )
