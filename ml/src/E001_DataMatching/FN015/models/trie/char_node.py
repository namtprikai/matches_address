import inspect
import re
import json
from typing import Optional, Callable, List, Union

from FN015.services.constant_values import SPACE


class CharNode:
    def __init__(self, original_char: Optional[str] = None, char: Optional[str] = None, ignore: bool = False):
        self.next: Optional['CharNode'] = None
        self.original_char: Optional[str] = original_char if original_char is not None else char
        self.char: Optional[str] = char
        self.ignore: bool = ignore

    def at(self, position: int) -> Optional['CharNode']:
        position = max(position, 0)
        head = self.clone()
        i = 0
        while head and i < position:
            i += 1
            head = head.next.move_to_next() if head.next else None
        return head

    def includes(self, search: Union[str, re.Pattern]) -> bool:
        if isinstance(search, str):
            search = re.compile(search)
        return self.match(search) is not None

    def concat(self, *another: Optional['CharNode']) -> Optional['CharNode']:
        if not another:
            return self.clone()
        head = self.clone()
        tail = head
        for other in another:
            if not other:
                continue
            while tail and tail.next and tail.next.next:
                tail = tail.next.next
            if tail and tail.next:
                tail = tail.next
            if tail:
                tail.next = other
                tail = tail.next
        return head

    def head_of(self, search: str) -> Optional['CharNode']:
        if search == '':
            return self
        def to_string(char_node_list: List[Optional['CharNode']]):
            buffer = []
            for char_node in char_node_list:
                if not char_node:
                    break
                buffer.append(char_node.char)
            return ''.join(buffer)
        search_len = len(search)
        buffer = [None] * search_len
        i = 0
        head = self
        while head and i < search_len:
            buffer[i] = head
            i += 1
            head = head.next.move_to_next() if head.next else None
        if i < search_len:
            return None
        while head:
            if to_string(buffer) == search:
                return buffer[0]
            head = head.next.move_to_next() if head.next else None
            buffer = buffer[1:] + [head]
        return None

    def replace_all(
            self,
            search: Union[str, re.Pattern],
            replace_value: Union[str, Callable[..., str]]
    ) -> Optional['CharNode']:
        root = self.clone()

        if isinstance(search, str):
            if search != '?':
                search = re.compile(search)
            else:
                search = re.compile(r'\?')

        matches = list(search.finditer(self.to_processed_string()))
        if not matches:
            return root

        def replacer(match: re.Match) -> str:
            if callable(replace_value):
                sig = inspect.signature(replace_value)
                param_count = len(sig.parameters)

                args = [match.group(0)] + list(match.groups())

                return replace_value(*args[:param_count])
            else:
                return replace_value

        # Reverse order so indices don't shift after replacement
        for match in reversed(matches):
            rep_value = replacer(match)
            if isinstance(rep_value, str):
                for i in range(1, len(match.groups()) + 1):
                    rep_value = rep_value.replace(f"${i}", match.group(i) or '')

            root = root.splice(match.start(), match.end() - match.start(), rep_value)
        return root

    def replace(self,
                search: Union[str, re.Pattern],
                replace_value: Union[str, Callable[..., str]]) -> Optional['CharNode']:

        root = self.clone()

        # Check how many arguments the callable expects
        def is_simple_callable(fn):
            return callable(fn) and len(inspect.signature(fn).parameters) <= 1

        def replacer(match: re.Match) -> str:
            substring = match.group(0)
            groups = match.groups()
            offset = match.start()
            string = match.string
            named_groups = match.groupdict()

            # Determine replacement value
            if isinstance(replace_value, str):
                rep_value = replace_value
            elif is_simple_callable(replace_value):
                rep_value = replace_value(substring)
            else:
                rep_value = replace_value(substring, *groups, offset, string, named_groups)

            # Replace named groups
            for key, value in named_groups.items():
                rep_value = rep_value.replace(key, value)

            # Replace positional groups like $1, $2...
            for i, group in enumerate(groups):
                group_str = group if group is not None else ''
                rep_value = rep_value.replace(f"${i + 1}", group_str)

            # Apply to root
            nonlocal root
            root = root.splice(offset, len(substring), rep_value)

            return rep_value

        # Compile pattern if needed
        pattern = re.compile(re.escape(search)) if isinstance(search, str) else search

        re.sub(pattern, replacer, self.to_processed_string())
        return root

    def to_original_string(self) -> str:
        from FN015.services.to_hankaku_alpha_num import to_hankaku_alpha_num  # type: ignore

        buffer = []
        head = self
        while head:
            if head.original_char:
                buffer.append(head.original_char)
            head = head.next
        return to_hankaku_alpha_num(''.join(buffer))

    def to_processed_string(self) -> str:
        buffer = []
        head = self
        while head:
            if not head.ignore and head.char:
                buffer.append(head.char)
            head = head.next
        return ''.join(buffer)

    def to_string(self) -> str:
        return json.dumps(self.to_json(), ensure_ascii=False)

    def to_json(self):
        buffer = []
        head = self
        while head:
            if head.char:
                buffer.append({
                    'org': head.original_char,
                    'char': head.char,
                    'ignore': head.ignore,
                })
            head = head.next
        return buffer

    def clone(self) -> Optional['CharNode']:
        root = CharNode(char='')
        tail = root
        node = self
        while node:
            tail.next = CharNode(
                original_char=node.original_char,
                char=node.char,
                ignore=node.ignore
            )
            tail = tail.next
            tail.next = None
            node = node.next
        return root.next

    def trim_with(self, target: Optional[str] = None) -> Optional['CharNode']:
        target = (target or SPACE)[0]
        found_body = False
        head = None
        stack = self.split('')
        while stack:
            top = stack.pop()
            if not found_body:
                if top.char == target:
                    continue
                if top.ignore:
                    top.next = head
                    head = top
                    continue
            found_body = True
            if top.char == target and head and head.char == target:
                continue
            top.next = head
            head = top
        head_anchor = CharNode(char='')
        head_anchor.next = head
        prefix_tail = None
        while head and head.ignore:
            prefix_tail = head
            head = head.next
        while head and head.char == target:
            head = head.next
        if prefix_tail:
            prefix_tail.next = head
        else:
            head_anchor.next = head
        return head_anchor.next

    def substring(self, index_start: int, index_end: Optional[int] = None) -> Optional['CharNode']:
        index_start = max(index_start, 0)
        i = 0
        current = self

        while i < index_start and current:
            current = current.next.move_to_next() if current.next else None
            i += 1

        if not current:
            return None

        result_head = current.clone()
        tail = result_head
        i += 1
        current = current.next.move_to_next() if current.next else None

        while current and (index_end is None or i < index_end):
            cloned = current.clone()
            tail.next = cloned
            tail = cloned
            current = current.next.move_to_next() if current.next else None
            i += 1

        tail.next = None

        return result_head

    def match(self, search: re.Pattern) -> Optional[dict]:
        if not search.flags:
            search = re.compile(search.pattern, search.flags)
        txt = self.to_processed_string()
        root = self
        i = 0
        match = search.search(txt)
        if not match:
            return None
        while i < match.start() and root:
            root = root.next.move_to_next() if root.next else None
            i += 1
        start_node = root
        start_index = i
        while i < match.end() and root:
            root = root.next.move_to_next() if root.next else None
            i += 1
        return {'node': start_node, 'index': start_index, 'lastIndex': i}

    def match_all(self, search: Union[str, re.Pattern]) -> List[dict]:
        # Ensure 'search_pattern' is a compiled regex object
        if isinstance(search, str):
            search_pattern = re.compile(search)
        else:
            search_pattern = search # Already a re.Pattern object

        results = []
        txt = self.to_processed_string() # Get the string representation for regex matching

        # `current_node_ptr` tracks our position in the CharNode linked list.
        # `current_txt_idx` tracks our corresponding index in the `txt` string.
        current_node_ptr: Optional['CharNode'] = self
        current_txt_idx = 0

        for match in search_pattern.finditer(txt):
            match_start_in_txt = match.start()
            match_end_in_txt = match.end()

            # Step 1: Advance `current_node_ptr` to the `CharNode` corresponding to `match_start_in_txt`.
            # We only increment `current_txt_idx` for characters that contribute to `txt`.
            while current_node_ptr and current_txt_idx < match_start_in_txt:
                if not current_node_ptr.ignore and current_node_ptr.char:
                    current_txt_idx += 1
                current_node_ptr = current_node_ptr.next

            # If we exhausted the CharNode list before reaching `match_start_in_txt`,
            # it means the match in `txt` doesn't have a corresponding CharNode start.
            if not current_node_ptr:
                break # No more valid nodes to match against

            # At this point, `current_node_ptr` is at the beginning `CharNode` of the match.
            start_node_for_match = current_node_ptr

            # Step 2: Advance `current_node_ptr` past the matched segment.
            # `current_txt_idx` will also advance to `match_end_in_txt`.
            while current_node_ptr and current_txt_idx < match_end_in_txt:
                if not current_node_ptr.ignore and current_node_ptr.char:
                    current_txt_idx += 1
                current_node_ptr = current_node_ptr.next

            # Store the results for this match
            results.append({
                'node': start_node_for_match,  # The CharNode where the match effectively starts
                'index': match_start_in_txt,   # Start index of the match in `txt`
                'lastIndex': match_end_in_txt  # Exclusive end index of the match in `txt`
            })

        return results
    def split(self, search: Union[str, 're.Pattern'], limit: Optional[int] = None) -> List['CharNode']:
        """
        Splits the CharNode linked list into a list of CharNode linked lists
        based on a search string or regular expression.
        """
        if limit is not None:
            if limit == 0:
                return []
            if limit < 0 or not isinstance(limit, int):
                raise TypeError('limit for split() must be a non-negative integer')

        count = limit if limit is not None else float('inf')

        results: List[CharNode] = []

        # Handle empty search string: split into individual CharNode objects
        if isinstance(search, str) and search == '':
            head: Optional[CharNode] = self.clone()  # Work on a clone to avoid modifying original
            while head and count > 0:
                count -= 1
                head_next: Optional[CharNode] = head.next
                head.next = None  # Detach the node
                results.append(head)
                head = head_next
            return results

        # Determine the regex to use
        if isinstance(search, str):
            regexp = re.compile(search)
        elif not search.flags:  # Simulate global flag if not present
            regexp = re.compile(search.pattern)
        else:
            regexp = search

        txt = self.to_processed_string()
        root: Optional[CharNode] = self.clone()  # Work on a clone

        # Use a dummy buffer head for collecting nodes before a split point
        buffer_head = CharNode(char='')
        buffer_tail: Optional[CharNode] = buffer_head

        char_idx = 0  # Index in the processed string `txt`

        # Iterate through matches
        for match in regexp.finditer(txt):
            if count <= 0:
                break  # Stop if limit reached

            # Add characters before the match to the current segment (buffer)
            while char_idx < match.start() and root:
                root_next: Optional[CharNode] = root.next

                # Append to buffer
                if buffer_tail:
                    buffer_tail.next = root
                    buffer_tail = buffer_tail.next
                    buffer_tail.next = None  # Detach from original chain
                else:  # Should not happen if buffer_head is initialized
                    buffer_head.next = root
                    buffer_tail = root
                    buffer_tail.next = None

                # Move to next original node
                root = root_next

                # Increment char_idx, respecting ignored characters
                if not (buffer_tail and buffer_tail.ignore):  # Check the last added charNode
                    char_idx += 1

            # If the buffer contains characters, it's a segment to be added to results
            if buffer_head.next:
                results.append(buffer_head.next)
                buffer_head.next = None  # Reset buffer
                buffer_tail = buffer_head  # Reset buffer tail
                count -= 1
                if count <= 0:
                    break  # Stop if limit reached

            # Advance root and char_idx past the matched segment
            # We don't want to include the matched separator in any result segment
            while char_idx < match.end() and root:
                root_next = root.next
                root = root_next  # Simply skip these nodes
                # Increment char_idx, respecting ignored characters
                if not (root and root.ignore):  # Check the skipped charNode
                    char_idx += 1

        # Add any remaining part after the last match (if limit allows)
        if root and count > 0:
            # We need to correctly append the remaining nodes from `root` to the buffer
            # and then add the buffer's content as a final result.
            current_remaining = root
            while current_remaining:
                next_remaining = current_remaining.next
                if buffer_tail:
                    buffer_tail.next = current_remaining
                    buffer_tail = buffer_tail.next
                    buffer_tail.next = None
                else:
                    buffer_head.next = current_remaining
                    buffer_tail = current_remaining
                    buffer_tail.next = None
                current_remaining = next_remaining

            if buffer_head.next:
                results.append(buffer_head.next)

        return results

    def splice(self, start: int, delete_count: int = 0, replace_value: Optional[str] = None) -> Optional['CharNode']:
        """
        Changes the content of a CharNode linked list by removing existing elements
        and/or adding new elements. Returns the modified linked list.
        """
        # Create a dummy root for easier manipulation at the beginning of the list
        root = CharNode(char='')
        root.next = self.clone()  # Work on a clone of the original list

        head: Optional[CharNode] = root.next  # Node to potentially be deleted/replaced
        tail: Optional[CharNode] = root  # Node *before* 'head'

        # Move tail to the node before 'start', and head to 'start'
        for _ in range(start):
            # Skip ignored nodes to find the actual 'start' position
            while head and head.ignore:
                tail = tail.next  # Tail also skips ignored nodes
                head = head.next
            if not head:  # Reached end of list before 'start'
                break
            tail = tail.next
            head = head.next

        if not tail:
            # This should ideally not happen if 'root' is set up correctly and 'start' is valid
            # If tail is None, it means the list was empty or start was out of bounds negatively
            return root.next  # Return the original (potentially empty) cloned list

        # Case 1: No replacement value or empty replacement value
        if replace_value is None or replace_value == '':
            for _ in range(delete_count):
                # Skip ignored nodes in the 'head' path
                while head and head.ignore:
                    head = head.next
                if not head:  # Ran out of nodes to delete
                    break

                # Mark node as ignored and empty its char, preserving originalChar for potential recovery
                # The original JS creates a new node for `tail.next`. Let's follow that.
                new_ignore_node = CharNode(
                    char='',
                    original_char=head.original_char if head.original_char else head.char
                )
                new_ignore_node.ignore = True

                if tail:  # Ensure tail is not None before accessing .next
                    tail.next = new_ignore_node
                    tail = tail.next
                else:  # Fallback, should ideally not happen if root and start are valid
                    # This implies root.next might be None at this point,
                    # so we need to set root.next if tail is None
                    root.next = new_ignore_node
                    tail = new_ignore_node

                head = head.next  # Advance head to the next node to potentially delete

            # Reconnect the list: tail's next points to where head is now
            if tail:
                tail.next = head
            return root.next

        # Case 2: With a replacement value
        replace_value_length = len(replace_value)
        new_idx = 0

        # Phase 1: Replace characters while deleting and inserting simultaneously
        while delete_count > 0 and head and new_idx < replace_value_length:
            # Skip ignored nodes in head path
            while head and head.ignore:
                tail = tail.next
                head = head.next

            if not head:  # Ran out of original nodes to modify
                break

            # Modify the existing head node
            head.char = replace_value[new_idx]
            # Preserve head.original_char if desired, or set to replaceValue[new_idx]
            # The original JS `originalChar: tail?.originalChar` is a bit ambiguous for CharNode,
            # but it seems to try and retain the `originalChar` from the node *before* the current `head`
            # or the current `head`'s original. Let's assume it should be `head.original_char` or the char from `replace_value`
            # For simplicity, I'll set it to the new char, or preserve existing if that's the intent.
            # Following `originalChar: tail?.originalChar` seems weird here as `tail` is the *previous* node.
            # I will assume `head.original_char` should be preserved or modified to the new char.
            # For now, let's keep it as is if it has content, or set to `head.char` if not.
            if head.original_char is None or head.original_char == '':
                head.original_char = replace_value[new_idx]

            new_idx += 1
            head = head.next
            tail = tail.next
            delete_count -= 1

        # Phase 2: If delete_count is still > 0 (meaning original list was longer)
        while delete_count > 0 and head:
            # Skip ignored nodes in head path
            while head and head.ignore:
                head = head.next
            if not head:  # Ran out of nodes
                break

            # Mark remaining nodes for deletion as ignored
            if tail and head:  # Ensure both exist before manipulation
                # The original JS `tail!.originalChar += head!.originalChar!;` implies
                # that `originalChar` can be a string that accumulates. Let's ensure this.
                if tail.original_char is None:
                    tail.original_char = ''
                if head.original_char:
                    tail.original_char += head.original_char
                head.char = ''
                head.ignore = True
                head = head.next
            delete_count -= 1

        # Phase 3: If replace_value is longer (meaning new characters need to be inserted)
        while new_idx < replace_value_length:
            new_node = CharNode(
                char=replace_value[new_idx],
                original_char=replace_value[new_idx]  # New characters have themselves as original
            )
            new_idx += 1

            if tail:
                new_node.next = tail.next  # Insert new_node after tail
                tail.next = new_node
                tail = tail.next  # Advance tail to the newly inserted node
            else:  # This implies the list was empty or we're inserting at the very beginning
                # and `tail` somehow became None. Handle as insertion at root.next.
                if root.next is None:  # If list was truly empty at this point
                    root.next = new_node
                    tail = new_node
                else:  # Insert at the front, but keep tail as the last inserted if it exists
                    new_node.next = root.next
                    root.next = new_node
                    tail = new_node  # Set tail to this new node

        # Finally, connect the end of the modified segment to the rest of the original list
        if tail:
            tail.next = head  # 'head' is now the first un-processed node from the original list
        else:  # If tail is None, it means the list was manipulated such that the root's next needs update
            root.next = head  # Connect the root directly to the remaining head

        return root.next

    def move_to_next(self, target_char: Optional[str] = None) -> Optional['CharNode']:
        pointer = self
        while pointer:
            while pointer and pointer.ignore:
                pointer = pointer.next
            if not target_char or (pointer and pointer.char == target_char):
                break
            pointer = pointer.next
        return pointer

    def release(self):
        next_char = self.next
        self.next = None
        if next_char:
            next_char.release()

    @staticmethod
    def from_string(value: str) -> Optional['CharNode']:
        try:
            parsed_value = json.loads(value)
            if isinstance(parsed_value, str):
                return CharNode.create(parsed_value)
            if isinstance(parsed_value, list):
                root = CharNode(char='')
                head = root
                for v in parsed_value:
                    head.next = CharNode(
                        original_char=v.get('org'),
                        char=v.get('char'),
                        ignore=v.get('ignore', False)
                    )
                    head = head.next
                return root.next
            raise Exception('unexpected format')
        except Exception:
            raise Exception('unexpected format')

    @staticmethod
    def join_with(connector: 'CharNode', *targets: Optional['CharNode']) -> Optional['CharNode']:
        targets = [x for x in targets if x is not None]
        if not targets:
            return None
        if len(targets) == 1:
            return targets[0]
        p = targets.pop(0)
        head = p
        while p and p.next:
            p = p.next
        while p and targets:
            p.next = connector.clone()
            while p.next:
                p = p.next
            p.next = targets.pop(0)
            while p and p.next and p != p.next:
                p = p.next
            if p == p.next:
                p.next = None
        return head

    @staticmethod
    def create(address: str) -> Optional['CharNode']:
        head = None
        is_in_parenthesis = False
        for i in range(len(address)-1, -1, -1):
            prev_head = head
            if address[i] == ')':
                is_in_parenthesis = True
            head = CharNode(
                original_char=address[i],
                char=address[i],
                ignore=is_in_parenthesis
            )
            head.next = prev_head
            if address[i] == '(': 
                is_in_parenthesis = False
        return head 