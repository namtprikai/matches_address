from typing import List, Optional
from FN015.services.constant_values import DASH, SPACE
from FN015.services.reg_exp_ex import RegExpEx
from FN015.models.trie.char_node import CharNode
from FN015.models.query_set import QuerySet
from FN015.services.is_number import is_digit
from FN015.services.trim_dash_and_space import trim_dash_and_space

class NormalizeBanchomeTransform:
    def __init__(self):
        pass

    def transform(self, queries: QuerySet):
        results = QuerySet()
        for query in queries.values():
            # Skip if there's no remaining string
            if query.tempAddress is None:
                results.add(query)
                continue
            regex = RegExpEx.create(SPACE, 'g')
            parts = query.tempAddress.split(regex)

            before = parts[0]
            after = parts[1:] if len(parts) > 1 else []

            # Normalize
            normalized = self.normalize(before)

            # Join
            temp_address_node = CharNode.join_with(CharNode(SPACE), normalized, *after)

            # Remove leading and trailing DASH or SPACE
            temp_address_node = trim_dash_and_space(temp_address_node)

            results.add(query.copy({
                'tempAddress': temp_address_node,
              }))

        return results

    def normalize(self, p: Optional[CharNode]) -> Optional[CharNode]:
        # If p is 'XX-chome XX-banchi XX-go' or 'XX-chome XX-banchi', convert it to 'XX-chome XX-XX' or 'XX-chome XX'
        if not p:
            return None

        stack: List[CharNode] = []
        current_node = p
        while current_node:
            stack.append(current_node)
            current_node = current_node.next

        head: CharNode = CharNode(char='')

        while stack:
            top = stack.pop()
            
            if top.ignore or not top.char:
                top.next = head.next
                head.next = top
                continue

            # If it's like "第1地番" or "第2地区", remove "第"
            if len(stack) >= 2 and stack[-2].char == '第' and is_digit(top):
                pointer2 = head.next
                if pointer2:
                    pointer2 = pointer2.move_to_next()

                while pointer2 and is_digit(pointer2):
                    pointer2 = pointer2.next

                if pointer2 and pointer2.char == '地' and \
                        pointer2.next and pointer2.next.move_to_next() and \
                        (pointer2.next.move_to_next().char == '割' or pointer2.next.move_to_next().char == '区'):

                    stack[-2].ignore = True

                    replaced: List[str] = []
                    if pointer2.original_char:
                        replaced.append(pointer2.original_char)
                    if pointer2.next and pointer2.next.move_to_next() and pointer2.next.move_to_next().original_char:
                        replaced.append(pointer2.next.move_to_next().original_char)

                    dash = CharNode(char=DASH, original_char=''.join(replaced))
                    if pointer2.next and pointer2.next.move_to_next():
                        dash.next = pointer2.next.move_to_next().next
                    top.next = dash
                    head.next = top
                    continue

            # If, due to other substitutions, it's "1番(DASH)", "2番地(DASH)", "3号(DASH)", "4条(DASH)",
            # "5地割(DASH)", "6地区(DASH)", convert to just DASH
            conditions = [
                (len(stack) >= 1 and is_digit(stack[-1]) and top.char == '番' and head.next and head.next.move_to_next() and head.next.move_to_next().char == DASH),
                (len(stack) >= 2 and is_digit(stack[-2]) and stack[-1].char == '番' and top.char == '地' and head.next and head.next.move_to_next() and head.next.move_to_next().char == DASH),
                (len(stack) >= 1 and is_digit(stack[-1]) and top.char == '号' and head.next and head.next.move_to_next() and head.next.move_to_next().char == DASH),
                (len(stack) >= 1 and is_digit(stack[-1]) and top.char == '条' and head.next and head.next.move_to_next() and head.next.move_to_next().char == DASH),
                (len(stack) >= 1 and is_digit(stack[-1]) and top.char == '丁' and head.next and head.next.move_to_next() and head.next.move_to_next().char == '目'),
                (len(stack) >= 1 and is_digit(stack[-1]) and top.char == '町' and head.next and head.next.move_to_next() and head.next.move_to_next().char == '目')
            ]
            if any(conditions):
                if head.next and head.next.char == DASH:
                    head.next = head.next.next
                
                stack.append(CharNode(char=DASH, original_char=''))
                continue
            
            # 1番地, 2番街, 3番地, 4番館, 5号棟, 6号室, 7号館, 8号室 など
            if len(stack) >= 1 and is_digit(stack[-1]) and RegExpEx.create('[番号]').search(top.char or ''):
                removed_chars: List[str] = []
                if head.next and head.next.char == '地':
                    if head.next.original_char:
                        removed_chars.append(head.next.original_char)
                    head.next = head.next.next
                if head.next and head.next.char == 'の' and is_digit(head.next.next):
                    if head.next.original_char:
                        removed_chars.append(head.next.original_char)
                    head.next = head.next.next
                
                if not RegExpEx.create('[室棟区館]').search(head.next.char if head.next else ''):
                    dash = CharNode(char=DASH, original_char=''.join(reversed(removed_chars)))
                    dash.next = head.next
                    head.next = dash
                    continue

                buffer: List[CharNode] = []
                while stack and is_digit(stack[-1]):
                    buffer.append(stack.pop())
                
                removed_chars.clear()
                while stack and RegExpEx.create(f'[号番{DASH}]').search(stack[-1].char or ''):
                    tmp = stack.pop()
                    if tmp and tmp.original_char:
                        removed_chars.append(tmp.original_char)
                
                stack.append(CharNode(char=SPACE, original_char=''.join(reversed(removed_chars))))
                stack.extend(reversed(buffer))
                
                continue

            if len(stack) >= 1 and is_digit(stack[-1]) and RegExpEx.create('[のノ之]').search(top.char or '') and is_digit(head.next):
                top.char = DASH
                top.original_char = DASH
                top.next = head.next
                head.next = top
                continue

            top.next = head.next
            head.next = top

        return head.next