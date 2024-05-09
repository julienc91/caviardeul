FROM python:3.12-slim as build

WORKDIR /app
ENV APP_USER=appuser

COPY pyproject.toml requirements.txt ./
RUN pip install uv~=0.1 \
    && uv venv \
    && uv pip sync requirements.txt

FROM python:3.12-slim

RUN groupadd -r -g 1001 django \
    && useradd -r -u 1001 -g django -s /sbin/nologin django

USER django

WORKDIR /app
ENV PATH="/venv/bin:$PATH"
COPY --from=build /app/.venv /venv
COPY . ./

EXPOSE 8000
CMD python -m gunicorn wsgi:application --bind 0.0.0.0:5000
