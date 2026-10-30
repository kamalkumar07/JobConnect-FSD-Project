"""Small helpers for talking to MySQL. Every helper opens and closes its own connection."""
from datetime import datetime, date
from decimal import Decimal

import mysql.connector

from config import Config


def get_connection():
    return mysql.connector.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
    )


def _clean(row):
    """Convert dates and decimals into JSON-friendly values."""
    if row is None:
        return None
    for key, value in row.items():
        if isinstance(value, (datetime, date)):
            row[key] = value.isoformat()
        elif isinstance(value, Decimal):
            row[key] = float(value)
    return row


def fetch_all(sql, params=()):
    conn = get_connection()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(sql, params)
        return [_clean(r) for r in cur.fetchall()]
    finally:
        conn.close()


def fetch_one(sql, params=()):
    conn = get_connection()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(sql, params)
        return _clean(cur.fetchone())
    finally:
        conn.close()


def execute(sql, params=()):
    """Run INSERT/UPDATE/DELETE. Returns (last_insert_id, affected_rows)."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(sql, params)
        conn.commit()
        return cur.lastrowid, cur.rowcount
    finally:
        conn.close()
