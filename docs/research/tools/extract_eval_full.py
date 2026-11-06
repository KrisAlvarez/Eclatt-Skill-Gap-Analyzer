with open("all_readable_sentences.txt", "r", encoding="utf-8") as f:
    text = f.read()

import re

# Find all [number]: content blocks
blocks = re.findall(r'\[(\d+)\]:\s*(.*?)(?=\n\[\d+\]:|\Z)', text, re.DOTALL)
print(f"Total blocks: {len(blocks)}")

full_eval = []
collecting = False
for num, content in blocks:
    if int(num) >= 560:
        full_eval.append(f"[{num}] {content.strip()}")

with open("chatgpt_evaluation_full.md", "w", encoding="utf-8") as out:
    out.write("\n\n".join(full_eval))

print(f"Saved {len(full_eval)} blocks to chatgpt_evaluation_full.md")
