#!/bin/bash

python manage.py migrate
python -m gunicorn wsgi:application --bind 0.0.0.0:5000
