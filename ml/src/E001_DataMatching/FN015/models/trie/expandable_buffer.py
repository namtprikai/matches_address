class ExpandableBuffer:
    def __init__(self, buffer: bytearray):
        self.buffer = buffer
        self.offset = 0 

    def size(self) -> int:
        return self.offset

    def read_uint8(self, offset: int) -> int:
        return self.buffer[offset]

    def read_uint16be(self, offset: int) -> int:
        return int.from_bytes(self.buffer[offset:offset+2], 'big')

    def read_uint32be(self, offset: int) -> int:
        return int.from_bytes(self.buffer[offset:offset+4], 'big')

    def read(self, offset: int, size: int) -> bytes:
        return bytes(self.buffer[offset:offset+size])

    def copy_to(self, offset: int, dst: bytearray):
        dst_len = len(dst)
        dst[:dst_len] = self.buffer[offset:offset+dst_len]
        return dst

    def ensure_capacity(self, size: int):
        if self.offset + size < len(self.buffer):
            return
        new_size = max(len(self.buffer) * 2, self.offset + size)
        new_buffer = bytearray(new_size)
        new_buffer[:len(self.buffer)] = self.buffer
        self.buffer = new_buffer

    def write(self, data: bytes, offset: int):
        data_size = len(data)
        self.ensure_capacity(data_size)
        self.offset += data_size
        self.buffer[offset:offset+data_size] = data

    def get_buffer(self) -> bytes:
        return bytes(self.buffer[:self.offset])

    def to_string(self, encoding: str = 'utf-8', start: int = 0, end: int = None) -> str:
        if end is None:
            end = self.offset
        return self.buffer[start:end].decode(encoding) 