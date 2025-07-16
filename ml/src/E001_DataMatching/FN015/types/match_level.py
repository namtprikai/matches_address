from enum import Enum
from collections import namedtuple

MatchInfo = namedtuple('MatchInfo', ['num', 'str'])
class MatchLevel(Enum):
    ERROR = MatchInfo(-1, 'error')
    UNKNOWN = MatchInfo(0, 'unknown')
    PREFECTURE = MatchInfo(1, 'prefecture')
    CITY = MatchInfo(2, 'city')
    MACHIAZA = MatchInfo(3, 'machiaza')
    MACHIAZA_DETAIL = MatchInfo(4, 'machiaza_detail')
    RESIDENTIAL_BLOCK = MatchInfo(5, 'residential_block')
    RESIDENTIAL_DETAIL = MatchInfo(6, 'residential_detail')
    PARCEL = MatchInfo(7, 'parcel')