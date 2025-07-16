import os
import re

from FN015.services.constant_values import DASH_SYMBOLS, OAZA_CENTER, MUBANCHI, DASH, BANGAICHI, OAZA_BANCHO, SPACE
from FN015.services.reg_exp_ex import RegExpEx
from FN015.services.jis_kanji import jis_kanji
from FN015.services.kan2num import kan2num
from FN015.models.trie.trie_finder2 import TrieAddressFinder2, CharNode
from FN015.models.trie.file_trie_writer import FileTrieWriter
from FN015.services.to_hankaku_alpha_num import to_hankaku_alpha_num
from FN015.services.to_hiragana import to_hiragana
from FN015.services.utils_db import get_oazaChomes_generator_hash, get_oaza_chomes


class OazaChoTrieFinder(TrieAddressFinder2):
    @staticmethod
    def normalize(address: str | CharNode):
        # 全角英数字は、半角英数字に変換
        address = to_hankaku_alpha_num(address)
        # 片仮名は平仮名に変換する
        address = to_hiragana(address)
        # JIS 第2水準 => 第1水準 及び 旧字体 => 新字体
        address = jis_kanji(address)
        # 漢数字を半角数字に変換する
        address = kan2num(address)

        #「センター」を「OAZA_CENTER」に置き換える
        address = OazaChoTrieFinder.replace_text(address, RegExpEx.create(f"せんた{DASH_SYMBOLS}"), OAZA_CENTER)

        # 「無番地」を「MUBANCHI」にする
        address = OazaChoTrieFinder.replace_text(address, RegExpEx.create('無番地'), MUBANCHI)

        # 「番外地」を「BANGAICHI」にする
        address = OazaChoTrieFinder.replace_text(address, RegExpEx.create('番外地'), BANGAICHI)

        # 大字が「番町」の場合があるので、置換する
        address = OazaChoTrieFinder.replace_text(address, RegExpEx.create('([0-9])番町'), rf'$1{DASH}')
        address = OazaChoTrieFinder.replace_text(address, RegExpEx.create('番町'), OAZA_BANCHO)

        # 「番地」「番丁」「番街」「番」「番地の」をDASHにする
        address = OazaChoTrieFinder.replace_text(address, RegExpEx.create('番[丁地街]'), DASH)
        address = OazaChoTrieFinder.replace_text(address, RegExpEx.create('番[の目]'), DASH)

        # 「大字」「字」がある場合は削除する
        address = OazaChoTrieFinder.replace_text_all(address, RegExpEx.create('大?字'), '')

        # 「丁目」をDASH に変換する
        # 大阪府堺市は「丁目」の「目」が付かないので「目?」としている
        address = OazaChoTrieFinder.replace_text_all(address, RegExpEx.create('([0-9])丁目?'), rf'$1{DASH}')

        # 京都の「四条通」の「通」が省略されることがある
        # 北海道では「春光四条二丁目1-1」を「春光4-2-1-1」と表記する例がある
        # 「条」「条通」「条通り」を DASH にする
        address = OazaChoTrieFinder.replace_text(address, RegExpEx.create(r'([0-9]+)(?:条|条通|条通り)'), rf'$1{DASH}')

        # 第1地割 → 1地割 と書くこともあるので、「1(DASH)」にする
        # 第1地区、1丁目、1号、1部、1番地、第1なども同様。
        # トライ木でマッチすれば良いだけなので、正確である必要性はない
        address = OazaChoTrieFinder.replace_text_all(
                address,
                RegExpEx.create(rf'第?([0-9]+)(?:地[割区]|番[地丁]?|軒|号|線|部|条通?|字|{DASH})(?![室棟区館階])'),
                rf'$1{DASH}')

        # 北海道に「太田五の通り」という大字がある。DASHにする
        address = OazaChoTrieFinder.replace_text_all(address, RegExpEx.create('の通り?'), DASH)
        address = OazaChoTrieFinder.replace_text_all(address, RegExpEx.create('通り'), DASH)

        # input =「丸の内一の八」のように「ハイフン」を「の」で表現する場合があるので
        # 「の」は全部DASHに変換する
        address = OazaChoTrieFinder.replace_text_all(address, RegExpEx.create(r'([0-9])の([0-9])'), rf'$1{DASH}$2')
        address = OazaChoTrieFinder.replace_text_all(address, RegExpEx.create('之'), DASH)

        address = OazaChoTrieFinder.replace_text_all(address, RegExpEx.create(f"{DASH}+$", flags='g'), '')

        address = OazaChoTrieFinder.replace_text_all(address, RegExpEx.create(f"^[{SPACE}{DASH}]", flags='g'), '')
        address = OazaChoTrieFinder.replace_text_all(address, RegExpEx.create(f"[{SPACE}{DASH}]$", flags='g'), '')

        return address

    @staticmethod
    def replace_text(address: str | CharNode, pattern, text_replace):
        if address:
            if isinstance(address, CharNode):
                address = address.replace(pattern, text_replace) or address
            elif isinstance(address, str):
                if '$' in text_replace:
                    text_replace = re.sub(r'\$(\d+)', r'\\\1', text_replace)
                address = re.sub(pattern, text_replace, address)
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
    def get_cache_file_path(params, data):
        os.makedirs(params['cache_dir'], exist_ok=True)
        return os.path.join(params['cache_dir'], f"oaza-cho_{get_oazaChomes_generator_hash()}_{data['lg_code']}.abrg2")

    @staticmethod
    def create_dictionary_file(params, data):
        cache_file_path = OazaChoTrieFinder.get_cache_file_path(params, data)
        for f in os.listdir(params['cache_dir']):
            if re.match(rf"oaza-cho_[^_]+_{data['lg_code']}\.abrg2", f):
                os.remove(os.path.join(params['cache_dir'], f))

        rows = get_oaza_chomes(data['lg_code'], data['lg_code_parcel'])
        if (len(rows) > 0):
            writer = FileTrieWriter.create(cache_file_path)

            for row in rows:
                row['oaza_cho'] = to_hankaku_alpha_num(row['oaza_cho'])
                row['chome'] = to_hankaku_alpha_num(row['chome'])
                row['koaza'] = to_hankaku_alpha_num(row['koaza'])
                writer.add_node({
                    'key': OazaChoTrieFinder.normalize((row.get('oaza_cho','') + row.get('chome','') + row.get('koaza',''))),
                    'value': row,
                })
                oaza_cho = row['oaza_cho']
                if oaza_cho and len(oaza_cho) > 2:
                    if oaza_cho.endswith('番町'):
                        oaza_cho = oaza_cho.replace('番町', '')
                    if oaza_cho.endswith('町'):
                        oaza_cho = oaza_cho.replace('町', '')
                    writer.add_node({
                        'key': OazaChoTrieFinder.normalize((oaza_cho + row.get('chome','') + row.get('koaza',''))),
                        'value': row,
                    })
                chome = row['chome']
                if chome and len(chome) > 2:
                    if chome.endswith('番町'):
                        chome = chome.replace('番町', '')
                    if chome.endswith('町'):
                        chome = chome.replace('町', '')
                    writer.add_node({
                        'key': OazaChoTrieFinder.normalize((row.get('oaza_cho','') + chome + row.get('koaza',''))),
                        'value': row,
                    })
            writer.close()
        return True

    @staticmethod
    def load_data_file(params, data_oaza):
        cache_file_path = OazaChoTrieFinder.get_cache_file_path(params, data_oaza)
        data = None
        num_of_try = 0
        while not data and num_of_try < 3:
            try:
                if os.path.exists(cache_file_path):
                    with open(cache_file_path, 'rb') as f:
                        data = f.read()
                    OazaChoTrieFinder(bytearray(data[:100]))
                    return data
            except Exception as e:
                print(e)
            if not OazaChoTrieFinder.create_dictionary_file(params, data_oaza):
                return None
            num_of_try += 1
        return data

    def __init__(self, data):
        super().__init__(data)
        self.data = data
