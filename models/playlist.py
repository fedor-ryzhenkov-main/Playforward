class Playlist:
    def __init__(self, id: int, name: str, tags: list, description: str, children: list, parent_id: int):
        self.id = id
        self.name = name
        self.tags = tags
        self.description = description
        self.children = children
        self.parent_id = parent_id

    @classmethod
    def from_db_item(cls, item: dict):
        return cls(
            id=item['id'],
            name=item['name'],
            tags=item['data']['tags'],
            description=item['data']['description'],
            children=item['data']['children'],
            parent_id=item['parent_id']
        )