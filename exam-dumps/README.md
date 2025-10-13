This folder is for local JSON dumps per exam code.

Usage:
- Place a file named <code>.json here, e.g. ai102.json, ai900.json, az204.json.
- In the editor, set the exam selector to Custom and use the code to Load (e.g., ai102).
- The simulator does not automatically load custom dumps; saving in the editor writes to localStorage under key `custom_<code>_questions`.

Notes:
- For AI-102 built-in, we still load from `ai102-extractor/out/ai102_dump.json`. You can override via localStorage or by loading `exam-dumps/ai102.json` in the editor and saving.