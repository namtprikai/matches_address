import os
from FN015.services.jis_kanji import jis_kanji
from FN015.services.kan2num import kan2num
from FN015.services.to_hiragana import to_hiragana
from FN015.models.trie.trie_finder2 import TrieAddressFinder2
from FN015.models.trie.file_trie_writer import FileTrieWriter

class WardAndOazaTrieFinder(TrieAddressFinder2):
    @staticmethod
    def normalize(value: str) -> str:
        value = to_hiragana(value)
        value = jis_kanji(value)
        value = kan2num(value)
        return value

    @staticmethod
    def get_cache_file_path(di_container):
        os.makedirs(di_container.cache_dir, exist_ok=True)
        common_db = di_container.db.open_common_db()
        gen_hash = common_db.get_ward_and_oaza_cho_list_generator_hash()
        return os.path.join(di_container.cache_dir, f"ward-and-oaza_{gen_hash}.abrg2")

    @staticmethod
    def create_dictionary_file(di_container):
        cache_file_path = WardAndOazaTrieFinder.get_cache_file_path(di_container)
        if os.path.exists(cache_file_path):
            return
        for f in os.listdir(di_container.cache_dir):
            if f.startswith("ward-and-oaza_") and f.endswith(".abrg2"):
                os.remove(os.path.join(di_container.cache_dir, f))
        db = di_container.db.open_common_db()
        rows = db.get_ward_and_oaza_cho_list()
        writer = FileTrieWriter.create(cache_file_path)
        for row in rows:
            writer.add_node({
                'key': WardAndOazaTrieFinder.normalize(row['key']),
                'value': row,
            })
        writer.close()
        db.close()

    @staticmethod
    def load_data_file(di_container):
        cache_file_path = WardAndOazaTrieFinder.get_cache_file_path(di_container)
        if not os.path.exists(cache_file_path):
            WardAndOazaTrieFinder.create_dictionary_file(di_container)
        try:
            with open(cache_file_path, 'rb') as f:
                data = f.read()
            WardAndOazaTrieFinder(bytearray(data[:100]))
            return data
        except Exception as e:
            print(e)
            os.remove(cache_file_path)
            WardAndOazaTrieFinder.create_dictionary_file(di_container)
            with open(cache_file_path, 'rb') as f:
                data = f.read()
            return data 