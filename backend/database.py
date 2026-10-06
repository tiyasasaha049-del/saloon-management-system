import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import MYSQL_URL, SQLITE_FALLBACK_URL, ALLOW_SQLITE_FALLBACK, ENVIRONMENT

Base = declarative_base()

engine = None

if MYSQL_URL:
    try:
        engine = create_engine(MYSQL_URL, pool_pre_ping=True, echo=False)
        with engine.connect() as conn:
            print("[DATABASE] Successfully connected to primary relational database!")
    except Exception as e:
        print(f"[DATABASE WARNING] Primary DB connection failed: {e}")
        if not ALLOW_SQLITE_FALLBACK:
            print("[DATABASE FATAL] Production environment requires primary database. SQLite fallback is disabled.")
            sys.exit(1)

if engine is None:
    if ALLOW_SQLITE_FALLBACK:
        print(f"[DATABASE INFO] ({ENVIRONMENT}) Operating on SQLite local database at {SQLITE_FALLBACK_URL}...")
        engine = create_engine(SQLITE_FALLBACK_URL, connect_args={"check_same_thread": False}, echo=False)
    else:
        raise RuntimeError("No valid database configuration available and fallback disabled.")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

