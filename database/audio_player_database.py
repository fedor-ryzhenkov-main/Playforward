import json
from typing import List, Dict, Any, Optional
from .database import Database

class AudioPlayerDatabase(Database):
    def __init__(self, db_name: str):
        super().__init__(db_name)
        self.init_db()

    def init_db(self):
        self.execute('''
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                parent_id INTEGER,
                data JSON,
                FOREIGN KEY (parent_id) REFERENCES items (id)
            )
        ''')
        self.commit()

    def add_playlist(self, name: str, parent_id: Optional[int] = None, tags: List[str] = [], description: str = "") -> int:
        return self.insert('items', {
            'name': name,
            'type': 'playlist',
            'parent_id': parent_id,
            'data': json.dumps({
                'tags': tags,
                'description': description,
                'children': []
            })
        })

    def add_track(self, name: str, path: str, tags: List[str], comments: str, parent_id: int) -> int:
        track_id = self.insert('items', {
            'name': name,
            'type': 'track',
            'parent_id': parent_id,
            'data': json.dumps({
                'path': path,
                'tags': tags,
                'comments': comments
            })
        })
        self._add_child_to_parent(parent_id, track_id)
        return track_id

    def _add_child_to_parent(self, parent_id: int, child_id: int):
        parent = self.get_item_details(parent_id)
        if parent and parent['type'] == 'playlist':
            parent_data = json.loads(parent['data'])
            parent_data['children'].append(child_id)
            self.update('items', {'data': json.dumps(parent_data)}, 'id = ?', (parent_id,))

    def get_item_details(self, item_id: int) -> Optional[Dict[str, Any]]:
        result = self.get_by('items', ['*'], 'id', item_id)
        if result:
            result['data'] = json.loads(result['data'])
        return result

    def get_items_in_parent(self, parent_id: Optional[int] = None) -> List[Dict[str, Any]]:
        query = "SELECT * FROM items WHERE parent_id IS ?" if parent_id is None else "SELECT * FROM items WHERE parent_id = ?"
        results = self.fetch_all(query, (parent_id,))
        for result in results:
            result['data'] = json.loads(result['data'])
        return results

    def delete_item(self, item_id: int):
        item = self.get_item_details(item_id)
        if item:
            # Remove this item from its parent's children list
            if item['parent_id']:
                parent = self.get_item_details(item['parent_id'])
                if parent and parent['type'] == 'playlist':
                    parent_data = parent['data']
                    parent_data['children'].remove(item_id)
                    self.update('items', {'data': json.dumps(parent_data)}, 'id = ?', (parent['id'],))
            
            # Recursively delete all children if it's a playlist
            if item['type'] == 'playlist':
                for child_id in item['data']['children']:
                    self.delete_item(child_id)
            
            # Delete the item itself
            self.delete('items', 'id = ?', (item_id,))

    def move_item(self, item_id: int, new_parent_id: Optional[int]):
        item = self.get_item_details(item_id)
        if item:
            old_parent_id = item['parent_id']
            
            # Remove from old parent
            if old_parent_id:
                old_parent = self.get_item_details(old_parent_id)
                if old_parent and old_parent['type'] == 'playlist':
                    old_parent_data = old_parent['data']
                    old_parent_data['children'].remove(item_id)
                    self.update('items', {'data': json.dumps(old_parent_data)}, 'id = ?', (old_parent_id,))
            
            # Add to new parent
            if new_parent_id:
                self._add_child_to_parent(new_parent_id, item_id)
            
            # Update item's parent
            self.update('items', {'parent_id': new_parent_id}, 'id = ?', (item_id,))

    def get_item_field(self, item_id: int, field: str) -> Any:
        item = self.get_item_details(item_id)
        if item and field in item['data']:
            return item['data'][field]
        return None

    def update_item_field(self, item_id: int, field: str, value: Any) -> bool:
        item = self.get_item_details(item_id)
        if item:
            item['data'][field] = value
            self.update('items', {'data': json.dumps(item['data'])}, 'id = ?', (item_id,))
            return True
        return False

    def search_items_by_tags(self, tags: List[str]) -> List[Dict[str, Any]]:
        # Create a parameterized query for each tag
        tag_conditions = []
        params = []
        for tag in tags:
            tag_conditions.append('''
                EXISTS (
                    SELECT 1 
                    FROM json_each(json_extract(data, '$.tags')) 
                    WHERE LOWER(json_each.value) LIKE LOWER(?)
                )
            ''')
            params.append(f'%{tag}%')

        # Combine all conditions with AND
        combined_condition = ' AND '.join(tag_conditions)

        query = f'''
            SELECT * FROM items 
            WHERE json_array_length(json_extract(data, '$.tags')) > 0 
            AND {combined_condition}
        '''

        results = self.fetch_all(query, tuple(params))
        for result in results:
            result['data'] = json.loads(result['data'])
        return results
