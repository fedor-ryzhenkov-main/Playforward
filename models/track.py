class Track:
    def __init__(self, id: int, name: str, path: str, tags: list, comments: str, parent_id: int):
        self.id = id
        self.name = name
        self.path = path
        self.tags = tags
        self.comments = comments
        self.parent_id = parent_id

    @classmethod
    def from_db_item(cls, item: dict):
        return cls(
            id=item['id'],
            name=item['name'],
            path=item['data']['path'],
            tags=item['data']['tags'],
            comments=item['data']['comments'],
            parent_id=item['parent_id']
        )