import sqlite3
import os

def init_db():
    conn = sqlite3.connect('audio_manager.db')
    cursor = conn.cursor()
    
    # Tracks table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS tracks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        path TEXT,
        normalized_path TEXT,
        tags TEXT
    )
    ''')
    
    # Playlists table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT
    )
    ''')
    
    # Junction table for tracks in playlists
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS playlist_tracks (
        playlist_id INTEGER,
        track_id INTEGER,
        FOREIGN KEY (playlist_id) REFERENCES playlists (id),
        FOREIGN KEY (track_id) REFERENCES tracks (id)
    )
    ''')
    
    conn.commit()
    return conn

def add_track(conn, name, path, normalized_path, tags):
    cursor = conn.cursor()
    cursor.execute('INSERT INTO tracks (name, path, normalized_path, tags) VALUES (?, ?, ?, ?)', (name, path, normalized_path, tags))
    conn.commit()

def add_playlist(conn, name):
    cursor = conn.cursor()
    cursor.execute('INSERT INTO playlists (name) VALUES (?)', (name,))
    conn.commit()
    return cursor.lastrowid

def add_track_to_playlist(conn, playlist_id, track_id):
    cursor = conn.cursor()
    cursor.execute('INSERT INTO playlist_tracks (playlist_id, track_id) VALUES (?, ?)', (playlist_id, track_id))
    conn.commit()

def get_playlists(conn):
    cursor = conn.cursor()
    cursor.execute('SELECT id, name FROM playlists')
    return cursor.fetchall()

def get_tracks_in_playlist(conn, playlist_id):
    cursor = conn.cursor()
    cursor.execute('''
    SELECT t.id, t.name, t.path, t.normalized_path, t.tags
    FROM tracks t
    JOIN playlist_tracks pt ON t.id = pt.track_id
    WHERE pt.playlist_id = ?
    ''', (playlist_id,))
    return cursor.fetchall()

def search_tracks(conn, keyword):
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM tracks WHERE name LIKE ? OR tags LIKE ?', (f'%{keyword}%', f'%{keyword}%'))
    return cursor.fetchall()

def get_all_tracks(conn):
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM tracks')
    return cursor.fetchall()

def delete_track_from_db(conn, name):
    cursor = conn.cursor()
    cursor.execute('SELECT normalized_path FROM tracks WHERE name=?', (name,))
    result = cursor.fetchone()
    if result and result[0]:
        normalized_path = result[0]
        if os.path.exists(normalized_path):
            os.remove(normalized_path)
    cursor.execute('DELETE FROM tracks WHERE name=?', (name,))
    cursor.execute('DELETE FROM playlist_tracks WHERE track_id IN (SELECT id FROM tracks WHERE name=?)', (name,))
    conn.commit()

def display_tags(conn, track_name):
    cursor = conn.cursor()
    cursor.execute('SELECT tags FROM tracks WHERE name=?', (track_name,))
    result = cursor.fetchone()
    return result[0] if result and result[0] else 'No tags available'

def get_track_id_by_name(conn, track_name):
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM tracks WHERE name=?', (track_name,))
    result = cursor.fetchone()
    return result[0] if result else None

def get_track_path_by_name(conn, track_name):
    cursor = conn.cursor()
    cursor.execute('SELECT normalized_path FROM tracks WHERE name=?', (track_name,))
    result = cursor.fetchone()
    return result[0] if result else None

def update_track_tags(conn, track_name, new_tags):
    cursor = conn.cursor()
    cursor.execute('UPDATE tracks SET tags=? WHERE name=?', (new_tags, track_name))
    conn.commit()

def remove_track_from_playlist(conn, playlist_id, track_id):
    cursor = conn.cursor()
    cursor.execute('DELETE FROM playlist_tracks WHERE playlist_id=? AND track_id=?', (playlist_id, track_id))
    conn.commit()

def delete_playlist(conn, playlist_id):
    cursor = conn.cursor()
    cursor.execute('DELETE FROM playlist_tracks WHERE playlist_id=?', (playlist_id,))
    cursor.execute('DELETE FROM playlists WHERE id=?', (playlist_id,))
    conn.commit()

def close_db(conn):
    conn.close()