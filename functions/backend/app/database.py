from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from urllib.parse import quote_plus  # For URL-encoding
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)
# No need for `dotenv` if using Azure Functions local settings
# Remove `load_dotenv()` since Azure Functions Core Tools handles this automatically


def parse_azure_connection_string(conn_str: str) -> dict:
    """Parse Azure-style connection string into components."""
    params = {}
    for part in conn_str.split(';'):
        if '=' in part:
            key, value = part.split('=', 1)
            params[key.strip().lower()] = value.strip()
    return params


# Fetch the connection string from the correct environment variable
conn_str = os.getenv("PostgreSQLConnection")  # Key matches Azure settings

# Parse the connection string
params = parse_azure_connection_string(conn_str)

# Extract values (adjust keys if needed)
username = params.get('user id', '')
password = params.get('password', '')
host = params.get('server', '')
database = params.get('database', '')
port = params.get('port', '5432')  # Default PostgreSQL port
ssl_mode = params.get('ssl mode', 'require').lower()

# URL-encode username/password to handle special characters
encoded_username = quote_plus(username)
encoded_password = quote_plus(password)

# Build SQLAlchemy-compatible URL
DATABASE_URL = (
    f"postgresql+psycopg2://{encoded_username}:{encoded_password}"
    f"@{host}:{port}/{database}?sslmode={ssl_mode}"
)

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)
try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version()"))
        print("PostgreSQL Version:", result.fetchone()[0])
    print("Connection successful!")
except Exception as e:
    print("Connection failed:", e)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
