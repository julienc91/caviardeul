FROM python:3.12-slim AS base

FROM base AS build_dev

WORKDIR /app
COPY pyproject.toml requirements-dev.txt ./
RUN pip install uv~=0.1 \
    && uv venv /venv \
    && uv pip sync -p /venv/bin/python requirements-dev.txt

FROM base AS dev

RUN groupadd -r -g 1000 django \
    && useradd -r -u 1000 -g django -s /sbin/nologin django

USER django
WORKDIR /app

ENV PATH="/venv/bin:$PATH"
COPY --from=build_dev /venv /venv
COPY . ./

EXPOSE 5000
CMD python manage.py runserver 0.0.0.0:5000


FROM base AS build_prod

WORKDIR /app
COPY pyproject.toml requirements.txt ./
RUN pip install uv~=0.1 \
    && uv venv /venv \
    && uv pip sync -p /venv/bin/python requirements.txt

FROM base AS prod

RUN groupadd -r -g 65332 django \
    && useradd -r -u 65332 -g django -s /sbin/nologin django

USER django
WORKDIR /app

ENV PATH="/venv/bin:$PATH"
COPY --from=build_prod /venv /venv
COPY . ./

EXPOSE 5000
CMD ./start.sh
