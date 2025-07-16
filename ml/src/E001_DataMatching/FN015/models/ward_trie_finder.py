import os
from FN015.services.jis_kanji import jis_kanji
from FN015.models.trie.trie_finder2 import TrieAddressFinder2
from FN015.models.trie.file_trie_writer import FileTrieWriter
from FN015.services.to_hankaku_alpha_num import to_hankaku_alpha_num
from FN015.services.to_hiragana import to_hiragana
from FN015.services.utils_db import get_wards_generator_hash, get_wards


class WardTrieFinder(TrieAddressFinder2):
    @staticmethod
    def normalize(address: str) -> str:
        address = to_hankaku_alpha_num(address)
        address = jis_kanji(address)
        address = to_hiragana(address)
        return address

    @staticmethod
    def get_cache_file_path(di_container):
        os.makedirs(di_container['cache_dir'], exist_ok=True)
        gen_hash = get_wards_generator_hash()
        return os.path.join(di_container['cache_dir'], f"ward_{gen_hash}.abrg2")

    @staticmethod
    def create_dictionary_file(di_container):
        cache_file_path = WardTrieFinder.get_cache_file_path(di_container)
        for f in os.listdir(di_container['cache_dir']):
            if f.startswith("ward_") and f.endswith(".abrg2"):
                os.remove(os.path.join(di_container['cache_dir'], f))

        rows = get_wards()
        writer = FileTrieWriter.create(cache_file_path)
        for row in rows:
            writer.add_node({
                'key': WardTrieFinder.normalize(row['key']),
                'value': row,
            })
            # partial match させるために、〇〇区だけでも登録する
            writer.add_node({
                'key': WardTrieFinder.normalize(row['ward']),
                'value': row,
            })
        writer.close()
        return True

    @staticmethod
    def load_data_file(di_container):
        cache_file_path = WardTrieFinder.get_cache_file_path(di_container)
        data = None
        num_of_try = 0
        while not data and num_of_try < 3:
            try:
                if os.path.exists(cache_file_path):
                    with open(cache_file_path, 'rb') as f:
                        data = f.read()
                    WardTrieFinder(bytearray(data[:100]))
                    return data
            except Exception as e:
                print(e)
            if not WardTrieFinder.create_dictionary_file(di_container):
                return None
            num_of_try += 1
        return data 