import os
from dotenv import load_dotenv

load_dotenv()

# Server & Environment Settings
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
ALLOWED_ORIGINS = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", f"{FRONTEND_URL},http://127.0.0.1:5173").split(",") if origin.strip()]

# Security & JWT Auth
SECRET_KEY = os.getenv("SECRET_KEY", "lumina_luxe_salon_erp_super_secret_jwt_key_2026_change_in_prod!")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

# Database Configuration
# Format: mysql+pymysql://<user>:<password>@<host>:<port>/<dbname>
MYSQL_USER = os.getenv("MYSQL_USER", "")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
MYSQL_DB = os.getenv("MYSQL_DB", "lumina_salon")

if MYSQL_USER and MYSQL_PASSWORD:
    MYSQL_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
elif os.getenv("DATABASE_URL"):
    MYSQL_URL = os.getenv("DATABASE_URL")
else:
    MYSQL_URL = None

SQLITE_FALLBACK_URL = os.getenv("SQLITE_URL", "sqlite:///./lumina_salon.db")
# Only allow SQLite fallback when ENVIRONMENT is development or ALLOW_SQLITE_FALLBACK is true
ALLOW_SQLITE_FALLBACK = os.getenv("ALLOW_SQLITE_FALLBACK", "true" if ENVIRONMENT == "development" else "false").lower() == "true"

