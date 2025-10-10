import mysql.connector
from config import Config
import os


def get_db_connection():
    host = os.getenv("DB_HOST", "localhost")
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    database = os.getenv("DB_NAME")
    return mysql.connector.connect(
        host=host,
        user=user,
        password=password,
        database=database
    )
def fetch_recent_prices(ticker, limit=3):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT close_price FROM price_history WHERE ticker = %s ORDER BY date DESC LIMIT %s",
        (ticker, limit)
    )
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return [r[0] for r in rows]

def fetch_history(ticker):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT date, close_price FROM price_history WHERE ticker = %s ORDER BY date ASC",
        (ticker,)
    )
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows

def insert_price(ticker, date, price):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO price_history (ticker, date, close_price) VALUES (%s, %s, %s)",
        (ticker, date, price)
    )
    conn.commit()
    cursor.close()
    conn.close()
