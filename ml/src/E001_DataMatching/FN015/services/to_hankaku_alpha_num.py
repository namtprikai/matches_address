
from typing import Union, Optional
from FN015.models.trie.char_node import CharNode # type: ignore

zenkaku_hankaku_map = {
    '\uff21': 'A', '\uff22': 'B', '\uff23': 'C', '\uff24': 'D', '\uff25': 'E', '\uff26': 'F', '\uff27': 'G', '\uff28': 'H', '\uff29': 'I', '\uff2a': 'J', '\uff2b': 'K', '\uff2c': 'L', '\uff2d': 'M', '\uff2e': 'N', '\uff2f': 'O', '\uff30': 'P', '\uff31': 'Q', '\uff32': 'R', '\uff33': 'S', '\uff34': 'T', '\uff35': 'U', '\uff36': 'V', '\uff37': 'W', '\uff38': 'X', '\uff39': 'Y', '\uff3a': 'Z',
    '\uff41': 'a', '\uff42': 'b', '\uff43': 'c', '\uff44': 'd', '\uff45': 'e', '\uff46': 'f', '\uff47': 'g', '\uff48': 'h', '\uff49': 'i', '\uff4a': 'j', '\uff4b': 'k', '\uff4c': 'l', '\uff4d': 'm', '\uff4e': 'n', '\uff4f': 'o', '\uff50': 'p', '\uff51': 'q', '\uff52': 'r', '\uff53': 's', '\uff54': 't', '\uff55': 'u', '\uff56': 'v', '\uff57': 'w', '\uff58': 'x', '\uff59': 'y', '\uff5a': 'z',
    '\uff10': '0', '\uff11': '1', '\uff12': '2', '\uff13': '3', '\uff14': '4', '\uff15': '5', '\uff16': '6', '\uff17': '7', '\uff18': '8', '\uff19': '9',
}

def to_hankaku_alpha_num(target: Union[str, CharNode, None]) -> Union[str, CharNode, None]:
    if target is None:
        return None
    if isinstance(target, str):
        return ''.join([zenkaku_hankaku_map.get(c, c) for c in target])
    if isinstance(target, CharNode):
        return to_hankaku_alpha_num_for_char_node(target)
    raise TypeError('unsupported value type')

def to_hankaku_alpha_num_for_char_node(root: Optional[CharNode]) -> Optional[CharNode]:
    head = root
    while head:
        if head.char:
            head.char = zenkaku_hankaku_map.get(head.char, head.char)
        head = head.next
    return root 