#!/bin/bash

python manage.py migrate
python -m gunicorn asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:5000
