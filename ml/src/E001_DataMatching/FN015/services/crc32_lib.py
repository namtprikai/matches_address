# -*- coding: utf-8 -*-

import binascii
import json
from pathlib import Path

def from_file(path_to_file: str) -> str:
    file_path = Path(path_to_file)
    if not file_path.exists():
        return None
    with file_path.open('rb') as f:
        return from_buffer(f.read())

def from_buffer(data: bytes) -> str:
    return format(binascii.crc32(data) & 0xFFFFFFFF, 'x')

def from_string(data: str) -> str:
    return from_buffer(data.encode('utf-8'))

def from_record(data: dict) -> str:
    return from_string(json.dumps(data, ensure_ascii=False)) 