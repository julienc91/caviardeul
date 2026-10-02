#!/bin/sh
# Deploy the latest release without downtime.

set -eu

cd "$(dirname "$0")"

exec 9>.deploy.lock
if ! flock -n 9; then
    echo "Another deployment is already running" >&2
    exit 1
fi

# Fail before touching anything if the plugin is missing
docker rollout --version >/dev/null

echo "==> Pulling images"
docker compose pull pre_deploy backend frontend worker scheduler

echo "==> Making sure infrastructure services are running"
docker compose up -d --no-recreate postgres redis

echo "==> Running migrations and collecting static files"
docker compose up --exit-code-from pre_deploy pre_deploy

echo "==> Rolling out backend"
docker rollout backend --timeout 180 --wait-after-healthy 3

echo "==> Rolling out frontend"
docker rollout frontend --timeout 180 --wait-after-healthy 3

echo "==> Restarting worker and scheduler"
docker compose up -d --no-deps worker scheduler

echo "==> Making sure nginx is running"
docker compose up -d --no-recreate nginx
