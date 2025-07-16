import os
import re

from FN015.services.constant_values import DASH, SPACE
from FN015.services.reg_exp_ex import RegExpEx
from FN015.services.jis_kanji import jis_kanji
from FN015.services.kan2num import kan2num
from FN015.models.trie.trie_finder2 import TrieAddressFinder2, CharNode
from FN015.models.trie.file_trie_writer import FileTrieWriter
from FN015.services.to_hankaku_alpha_num import to_hankaku_alpha_num
from FN015.services.to_hiragana import to_hiragana
from FN015.services.utils_db import get_kyoto_street_rows, get_kyoto_street_generator_hash


class KyotoStreetTrieFinder(TrieAddressFinder2):
    @staticmethod
    def normalize(address: str | CharNode) -> str | None:
        if address is None:
            return None
        # 漢数字を半角数字に変換する
        address = kan2num(address)
        # 全角英数字は、半角英数字に変換
        address = to_hankaku_alpha_num(address)
        # 片仮名は平仮名に変換する
        address = to_hiragana(address)
        # JIS 第2水準 => 第1水準 及び 旧字体 => 新字体
        address = jis_kanji(address)
        # input =「丸の内一の八」のように「ハイフン」を「の」で表現する場合があるので
        # 「の」は全部DASHに変換する
        address = KyotoStreetTrieFinder.replace_text_all(address, RegExpEx.create(r'([0-9])の', 'g'), r'$1' + DASH)
        address = KyotoStreetTrieFinder.replace_text_all(address, RegExpEx.create(r'([0-9])の([0-9])', 'g'),
                                                         r'$1' + DASH + r'$2')

        # 「丁目」を DASHにする
        address = KyotoStreetTrieFinder.replace_text_all(address, RegExpEx.create(r'丁目', 'g'), DASH)

        # Trim leading/trailing spaces and dashes using CharNode's replace_all
        address = KyotoStreetTrieFinder.replace_text_all(address,
                                                         RegExpEx.create(f'^[{re.escape(SPACE)}{re.escape(DASH)}]+',
                                                                         'g'),
                                                         '')
        address = KyotoStreetTrieFinder.replace_text_all(address,
                                                         RegExpEx.create(f'[{re.escape(SPACE)}{re.escape(DASH)}]+$',
                                                                         'g'),
                                                         '')
        return address

    @staticmethod
    def replace_text_all(address: str | CharNode, pattern, text_replace):
        if address:
            if isinstance(address, CharNode):
                address = address.replace_all(pattern, text_replace) or address
            elif isinstance(address, str):
                if '$' in text_replace:
                    text_replace = re.sub(r'\$(\d+)', r'\\\1', text_replace)
                address = re.sub(pattern, text_replace, address)
        return address

    @staticmethod
    def get_cache_file_path(di_container):
        os.makedirs(di_container['cache_dir'], exist_ok=True)
        return os.path.join(di_container['cache_dir'], f"kyoto-street_{get_kyoto_street_generator_hash()}.abrg2")

    @staticmethod
    def create_dictionary_file(di_container):
        cache_file_path = KyotoStreetTrieFinder.get_cache_file_path(di_container)
        for f in os.listdir(di_container['cache_dir']):
            if f.startswith("kyoto-street") and f.endswith(".abrg2"):
                os.remove(os.path.join(di_container['cache_dir'], f))

        writer = FileTrieWriter.create(cache_file_path)
        data = get_kyoto_street_rows()
        for row in data:
            row['oaza_cho'] = to_hankaku_alpha_num(row['oaza_cho'])
            row['chome'] = to_hankaku_alpha_num(row['chome'])
            match_level = row.get('match_level')
            if match_level == 'machiaza':  # MACHIAZA
                writer.add_node({
                    'key': KyotoStreetTrieFinder.normalize(row['oaza_cho']),
                    'value': row,
                })
            elif match_level == 'machiaza_detail':  # MACHIAZA_DETAIL
                row['koaza'] = to_hankaku_alpha_num(row['koaza'])
                if row['koaza_aka_code'] == 2:
                    writer.add_node({
                        'key': KyotoStreetTrieFinder.normalize(row['koaza'] + row['oaza_cho']),
                        'value': row,
                    })
                else:
                    if not row['oaza_cho'] and not row['chome'] and row['koaza']:
                        writer.add_node({
                            'key': KyotoStreetTrieFinder.normalize(row['koaza']),
                            'value': row,
                        })
                    if row['oaza_cho'] and not row['chome'] and row['koaza']:
                        writer.add_node({
                            'key': KyotoStreetTrieFinder.normalize(row['oaza_cho'] + row['koaza']),
                            'value': row,
                        })
                    if row['oaza_cho'] and row['chome']:
                        writer.add_node({
                            'key': KyotoStreetTrieFinder.normalize(row['oaza_cho'] + row['chome']),
                            'value': row,
                        })
                    if row['oaza_cho'] and row['chome'] and row['koaza']:
                        writer.add_node({
                            'key': KyotoStreetTrieFinder.normalize(row['oaza_cho'] + row['chome'] + row['koaza']),
                            'value': row,
                        })
        writer.close()
        return True

    @staticmethod
    def load_data_file(di_container):
        cache_file_path = KyotoStreetTrieFinder.get_cache_file_path(di_container)
        data = None
        num_of_try = 0
        while not data and num_of_try < 3:
            try:
                if os.path.exists(cache_file_path):
                    with open(cache_file_path, 'rb') as f:
                        data = f.read()
                    KyotoStreetTrieFinder(bytearray(data[:100]))
                    return data
            except Exception as e:
                print(e)
            if not KyotoStreetTrieFinder.create_dictionary_file(di_container):
                return None
            num_of_try += 1
        return data

    def __init__(self, data):
        super().__init__(data)
        self.data = data
