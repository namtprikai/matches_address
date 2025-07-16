
from typing import Optional
from FN015.services.constant_values import SPACE, DASH
from FN015.services.reg_exp_ex import RegExpEx
from .is_number import is_digit
from .is_kanji_nums import is_kanji_nums
from FN015.models.trie.char_node import CharNode

def insert_space_before_room_or_facility(address: Optional[CharNode]) -> Optional[CharNode]:
    if not address:
        return None
    # Tách phần trước và sau SPACE đầu tiên
    split_result = address.split(SPACE)
    before = split_result[0]
    after = split_result[1:] if len(split_result) > 1 else []
    stack = before.split('')
    head = CharNode(char='')
    while stack:
        top = stack.pop()
        if top.ignore or not top.char:
            top.next = head.next
            head.next = top
            continue
        # DASH + (số) + (không phải số): chèn SPACE giữa số và ký tự
        if (
            len(stack) > 0 and is_digit(stack[-1]) and not is_digit(top) and not RegExpEx.create(f'[号番通条棟階{DASH}{SPACE}a-z]').search(top.char)
        ):
            found_dash = False
            for i in range(len(stack) - 2, -1, -1):
                node = stack[i]
                if is_digit(node):
                    continue
                found_dash = (node.char == DASH)
                break
            if found_dash:
                space = CharNode(char=SPACE)
                top.next = head.next
                space.next = top
                head.next = space
                continue
        # (số/kanji) + "の" + (số/kanji): "の" thành DASH
        if (
            len(stack) > 1 and (
                is_kanji_nums(stack[-2].original_char or '') or is_digit(stack[-2])
            ) and RegExpEx.create('[のノ丿之]').search(stack[-1].char or '') and (
                is_kanji_nums(top.original_char or '') or is_digit(top)
            )
        ):
            removed = stack.pop()
            dash = CharNode(char=DASH, original_char=getattr(removed, 'original_char', None))
            top.next = head.next
            dash.next = top
            head.next = dash
            continue
        # Số thường và kanji số: chèn SPACE giữa
        if is_digit(top) and not is_kanji_nums(top.original_char or '') and \
            (head.next and head.next.move_to_next() and head.next.move_to_next().char != DASH) and \
            head.next.move_to_next() and \
            is_kanji_nums(head.next.move_to_next().original_char or ''):
            space = CharNode(char=SPACE)
            space.next = head.next.move_to_next()
            top.next = space
            head.next = top
            continue
        # 12-34-56号室: thay DASH giữa số thành SPACE
        if (
            len(stack) > 0 and is_digit(stack[-1]) and (
                (top.char == '号' and head.next and head.next.char == '室') or
                RegExpEx.create('[a-z]').search(top.char)
            )
        ):
            top.next = head.next
            head.next = top
            while len(stack) > 0 and is_digit(stack[-1]):
                num = stack.pop()
                num.next = head.next
                head.next = num
            buffer = []
            while len(stack) > 0 and RegExpEx.create(f'[号番通条{DASH}{SPACE}]').search(stack[-1].char or ''):
                removed = stack.pop()
                if removed and removed.original_char:
                    buffer.append(removed.original_char)
            space = CharNode(char=SPACE, original_char=''.join(reversed(buffer)))
            space.next = head.next
            head.next = space
            continue
        top.next = head.next
        head.next = top
    # Ghép lại với phần sau SPACE
    separator = CharNode(char=SPACE)
    result = CharNode.join_with(separator, head.next, *after) if after else head.next
    return result 