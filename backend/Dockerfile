FROM python:3.12-slim as build

WORKDIR /app
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    APP_USER=appuser

COPY pyproject.toml poetry.lock ./
RUN pip install poetry~=1.7 \
    && poetry install --no-root

FROM python:3.12-slim

RUN groupadd -r -g 1000 django \
    && useradd -r -u 1000 -g django -s /sbin/nologin django

USER django

WORKDIR /app
ENV PATH="/venv/bin:$PATH"
COPY --from=build /app/.venv /venv

COPY caviardeul ./

EXPOSE 8000
CMD python -m gunicorn caviardeul.wsgi:application --bind 0.0.0.0:8000