#!/bin/sh

exec python -m gunicorn asgi:application -k workers.DjangoUvicornWorker --workers "${WEB_CONCURRENCY:-2}" --bind 0.0.0.0:5000 --graceful-timeout 20
