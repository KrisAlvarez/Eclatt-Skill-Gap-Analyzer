import json

with open("script_9.txt", "r", encoding="utf-8") as f:
    raw = f.read()

# Look for the string inside enqueue(...)
start = raw.find('enqueue("')
if start != -1:
    end = raw.rfind('")')
    content = raw[start+9:end]
    # Unescape
    try:
        decoded_str = bytes(content, 'utf-8').decode('unicode_escape', errors='ignore')
        # Parse JSON
        data = json.loads(decoded_str)
        print(f"Loaded JSON! Type: {type(data)}, length: {len(data) if isinstance(data, list) else 'dict'}")
        
        # Save all string elements in data
        messages = []
        if isinstance(data, list):
            for idx, item in enumerate(data):
                if isinstance(item, str) and len(item) > 30:
                    messages.append((idx, item))
        
        print(f"Found {len(messages)} long string elements:")
        with open("chat_messages_decoded.txt", "w", encoding="utf-8") as out:
            for idx, m in messages:
                out.write(f"\n==================== [Index {idx}] ====================\n")
                out.write(m + "\n")
                
        print("Written to chat_messages_decoded.txt")
    except Exception as e:
        print("JSON parse error:", e)
else:
    print("enqueue not found")
