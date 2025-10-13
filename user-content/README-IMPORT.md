# Exam Import Guide

This guide explains how to import exam packs into the Azure AI Exam Simulator.

## Supported Formats

### JSON Format
The simulator accepts exam data in JSON format with the following structure:

```json
{
  "id": "exam-id",
  "metadata": {
    "name": "AI-900",
    "fullName": "Azure AI Fundamentals",
    "duration": 45,
    "questionCount": 45,
    "passScore": 75,
    "badge": "Fundamentals",
    "icon": "fas fa-brain"
  },
  "questions": [
    {
      "id": 1,
      "module": "AI_WORKLOADS",
      "question": "What is Azure AI?",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correct": 0,
      "explanation": "Explanation here...",
      "question_type": "STANDARD",
      "question_images": [
        {"filename": "image1.jpg"}
      ],
      "explanation_images": [
        {"filename": "image2.jpg"}
      ]
    }
  ]
}
```

### ZIP Format (Future)
ZIP files containing:
- `dump.json` - The exam data
- `images/` folder - Associated images

## Import Methods

### Method 1: Drag & Drop (Recommended)
1. Open the exam simulator homepage
2. If no exams are found, you'll see an import area
3. Drag your `.json` file onto the drop zone
4. The exam will be automatically imported and available

### Method 2: Browse Files
1. Click the "Browse Files" button in the import area
2. Select your `.json` file
3. The exam will be imported automatically

### Method 3: Manual File Placement
1. Place your exam file in `user-content/exams/[exam-id]/dump.json`
2. Place associated images in `user-content/exams/[exam-id]/images/`
3. Refresh the application

## Directory Structure

```
user-content/
├── exams/
│   ├── ai900/
│   │   ├── dump.json
│   │   └── images/
│   │       ├── image1.jpg
│   │       └── image2.jpg
│   ├── ai102/
│   │   ├── dump.json
│   │   └── images/
│   └── custom-exam/
│       ├── dump.json
│       └── images/
└── imports/
    └── [temporary upload area]
```

## Question Types Supported

### STANDARD
Single choice question with one correct answer.

### MULTI
Multiple choice question with multiple correct answers.

### SEQUENCE
Drag & drop ordering question where options must be arranged in correct sequence.

### DRAG_DROP_SELECT
Drag & drop question where you select N items from a source list.

### YES_NO_MATRIX
Matrix of statements with Yes/No answers for each.

### HOTSPOT
Click on specific areas of an image (visual questions).

## Image Handling

Images should be referenced in two ways:

1. **Via image arrays** (recommended):
```json
{
  "question_images": [{"filename": "relative/path/image.jpg"}],
  "explanation_images": [{"filename": "relative/path/image.jpg"}]
}
```

2. **Via markdown in text**:
```json
{
  "question": "Look at this image: ![Description](images/example.jpg)"
}
```

### Image Path Rules
- Images paths are relative to the `images/` directory
- Supported formats: `.jpg`, `.jpeg`, `.png`, `.gif`
- Keep filenames unique across exams
- Use descriptive names for better organization

## Validation

The simulator validates imported exams for:
- Required fields (`id`, `question`, `options`, `correct`)
- Correct data types
- Question format consistency
- Image file references

## Troubleshooting

### Import Fails
- Check JSON syntax with a validator
- Ensure all required fields are present
- Verify question IDs are unique
- Check that `correct` indices match available options

### Images Not Loading
- Verify image files exist in the specified paths
- Check file extensions are supported
- Ensure filenames match exactly (case-sensitive)
- Try using absolute paths from the `images/` directory

### Exam Not Appearing
- Check browser console for error messages
- Verify the exam has questions
- Try refreshing the page
- Clear browser cache if needed

## Best Practices

1. **Use descriptive exam IDs**: `ai900-practice`, `ai102-advanced`
2. **Organize images by exam**: `ai900/question1.jpg`
3. **Include metadata**: Helps with proper display
4. **Test small first**: Import a few questions to test format
5. **Backup your data**: Keep original files safe

## Export for Sharing

You can export exams from the editor to share with others:
1. Open the Question Editor
2. Select the exam to export
3. Click "Export JSON"
4. Share the downloaded file

## Example Files

Sample exam files can be found in the `downloads/` folder:
- `ai900-sample.json` - Sample AI-900 questions
- `ai102-sample.json` - Sample AI-102 questions

## Need Help?

If you encounter issues:
1. Check the browser console (F12) for error messages
2. Validate your JSON format online
3. Try importing a sample file first
4. Contact support with specific error messages

---

**Note**: This simulator is designed for educational purposes. Ensure you have the right to use any exam content you import.