# -*- coding: utf-8 -*-

DASH_SYMBOLS = (
    '－'
    '\\-'
    '−'
    '‐'
    '‒'
    '–'
    '—'
    '─'
    '━'
    '―'
    'ー'
    'ｰ'
    '⏤'
    '⎯'
    '﹘'
    '‑'
    '⁃'
    '﹣'
)
NUMRIC_SYMBOLS = '0-9０-９'
ZENKAKU = r'[^\x01-\x7E\xA1-\xDF]'
KANJI_NUMS = '壱一二ニ弐参三四五六七八ㇵハ九零十'
NUMRIC_AND_KANJI_SYMBOLS = '0-9０-９一二三四五六七八九〇十百千'
ALPHA_NUMERIC_SYMBOLS = '０-９Ａ-Ｚａ-ｚ'
J_DASH = 'の|之|ノ|丿'
SPACE = '␣'
DASH = '@'
BEGIN_SPECIAL = '<'
END_SPECIAL = '>'
BANGAICHI = f'{BEGIN_SPECIAL}BG{END_SPECIAL}'
MUBANCHI = f'{BEGIN_SPECIAL}MB{END_SPECIAL}'
OAZA_BANCHO = f'{BEGIN_SPECIAL}OB{END_SPECIAL}'
OAZA_CENTER = f'{BEGIN_SPECIAL}OC{END_SPECIAL}'
VIRTUAL_SPACE = '~'
SPACE_CHARS = ' 　'
SPACE_SYMBOLS = SPACE + VIRTUAL_SPACE
DEFAULT_FUZZY_CHAR = '?'
STDIN_FILEPATH = '<stdin>'
BREAK_AT_EOF = '\n'
SINGLE_QUOTATION = "'"
DOUBLE_QUOTATION = '"'
BLANK_CHAR = None
MAX_CONCURRENT_DOWNLOAD = 100
AMBIGUOUS_RSDT_ADDR_FLG = -1
CLI_SERVER_PORT = 8143
