# Research & Evaluation Archive

This directory houses the background research, critical evaluation transcripts, defense preparations, and loophole resolution notes for the **SkillGap** project.

## Directory Structure

```
docs/research/
├── README.md                     # This documentation file
├── clean_loopholes.md            # In-depth resolution of the 7 academic loopholes
├── clean_recommendations.md      # Comprehensive methodology and scope recommendations
├── chatgpt_evaluation_full.md    # Full defense-readiness evaluation conversation transcript
├── skillgap_chatgpt_response.md  # Original ChatGPT project formulation and responses
├── tools/                        # Utility scripts used to scrape and unpack research transcripts
│   ├── clean_dump.py
│   ├── dump_readable.py
│   ├── extract_constants.py
│   ├── extract_content.py
│   ├── extract_eval_full.py
│   ├── find_constants_in_data.py
│   ├── parse_chat.py
│   ├── save_skillgap_analysis.py
│   └── unpack_turbostream.py
└── raw/                          # Raw HTML, JSON stream dumps, and extracted intermediate text
    ├── page.html
    ├── scraped_chat.txt
    ├── script_2.txt
    ├── script_4.txt
    ├── script_9.txt
    ├── conversation_extracted.txt
    ├── chat_messages_decoded.txt
    ├── all_readable_sentences.txt
    └── chatgpt_readable_full.md
```

## Key Research Documents

1. **[clean_loopholes.md](./clean_loopholes.md)**:
   - Detailed analysis of Seniority Bias, Predictive Overreach, ECLAT vs Count(*), Unvetted Skills, Scope, Evaluation Metrics, and Cold-Start Handling.
2. **[clean_recommendations.md](./clean_recommendations.md)**:
   - Methodological recommendations on transaction modeling, conditional rule extraction, and defensible academic framing.
3. **[chatgpt_evaluation_full.md](./chatgpt_evaluation_full.md)**:
   - Unabridged transcript detailing defense question formulations and metric selection rationale.
4. **[skillgap_chatgpt_response.md](./skillgap_chatgpt_response.md)**:
   - Preliminary architecture and algorithmic notes.

## Tools and Raw Scrapes

- **`tools/`**: Python utility scripts used to parse Next.js / TurboStream JSON payloads from browser snapshots.
- **`raw/`**: Archived raw data dumps retained for complete reproducibility and verification.
