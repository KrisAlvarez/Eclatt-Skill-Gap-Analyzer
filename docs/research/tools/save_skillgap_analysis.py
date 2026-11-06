with open("chat_messages_decoded.txt", "r", encoding="utf-8") as f:
    text = f.read()

sections = text.split("====================")
# Find the section starting with # SkillGap
for s in sections:
    if "SkillGap" in s:
        with open("skillgap_chatgpt_response.md", "w", encoding="utf-8") as out:
            out.write(s)
        print("Found and saved to skillgap_chatgpt_response.md!")
        break
