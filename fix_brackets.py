import sys
content = open('framerusercontent.com/sites/5kj0S8gDMWYNPEPmYNuaP6/6z23n7ntDLd5vQdQEEHp86ENwggr1CCgW_2Z4Oo1vTY.DyIE-0qV.mjs').read()
new_content = content.replace(']})})}),[`@supports', ']})}),[`@supports')
open('framerusercontent.com/sites/5kj0S8gDMWYNPEPmYNuaP6/6z23n7ntDLd5vQdQEEHp86ENwggr1CCgW_2Z4Oo1vTY.DyIE-0qV.mjs', 'w').write(new_content)
brackets = new_content.count('[') - new_content.count(']')
print('New bracket balance:', brackets)
