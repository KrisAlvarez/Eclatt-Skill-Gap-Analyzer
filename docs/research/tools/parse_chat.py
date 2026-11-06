import urllib.request
import ssl
import re

url = 'https://chatgpt.com/s/t_6aec8e29cc508191946a5c3dffb96148'
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')

# Search for next_f chunks
chunks = re.findall(r'self\.__next_f\.push\(\[1,"(.*?)"\]\)', html, re.DOTALL)
print(f"Total chunks: {len(chunks)}")

combined = "".join(chunks)
try:
    decoded = bytes(combined, "utf-8").decode("unicode_escape", errors="ignore")
except Exception:
    decoded = combined

with open("scraped_chat.txt", "w", encoding="utf-8") as f:
    f.write(decoded)

parts = re.findall(r'"parts":\s*\["(.*?)"\]', decoded, re.DOTALL)
print(f"Found {len(parts)} parts:")
for i, p in enumerate(parts):
    clean = p.replace('\\n', '\n').replace('\\"', '"').replace('\\\\', '\\')
    print(f"\n==================== MESSAGE {i+1} ====================")
    print(clean)
