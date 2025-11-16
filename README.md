📘 QCM Simulator – Mobile SPA

A modern, mobile-only Single Page Application (SPA) for practicing QCM (multiple-choice medical exam questions).
Built with HTML, JavaScript, TailwindCSS, and IndexedDB (via Dexie.js) for local storage.

🚀 Features
✔ JSON Exam Upload

Create new exams by uploading a JSON file

Assign a custom name

Local validation of exam structure

Supports large QCM exam files

✔ Local Exam Management

All exams are stored locally using IndexedDB

Rename, delete, and browse exams

No internet required

No backend required

Data persists across browser sessions

✔ Exam Experience

Full-screen, mobile-first design

One question per screen

Multiple large option buttons for mobile usability

Show correction immediately after selecting an answer

Prevent moving to the next question until correction is viewed

Bookmark questions during the exam

Track exam progress in real-time

Final score summary

Review all questions after finishing

Review marked questions only

✔ AI Answer Explanation (optional)

Ask AI to explain the correct answer

Sends the question + correct answer to a backend or API

Modal UI for explanation feedback

✔ User Interface

Modern TailwindCSS design

Smooth animations

Toast notifications

Mobile SPA Routing (hash-based)

📂 JSON Exam Format

Each exam file is a JSON array:

[
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
]

Requirements:

Each question must have exactly 6 options

Missing options must be "n/a"

Only one correct answer, given by answerIndex

stem is the question text

category and drug are optional metadata

💾 Local Database (IndexedDB + Dexie.js)

The app stores everything locally on the user's device.
No backend is required.

📦 Database Structure
Database name:
QCMDatabase

Dexie.js schema:
const db = new Dexie("QCMDatabase");

db.version(1).stores({
    exams: "id, name, createdAt, updatedAt, questionCount",
    questions: "id, examId"
});

🗂 Table: exams

Stores metadata for each exam uploaded by the user.

Field	Type	Description
id	string (uuid)	Unique ID for exam
name	string	User-defined name
createdAt	number (timestamp)	Creation date
updatedAt	number (timestamp)	Last update
questionCount	number	Number of questions in exam
fileName	string	Original JSON filename
🗂 Table: questions

Stores questions for each exam.

Field	Type	Description
id	string (uuid)	Question UID
examId	string	Foreign key to exam
stem	string	Question text
options	array[string]	Always 6 options
answerIndex	number	Correct option index
category	string	Optional
drug	string	Optional
🧠 Why IndexedDB + Dexie.js?
✔ Works offline
✔ Supports large JSON exam files
✔ Fast and persistent
✔ Automatically works on deployed version
✔ No server required
✔ Perfect for mobile SPAs
✔ Zero backend cost
🧭 App Architecture (SPA)
Pages (internal SPA routes):

#/exams → List of exams

#/exam/:id → Take exam

#/review/:id → Review mode

#/marked/:id → Marked questions

#/import → Upload exam

#/score/:id → Final score

No page reloads.
All navigation is handled via JavaScript.

🖥 UI Components
Core components:

ExamCard

QuestionCard

OptionButton

ProgressBar

MarkQuestionButton

ToastComponent

ScoreCard

ModalComponent

AIExplanationModal

Tailwind utility classes used for styling.

🔔 Toast Notifications

Global toast API:

toast.success("Exam created!");
toast.error("Invalid JSON file.");
toast.info("Question marked!");

🎯 User Flow Summary

Upload JSON → create exam

Start exam

Answer → see correction

Navigate to next question

Mark questions while answering

Finish exam → see score

Review full exam or marked questions

Request AI explanation (optional)

🌐 Deployment

SPA can be deployed easily on:

GitHub Pages

Netlify

Vercel

No server required unless using AI explanations.

🎁 Optional Add-Ons

Timer mode

Randomized order

Difficulty filters

Dark mode

History of exam results

Cloud sync (with Firebase)
