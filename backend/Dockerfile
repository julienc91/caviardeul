FROM python:3.13-slim AS base

FROM base AS build_dev

WORKDIR /build
COPY pyproject.toml uv.lock ./
RUN pip install uv \
    && uv sync --extra tests

FROM base AS dev

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
RUN pip install uv \
    && uv sync --no-dev

FROM base AS prod

RUN groupadd -r -g 65332 django \
    && useradd -r -u 65332 -g django -s /sbin/nologin django \
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
