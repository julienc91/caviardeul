# Dev dependencies include playwright, which has no wheels for Alpine (musl)
FROM python:3.14-slim AS base_dev

FROM python:3.14-alpine AS base

# The app runs from the uv virtualenv, pip is only dead weight (and CVEs)
RUN pip uninstall -y pip

FROM base_dev AS build_dev

WORKDIR /build
COPY pyproject.toml uv.lock ./
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
RUN uv sync

FROM base_dev AS dev

RUN groupadd -r -g 1000 django \
    && useradd -r -u 1000 -g django -s /sbin/nologin django

USER django
WORKDIR /app

ENV PATH="/build/.venv/bin:$PATH"
COPY --from=build_dev /build/.venv /build/.venv
COPY . ./

EXPOSE 5000
CMD ["python", "manage.py", "runserver", "0.0.0.0:5000"]


FROM base AS build_prod

ENV UV_LINK_MODE=copy \
    UV_COMPILE_BYTECODE=1

WORKDIR /build
COPY pyproject.toml uv.lock ./
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
RUN uv sync --no-dev

FROM base AS prod

RUN addgroup -S -g 65332 django \
    && adduser -S -u 65332 -G django -s /sbin/nologin django \
    && mkdir -p /app/static/ \
    && chown django:django /app

ARG VERSION
ENV PATH="/build/.venv/bin:$PATH"
ENV VERSION=$VERSION
COPY --from=build_prod /build/.venv /build/.venv
COPY --chown=django:django . /app

USER django
WORKDIR /app

EXPOSE 5000
CMD ["./start.sh"]
