from enum import Enum

class PrefLgCode(str, Enum):
    ALL = '000000'
    HOKKAIDO = '010006'
    AOMORI = '020001'
    IWATE = '030007'
    MIYAGI = '040002'
    AKITA = '050008'
    YAMAGATA = '060003'
    FUKUSHIMA = '070009'
    IBARAKI = '080004'
    TOCHIGI = '090000'
    GUMMA = '100005'
    SAITAMA = '110001'
    CHIBA = '120006'
    TOKYO = '130001'
    KANAGAWA = '140007'
    YAMANASHI = '190004'
    NAGANO = '200000'
    NIIGATA = '150002'
    TOYAMA = '160008'
    ISHIKAWA = '170003'
    FUKUI = '180009'
    SHIZUOKA = '220001'
    AICHI = '230006'
    GIFU = '210005'
    MIE = '240001'
    SHIGA = '250007'
    KYOTO = '260002'
    OSAKA = '270008'
    HYOGO = '280003'
    NARA = '290009'
    WAKAYAMA = '300004'
    OKAYAMA = '330001'
    HIROSHIMA = '340006'
    TOTTORI = '320005'
    SHIMANE = '310000'
    YAMAGUCHI = '350001'
    TOKUSHIMA = '360007'
    KAGAWA = '370002'
    EHIME = '380008'
    KOCHI = '390003'
    FUKUOKA = '400009'
    SAGA = '410004'
    NAGASAKI = '420000'
    OITA = '440001'
    KUMAMOTO = '430005'
    MIYAZAKI = '450006'
    KAGOSHIMA = '460001'
    OKINAWA = '470007'

def is_pref_lg_code(target: str) -> bool:
    return target in PrefLgCode._value2member_map_

def to_pref_lg_code(lg_code: str) -> PrefLgCode | None:
    if is_pref_lg_code(lg_code):
        return PrefLgCode(lg_code)
    if len(lg_code) != 6 or not lg_code.isdigit():
        return None
    prefix = lg_code[:2]
    for code in PrefLgCode:
        if code.value.startswith(prefix):
            return code
    return None