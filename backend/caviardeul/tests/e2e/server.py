import os
import signal
import socket
import subprocess
import time
from pathlib import Path

from django.conf import settings
from pytest_django.live_server_helper import LiveServer


def _wait_for_port(port, host="127.0.0.1", timeout=30):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            with socket.create_connection((host, port), timeout=1):
                return
        except OSError:
            time.sleep(0.5)
    raise TimeoutError(f"{host}:{port} not ready after {timeout}s")


def backend_server(django_db_blocker):
    with django_db_blocker.unblock():
        server = LiveServer("localhost")
        yield server
        server.stop()


def frontend_server(live_server):
    env = os.environ.copy()
    env["BACKEND_URL"] = live_server.url
    proc = subprocess.Popen(
        ["yarn", "start"],
        cwd=Path(settings.BASE_DIR) / ".." / "frontend",
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        start_new_session=True,
    )
    try:
        _wait_for_port(3000, timeout=30)
    except TimeoutError:
        out = proc.stdout.read().decode(errors="replace") if proc.stdout else ""
        os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
        raise TimeoutError(f"Frontend failed to start:\n{out}")
    yield proc
    os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
    proc.wait(timeout=5)
    if proc.stdout:
        proc.stdout.close()
