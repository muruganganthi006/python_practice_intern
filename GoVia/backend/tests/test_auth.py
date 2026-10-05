import ast
import subprocess
import sys

from app.schemas.auth import UserRegisterRequest
from app.utils.security import create_access_token, verify_password, get_password_hash


def test_database_metadata_includes_core_models():
    script = """
from app.models import __all__
from app.database import Base
print(sorted(Base.metadata.tables.keys()))
"""
    result = subprocess.run(
        [sys.executable, "-c", script],
        capture_output=True,
        text=True,
        check=True,
    )
    registered_tables = set(ast.literal_eval(result.stdout.strip()))
    required_tables = {"users", "routes", "buses", "operators", "trips"}
    assert required_tables.issubset(registered_tables)


def test_password_hash_and_verify():
    password = "User@123"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed) is True


def test_register_password_accepts_7_character_sample_password():
    payload = UserRegisterRequest(
        name="Murugan",
        email="murugan1@gmail.com",
        phone="9876543210",
        password="Mur@123",
    )
    assert payload.password == "Mur@123"


def test_access_token_contains_subject_and_role():
    token = create_access_token("42", "USER")
    assert isinstance(token, str)
    assert token.count(".") == 2
