#!/bin/sh

python manage.py collectstatic --no-input
python manage.py migrate --no-input
python -m gunicorn asgi:application -k workers.DjangoUvicornWorker --bind 0.0.0.0:5000
