from dataclasses import dataclass, field
from typing import Optional

@dataclass
class AbrgBytes:
    offset: int
    description: str
    size: int
    value: Optional[bytes] = field(default=None)

OFFSET_FIELD_SIZE = 4

@dataclass
class TrieHashListNode:
    hash_value_offset: int
    offset: int
    next: Optional['TrieHashListNode'] = None

@dataclass
class DataNode:
    data: bytes
    node_size: int
    hash_value: int
    offset: int
    next_data_node_offset: int
    next: Optional['DataNode'] = None

@dataclass
class ReadTrieNode:
    name: str
    offset: Optional[int] = None
    child_offset: Optional[int] = None
    sibling_offset: Optional[int] = None
    hash_value_list: Optional[TrieHashListNode] = None
    node_size: Optional[int] = None

@dataclass
class WriteTrieNode:
    name: str
    offset: Optional[int] = None
    child_offset: Optional[int] = None
    sibling_offset: Optional[int] = None
    hash_value_list: Optional[TrieHashListNode] = None

@dataclass
class AbrgDictHeader:
    version: dict
    trie_node_offset: int
    data_node_offset: Optional[int]
    header_size: int

ABRG_FILE_MAGIC = AbrgBytes(
    offset=0,
    description='ファイルマジック("abrg")',
    size=4,
    value=b"abrg"
)
ABRG_FILE_HEADER_SIZE = AbrgBytes(
    offset=ABRG_FILE_MAGIC.offset + ABRG_FILE_MAGIC.size,
    description='ヘッダーサイズ',
    size=2,
)
VERSION_BYTES = AbrgBytes(
    offset=ABRG_FILE_HEADER_SIZE.offset + ABRG_FILE_HEADER_SIZE.size,
    description='バージョン(major, minor)',
    size=2,
)
TRIE_NODE_ENTRY_POINT = AbrgBytes(
    offset=VERSION_BYTES.offset + VERSION_BYTES.size,
    description='トライノードへのオフセット値',
    size=OFFSET_FIELD_SIZE,
)
DATA_NODE_ENTRY_POINT = AbrgBytes(
    offset=TRIE_NODE_ENTRY_POINT.offset + TRIE_NODE_ENTRY_POINT.size,
    description='データノードへのオフセット値',
    size=OFFSET_FIELD_SIZE,
)

TRIE_NODE_SIZE_FIELD = AbrgBytes(
    offset=0,
    description='トライ木ノードのサイズ',
    size=1,
)
TRIE_NODE_SIBLING_OFFSET = AbrgBytes(
    offset=TRIE_NODE_SIZE_FIELD.offset + TRIE_NODE_SIZE_FIELD.size,
    description='兄弟ノードへのオフセット値',
    size=OFFSET_FIELD_SIZE,
)
TRIE_NODE_CHILD_OFFSET = AbrgBytes(
    offset=TRIE_NODE_SIBLING_OFFSET.offset + TRIE_NODE_SIBLING_OFFSET.size,
    description='子ノードへのオフセット値',
    size=OFFSET_FIELD_SIZE,
)
TRIE_NODE_HASH_LINKED_LIST_OFFSET = AbrgBytes(
    offset=TRIE_NODE_CHILD_OFFSET.offset + TRIE_NODE_CHILD_OFFSET.size,
    description='ノードのhashValueへのオフセット値',
    size=OFFSET_FIELD_SIZE,
)

DATA_NODE_NEXT_OFFSET = AbrgBytes(
    offset=0,
    description='次のデータノードへのオフセット値',
    size=OFFSET_FIELD_SIZE,
)
DATA_NODE_SIZE_FIELD = AbrgBytes(
    offset=DATA_NODE_NEXT_OFFSET.offset + DATA_NODE_NEXT_OFFSET.size,
    description='データノードのサイズ',
    size=2,
)
DATA_NODE_HASH_VALUE = AbrgBytes(
    offset=DATA_NODE_SIZE_FIELD.offset + DATA_NODE_SIZE_FIELD.size,
    description='データノードのハッシュ値',
    size=8,
)

HASH_LINK_NODE_NEXT_OFFSET = AbrgBytes(
    offset=0,
    description='次のハッシュオフセットノードへのオフセット値',
    size=OFFSET_FIELD_SIZE,
)
HASH_LINK_NODE_OFFSET_VALUE = AbrgBytes(
    offset=HASH_LINK_NODE_NEXT_OFFSET.offset + HASH_LINK_NODE_NEXT_OFFSET.size,
    description='ハッシュ値へのオフセット',
    size=OFFSET_FIELD_SIZE,
) 