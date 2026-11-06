import json

with open("script_9.txt", "r", encoding="utf-8") as f:
    raw = f.read()

start = raw.find('enqueue("')
end = raw.rfind('")')
content = raw[start+9:end]
data = json.loads(bytes(content, 'utf-8').decode('unicode_escape', errors='ignore'))

with open("all_readable_sentences.txt", "w", encoding="utf-8") as out:
    for i, item in enumerate(data):
        if isinstance(item, str) and len(item.strip()) > 10:
            out.write(f"\n[{i}]: {item}\n")

print("Saved all_readable_sentences.txt")
