import re
import json

output_lines = []

for fname in ['script_9.txt', 'script_4.txt']:
    try:
        with open(fname, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        continue

    output_lines.append(f"=== CHECKING {fname} (length: {len(content)}) ===")
    
    # In Remix / React Router TurboStream, strings are serialized.
    # Let's search for JSON serialized data
    all_strings = re.findall(r'"((?:[^"\\]|\\.)*)"', content)
    for s in all_strings:
        if len(s) > 40 and any(w in s.lower() for w in ['eclat', 'skill', 'job', 'developer', 'render', 'machine learning', 'frontend', 'backend', 'dataset']):
            try:
                dec = bytes(s, 'utf-8').decode('unicode_escape', errors='ignore')
            except:
                dec = s
            output_lines.append("\n------------------ EXTRACTED TEXT BLOCK ------------------\n")
            output_lines.append(dec)

with open("conversation_extracted.txt", "w", encoding="utf-8") as out:
    out.write("\n".join(output_lines))

print(f"Done! Written {len(output_lines)} blocks to conversation_extracted.txt")
