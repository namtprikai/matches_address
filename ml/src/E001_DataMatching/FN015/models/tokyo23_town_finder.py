import os
import re
from FN015.services.jis_kanji import jis_kanji
from FN015.services.kan2num import kan2num
from FN015.models.trie.trie_finder2 import TrieAddressFinder2
from FN015.models.trie.file_trie_writer import FileTrieWriter
from FN015.services.to_hiragana import to_hiragana
from FN015.services.utils_db import get_tokyo23_towns_generator_hash, get_tokyo23_towns


class Tokyo23TownTrieFinder(TrieAddressFinder2):
    @staticmethod
    def normalize(address: str) -> str:
        address = to_hiragana(address)
        address = kan2num(address)
        address = jis_kanji(address)
        # 〇〇番地[〇〇番ー〇〇号]、の [〇〇番ー〇〇号] だけを取る
        address = re.sub(r'(\d+)[\-ー－]?[番号町地丁目]+の?', r'\1-', address)
        return address

    @staticmethod
    def get_cache_file_path(di_container):
        os.makedirs(di_container['cache_dir'], exist_ok=True)
        gen_hash = get_tokyo23_towns_generator_hash()
        return os.path.join(di_container['cache_dir'], f"tokyo23-town_{gen_hash}.abrg2")

    @staticmethod
    def create_dictionary_file(di_container):
        cache_file_path = Tokyo23TownTrieFinder.get_cache_file_path(di_container)
        # Xóa cache cũ
        for f in os.listdir(di_container['cache_dir']):
            if f.startswith("tokyo23-town_") and f.endswith(".abrg2"):
                os.remove(os.path.join(di_container['cache_dir'], f))

        rows = get_tokyo23_towns()
        writer = FileTrieWriter.create(cache_file_path)
        for row in rows:
            key = f"{row.get('city','')}{row.get('oaza_cho','')}{row.get('chome','')}{row.get('koaza','')}"
            writer.add_node({
                'key': Tokyo23TownTrieFinder.normalize(key),
                'value': row,
            })
        writer.close()
        return True

    @staticmethod
    def load_data_file(di_container):
        cache_file_path = Tokyo23TownTrieFinder.get_cache_file_path(di_container)
        data = None
        num_of_try = 0
        while not data and num_of_try < 3:
            try:
                if os.path.exists(cache_file_path):
                    with open(cache_file_path, 'rb') as f:
                        data = f.read()
                    Tokyo23TownTrieFinder(bytearray(data[:100]))
                    return data
            except Exception as e:
                print(e)
            if not Tokyo23TownTrieFinder.create_dictionary_file(di_container):
                return None
            num_of_try += 1
        return data 