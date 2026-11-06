with open("chatgpt_evaluation_full.md", "r", encoding="utf-8") as f:
    text = f.read()

import re

# Clean markdown formatting and write to clean_loopholes.txt
sections = re.split(r'###\s+Loophole\s+(\d+\.[^\n]+)', text)
with open("clean_loopholes.txt", "w", encoding="utf-8") as out:
    for i in range(1, len(sections), 2):
        out.write(f"\n==================== LOOPHOLE {sections[i]} ====================\n")
        out.write(sections[i+1].strip() + "\n")

# Also extract sections 3, 4, 5, 6, 7, 8, 9, 10
other_sections = re.split(r'##\s+(\d+\.[^\n]+)', text)
with open("clean_recommendations.txt", "w", encoding="utf-8") as out:
    for i in range(1, len(other_sections), 2):
        out.write(f"\n==================== SECTION {other_sections[i]} ====================\n")
        out.write(other_sections[i+1].strip() + "\n")

print("Wrote clean_loopholes.txt and clean_recommendations.txt")
