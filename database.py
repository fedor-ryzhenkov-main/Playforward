import sqlite3
import os

def init_db(base_path):
    db_path = os.path.join(base_path, 'audio_manager.db')
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON")  # Enable foreign key support
    cursor = conn.cursor()
    
    # Tracks table remains the same
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS tracks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        path TEXT,
        normalized_path TEXT,
        tags TEXT
    )
    ''')
    
    # Items table represents both playlists and tracks in a hierarchical structure
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        type TEXT CHECK(type IN ('playlist', 'track')),
        parent_id INTEGER,
        track_id INTEGER,
        FOREIGN KEY (parent_id) REFERENCES items(id) ON DELETE CASCADE,
        FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
    )
    ''')
    
    conn.commit()
    return conn

def add_track(conn, name, path, normalized_path, tags):
    cursor = conn.cursor()
    cursor.execute('INSERT INTO tracks (name, path, normalized_path, tags) VALUES (?, ?, ?, ?)', (name, path, normalized_path, tags))
    conn.commit()
    return cursor.lastrowid

def add_item(conn, name, item_type, parent_id=None, track_id=None):
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO items (name, type, parent_id, track_id) VALUES (?, ?, ?, ?)
    ''', (name, item_type, parent_id, track_id))
    conn.commit()
    return cursor.lastrowid

def get_items_in_parent(conn, parent_id):
    cursor = conn.cursor()
    cursor.execute('''
    SELECT id, name, type, track_id FROM items WHERE parent_id IS ?
    ''', (parent_id,))
    return cursor.fetchall()

def move_item(conn, item_id, new_parent_id):
    cursor = conn.cursor()
    cursor.execute('''
    UPDATE items SET parent_id = ? WHERE id = ?
    ''', (new_parent_id, item_id))
    conn.commit()

def delete_item(conn, item_id):
    cursor = conn.cursor()
    cursor.execute('DELETE FROM items WHERE id = ?', (item_id,))
    conn.commit()

def get_item_by_name(conn, name, parent_id):
    cursor = conn.cursor()
    cursor.execute('''
    SELECT id, name, type, track_id FROM items WHERE name = ? AND parent_id IS ?
    ''', (name, parent_id))
    return cursor.fetchone()

def get_track_tags_by_id(conn, track_id):
    cursor = conn.cursor()
    cursor.execute('SELECT tags FROM tracks WHERE id = ?', (track_id,))
    result = cursor.fetchone()
    return result[0] if result and result[0] else ''

def get_track_path_by_id(conn, track_id):
    cursor = conn.cursor()
    cursor.execute('SELECT normalized_path FROM tracks WHERE id=?', (track_id,))
    result = cursor.fetchone()
    return result[0] if result else None

def get_track_id_by_name(conn, name):
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM tracks WHERE name=?', (name,))
    result = cursor.fetchone()
    return result[0] if result else None

def update_track_tags(conn, track_id, new_tags):
    cursor = conn.cursor()
    cursor.execute('UPDATE tracks SET tags = ? WHERE id = ?', (new_tags, track_id))
    conn.commit()

def close_db(conn):
    conn.close()