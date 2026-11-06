import json
import re

with open("script_9.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Search for the dictionary of constants
# Typically {"0":"SkillGap...","1":"..."}
constants_match = re.search(r'\{"0":".*?"\}', text)
if not constants_match:
    # Try finding the large map of numeric keys to strings
    matches = re.findall(r'"(\d+)":"((?:[^"\\]|\\.)*)"', text)
    print(f"Found {len(matches)} numeric key mappings!")
    
    with open("chatgpt_readable_full.md", "w", encoding="utf-8") as out:
        for k, v in sorted(matches, key=lambda x: int(x[0])):
            try:
                dec = bytes(v, 'utf-8').decode('unicode_escape', errors='ignore')
            except:
                dec = v
            out.write(f"[{k}] {dec}\n")
    print("Saved to chatgpt_readable_full.md")
else:
    print("Found direct constants match")
