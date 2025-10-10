import os
from dotenv import load_dotenv

# Load .env if present (only for local / development)
load_dotenv()

class Config:
    DB_HOST = os.getenv('DB_HOST', 'database')
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    DB_NAME = os.getenv('DB_NAME')
