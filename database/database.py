import sqlite3
from typing import List, Dict, Any, Optional

class Database:
    def __init__(self, db_name: str):
        self.db_name = db_name
        self.connection = None

    def connect(self):
        self.connection = sqlite3.connect(self.db_name)
        self.connection.row_factory = sqlite3.Row

    def disconnect(self):
        if self.connection:
            self.connection.close()

    def execute(self, query: str, params: tuple = ()) -> Optional[sqlite3.Cursor]:
        if not self.connection:
            self.connect()
        return self.connection.execute(query, params)

    def commit(self):
        if self.connection:
            self.connection.commit()

    def fetch_one(self, query: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
        cursor = self.execute(query, params)
        result = cursor.fetchone()
        return dict(result) if result else None

    def fetch_all(self, query: str, params: tuple = ()) -> List[Dict[str, Any]]:
        cursor = self.execute(query, params)
        results = cursor.fetchall()
        return [dict(row) for row in results]
    
    def get_by(self, table: str, select_columns: List[str], condition_column: str, value: Any) -> Optional[Dict[str, Any]]:
        columns = ', '.join(select_columns)
        query = f"SELECT {columns} FROM {table} WHERE {condition_column} = ? LIMIT 1"
        return self.fetch_one(query, (value,))

    def get_all_by(self, table: str, select_columns: List[str], condition_column: str, value: Any) -> List[Dict[str, Any]]:
        columns = ', '.join(select_columns)
        query = f"SELECT {columns} FROM {table} WHERE {condition_column} = ?"
        return self.fetch_all(query, (value,))

    def insert(self, table: str, data: Dict[str, Any]) -> int:
        columns = ', '.join(data.keys())
        placeholders = ', '.join(['?' for _ in data])
        query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
        cursor = self.execute(query, tuple(data.values()))
        self.commit()
        return cursor.lastrowid

    def update(self, table: str, data: Dict[str, Any], condition: str, params: tuple):
        set_clause = ', '.join([f"{key} = ?" for key in data.keys()])
        query = f"UPDATE {table} SET {set_clause} WHERE {condition}"
        self.execute(query, tuple(data.values()) + params)
        self.commit()

    def delete(self, table: str, condition: str, params: tuple):
        query = f"DELETE FROM {table} WHERE {condition}"
        self.execute(query, params)
        self.commit()