Below is a complete, professional, end-to-end specification for your Mobile-Only QCM Simulator SPA, written in English, structured exactly as a software requirements document — ready for development.

This specification is tailored to your JSON exam format, your user flows, and mobile constraints.

📘 QCM Simulator – Detailed Specifications (Mobile-Only SPA)

Technologies: HTML, JavaScript, TailwindCSS, Local Filestore (IndexedDB or LocalStorage)
Target device: Mobile
Type: Single Page Application (SPA)
Design: Modern, clean, responsive, smooth animations, toast notifications

1. Purpose

The purpose of this SPA is to allow users to:

Upload JSON files containing QCM questions

Create and store multiple exams locally

Take QCM exams on mobile with progress tracking

View corrections immediately after answering

Mark questions to review later

See final score and AI-generated explanations

Provide a lightweight, offline-capable QCM practice tool

2. Data Specification
2.1. One question entry

Each entry in the JSON file represents one question:

{
  "category": "QCM",
  "drug": "n/a",
  "stem": "fémorale avec un fragment osseux faisant saillie à travers une plaie irrégulière. Quelle est la meilleure conduite à tenir",
  "options": [
      "Réduction fermée et plâtre long uniquement",
      "Rappel antitétanique uniquement ; suivi ambulatoire",
      "Traction squelettique pendant 24 à 48 heures, puis sortie",
      "Antibiothérapie intraveineuse immédiate et irrigation/débridement chirurgical urgent",
      "Reporter l'intervention chirurgicale jusqu'à la résorption de l'œdème.",
      "n/a"
  ],
  "answerIndex": 3
}

Rules

options always contains 6 items

missing options replaced with "n/a"

answerIndex contains only ONE correct answer index

stem is the question text

category and drug are optional metadata for the UI

2.2. Exam file format

A JSON exam file contains an array of questions:

[
  { ...question1... },
  { ...question2... },
  ...
]

2.3. Stored exam metadata

Stored separately from questions:

{
  "id": "uuid",
  "name": "Trauma Exam",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "questionCount": 120,
  "fileName": "qcm_block_1.json"
}

3. Storage Architecture

Use browser filestore:

Option 1 — IndexedDB (recommended)

For exam metadata table

For exam questions table

Supports large files

Fast indexed lookups

Option 2 — LocalStorage

Simpler but limited (5 MB)

For metadata only

Questions stored as stringified JSON

👉 Use IndexedDB for enterprise-level reliability.

4. App Architecture (SPA)
Pages (all in SPA):

Home / Dashboard

Exam List

Exam Import (Upload JSON)

Exam Rename / Delete modals

Exam Taking page

Question Review page (after exam)

Marked Questions page

Final Score page

Settings (AI explanation etc.)

All pages implemented inside a single index.html using JS routing.

5. Features (Detailed)
5.1. Create a New Exam

User selects a .json file

App reads file via FileReader API

Validate structure:

Must be an array

Each entry must include stem, options, answerIndex

User enters exam name

Save exam JSON to IndexedDB

Save metadata record

Show toast:
“Exam successfully created 🎉”

5.2. View All Exams

List includes:

Exam name

Number of questions

Created date

3-dot menu:

Rename

Delete

Start Exam

Modern card layout with TailwindCSS.

5.3. Rename Exam

Inline modal

Update metadata

Toast:
“Exam renamed successfully.”

5.4. Delete Exam

Confirmation modal

Remove both metadata and question store

Toast:
“Exam removed.”

5.5. Start Exam

Exam page displays:

Header:

Exam name

Progress (e.g., “Question 5 / 50”)

Timer (optional)

Bookmark/Mark button (⭐)

Body:

Question stem

Options as large buttons (mobile-friendly)

Disable after choosing one

Highlight correct answer in green

Highlight wrong choice in red

Footer:

“Next Question” button (locked until answer is chosen)

“View Explanation using AI” button

5.6. Answer Checking

When user selects an option:

✔ Correct answer → show green state
❌ Wrong answer → show red + highlight correct one

Toast-style optional feedback:

“Correct!”

“Incorrect, correct answer is D”

5.7. Show Correction Before Moving Next

User must confirm:
➡️ “Next Question”

This enforces learning before continuing.

5.8. Exam Progress Tracking

A progress bar:

currentIndex / totalQuestions

Animated Tailwind progress bar

5.9. Question Marking (Flagging)

User can tap ⭐ to mark a question:

Store question index in metadata during exam session

List available after exam in “Marked Questions”

State stored in:

{
  "marked": [3, 10, 17]
}

5.10. Final Score Page

Display:

Score: “34 / 50”

Percentage

Time taken

Number of marked questions

Buttons:

Review All Questions

Review Marked Questions Only

Restart Exam

5.11. AI Explanation Feature

(Using backend or browser-based LLM)

On a question page, after answering:

Button:
“Explain the correct answer 🤖”

The request sent:

{
  "stem": "...",
  "options": [...],
  "correctIndex": 3
}


Response displayed in a modal:

Explanation paragraph

Optional reference links

6. Component Breakdown
Components:

Navbar

ExamCard

QuestionCard

OptionButton

ProgressBar

MarkedBadge

ScoreCard

ToastComponent

ModalComponent

FloatingActionButtons

AIExplanationModal

7. UI/UX Requirements
General:

Mobile-first

1 column layout

Rounded cards

Soft shadows

Vibrant colors

Animated transitions (Tailwind + JS)

Typography:

Use Inter or Poppins

Large question text

Big touch-friendly buttons

Navigation:

No page reload

simple hash-based routing:

#/exams

#/exam/:id

#/results/:id

8. Toast Notifications

Examples:

success("Exam created successfully!")

error("Invalid JSON file")

warning("You must answer before moving on.")

info("Question marked for review.")

9. Validation Rules
For file upload:

JSON must parse

Must be array

Each question must contain:

stem

options

answerIndex

Option constraints:

Always 6 items

If missing → auto pad "n/a"

10. Performance

All data saved locally for instant access

Exam runs offline after initial upload

Minimal bundle size, no build tools required

11. Security

No backend required

No user-sensitive data

Optional: AI explanation via backend (user decides)

12. Future Features (Optional)

Category filtering

Timed exams

Exam difficulty levels

Color themes (dark mode)

Export score history

✅ Ready to Generate the Code?

If you want, I can now generate:

✔ Full SPA code (HTML + JS + TailwindCSS)
✔ IndexedDB exam manager
✔ JSON loader and validator
✔ Question engine + score engine
✔ Beautiful modern UI
