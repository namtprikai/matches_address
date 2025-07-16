

from typing import Optional, Union
from FN015.models.trie.char_node import CharNode 

DASH = '-'
SPACE = ' '

kanji_num = {
    '壱': 1, '一': 1, '１': 1, '1': 1,
    '二': 2, 'ニ': 2, '弐': 2, '２': 2, '2': 2,
    '参': 3, '3': 3, '三': 3, '３': 3,
    '４': 4, '4': 4, '四': 4,
    '５': 5, '5': 5, '五': 5,
    '６': 6, '6': 6, '六': 6,
    '７': 7, '7': 7, '七': 7,
    '８': 8, '8': 8, '八': 8,
    '９': 9, '9': 9, '九': 9,
    '〇': 0, '0': 0, '０': 0, '零': 0,
    '十': 10,
}

SENTINEL = '&'
target_patterns = set([
    '軒', '通', '丁', '町', '字', '番', '部', '所', '社', '線', '号', '条', '里',
    SENTINEL, DASH, SPACE, 'の', '之', 'ノ', '丿',
])

def kan2num_for_char_node(target: Optional[CharNode]) -> Optional[CharNode]:
    result = []
    buffer = []
    current_number = 0
    last_was_ten = False
    head = target
    head_next = None
    while head and (getattr(head, 'ignore', False) or getattr(head, 'char', None)):
        if getattr(head, 'ignore', False) or not getattr(head, 'char', None):
            if buffer:
                tmp = list(str(current_number))
                for node in buffer:
                    if not tmp:
                        break
                    node.char = tmp.pop(0)
                    result.append(node)
                while tmp:
                    result.append(CharNode(original_char='', char=tmp.pop(0)))
                buffer.clear()
                current_number = 0
                last_was_ten = False
            head_next = head.next
            head.next = None
            result.append(head)
            head = head_next
            continue
        char = head.char
        num = kanji_num.get(char)
        if num is None:
            if char not in target_patterns:
                result.extend(buffer)
            elif current_number > 0:
                tmp = list(str(current_number))
                for node in buffer:
                    if not tmp:
                        break
                    node.char = tmp.pop(0)
                    result.append(node)
                while tmp:
                    result.append(CharNode(original_char='', char=tmp.pop(0)))
            buffer.clear()
            current_number = 0
            last_was_ten = False
            head_next = head.next
            head.next = None
            result.append(head)
            head = head_next
            continue
        if num >= 10:
            if current_number == 0:
                current_number = num
            else:
                current_number *= num
            last_was_ten = (num == 10)
        else:
            if last_was_ten:
                current_number += num
                last_was_ten = False
            else:
                current_number = current_number * 10 + num
        head_next = head.next
        head.next = None
        buffer.append(head)
        head = head_next
    if current_number > 0:
        tmp = list(str(current_number))
        if len(tmp) > len(buffer):
            for node in buffer:
                node.char = tmp.pop(0)
                result.append(node)
            while tmp:
                result.append(CharNode(original_char='', char=tmp.pop(0)))
        else:
            while buffer:
                node = buffer.pop(0)
                if tmp:
                    node.char = tmp.pop(0)
                else:
                    node.char = ''
                result.append(node)
    result_node = CharNode(char='')
    tail = result_node
    for node in result:
        tail.next = node
        tail = tail.next
        node.next = None
    return result_node.next

def kan2num(target: Union[str, CharNode, None]):
    if target is None:
        return None
    if isinstance(target, CharNode):
        return kan2num_for_char_node(target)
    if isinstance(target, str):
        result = []
        stack = []
        target2 = target + SENTINEL
        N = len(target2)
        for i in range(N):
            char = target2[i]
            if char in kanji_num:
                stack.append(char)
                continue
            if char not in target_patterns:
                result.extend(stack)
                result.append(char)
                stack.clear()
                continue
            current = 0
            temp_result = []
            while stack:
                val = kanji_num[stack.pop()]
                if val == 0:
                    temp_result.append(str(current))
                    if current != 0:
                        temp_result.append('0')
                    current = 0
                    continue
                elif val == 10:
                    if not stack:
                        current += val
                        continue
                    bias10 = kanji_num[stack.pop()]
                    current = bias10 * val + current
                    temp_result.append(str(current))
                    current = 0
                    continue
                else:
                    if current > 0:
                        temp_result.append(str(current))
                    current = 0
                current += val
            if current > 0:
                temp_result.append(str(current))
            result.extend(reversed(temp_result))
            if char not in kanji_num:
                result.append(char)
        if result:
            result.pop()
        return ''.join(result)
    raise TypeError('unsupported value type') 