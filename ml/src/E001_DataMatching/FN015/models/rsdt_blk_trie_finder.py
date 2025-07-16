import os
from FN015.models.trie.trie_finder2 import TrieAddressFinder2
from FN015.models.trie.file_trie_writer import FileTrieWriter

class RsdtBlkTrieFinder(TrieAddressFinder2):
    @staticmethod
    def get_cache_file_path(di_container, lg_code):
        os.makedirs(di_container.cache_dir, exist_ok=True)
        common_db = di_container.db.open_common_db()
        gen_hash = common_db.get_oaza_chomes_generator_hash()
        return os.path.join(di_container.cache_dir, f"rsdtblk_{lg_code}_{gen_hash}.abrg2")

    @staticmethod
    def create_dictionary_file(di_container, lg_code):
        cache_file_path = RsdtBlkTrieFinder.get_cache_file_path(di_container, lg_code)
        # Xóa cache cũ
        for f in os.listdir(di_container.cache_dir):
            if f.startswith(f"rsdtblk_{lg_code}") and f.endswith(".abrg2"):
                os.remove(os.path.join(di_container.cache_dir, f))
        db = di_container.db.open_rsdt_blk_db(lg_code, create_if_not_exists=False)
        if not db:
            return False
        rows = db.get_block_num_rows()
        writer = FileTrieWriter.create(cache_file_path)
        for row in rows:
            key = f"{row['town_key']}:{row['blk_num']}"
            writer.add_node({
                'key': key,
                'value': {
                    'rsdtblk_key': row['rsdtblk_key'],
                    'town_key': row['town_key'],
                    'blk_id': row['blk_id'],
                    'blk_num': row['blk_num'],
                    'rep_lat': row['rep_lat'],
                    'rep_lon': row['rep_lon'],
                }
            })
        writer.close()
        db.close()
        return True

    @staticmethod
    def load_data_file(di_container, lg_code):
        cache_file_path = RsdtBlkTrieFinder.get_cache_file_path(di_container, lg_code)
        data = None
        num_of_try = 0
        while not data and num_of_try < 3:
            try:
                if os.path.exists(cache_file_path):
                    with open(cache_file_path, 'rb') as f:
                        data = f.read()
                    RsdtBlkTrieFinder(bytearray(data[:100]))
                    return data
            except Exception as e:
                print(e)
            if not RsdtBlkTrieFinder.create_dictionary_file(di_container, lg_code):
                return None
            num_of_try += 1
        return data 