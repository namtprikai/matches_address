
from typing import Optional
from FN015.services.constant_values import DASH, SPACE
from FN015.models.trie.char_node import CharNode

def trim_dash_and_space(target: Optional[CharNode]) -> Optional[CharNode]:
    if target is None:
        return None
    result = target.trim_with(DASH)
    if result:
        result = result.trim_with(SPACE)
    return result 