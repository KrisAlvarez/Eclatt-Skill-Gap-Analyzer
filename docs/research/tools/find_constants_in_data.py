import json

with open("script_9.txt", "r", encoding="utf-8") as f:
    raw = f.read()

start = raw.find('enqueue("')
end = raw.rfind('")')
content = raw[start+9:end]
decoded_str = bytes(content, 'utf-8').decode('unicode_escape', errors='ignore')
data = json.loads(decoded_str)

# Look for dictionaries in data
print(f"Data has {len(data)} items")
for idx, item in enumerate(data):
    if isinstance(item, dict):
        keys = list(item.keys())
        if '0' in keys or '1' in keys:
            print(f"Index {idx} is the constants dictionary with {len(keys)} entries!")
            with open("chatgpt_constants_recovered.txt", "w", encoding="utf-8") as out:
                for k in sorted(keys, key=lambda x: int(x) if x.isdigit() else 99999):
                    val = item[k]
                    if isinstance(val, (int, float)):
                        # Look up reference in data array if it is an index
                        resolved = data[val] if val < len(data) else val
                        out.write(f"[{k}] {resolved}\n")
                    else:
                        out.write(f"[{k}] {val}\n")
            print("Wrote chatgpt_constants_recovered.txt!")
            break
