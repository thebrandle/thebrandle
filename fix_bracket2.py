import sys

try:
    content = open('framerusercontent.com/sites/5kj0S8gDMWYNPEPmYNuaP6/6z23n7ntDLd5vQdQEEHp86ENwggr1CCgW_2Z4Oo1vTY.DyIE-0qV.mjs', 'r').read()
    
    idx = 33262
    print("Found mismatch at 33262:")
    print(content[idx-50:idx+50])
    
    # We want to replace `]]})})})` with `]})})})` at this location if it exists
    snippet = "})]})]})]]})})}),T()&&r(m"
    if snippet in content:
        print("Found the culprit snippet!")
        content = content.replace(snippet, "})]})]})]})})}),T()&&r(m")
        print("Replaced with: })]})]})]})})}),T()&&r(m")
        # Let's count again
        brackets = content.count('[') - content.count(']')
        print("Bracket balance after fix:", brackets)
        
        # Did we break the end bracket? The previous script removed `]` near `@supports`
        # Let's add it back if it's missing.
        end_idx = content.find('`@supports (aspect-ratio: 1)')
        end_context = content[end_idx-20:end_idx]
        print("End context:", end_context)
        
        if end_context.endswith('})}),['):
            print("End context looks correct: })}),[")
            
        open('framerusercontent.com/sites/5kj0S8gDMWYNPEPmYNuaP6/6z23n7ntDLd5vQdQEEHp86ENwggr1CCgW_2Z4Oo1vTY.DyIE-0qV.mjs', 'w').write(content)
        print("File updated.")
    else:
        print("Snippet not found, here is what is around 33262:")
        print(content[idx-100:idx+100])
except Exception as e:
    print("Error:", e)
