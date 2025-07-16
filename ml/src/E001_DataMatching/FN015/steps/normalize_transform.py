import re
from FN015.services.constant_values import (
    BANGAICHI, DASH, DASH_SYMBOLS, DEFAULT_FUZZY_CHAR, DOUBLE_QUOTATION, J_DASH, MUBANCHI, NUMRIC_AND_KANJI_SYMBOLS,
    OAZA_BANCHO, OAZA_CENTER, SINGLE_QUOTATION, SPACE, SPACE_CHARS, SPACE_SYMBOLS
)
from FN015.services.reg_exp_ex import RegExpEx
from FN015.models.trie.char_node import CharNode
from FN015.models.query import Query
from FN015.models.query_set import QuerySet
from FN015.services.insert_space_before_room_or_facility import insert_space_before_room_or_facility
from FN015.services.is_number import is_digit
from FN015.services.jis_kanji import jis_kanji
from FN015.services.kan2num import kan2num
from FN015.services.to_hankaku_alpha_num import to_hankaku_alpha_num
from FN015.services.to_hiragana import to_hiragana
from FN015.services.trim_dash_and_space import trim_dash_and_space


class NormalizeTransform:
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

    def transform(self, input) -> QuerySet:
        # 重複する空白をまとめる
        input.data.address = NormalizeTransform.replace_text_all(input.data.address, RegExpEx.create(' +', 'g'), ' ')
        # カッコを半角にする
        input.data.address = input.data.address.replace('（', '(').replace('）', ')')
        query = Query.create(input)
        address = query.tempAddress
        if getattr(input.data, 'fuzzy', ''):
            address = address.replace_all(input.data.fuzzy, DEFAULT_FUZZY_CHAR)
        address = address.replace_all(
            RegExpEx.create(
                f"[^{DEFAULT_FUZZY_CHAR}\u0020-\u007E\u2000-\u206F\u2212\u2500-\u257F\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]+",
                'g'),
            DEFAULT_FUZZY_CHAR
        )
        address = address.replace_all(SINGLE_QUOTATION, '')
        address = address.replace_all(DOUBLE_QUOTATION, '')
        address = address.replace_all(RegExpEx.create(f"[{SPACE_CHARS}]+", 'g'), SPACE)
        address = to_hankaku_alpha_num(address)
        address = address.replace(RegExpEx.create(f"センタ[{DASH_SYMBOLS}]"), OAZA_CENTER)
        address = address.replace_all(
            RegExpEx.create(
                f"([{NUMRIC_AND_KANJI_SYMBOLS}][{DASH_SYMBOLS}])|([{DASH_SYMBOLS}][{NUMRIC_AND_KANJI_SYMBOLS}])", 'g'),
            lambda match: RegExpEx.create(f"[{DASH_SYMBOLS}]", 'g').sub(DASH, match)
        )

        address = address.replace_all(
            RegExpEx.create(
                f"([{NUMRIC_AND_KANJI_SYMBOLS}][{DASH_SYMBOLS}])|([{DASH_SYMBOLS}][{NUMRIC_AND_KANJI_SYMBOLS}])", 'g'),
            lambda match: RegExpEx.create(f"[{DASH_SYMBOLS}]", 'g').sub(DASH, match)
        )

        address = address.replace_all(RegExpEx.create('([0-9])一([0-9])', 'g'), f'$1{DASH}$2')
        address = address.replace(
            RegExpEx.create(f"(.+)(丁目?|番(町|地|丁)|条|軒|({J_DASH})町|地割)"),
            lambda match: RegExpEx.create(f"[{SPACE_SYMBOLS}]", 'g').sub('', match)
        )
        address = to_hiragana(address)
        address = jis_kanji(address)
        address = address.replace('八丈島', '').replace('三宅島', '')
        address = kan2num(address)
        address = address.replace_all(RegExpEx.create('([0-9])番町', 'g'), f'$1{DASH}')
        address = address.replace_all(RegExpEx.create('番町', 'g'), OAZA_BANCHO)
        address = ignore_parenthesis(address)
        address = insert_space_before_room_or_facility(address)
        address = address.replace_all(RegExpEx.create('大?字', 'g'), '')
        address = address.replace(RegExpEx.create('無番地'), MUBANCHI)
        address = address.replace(RegExpEx.create('番外地'), BANGAICHI)
        address = replace_banchome(address)
        address = trim_dash_and_space(address)
        results = QuerySet()
        results.add(query.copy({'tempAddress': address}))
        return results


def replace_banchome(address: CharNode | None) -> CharNode | None:
    """
    Replaces "banchome" related Japanese address terms (like 番地, 丁目, 条)
    with a DASH (-) or SPACE based on specific patterns.
    This function processes a linked list of CharNode objects using a stack
    to manage the address transformation.

    Args:
        address: The head of the CharNode linked list representing the address.

    Returns:
        The head of the transformed CharNode linked list.
    """
    pointer: CharNode | None = address
    stack: list[CharNode] = []  # Python list acts as a stack (append for push, pop for pop)

    while pointer:
        # Handle ignored nodes: These nodes are detached from the original list
        # and pushed directly onto the stack, then the pointer moves to the next.
        if pointer.ignore:
            p_next = pointer.next
            pointer.next = None  # Detach the current node from its original 'next'
            stack.append(pointer)
            pointer = p_next
            continue

        skip_push = False  # Flag to control whether the current 'pointer' node is pushed to the stack

        # Create a temporary string by concatenating the stack content and the current character.
        # This 'tmp_str' is used for regex pattern matching.
        tmp_str = char_node_to_string(stack) + pointer.char
        next_pointer = pointer.next  # Get the next node for look-ahead checks

        # --- Pattern Matching and Transformation Logic (Mimicking TypeScript's switch-case) ---

        # Case 1: Numeric + "banchi" variations + Numeric (e.g., "1番地999", "5丁目999", "24軒2条3丁目")
        # This is a complex pattern matching a number followed by specific Japanese address units
        # and then another number.
        if is_digit(pointer):
            if (RegExpEx.create(r'([0-9]+)番[丁地街][の目]?([0-9]+)$').search(tmp_str) or
                    RegExpEx.create(r'([0-9]+)丁目?([0-9]+)$').search(tmp_str) or
                    RegExpEx.create(r'([0-9]+)番[丁地街]?([0-9]+)$').search(tmp_str) or
                    RegExpEx.create(r'([0-9]+)[軒条通線]([0-9]+)$').search(tmp_str) or
                    RegExpEx.create(r'([0-9]+)の?通りの?([0-9]+)$').search(tmp_str) or
                    RegExpEx.create(r'([0-9]+)の町([0-9]+)$').search(tmp_str)):

                # If a match is found, pop elements from the stack until a digit is found.
                # Collect their original characters to reconstruct for the new DASH node.
                buffer_original_chars = []
                while stack and not is_digit(stack[-1]):
                    removed = stack.pop()
                    if removed and removed.original_char:
                        buffer_original_chars.append(removed.original_char)

                # Push a new CharNode with a DASH character and the collected original characters.
                stack.append(CharNode(char=DASH, original_char="".join(reversed(buffer_original_chars))))

        # Case 2: (Numeric) + [条通線] + [東西南北] (e.g., "16条東")
        # This handles patterns like "16条東" where "条" needs to be replaced by a DASH.
        elif RegExpEx.create(r'[0-9][条通線][東西南北]$').search(tmp_str):
            removed = stack.pop()  # Pop the last character (e.g., '条')
            # Push a DASH CharNode, preserving the original character of the popped node.
            stack.append(CharNode(char=DASH, original_char=removed.original_char if removed else ''))

        # Case 3: (Numeric) + [東西南北] + (Numeric) (e.g., "北16西2" -> "北16-西2" for Hokkaido addresses)
        # Inserts a DASH between a direction/number combination and a subsequent number.
        elif RegExpEx.create(r'[0-9][東西南北]$').search(tmp_str) and next_pointer and is_digit(next_pointer):
            # Insert a DASH CharNode. The 'original_char' '番地' is arbitrary, mimicking TS.
            stack.append(CharNode(char=DASH, original_char='番地'))

        # Case 4: "番地の" + (Numeric) (e.g., "番地の1")
        # Removes "番地の" and inserts a DASH.
        elif RegExpEx.create(r'番地[の目]$').search(tmp_str) and next_pointer and is_digit(next_pointer):
            stack.pop()  # Pop 'の' or '目'
            stack.pop()  # Pop '地'
            stack.append(CharNode(char=DASH, original_char='番地'))
            skip_push = True  # Skip pushing the current 'pointer' (which was 'の' or '目')

        # Case 5: "番地" + (Numeric) (e.g., "番地1")
        # Removes "番地" and inserts a DASH.
        elif tmp_str.endswith('番地') and next_pointer and is_digit(next_pointer):
            stack.pop()  # Pop '地'
            stack.append(CharNode(char=DASH, original_char='番地'))
            skip_push = True  # Skip pushing the current 'pointer' (which was '地')

        # Case 6: (Numeric) + "番" + (Numeric) (e.g., "1番2")
        # Inserts a DASH between a number, "番", and another number.
        elif stack and is_digit(stack[-1]) and tmp_str.endswith('番') and next_pointer and is_digit(next_pointer):
            # Insert a DASH CharNode, using the current 'pointer.char' ('番') as original_char.
            stack.append(CharNode(char=DASH, original_char=pointer.char))
            skip_push = True  # Skip pushing the current 'pointer' (which was '番')

        # Case 7: "番地" + (Non-numeric and not 'の'/'目') (e.g., "番地アパート")
        # Removes "番地" and inserts a SPACE.
        elif tmp_str.endswith('番地') and next_pointer and not is_digit(next_pointer) and not RegExpEx.create(
                r'[の目]').search(next_pointer.char or ''):
            stack.pop()  # Pop '地'
            stack.append(CharNode(char=SPACE, original_char='番地'))  # Insert a SPACE CharNode
            skip_push = True  # Skip pushing the current 'pointer' (which was '地')

        # Case 8: (Numeric) + "の" + (Numeric) (e.g., "1の2")
        # Removes "の" and inserts a DASH.
        elif RegExpEx.create(r'[0-9]の[0-9]$').search(tmp_str):
            stack.pop()  # Pop 'の'
            stack.append(CharNode.create(DASH))  # Push a new DASH CharNode

        # --- End of Pattern Matching ---

        # Move to the next node in the original linked list.
        # Detach the current node from its original 'next' before potentially pushing it.
        p_next = pointer.next
        pointer.next = None
        if not skip_push:
            stack.append(pointer)  # Push the current node if not skipped
        pointer = p_next

    # --- Post-loop Processing ---
    # This logic handles cases where patterns like "番号線" (e.g., "1号", "2番", "3線")
    # appear at the end of the string, but are not followed by specific building identifiers.
    final_str_from_stack = char_node_to_string(stack)
    if RegExpEx.create(r'([0-9]+)[番号線][丁地街町]?(?![室棟館])$').search(final_str_from_stack):
        # If such a pattern is found, pop elements from the stack until a digit is encountered.
        while stack and not is_digit(stack[-1]):
            stack.pop()

    # --- Reconstruct the CharNode linked list from the processed stack ---
    head: CharNode = CharNode(char='')  # Create a dummy head node
    tail: CharNode = head
    for node in stack:
        tail.next = node
        tail = tail.next

    return head.next  # Return the actual head of the new linked list (skipping the dummy)


def ignore_parenthesis(address: CharNode) -> CharNode:
    """
    Sets the 'ignore' flag on CharNodes within parentheses/brackets.
    Returns the original address head, with nodes potentially marked as ignored.
    """
    pointer: CharNode | None = address
    parenthesis_map: dict[str, str] = {
        '(': ')', '（': '）', '「': '」', '[': ']', '『': '』',
    }

    # Stack to keep track of opening delimiters
    buffer_stack: list[str] = []

    current = address
    while current:
        if current.ignore:
            current = current.next
            continue

        # Normalize full-width parentheses
        if current.char == '（':
            current.char = '('
        elif current.char == '）':
            current.char = ')'

        # Check for opening parenthesis
        if current.char in parenthesis_map:
            buffer_stack.append(parenthesis_map[current.char])  # Push expected closing onto stack
            current.ignore = True
        # Check for closing parenthesis that matches top of stack
        elif buffer_stack and current.char == buffer_stack[-1]:
            current.ignore = True
            buffer_stack.pop()  # Pop matched closing
        # If stack is not empty, current char is inside a parenthesis block
        else:
            current.ignore = bool(buffer_stack)

        current = current.next
    return address


def char_node_to_string(stack: list[CharNode]) -> str:
    """Converts a list/stack of CharNode to a string."""
    buffer = []
    for node in stack:
        if node:  # Ensure node is not None
            buffer.append(node.char)
    return "".join(buffer)
