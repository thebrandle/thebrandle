import sys
import re

content = open('framerusercontent.com/sites/5kj0S8gDMWYNPEPmYNuaP6/6z23n7ntDLd5vQdQEEHp86ENwggr1CCgW_2Z4Oo1vTY.DyIE-0qV.mjs').read()

# First undo my previous mistake
content = content.replace(']})}),[`@supports', ']})})}),[`@supports')

# Let's count properly
def count_brackets(s):
    return s.count('[') - s.count(']')

print('Initial bracket balance:', count_brackets(content))

# The actual issue was that there was an extra `]` before `[` @supports.
# I need to remove one `]`! 
# Original snippet: ` })})})]}),r('div',{id:'overlay'})]})})}),[`
# If I remove the `]` after `({id:'overlay'})}`, it becomes:
# ` })})})]}),r('div',{id:'overlay'})]}),[` or something else?
# Let's try replacing `]})})}),[` with `]}})}),[` 
# Wait, let's just use string slicing.

# Let's find exactly the matching brackets for the whole thing
idx = content.find('`@supports (aspect-ratio: 1)')
# go backwards and remove the first `]` we see?
# Let's be smart. The issue was introduced by replacing the content inside `framer-i9o2vz` container.
# My `patch_privacy.py` had this:
# new_content = f"children:[a(`div`,{{className:`framer-m1cmc8`...}}}), {', '.join(sections)}]"
# But wait, original was: `children:[a('div',{...}), a('div'...)]`
# If we replaced the whole thing, maybe we added too many `]` at the end of the sections?
# `a('div',{className:'framer-10kyo87'..., children:[...]})`
# The string replacement might have missed something. Let's just remove the first `]` going backwards from `[` `@supports`.

prefix = content[:idx]
suffix = content[idx:]

# Find the last `]` in prefix
last_bracket = prefix.rfind(']')
if last_bracket != -1:
    prefix = prefix[:last_bracket] + prefix[last_bracket+1:]

new_content = prefix + suffix
print('Final bracket balance:', count_brackets(new_content))

open('framerusercontent.com/sites/5kj0S8gDMWYNPEPmYNuaP6/6z23n7ntDLd5vQdQEEHp86ENwggr1CCgW_2Z4Oo1vTY.DyIE-0qV.mjs', 'w').write(new_content)
