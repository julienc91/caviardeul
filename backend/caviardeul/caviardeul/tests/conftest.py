import os
from pathlib import Path
import pytest


@pytest.fixture()
def resources_path():
    return Path(os.path.dirname(__file__)) / "resources"
