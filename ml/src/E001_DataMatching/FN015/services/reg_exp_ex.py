# -*- coding: utf-8 -*-

import re
from functools import lru_cache

class RegExpEx:
    @staticmethod
    @lru_cache(maxsize=300)
    def create(pattern: str, flags: str = '') -> 're.Pattern':
        re_flags = 0
        if 'g' in flags:
            pass
        if 'i' in flags:
            re_flags |= re.IGNORECASE
        # Add more flags as needed (e.g., multiline 'm')
        return re.compile(pattern, re_flags)