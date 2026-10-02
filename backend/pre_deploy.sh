#!/bin/sh
set -e

python manage.py migrate --no-input
python manage.py collectstatic --no-input
