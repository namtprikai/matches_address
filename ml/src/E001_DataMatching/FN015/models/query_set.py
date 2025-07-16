class QuerySet:
    def __init__(self):
        self.memory = dict()

    def to_key(self, query):
        values = [
            getattr(query, 'pref_key', None),
            getattr(query, 'city_key', None),
            getattr(query, 'town_key', None),
            getattr(query, 'parcel_key', None),
            getattr(query, 'rsdtblk_key', None),
            getattr(query, 'rsdtdsp_key', None),
            str(getattr(query, 'tempAddress', '')),
        ]
        key_str = ':'.join([str(x) for x in values if x is not None])
        return hash(key_str)

    def add(self, query):
        key = self.to_key(query)
        if self.has(query):
            return
        self.memory[key] = query

    def has(self, query):
        key = self.to_key(query)
        return key in self.memory

    def values(self):
        return self.memory.values()

    def delete(self, query):
        key = self.to_key(query)
        if key in self.memory:
            del self.memory[key]

    def clear(self):
        self.memory.clear()

    def size(self):
        return len(self.memory) 