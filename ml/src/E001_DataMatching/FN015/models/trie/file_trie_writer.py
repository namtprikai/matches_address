import os
import struct
import zlib
import json
from collections import deque
import io 

from FN015.models.trie.abrg_file_structure import *

class ReadTrieNode:
    def __init__(self, name: str, offset: int, child_offset: int, sibling_offset: int,
                 hash_value_list: 'TrieHashListNode' = None, node_size: int = 0):
        self.name = name
        self.offset = offset
        self.child_offset = child_offset
        self.sibling_offset = sibling_offset
        self.hash_value_list = hash_value_list
        self.node_size = node_size


class WriteTrieNode:
    def __init__(self, name: str, offset: int = None, child_offset: int = None, sibling_offset: int = None,
                 hash_value_list: 'TrieHashListNode' = None):
        self.name = name
        self.offset = offset
        self.child_offset = child_offset
        self.sibling_offset = sibling_offset
        self.hash_value_list = hash_value_list


class TrieHashListNode:
    def __init__(self, hash_value_offset: int, offset: int, next_node: 'TrieHashListNode' = None):
        self.hash_value_offset = hash_value_offset
        self.offset = offset
        self.next = next_node


class AbrgDictHeader:
    def __init__(self, version: dict, trie_node_offset: int, data_node_offset: int, header_size: int):
        self.version = version
        self.trie_node_offset = trie_node_offset
        self.data_node_offset = data_node_offset
        self.header_size = header_size


class ReadDataNode:
    def __init__(self, offset: int, next_offset: int, size: int, hash_value: int, data: bytes,
                 next_node: 'ReadDataNode' = None):
        self.offset = offset
        self.next_offset = next_offset
        self.size = size
        self.hash_value = hash_value
        self.data = data
        self.next = next_node


class TrieTreeBuilderBase:
    """
    Base class for TrieTreeBuilder functionalities.
    Contains common synchronous file I/O methods.
    """

    def __init__(self, fd: io.FileIO, size: int = 0):
        self.fd = fd
        self._file_size = size
        self.trie_node_map = {}  # Cache for ReadTrieNode objects
        self.trie_hash_list_node_map = {}  # Cache for TrieHashListNode objects
        self.debug = False

    @property
    def file_size(self):
        """Returns the current file size."""
        return self._file_size

    def write(self, data: bytes, offset: int):
        """Writes data to a specific offset in the file synchronously."""
        self.fd.seek(offset)
        self.fd.write(data)
        self._file_size = max(self._file_size, offset + len(data))
        if self.debug:
            print(f"DEBUG: Wrote {len(data)} bytes at offset {offset}. New file size: {self._file_size}")

    def read(self, size: int, offset: int) -> bytes:
        """Reads data from a specific offset in the file synchronously."""
        self.fd.seek(offset)
        data = self.fd.read(size)
        return data

    def copy_to(self, offset: int, buffer: bytearray) -> int:
        """Copies data from a specific offset into a pre-allocated buffer synchronously."""
        self.fd.seek(offset)
        bytes_read = self.fd.readinto(buffer)
        return bytes_read

    def read_uint32_be(self, offset: int) -> int:
        """Reads a Big-Endian 32-bit unsigned integer from the file synchronously."""
        data = self.read(4, offset)
        if len(data) < 4:
            return 0  # Or raise an error
        return struct.unpack('>I', data)[0]

    def read_uint16_be(self, offset: int) -> int:
        """Reads a Big-Endian 16-bit unsigned integer from the file synchronously."""
        data = self.read(2, offset)
        if len(data) < 2:
            return 0  # Or raise an error
        return struct.unpack('>H', data)[0]

    def read_uint8(self, offset: int) -> int:
        """Reads an 8-bit unsigned integer from the file synchronously."""
        data = self.read(1, offset)
        if len(data) < 1:
            return 0  # Or raise an error
        return struct.unpack('>B', data)[0]

    def read_big_uint64_be(self, offset: int) -> int:
        """Reads a Big-Endian 64-bit unsigned integer from the file synchronously."""
        data = self.read(8, offset)
        if len(data) < 8:
            return 0  # Or raise an error
        return struct.unpack('>Q', data)[0]  # Q for unsigned long long

    def read_trie_node(self, offset: int) -> ReadTrieNode | None:
        """Reads a trie node from the file synchronously."""
        if self.trie_node_map.get(offset):
            return self.trie_node_map.get(offset)

        # Read node size
        node_size_data = self.read(TRIE_NODE_SIZE_FIELD.size, offset + TRIE_NODE_SIZE_FIELD.offset)
        if not node_size_data:
            return None
        node_size = struct.unpack('>B', node_size_data)[0]

        # Read the full node data
        full_node_data = self.read(node_size, offset)
        if len(full_node_data) < node_size:
            print(
                f"ERROR: Not enough data to read trie node at offset {offset}. Expected {node_size}, got {len(full_node_data)}")
            return None

        # Unpack fields
        sibling_offset = struct.unpack('>I', full_node_data[
                                             TRIE_NODE_SIBLING_OFFSET.offset:TRIE_NODE_SIBLING_OFFSET.offset +
                                                                                TRIE_NODE_SIBLING_OFFSET.size])[0]
        child_offset = struct.unpack('>I', full_node_data[
                                           TRIE_NODE_CHILD_OFFSET.offset:TRIE_NODE_CHILD_OFFSET.offset +
                                                                            TRIE_NODE_CHILD_OFFSET.size])[0]
        hash_list_offset_field = struct.unpack('>I', full_node_data[TRIE_NODE_HASH_LINKED_LIST_OFFSET.offset:
                                                                    TRIE_NODE_HASH_LINKED_LIST_OFFSET.offset +
                                                                    TRIE_NODE_HASH_LINKED_LIST_OFFSET.size])[0]

        name_start_offset_in_node_data = TRIE_NODE_HASH_LINKED_LIST_OFFSET.offset + \
                                         TRIE_NODE_HASH_LINKED_LIST_OFFSET.size
        name_bytes = full_node_data[name_start_offset_in_node_data:]
        name = name_bytes.decode('utf-8')

        hash_value_list = None
        if hash_list_offset_field > 0:
            hash_value_list = TrieHashListNode(hash_value_offset=hash_list_offset_field, offset=hash_list_offset_field)
            # We don't read the whole linked list here, only the first node reference
            # The appendHashOffset method will traverse it when needed.

        read_node = ReadTrieNode(
            name=name,
            offset=offset,
            child_offset=child_offset,
            sibling_offset=sibling_offset,
            hash_value_list=hash_value_list,
            node_size=node_size
        )
        self.trie_node_map[offset] = read_node
        return read_node

    def read_data_node(self, offset: int) -> ReadDataNode | None:
        """Reads a data node from the file synchronously."""
        # Read the next offset, size, and hash value first
        header_buffer_size = DATA_NODE_NEXT_OFFSET.size + DATA_NODE_SIZE_FIELD.size + DATA_NODE_HASH_VALUE.size
        header_buffer = bytearray(header_buffer_size)
        bytes_read = self.copy_to(offset, header_buffer)
        if bytes_read < header_buffer_size:
            # Not enough data to read the header, implies end of file or corrupted data
            return None

        next_offset = struct.unpack('>I', header_buffer[
                                          DATA_NODE_NEXT_OFFSET.offset:DATA_NODE_NEXT_OFFSET.offset +
                                                                          DATA_NODE_NEXT_OFFSET.size])[0]
        data_node_size = struct.unpack('>H', header_buffer[
                                             DATA_NODE_SIZE_FIELD.offset:DATA_NODE_SIZE_FIELD.offset +
                                                                            DATA_NODE_SIZE_FIELD.size])[0]
        hash_value = struct.unpack('>Q', header_buffer[DATA_NODE_HASH_VALUE.offset:DATA_NODE_HASH_VALUE.offset +
                                                                                      DATA_NODE_HASH_VALUE.size])[0]

        # Read the actual data (full node size minus header size)
        actual_data_offset = offset + header_buffer_size
        data_content_size = data_node_size - header_buffer_size
        data_content = self.read(data_content_size, actual_data_offset)

        if len(data_content) < data_content_size:
            print(
                f"ERROR: Not enough data for content of data node at {offset}. Expected {data_content_size}, got {len(data_content)}")
            return None  # Or handle error appropriately

        read_node = ReadDataNode(
            offset=offset,
            next_offset=next_offset,
            size=data_node_size,
            hash_value=hash_value,
            data=data_content,
            next_node=None  # Next node will be populated if traversing the linked list
        )

        if next_offset > 0:
            read_node.next = self.read_data_node(next_offset)  # Recursively read next
        return read_node

    def close(self):
        """Closes the underlying file descriptor synchronously."""
        if self.fd:
            self.fd.close()
            if self.debug:
                print("DEBUG: File descriptor closed.")


class FileTrieWriter(TrieTreeBuilderBase):
    def __init__(self, fd: io.FileIO, size: int = 0):
        super().__init__(fd, size)
        self.header: AbrgDictHeader | None = None
        self.last_data_node_offset: int = 0
        # self.lock = asyncio.Lock() # Removed: No need for async locks in synchronous code
        self.data_hash_value_to_offset_map: dict[int, int] = {}  # Python dict uses int for keys
        self.debug = False

    def _write_header(self, header: AbrgDictHeader = None):
        # package_json_meta = get_package_info()  # Synchronous call

        offset = 0

        # magicの書き込み (Write magic)
        magic_buffer = ABRG_FILE_MAGIC.value
        offset += len(magic_buffer)

        # ヘッダーサイズの書き込み (Write header size)
        # This will be filled in later once the full header size is known
        header_size_buffer = bytearray(ABRG_FILE_HEADER_SIZE.size)
        offset += len(header_size_buffer)

        # バージョン (Version)
        # 将来的に書きこんだversionによってロジックが変えられるようにするため書いておく
        # (Writing version to allow future logic changes based on version)
        version_buffer = bytearray(VERSION_BYTES.size)
        # version_parts = package_json_meta["version"].split('.')
        # major_version = int(version_parts[0]) if len(version_parts) > 0 else 0
        # minor_version = int(version_parts[1]) if len(version_parts) > 1 else 0
        major_version = 2
        minor_version = 2
        struct.pack_into('>BB', version_buffer, 0, major_version, minor_version)
        offset += len(version_buffer)

        # トライノードのオフセット値 (Trie node offset value)
        trie_node_offset_buffer = bytearray(TRIE_NODE_ENTRY_POINT.size)
        if header and header.trie_node_offset is not None:
            struct.pack_into('>I', trie_node_offset_buffer, 0, header.trie_node_offset)
        offset += len(trie_node_offset_buffer)

        # データノードのオフセット値 (Data node offset value)
        data_node_offset_buffer = bytearray(DATA_NODE_ENTRY_POINT.size)
        if header and header.data_node_offset is not None:
            struct.pack_into('>I', data_node_offset_buffer, 0, header.data_node_offset)
        offset += len(data_node_offset_buffer)

        # ヘッダーサイズが確定 (Header size confirmed)
        struct.pack_into('>H', header_size_buffer, 0, offset)

        final_buffer = b''.join([
            magic_buffer,
            header_size_buffer,
            version_buffer,
            trie_node_offset_buffer,
            data_node_offset_buffer,
        ])

        # ファイルに書き込む (Write to file)
        self.write(final_buffer, 0)  # Synchronous call

        return AbrgDictHeader(
            version={"major": major_version, "minor": minor_version},
            trie_node_offset=offset,  # This offset is where the trie nodes start *after* the header
            data_node_offset=None,  # Will be updated later for the first data node
            header_size=offset,
        )

    def _read_all_data_nodes(self):
        if not self.header or not self.header.data_node_offset:
            return

        # データノードを全て辿っていき、dataHashValueMap に格納していく
        # (Traverse all data nodes and store them in dataHashValueMap)
        offset: int = self.header.data_node_offset
        hash_value: int
        next_offset: int = 0
        # データノードのヘッダを読み込むためのバッファ
        # (Buffer to read the data node header)
        data_node_head = bytearray(
            DATA_NODE_NEXT_OFFSET.size + DATA_NODE_SIZE_FIELD.size + DATA_NODE_HASH_VALUE.size)

        # データノードの連結リストが続く限り、読み取っていく
        # (Read as long as the data node linked list continues)
        while offset > 0:
            bytes_read = self.copy_to(offset, data_node_head)  # Synchronous call
            if bytes_read < len(data_node_head):
                print(f"WARNING: Incomplete data node header at offset {offset}")
                break  # Break if we can't read the full header

            next_offset = struct.unpack('>I', data_node_head[
                                              DATA_NODE_NEXT_OFFSET.offset:DATA_NODE_NEXT_OFFSET.offset +
                                                                              DATA_NODE_NEXT_OFFSET.size])[0]
            hash_value = struct.unpack('>Q', data_node_head[
                                             DATA_NODE_HASH_VALUE.offset:DATA_NODE_HASH_VALUE.offset +
                                                                            DATA_NODE_HASH_VALUE.size])[0]

            # ハッシュ値が衝突する可能性があるが、それほど多くはないはずなので、先頭のオフセット値だけをキープする
            # (Hash values may collide, but should not be too many, so keep only the first offset value)
            if hash_value not in self.data_hash_value_to_offset_map:
                self.data_hash_value_to_offset_map[hash_value] = offset

            offset = next_offset

    @classmethod
    def create(cls, file_path: str):
        # Open file synchronously
        fd = open(file_path, 'w+b')  # Use 'w+b' for binary
        stat_info = os.fstat(fd.fileno())  # Get file size synchronously
        writer = cls(fd, stat_info.st_size)

        # Read header or create new if file is empty
        # Read magic to check if file is new or existing
        magic_buffer = bytearray(ABRG_FILE_MAGIC.size)
        try:
            writer.copy_to(0, magic_buffer)  # Synchronous call
            is_existing_file = magic_buffer == ABRG_FILE_MAGIC.value
        except Exception:  # File might be truly empty or unreadable at 0
            is_existing_file = False

        if is_existing_file:
            # Read header size
            header_size_val = writer.read_uint16_be(ABRG_FILE_HEADER_SIZE.offset)  # Synchronous call

            # Read version
            version_data = writer.read(VERSION_BYTES.size, VERSION_BYTES.offset)  # Synchronous call
            major_version, minor_version = struct.unpack('>BB', version_data)

            # Read trie node offset
            trie_node_offset = writer.read_uint32_be(TRIE_NODE_ENTRY_POINT.offset)  # Synchronous call

            # Read data node offset
            data_node_offset = writer.read_uint32_be(DATA_NODE_ENTRY_POINT.offset)  # Synchronous call

            writer.header = AbrgDictHeader(
                version={"major": major_version, "minor": minor_version},
                trie_node_offset=trie_node_offset,
                data_node_offset=data_node_offset,
                header_size=header_size_val,
            )
            # ファイルに書き込まれている全データノードを読み込み
            # (Read all data nodes written in the file)
            writer._read_all_data_nodes()
        else:
            # ファイルヘッダーの作成 (Create file header)
            writer.header = writer._write_header()  # Synchronous call

            # ルートノードの値(0)を書き込む (Write root node value (0))
            # The root node data is an empty dictionary
            root_data_offset = writer._store_data({})  # Synchronous call
            writer.data_hash_value_to_offset_map[0] = root_data_offset

            # ルートノード(トライ木ノード)を書き込む (Write root node (trie tree node))
            # The root trie node has an empty name
            root_node = writer._write_trie_node(  # Synchronous call
                trie_node=WriteTrieNode(name=''),
                hash_value_offset=root_data_offset,
            )

            # writerにheaderを持たせる (Assign header to writer)
            writer.header.trie_node_offset = root_node.offset
            writer.header.data_node_offset = root_data_offset

            # ファイルのヘッダー情報を更新する (Update file header information)
            writer._write_header(writer.header)  # Synchronous call
        return writer

    def _write_sibling_offset_field_on_trie_node(self, trie_node: WriteTrieNode):
        if trie_node.offset is None:
            raise ValueError("trieNode.offset is required")

        # 兄弟ノードへのオフセット値 (Offset value to sibling node)
        sibling_node_offset_buffer = struct.pack('>I', trie_node.sibling_offset)

        self.write(sibling_node_offset_buffer,
                   trie_node.offset + TRIE_NODE_SIBLING_OFFSET.offset)  # Synchronous call

    def _write_child_offset_field_on_trie_node(self, trie_node: WriteTrieNode):
        if trie_node.offset is None:
            raise ValueError("trieNode.offset is required")

        # 子ノードへのオフset值 (Offset value to child node)
        child_node_offset_buffer = struct.pack('>I', trie_node.child_offset)

        self.write(child_node_offset_buffer, trie_node.offset + TRIE_NODE_CHILD_OFFSET.offset)  # Synchronous call

    def _write_trie_node(self, trie_node: WriteTrieNode, hash_value_offset: int = None) -> ReadTrieNode:
        # 同じオフセットの位置にデータが書き込まれていたらマージする
        # (Merge data if written at the same offset)
        prev_trie_node = self.trie_node_map.get(trie_node.offset) if trie_node.offset else None
        if prev_trie_node:
            # Only update if the new trieNode doesn't explicitly have these, preserving old values
            if trie_node.sibling_offset is None:
                trie_node.sibling_offset = prev_trie_node.sibling_offset
            if trie_node.child_offset is None:
                trie_node.child_offset = prev_trie_node.child_offset
            if trie_node.hash_value_list is None:
                trie_node.hash_value_list = prev_trie_node.hash_value_list
            trie_node.name = prev_trie_node.name  # Name should ideally be consistent

        if self.debug:
            print(f"        hashValueOffset : {hash_value_offset} ")
            print(f"            name: {trie_node.name} ")
            print(f"            siblingOffset: {trie_node.sibling_offset} ")
            print(f"            childOffset: {trie_node.child_offset} ")
            print(
                f"            hashValueList: {trie_node.hash_value_list.offset if trie_node.hash_value_list else None} ")
            print(f"            offset: {trie_node.offset} ")

        buffers = []

        # トライ木ノードのサイズ (Trie tree node size)
        trie_node_size_buffer = bytearray(TRIE_NODE_SIZE_FIELD.size)
        buffers.append(trie_node_size_buffer)

        # 兄弟ノードへのオフセット値 (Offset value to sibling node)
        sibling_node_offset_buffer = struct.pack('>I', trie_node.sibling_offset or 0)
        buffers.append(sibling_node_offset_buffer)

        # 子ノードへのオフセット値 (Offset value to child node)
        child_node_offset_buffer = struct.pack('>I', trie_node.child_offset or 0)
        buffers.append(child_node_offset_buffer)

        # ノードに関連付けるハッシュ値連結リストへのオフセット値(4バイト)
        # (Offset value (4 bytes) to the hash value linked list associated with the node)
        hash_offset_buffer = bytearray(TRIE_NODE_HASH_LINKED_LIST_OFFSET.size)
        if trie_node.hash_value_list and trie_node.hash_value_list.offset is not None:
            # Need to read the actual hash value offset *stored at* trieNode.hash_value_list.offset
            # The existing TS code reads a uint32 from that offset and writes it into the current node's hashOffsetBuffer
            try:
                stored_hash_list_entry_offset = self.read_uint32_be(
                    trie_node.hash_value_list.offset)  # Synchronous call
                struct.pack_into('>I', hash_offset_buffer, 0, stored_hash_list_entry_offset)
            except Exception as e:
                print(
                    f"WARNING: Could not read hash list offset for trie node {trie_node.offset} at {trie_node.hash_value_list.offset}: {e}")
                struct.pack_into('>I', hash_offset_buffer, 0, 0)  # Write 0 if unable to read
        else:
            struct.pack_into('>I', hash_offset_buffer, 0, 0)  # Write 0 if no hash list
        buffers.append(hash_offset_buffer)

        name_bytes = b''
        if trie_node.name:
            name_bytes = trie_node.name.encode('utf-8')
            buffers.append(name_bytes)

        # Calculate trieNodeSize after all components are added to determine the total size
        trie_node_size = sum(len(b) for b in buffers)

        # ノードのサイズが確定 (Node size confirmed)
        # Write the total size to the first byte
        struct.pack_into('>B', trie_node_size_buffer, 0, trie_node_size)

        # ファイルバッファに書き込む (Write to file buffer)
        write_offset = trie_node.offset if trie_node.offset is not None else self.file_size
        data = b''.join(buffers)
        self.write(data, write_offset)  # Synchronous call
        trie_node.offset = write_offset

        hash_value_list: TrieHashListNode | None = None
        if hash_value_offset is not None:
            # このトライ木ノードに関連付けてあるハッシュ値のオフセットのリストに追加する
            # (Add to the list of hash value offsets associated with this trie tree node)
            hash_value_list = self._append_hash_offset(  # Synchronous call
                trie_node=trie_node,
                hash_value_offset=hash_value_offset,
            )

        read_trie_node = ReadTrieNode(
            name=trie_node.name,
            offset=write_offset,
            child_offset=trie_node.child_offset or 0,
            sibling_offset=trie_node.sibling_offset or 0,
            hash_value_list=hash_value_list,
            node_size=trie_node_size,
        )

        self.trie_node_map[write_offset] = read_trie_node
        return read_trie_node

    def _append_hash_offset(self, trie_node: WriteTrieNode, hash_value_offset: int) -> TrieHashListNode:
        """
        トライ木に関連付けられるハッシュ値を定義してある領域へのオフセット値の、連結リストの最後に追加する
        (Appends to the end of the linked list of offsets to the hash value definition area associated with the trie tree.)
        """
        if trie_node.offset is None:
            raise ValueError("trieNode.offset is required")

        # 1つ前のハッシュ値のオフセット値が書かれているアドレス
        # (Address where the offset value of the previous hash value is written)
        parent_hash_offset_node_offset: int = trie_node.offset + TRIE_NODE_HASH_LINKED_LIST_OFFSET.offset

        # メモリから読み込んだハッシュ値へのオフセット値 (Offset value to hash value read from memory)
        stored_hash_value_offset_in_trie_node = self.read_uint32_be(parent_hash_offset_node_offset)  # Synchronous call

        # 次に移動するオフセット値 (Next offset to move to)
        next_offset: int = stored_hash_value_offset_in_trie_node

        # ハッシュ値のリストを読み取るためのバッファ
        # (Buffer to read the hash value list)
        # 次のハッシュ値リストのノードへのオフセット値(4バイト)+実際のデータを格納している領域へのオフセット値
        # (Offset value to next hash value list node (4 bytes) + offset value to actual data storage area)
        hash_link_node_buffer = bytearray(
            HASH_LINK_NODE_NEXT_OFFSET.size + HASH_LINK_NODE_OFFSET_VALUE.size
        )

        # 同じハッシュ値へのオフセット値を既に持っているかどうか
        # (Whether it already has the same offset value to the hash value)
        has_same_hash_value_offset = False

        # 先頭アンカー (Head anchor)
        head_value_list: TrieHashListNode = TrieHashListNode(
            hash_value_offset=stored_hash_value_offset_in_trie_node,
            # This is the first hash value pointed to directly by the trie node
            offset=parent_hash_offset_node_offset,
            # This is the offset within the trie node that points to the first hash list node
            next_node=None,
        )
        # 末尾 (Tail)
        tail_value_list: TrieHashListNode = head_value_list

        # このトライ木ノードに同じハッシュ値へのオフセット値が関連付けられているかチェックする
        # (Check if the same hash value offset is associated with this trie tree node)
        while next_offset > 0:
            if self.debug:
                print(f"            (next){next_offset}")

            # Read from cache if available, otherwise read from file
            cached_node = self.trie_hash_list_node_map.get(next_offset)
            if cached_node:
                tail_value_list.next = cached_node
                tail_value_list = cached_node
                next_offset = cached_node.next.offset if cached_node.next else 0
                has_same_hash_value_offset = has_same_hash_value_offset or (
                        cached_node.hash_value_offset == hash_value_offset)
                continue

            # nextOffsetの位置のハッシュリンクを読み込む (Read hash link at nextOffset position)
            bytes_read = self.copy_to(next_offset, hash_link_node_buffer)  # Synchronous call
            if bytes_read < len(hash_link_node_buffer):
                raise IOError("Can not read the hashLinkNode correctly.")

            parent_hash_offset_node_offset = next_offset

            # 次のハッシュオフセットノードへのオフセット値 (Offset value to next hash offset node)
            next_offset_in_buffer = struct.unpack('>I', hash_link_node_buffer[
                                                        HASH_LINK_NODE_NEXT_OFFSET.offset:HASH_LINK_NODE_NEXT_OFFSET.offset + HASH_LINK_NODE_NEXT_OFFSET.size])[0]
            # 保存されているハッシュ值へのオフセット值 (Saved offset value to hash value)
            stored_hash_value_offset_in_buffer = struct.unpack('>I', hash_link_node_buffer[
                                                                     HASH_LINK_NODE_OFFSET_VALUE.offset:
                                                                     HASH_LINK_NODE_OFFSET_VALUE.offset +
                                                                     HASH_LINK_NODE_OFFSET_VALUE.size])[0]

            # リストを構築していく (Build the list)
            new_node = TrieHashListNode(
                hash_value_offset=stored_hash_value_offset_in_buffer,
                offset=parent_hash_offset_node_offset,
                next_node=None,
            )
            tail_value_list.next = new_node
            self.trie_hash_list_node_map[parent_hash_offset_node_offset] = new_node
            tail_value_list = new_node

            # 既に同じハッシュ値へのオフセット値が保存されているか判定 (Check if the same hash value offset is already saved)
            has_same_hash_value_offset = has_same_hash_value_offset or (
                    stored_hash_value_offset_in_buffer == hash_value_offset)
            next_offset = next_offset_in_buffer

        # 既に同じハッシュ値へのオフセット値が保存されている場合は終了 (If the same hash value offset is already saved, finish)
        if has_same_hash_value_offset:
            return head_value_list  # Always return the head of the constructed list, which points to the full chain

        # nextOffset = 0 が成立しているので、ファイルの末尾に追加 (Since nextOffset = 0, append to end of file)
        hash_link_node_buffer_to_write = bytearray(
            HASH_LINK_NODE_NEXT_OFFSET.size + HASH_LINK_NODE_OFFSET_VALUE.size
        )
        struct.pack_into('>I', hash_link_node_buffer_to_write, HASH_LINK_NODE_NEXT_OFFSET.offset,
                         0)  # Next hashLinkNode offset
        struct.pack_into('>I', hash_link_node_buffer_to_write, HASH_LINK_NODE_OFFSET_VALUE.offset,
                         hash_value_offset)  # Actual data offset

        write_offset = self.file_size
        self.write(hash_link_node_buffer_to_write, write_offset)  # Synchronous call

        # 1つ前のノードから関連付ける (Associate from the previous node)
        only_offset = struct.pack('>I', write_offset)  # Pack the new node's offset
        self.write(only_offset, parent_hash_offset_node_offset)  # Synchronous call

        if self.debug:
            print(f"            (save){write_offset} at {parent_hash_offset_node_offset} (node: {trie_node.offset})")

        # リストにも追加する (Also add to the list)
        new_appended_node = TrieHashListNode(
            hash_value_offset=hash_value_offset,
            offset=write_offset,
            next_node=None,
        )
        tail_value_list.next = new_appended_node
        self.trie_hash_list_node_map[write_offset] = new_appended_node
        if self.debug:
            print(f"            (save){head_value_list}")

        return head_value_list

    def _store_data(self, data: any) -> int:
        data_str = json.dumps(data, sort_keys=True, ensure_ascii=False)
        data_buffer = zlib.compress(data_str.encode('utf-8'), level=9)
        hash_value = self._buffer_to_big_int_hash(data_buffer)

        # データノード先頭にある、次のデータノードへのオフセット値を読み込むためのバッファ
        # (Buffer to read the offset value to the next data node at the beginning of the data node)
        next_data_node_offset_buffer = bytearray(DATA_NODE_NEXT_OFFSET.size)  # Just the next offset field

        parent_data_node_offset = 0
        if hash_value in self.data_hash_value_to_offset_map:
            # キャッシュがある場合、キーが衝突している可能性がある
            # (If there is a cache, the key might be colliding)
            initial_offset = self.data_hash_value_to_offset_map[hash_value]

            # 連結リストになって返ってくるので、各ノードの実データと保存したいデータを比較する
            # (Since it returns as a linked list, compare the actual data of each node with the data to be saved)
            current_data_node = self.read_data_node(initial_offset)  # Synchronous call
            while current_data_node:
                # データを読み取って同じなら、current_data_node.offsetを返す
                # (If data is read and is the same, return current_data_node.offset)
                if current_data_node.data and current_data_node.data == data_buffer:
                    return current_data_node.offset
                parent_data_node_offset = current_data_node.offset
                current_data_node = current_data_node.next
        else:
            # キーが異なる場合は追記 (If keys are different, append)
            # If there's a last data node from previous writes, append to it
            if self.last_data_node_offset > 0:
                parent_data_node_offset = self.last_data_node_offset
            else:
                # If no last data node, read the DATA_NODE_ENTRY_POINT from header
                if self.header and self.header.data_node_offset:
                    parent_data_node_offset = self.header.data_node_offset
                else:
                    parent_data_node_offset = self.file_size

        # Traverse the linked list to find the actual last node if parent_data_node_offset is already part of a chain
        if parent_data_node_offset > 0 and hash_value not in self.data_hash_value_to_offset_map:
            if self.header and self.header.data_node_offset and parent_data_node_offset == self.header.data_node_offset:
                current_node_offset = self.header.data_node_offset
            else:
                current_node_offset = parent_data_node_offset

            if current_node_offset > 0:
                while True:
                    read_next_offset_buffer = bytearray(DATA_NODE_NEXT_OFFSET.size)
                    bytes_read = self.copy_to(current_node_offset + DATA_NODE_NEXT_OFFSET.offset,
                                              read_next_offset_buffer)  # Synchronous call
                    if bytes_read < DATA_NODE_NEXT_OFFSET.size:
                        break

                    next_linked_offset = struct.unpack('>I', read_next_offset_buffer)[0]
                    if next_linked_offset == 0:
                        break

                    current_node_offset = next_linked_offset
                parent_data_node_offset = current_node_offset

        self.last_data_node_offset = max(self.last_data_node_offset, parent_data_node_offset)

        # ファイルの末尾をデータを書き込むオフセット値にする (Make the end of the file the offset for writing data)
        write_offset = self.file_size

        # Update the 'next_offset' field of the parent node to point to the new node
        if parent_data_node_offset > 0:
            next_data_node_ptr_buffer = struct.pack('>I', write_offset)
            if parent_data_node_offset == DATA_NODE_ENTRY_POINT.offset:
                self.write(next_data_node_ptr_buffer, DATA_NODE_ENTRY_POINT.offset)  # Synchronous call
            else:
                self.write(next_data_node_ptr_buffer,
                           parent_data_node_offset + DATA_NODE_NEXT_OFFSET.offset)  # Synchronous call

        buffers = []

        # 次のデータノードへのオフセット値を保存するためのプレイスホルダ (Placeholder for next data node offset)
        next_data_node_placeholder_buffer = bytearray(DATA_NODE_NEXT_OFFSET.size)
        buffers.append(next_data_node_placeholder_buffer)

        # データノードのサイズ (Data node size)
        data_node_size_buffer = bytearray(DATA_NODE_SIZE_FIELD.size)
        buffers.append(data_node_size_buffer)

        # データのハッシュ値(データに対するキー) (Hash value of data (key for data))
        hash_value_buffer = struct.pack('>Q', hash_value)
        buffers.append(hash_value_buffer)

        # 実データ (Actual data)
        buffers.append(data_buffer)

        # データノード全体のサイズが確定 (Total data node size confirmed)
        data_node_size = sum(len(b) for b in buffers)
        struct.pack_into('>H', data_node_size_buffer, 0, data_node_size)

        # ファイルに書き込む (Write to file)
        data_node_buffer = b''.join(buffers)
        self.write(data_node_buffer, write_offset)  # Synchronous call

        # 次のためにオフセット値を持っておく (Keep offset for next time)
        self.last_data_node_offset = write_offset

        # ハッシュ値に対するオフセット値を記録 (Record offset value for hash value)
        if hash_value not in self.data_hash_value_to_offset_map:
            self.data_hash_value_to_offset_map[hash_value] = write_offset

        return write_offset

    def add_node(self, params):
        key = params["key"]
        value = params["value"]
        if not self.header or not self.header.trie_node_offset:
            raise RuntimeError("Can not find the root node")

        # Removed: No need for async locks in synchronous code
        # with self.lock:

        # 新しいハッシュ値ならファイルに書き込む (If new hash value, write to file)
        hash_value_offset = self._store_data(value)  # Synchronous call

        # ルートノードの読み取り (Read root node)
        offset = self.header.trie_node_offset
        root_node: ReadTrieNode | None
        if offset in self.trie_node_map:
            root_node = self.trie_node_map[offset]
        else:
            root_node = self.read_trie_node(offset)  # Synchronous call
            if not root_node:
                raise RuntimeError("Failed to read root node after initial setup.")
            self.trie_node_map[offset] = root_node

        # keyの前方から既にある親ノードを探す (Search for existing parent node from front of key)
        queue = deque([{
            "node": root_node,
            "idx": -1,  # Represents the character index in the key that `node.name` corresponds to. -1 for root.
            "path": '',
        }])

        current_idx: int = -1

        while queue:
            task = queue.popleft()  # Use popleft for BFS

            # 既に子ノードが見つかっているので、スキップ (If child node already found, skip)
            if task["idx"] < current_idx:
                continue

            # マッチしないときは、兄弟ノードを探す (If no match, search for sibling node)
            if task["idx"] > -1 and key[task["idx"]] != task["node"].name:
                if task["node"].sibling_offset:
                    # 兄弟ノードを読み込む (Read sibling node)
                    sibling_node = self.read_trie_node(task["node"].sibling_offset)  # Synchronous call
                    if not sibling_node:
                        raise IOError(f"Can not read the sibling node at {task['node'].sibling_offset}")
                    queue.append({
                        "node": sibling_node,
                        "idx": task["idx"],
                        "path": task["path"],
                    })
                    continue
                else:
                    # 全ての兄弟ノードをチェックしたが見つからない場合、兄弟ノードを追加する
                    # (If all sibling nodes checked and not found, add a sibling node)
                    sibling_node = self._write_trie_node(  # Synchronous call
                        trie_node=WriteTrieNode(
                            name=key[task["idx"]],
                        ),
                        hash_value_offset=hash_value_offset if task["idx"] == len(key) - 1 else None,
                    )

                    # 親ノードと作成した兄弟ノードを関連付ける (Associate parent node with created sibling node)
                    task["node"].sibling_offset = sibling_node.offset
                    self._write_sibling_offset_field_on_trie_node(trie_node=task["node"])  # Synchronous call
                    if self.debug:
                        print(f"    [sibling] {task['node'].name} => {sibling_node.name}")

                    # 最後の文字だった場合は終了 (If it was the last character, finish)
                    if task["idx"] == len(key) - 1:
                        break

                    # 次の文字に進む (Move to the next character)
                    task = {
                        "node": sibling_node,
                        "idx": task["idx"],
                        "path": task["path"] + key[task["idx"]],
                    }

            # 文字がマッチした場合 (If character matches)
            current_idx = max(current_idx, task["idx"] + 1)

            # 全ての文字が既に登録されていて、末尾にたどり着いた場合
            # (If all characters are already registered and reached the end)
            if task["idx"] == len(key) - 1:
                if self.debug:
                    print(f"    [write] {task['node'].name} with {hash_value_offset}")
                # 現在のトライ木ノードに hashValueOffset を書き込んで終了
                # (Write hashValueOffset to current trie tree node and finish)
                self._write_trie_node(  # Synchronous call
                    trie_node=task["node"],
                    hash_value_offset=hash_value_offset,
                )
                break

            child_node: ReadTrieNode | None = None
            if task["node"].child_offset:
                # 子ノードがある場合は、子ノードに進む (If child node exists, proceed to child node)
                child_node = self.read_trie_node(task["node"].child_offset)  # Synchronous call
                if not child_node:
                    raise IOError(f"Cannot load the child node at {task['node'].child_offset}")
            else:
                # 子ノードがないので書き込む (No child node, so write one)
                child_node = self._write_trie_node(  # Synchronous call
                    trie_node=WriteTrieNode(
                        name=key[task["idx"] + 1],
                    ),
                    hash_value_offset=hash_value_offset if task["idx"] + 1 == len(key) - 1 else None,
                )

                # 親ノードのchildNodeOffsetに書き込む (Write to parent node's childNodeOffset)
                task["node"].child_offset = child_node.offset
                self._write_child_offset_field_on_trie_node(trie_node=task["node"])  # Synchronous call

            if self.debug:
                print(f"    [child] {task['node'].name} => {child_node.name}")

            queue.append({
                "node": child_node,
                "idx": task["idx"] + 1,
                "path": task["path"] + (key[task["idx"]] if task["idx"] > -1 else ''),
            })

    def _buffer_to_big_int_hash(self, data: bytes) -> int:
        """
        Calculates a 64-bit FNV-1a hash of the given bytes.
        Translates the JavaScript BigInt FNV-1a hashing to Python.
        """
        FNV_OFFSET_BASIS = 0xcbf29ce484222325
        FNV_PRIME = 0x100000001b3
        MAX_64_BIT = 0xFFFFFFFFFFFFFFFF

        hash_val = FNV_OFFSET_BASIS
        for byte_val in data:
            hash_val ^= byte_val
            hash_val = (hash_val * FNV_PRIME) & MAX_64_BIT
        return hash_val
