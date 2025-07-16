
from typing import Union
from FN015.services.reg_exp_ex import RegExpEx
from FN015.models.trie.char_node import CharNode

def is_digit(char: Union[str, CharNode, None]) -> bool:
    if char is None:
        return False
    if isinstance(char, str):
        return bool(RegExpEx.create(r'^[0-9]$').match(char))
    return is_digit_for_char_node(char)

def is_digit_for_char_node(char_node: CharNode) -> bool:
    return bool(char_node and not char_node.ignore and char_node.char and RegExpEx.create(r'^[0-9]$').match(char_node.char)) 