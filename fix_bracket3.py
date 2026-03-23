import sys

content = open('framerusercontent.com/sites/5kj0S8gDMWYNPEPmYNuaP6/6z23n7ntDLd5vQdQEEHp86ENwggr1CCgW_2Z4Oo1vTY.DyIE-0qV.mjs').read()

def find_mismatch(s):
    stack = []
    for i, c in enumerate(s):
        if c in '[{(':
            stack.append((c, i))
        elif c in ']})':
            if not stack:
                return f'Extra {c} at {i}'
            top_c, top_i = stack.pop()
            if (c == ']' and top_c != '[') or (c == '}' and top_c != '{') or (c == ')' and top_c != '('):
                return f'Mismatch {c} at {i}, expected match for {top_c} at {top_i}'
    if stack:
        return f'Unmatched {stack[-1][0]} at {stack[-1][1]}'
    return 'Balanced'

print('Status before:', find_mismatch(content))

# Look closely at the end of the file where the original error happened.
# The original file had: `('div',{id:'overlay'})]})})}),[`
# My broken script replaced: `('div',{id:'overlay'})]})})}),[` -> `('div',{id:'overlay'})]}),[`
# Then another script reverted it partially but then removed the last `]` in the whole file.
# The `fix_bracket2.py` printed: `End context: :`overlay`})})})}),[`
# Notice that `]})})}),[` became `})})}),[` because I had done `prefix.rfind(']')` and deleted it!

# So let's replace `id:\`overlay\`})})})}),[` with `id:\`overlay\`})]})})}),[`
# We have to be careful about backticks in python string but here it's fine.
target = "id:`overlay`})})})}),["
replacement = "id:`overlay`})]})})}),["

if target in content:
    content = content.replace(target, replacement)
    print("Successfully replaced the missing bracket at the end.")
else:
    print("Target not found. Looking at snippet at the end.")
    idx = content.find('`@supports (aspect-ratio')
    print("Context:", content[idx-30:idx+5])

print('Status after:', find_mismatch(content))
open('framerusercontent.com/sites/5kj0S8gDMWYNPEPmYNuaP6/6z23n7ntDLd5vQdQEEHp86ENwggr1CCgW_2Z4Oo1vTY.DyIE-0qV.mjs', 'w').write(content)
