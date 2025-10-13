# Official Exam Packs - Distribution Guide

This folder contains the official exam content separated from the core simulator application.

## Available Exam Packs

### AI-900 (Azure AI Fundamentals)
- **File**: `official-dumps/ai900_dump.json`
- **Images**: `official-images/` (filter for AI-900 related images)
- **Questions**: ~200+ questions
- **Modules**: AI Workloads, Machine Learning, Computer Vision, NLP, Generative AI

### AI-102 (Azure AI Engineer Associate)
- **File**: `official-dumps/ai102_dump.json`
- **Images**: `official-images/ai102/` and root folder
- **Questions**: ~600+ questions
- **Modules**: LUIS, Bot Framework, Computer Vision, Cognitive Search, Speech, Form Recognizer, Text Analytics, Translator

## How to Use These Packs

### Option 1: Direct Import (Recommended)
1. Download the desired `.json` file
2. Open the Azure AI Exam Simulator
3. Drag the `.json` file onto the import area
4. The exam will be automatically available

### Option 2: Manual Installation
1. Download the exam pack
2. Copy to `user-content/exams/[exam-id]/dump.json`
3. Copy related images to `user-content/exams/[exam-id]/images/`
4. Refresh the simulator

### Option 3: User-Content Setup
Create the following structure in your simulator:

```
user-content/
├── exams/
│   ├── ai900/
│   │   ├── dump.json          (copy ai900_dump.json here)
│   │   └── images/            (copy relevant images)
│   └── ai102/
│       ├── dump.json          (copy ai102_dump.json here)
│       └── images/            (copy relevant images)
```

## Image Organization

Images are referenced in questions and explanations. Make sure to:

1. **Keep folder structure**: Images reference specific paths
2. **Copy all images**: Some questions may reference images by GUID
3. **Check paths**: Ensure image paths in JSON match your folder structure

### AI-900 Images
Most AI-900 images are in the root images folder with descriptive names.

### AI-102 Images
AI-102 images are organized in subfolders and reference by GUID filenames.

## Distribution Notes

### For End Users
- Download only the JSON files you need
- Use the drag & drop import feature
- No technical setup required

### For System Administrators
- You can pre-install exams in user-content folder
- Set up shared network drives with exam packs
- Distribute via your organization's channels

### For Developers
- JSON files follow the standard exam schema
- Images are referenced via relative paths
- Modify metadata as needed for your organization

## Creating Custom Distributions

You can create your own exam packs:

1. **Export from Editor**: Use the exam editor to create custom questions
2. **Combine Sources**: Merge multiple exam files
3. **Filter Content**: Create subject-specific subsets
4. **Rebrand**: Update metadata for your organization

### Custom Pack Example
```json
{
  "id": "ai900-basics",
  "metadata": {
    "name": "AI-900 Basics",
    "fullName": "AI Fundamentals - Core Concepts Only",
    "duration": 30,
    "questionCount": 20,
    "passScore": 75,
    "badge": "Basic",
    "icon": "fas fa-graduation-cap"
  },
  "questions": [/* filtered questions */]
}
```

## Support and Updates

### Getting Updates
Check back periodically for:
- New question sets
- Updated content
- Additional exam types
- Bug fixes and improvements

### Community Sharing
Consider contributing back:
- Quality improvements
- Additional translations
- New question types
- Bug reports

## Legal Notes

- **Educational Use**: These packs are for educational and training purposes
- **Copyright**: Respect original content licensing
- **Accuracy**: Content accuracy is not guaranteed
- **Updates**: Official exam content may change over time

---

For technical support or questions about the simulator itself, refer to the main application documentation.