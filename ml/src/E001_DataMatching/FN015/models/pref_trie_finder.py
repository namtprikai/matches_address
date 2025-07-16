import hashlib
import os
from FN015.services.jis_kanji import jis_kanji
from FN015.services.kan2num import kan2num
from FN015.models.trie.trie_finder2 import TrieAddressFinder2
from FN015.models.trie.file_trie_writer import FileTrieWriter
from FN015.services.to_hiragana import to_hiragana

from FN015.services.utils_db import get_pref_list, get_pref_list_generator_hash


class PrefTrieFinder(TrieAddressFinder2):
    @staticmethod
    def normalize(value: str) -> str:
        # 半角カナ・全角カナ => 平仮名
        value = to_hiragana(value)
        # JIS 第2水準 => 第1水準 及び 旧字体 => 新字体
        value = jis_kanji(value)
        # 漢数字 => 算用数字
        value = kan2num(value)
        return value

    @staticmethod
    def get_cache_file_path(di_container):
        os.makedirs(di_container['cache_dir'], exist_ok=True)
        return os.path.join(di_container['cache_dir'], f"pref_{get_pref_list_generator_hash()}.abrg2")

    def string_md5_hash(s: str) -> int:
        return int(hashlib.md5(s.encode()).hexdigest(), 16)

    @staticmethod
    def create_dictionary_file(params):
        cache_file_path = PrefTrieFinder.get_cache_file_path(params)
        for f in os.listdir(params['cache_dir']):
            if f.startswith("pref") and f.endswith(".abrg2"):
                os.remove(os.path.join(params['cache_dir'], f))

        writer = FileTrieWriter.create(cache_file_path)
        data = get_pref_list()
        for row in data.itertuples(index=False):
            writer.add_node({
                'key': PrefTrieFinder.normalize(row.pref),
                'value': row._asdict(),
            })
        writer.close()
        return True

    @staticmethod
    def load_data_file(params):
        cache_file_path = PrefTrieFinder.get_cache_file_path(params)
        data = None
        num_of_try = 0
        while not data and num_of_try < 3:
            try:
                if os.path.exists(cache_file_path):
                    with open(cache_file_path, 'rb') as f:
                        data = f.read()
                    PrefTrieFinder(bytearray(data[:100]))
                    return data
            except Exception as e:
                print(e)
            if not PrefTrieFinder.create_dictionary_file(params):
                return None
            num_of_try += 1
        return data

    def __init__(self, data):
        self.data = data
        super().__init__(data)
