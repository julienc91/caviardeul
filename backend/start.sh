#!/bin/bash

python manage.py collectstatic --no-input
python manage.py migrate --no-input
python -m gunicorn asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:5000
