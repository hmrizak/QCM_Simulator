const app = document.getElementById("app");
const toastRoot = document.getElementById("toast-root");
const aiModal = document.getElementById("ai-modal");
const aiModalBody = document.getElementById("ai-modal-body");
const closeAIModalBtn = document.getElementById("close-ai-modal");
const dismissAIModalBtn = document.getElementById("ai-modal-dismiss");

const db = new Dexie("QCMDatabase");
db.version(1).stores({
  exams: "id, name, createdAt, updatedAt, questionCount, fileName",
  questions: "id, examId, order"
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}

function initializeApp() {
  initRouter();
  attachModalHandlers();
}

function attachModalHandlers() {
  [closeAIModalBtn, dismissAIModalBtn].forEach((btn) =>
    btn.addEventListener("click", () => hideAIModal())
  );
  aiModal.addEventListener("click", (event) => {
    if (event.target === aiModal) {
      hideAIModal();
    }
  });
}

function showAIModal(question, correctAnswer) {
  aiModalBody.innerHTML = `
    <p class="text-sm text-slate-300">Analyzing question…</p>
  `;
  aiModal.classList.remove("hidden");
  aiModal.classList.add("flex");

  // Simulate async call
  setTimeout(() => {
    aiModalBody.innerHTML = `
      <div>
        <p class="text-slate-100 font-semibold">Question</p>
        <p class="text-slate-300 mt-1">${question}</p>
      </div>
      <div>
        <p class="text-slate-100 font-semibold">Correct answer</p>
        <p class="text-slate-300 mt-1">${correctAnswer}</p>
      </div>
      <div>
        <p class="text-slate-100 font-semibold">AI insight</p>
        <p class="text-slate-300 mt-1">
          Connect your own API endpoint to replace this demo response. Use the
          current question and the right answer to generate richer explanations.
        </p>
      </div>
    `;
  }, 900);
}

function hideAIModal() {
  aiModal.classList.add("hidden");
  aiModal.classList.remove("flex");
}

const toast = {
  show(type, message) {
    const colors = {
      success: "bg-emerald-500/90",
      error: "bg-rose-500/90",
      info: "bg-brand-600/90"
    };
    const icons = {
      success: "✅",
      error: "⚠️",
      info: "ℹ️"
    };

    const toastEl = document.createElement("div");
    toastEl.className = `toast-enter text-sm text-white px-4 py-3 rounded-2xl shadow-lg ${
      colors[type] || colors.info
    } flex items-center gap-2 max-w-md w-full`;
    toastEl.innerHTML = `<span>${icons[type] || icons.info}</span><p class="flex-1">${
      message || ""
    }</p>`;

    toastRoot.appendChild(toastEl);

    setTimeout(() => {
      toastEl.classList.remove("toast-enter");
      toastEl.classList.add("toast-leave");
      toastEl.addEventListener("animationend", () => toastEl.remove());
    }, 2800);
  },
  success(message) {
    this.show("success", message);
  },
  error(message) {
    this.show("error", message);
  },
  info(message) {
    this.show("info", message);
  }
};

function initRouter() {
  window.addEventListener("hashchange", renderRoute);
  if (!window.location.hash) {
    window.location.hash = "#/exams";
  } else {
    renderRoute();
  }
}

function parseRoute(hash) {
  const cleanHash = hash.replace(/^#/, "");
  if (!cleanHash) return { path: "/exams", params: {} };

  const segments = cleanHash.split("/").filter(Boolean);
  if (segments.length === 0) return { path: "/exams", params: {} };

  if (segments.length === 1) {
    return { path: `/${segments[0]}`, params: {} };
  }

  return { path: `/${segments[0]}/:id`, params: { id: segments[1] } };
}

async function renderRoute() {
  const { path, params } = parseRoute(window.location.hash);
  switch (path) {
    case "/exams":
      await renderExamList();
      break;
    case "/import":
      renderImportPage();
      break;
    case "/exam/:id":
      await renderExamPage(params.id);
      break;
    case "/score/:id":
      await renderScorePage(params.id);
      break;
    case "/review/:id":
      await renderReviewPage(params.id);
      break;
    case "/marked/:id":
      await renderReviewPage(params.id, { markedOnly: true });
      break;
    default:
      await renderExamList();
      break;
  }
}

function navigateTo(hash) {
  if (window.location.hash === hash) {
    renderRoute();
  } else {
    window.location.hash = hash;
  }
}

async function renderExamList() {
  const exams = await db.exams.orderBy("createdAt").reverse().toArray();
  app.innerHTML = `
    <section class="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <header class="flex items-center justify-between gap-4">
        <div>
          <p class="text-brand-100 uppercase tracking-widest text-xs">QCM Simulator</p>
          <h1 class="text-3xl font-semibold mt-2">Your exams</h1>
          <p class="text-slate-400 text-sm">Fully local. Nothing leaves this device.</p>
        </div>
        <button id="new-exam-btn" class="bg-brand-600 hover:bg-brand-500 transition px-4 py-2.5 rounded-2xl font-semibold">Import exam</button>
      </header>
      <div id="exam-list" class="grid gap-4"></div>
      ${
        exams.length === 0
          ? '<div class="text-center text-slate-400 border border-dashed border-slate-800 rounded-3xl py-12">No exams yet. Import your first JSON exam to get started.</div>'
          : ""
      }
    </section>
  `;

  document
    .getElementById("new-exam-btn")
    .addEventListener("click", () => navigateTo("#/import"));

  const listEl = document.getElementById("exam-list");
  exams.forEach((exam) => {
    const card = document.createElement("article");
    card.className =
      "bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 shadow-xl shadow-black/20";
    card.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <div>
          <p class="text-sm text-slate-400">${formatTimestamp(exam.createdAt)}</p>
          <h2 class="text-xl font-semibold mt-1">${exam.name}</h2>
          <p class="text-sm text-slate-400">${exam.questionCount} questions</p>
        </div>
        <div class="flex gap-2">
          <button class="rename-btn text-xs px-3 py-1.5 rounded-full border border-slate-700 hover:border-brand-500" data-id="${
            exam.id
          }">Rename</button>
          <button class="delete-btn text-xs px-3 py-1.5 rounded-full border border-rose-600 text-rose-300 hover:bg-rose-500/10" data-id="${
            exam.id
          }">Delete</button>
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <button class="primary-btn" data-action="start" data-id="${exam.id}">Take exam</button>
        <button class="secondary-btn" data-action="review" data-id="${exam.id}">Review</button>
      </div>
    `;

    card.querySelectorAll(".primary-btn, .secondary-btn").forEach((btn) => {
      btn.classList.add(
        "px-4",
        "py-2.5",
        "rounded-2xl",
        "font-semibold",
        "text-sm",
        "transition",
        "focus:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-brand-500"
      );
      if (btn.dataset.action === "start") {
        btn.classList.add("bg-brand-600", "hover:bg-brand-500");
      } else {
        btn.classList.add("bg-white/5", "hover:bg-white/10");
      }
    });

    card
      .querySelector(".primary-btn")
      .addEventListener("click", () => navigateTo(`#/exam/${exam.id}`));
    card
      .querySelector(".secondary-btn")
      .addEventListener("click", () => navigateTo(`#/review/${exam.id}`));

    card
      .querySelector(".rename-btn")
      .addEventListener("click", () => handleRenameExam(exam.id, exam.name));
    card
      .querySelector(".delete-btn")
      .addEventListener("click", () => handleDeleteExam(exam.id));

    listEl.appendChild(card);
  });
}

function renderImportPage() {
  app.innerHTML = `
    <section class="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <button class="text-sm text-brand-100 flex items-center gap-2" id="back-to-list">← Back to exams</button>
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl shadow-black/30">
        <header>
          <p class="text-brand-100 uppercase text-xs tracking-[0.4em]">Import</p>
          <h1 class="text-3xl font-semibold mt-2">Upload a QCM exam</h1>
          <p class="text-slate-400 text-sm mt-1">Everything happens locally in your browser. Large files are welcome.</p>
        </header>
        <form id="import-form" class="space-y-5">
          <label class="block">
            <span class="text-sm text-slate-300">Exam name</span>
            <input
              id="exam-name"
              type="text"
              placeholder="Traumatologie 2024"
              class="mt-2 w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              required
            />
          </label>
          <label class="block">
            <span class="text-sm text-slate-300">JSON file</span>
            <input
              id="exam-file"
              type="file"
              accept="application/json"
              class="mt-2 block w-full text-sm text-slate-400"
              required
            />
          </label>
          <button
            type="submit"
            class="w-full py-3 rounded-2xl font-semibold bg-brand-600 hover:bg-brand-500 transition"
          >
            Create exam
          </button>
        </form>
        <p class="text-xs text-slate-500">The JSON must contain an array of questions. Each question needs exactly 6 options and an answerIndex.</p>
      </div>
    </section>
  `;

  document
    .getElementById("back-to-list")
    .addEventListener("click", () => navigateTo("#/exams"));

  document.getElementById("import-form").addEventListener("submit", handleImportExam);
}

async function handleImportExam(event) {
  event.preventDefault();
  const fileInput = document.getElementById("exam-file");
  const nameInput = document.getElementById("exam-name");
  const file = fileInput.files[0];
  const examName = nameInput.value.trim();
  if (!examName) {
    toast.error("Give your exam a name");
    return;
  }
  if (!file) {
    toast.error("Choose a JSON file first");
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const questions = normalizeQuestions(parsed);
    if (!questions || questions.length === 0) {
      throw new Error("No questions found");
    }
    const examId = crypto.randomUUID ? crypto.randomUUID() : `exam-${Date.now()}`;
    const createdAt = Date.now();
    await db.transaction("rw", db.exams, db.questions, async () => {
      await db.exams.add({
        id: examId,
        name: examName,
        fileName: file.name,
        createdAt,
        updatedAt: createdAt,
        questionCount: questions.length
      });
      await db.questions.bulkAdd(
        questions.map((question, index) => ({
          id: crypto.randomUUID ? crypto.randomUUID() : `${examId}-${index}`,
          examId,
          order: index,
          ...question
        }))
      );
    });
    toast.success("Exam imported successfully");
    navigateTo("#/exams");
  } catch (error) {
    console.error(error);
    toast.error("Invalid JSON structure");
  }
}

function normalizeQuestions(payload) {
  if (!Array.isArray(payload)) {
    throw new Error("Exam JSON must be an array of questions");
  }

  return payload.map((raw, index) => {
    if (typeof raw !== "object" || raw === null) {
      throw new Error(`Question ${index + 1} is invalid`);
    }
    const options = Array.isArray(raw.options) ? raw.options.slice(0, 6) : [];
    while (options.length < 6) {
      options.push("n/a");
    }
    if (options.length !== 6) {
      throw new Error(`Question ${index + 1} must have exactly 6 options`);
    }
    if (typeof raw.answerIndex !== "number" || raw.answerIndex < 0 || raw.answerIndex > 5) {
      throw new Error(`Question ${index + 1} is missing a valid answerIndex`);
    }
    return {
      category: raw.category || "",
      drug: raw.drug || "",
      stem: raw.stem || "Untitled question",
      options,
      answerIndex: raw.answerIndex
    };
  });
}

async function handleRenameExam(id, currentName) {
  const nextName = prompt("New exam name", currentName || "");
  if (!nextName) return;
  const trimmed = nextName.trim();
  if (!trimmed) return;
  await db.exams.update(id, { name: trimmed, updatedAt: Date.now() });
  toast.success("Exam renamed");
  renderExamList();
}

async function handleDeleteExam(id) {
  const confirmed = confirm("Delete this exam? This action cannot be undone.");
  if (!confirmed) return;
  await db.transaction("rw", db.exams, db.questions, async () => {
    await db.questions.where("examId").equals(id).delete();
    await db.exams.delete(id);
    localStorage.removeItem(sessionKey(id));
  });
  toast.info("Exam deleted");
  renderExamList();
}

async function renderExamPage(examId) {
  const exam = await db.exams.get(examId);
  if (!exam) {
    app.innerHTML = renderNotFound();
    return;
  }
  const questions = await getExamQuestions(examId);
  if (questions.length === 0) {
    app.innerHTML = `
      <section class="max-w-3xl mx-auto px-4 py-10 space-y-4 text-center">
        <p class="text-slate-300">This exam has no questions yet.</p>
        <button class="px-5 py-3 rounded-2xl bg-brand-600" id="back-empty">Back to exams</button>
      </section>
    `;
    document
      .getElementById("back-empty")
      .addEventListener("click", () => navigateTo("#/exams"));
    return;
  }
  const session = loadSession(examId, questions.length);
  const currentIndex = Math.min(session.currentIndex, questions.length - 1);
  const question = questions[currentIndex];
  const answeredCount = session.answers.filter(Boolean).length;
  const progressPercentage = Math.round((answeredCount / questions.length) * 100);

  app.innerHTML = `
    <section class="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <button class="text-sm text-brand-100 flex items-center gap-2" id="back-to-exams">← Back to list</button>
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
        <header class="space-y-2">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p class="text-xs uppercase tracking-[0.4em] text-brand-100">Exam</p>
              <h1 class="text-2xl font-semibold">${exam.name}</h1>
              <p class="text-sm text-slate-400">Question ${currentIndex + 1} of ${
    questions.length
  }</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-slate-500">Progress</p>
              <p class="text-lg font-semibold">${progressPercentage}%</p>
            </div>
          </div>
          <div class="w-full bg-slate-800 rounded-full h-2">
            <div class="bg-brand-500 h-2 rounded-full" style="width: ${progressPercentage}%"></div>
          </div>
        </header>
        <article class="space-y-4">
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span>${question.category || "General"}</span>
            <span>${question.drug || "n/a"}</span>
          </div>
          <p class="text-lg leading-relaxed">${question.stem}</p>
          <div id="options" class="space-y-3"></div>
          <div id="correction"></div>
        </article>
        <div class="flex flex-wrap items-center gap-3">
          <button
            id="mark-question"
            class="flex-1 min-w-[140px] py-2.5 rounded-2xl font-semibold border ${
              session.marked.includes(currentIndex)
                ? "border-amber-400 text-amber-300 bg-amber-500/10"
                : "border-slate-700 text-slate-200 hover:border-brand-500"
            }"
          >
            ${session.marked.includes(currentIndex) ? "Marked" : "Mark question"}
          </button>
          <div class="flex-1 flex gap-2">
            <button
              id="prev-question"
              class="flex-1 py-2.5 rounded-2xl border border-slate-700 text-sm disabled:opacity-50"
              ${currentIndex === 0 ? "disabled" : ""}
            >
              Previous
            </button>
            <button
              id="next-question"
              class="flex-1 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ${currentIndex === questions.length - 1 ? "Finish exam" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </section>
  `;

  document
    .getElementById("back-to-exams")
    .addEventListener("click", () => navigateTo("#/exams"));

  const optionsContainer = document.getElementById("options");
  const correctionEl = document.getElementById("correction");
  const answerRecord = session.answers[currentIndex];

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = `w-full text-left px-4 py-3 rounded-2xl border text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
      answerRecord
        ? index === question.answerIndex
          ? "border-emerald-400 bg-emerald-500/10"
          : index === answerRecord.selectedIndex
          ? "border-rose-400 bg-rose-500/10"
          : "border-slate-700"
        : "border-slate-700 hover:border-brand-500"
    }`;
    button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
    button.dataset.index = index;
    if (!answerRecord) {
      button.addEventListener("click", () => handleAnswerSelection(examId, currentIndex, index));
    }
    optionsContainer.appendChild(button);
  });

  if (answerRecord) {
    const correctOption = question.options[question.answerIndex];
    correctionEl.innerHTML = `
      <div class="p-4 rounded-2xl ${
        answerRecord.isCorrect
          ? "bg-emerald-500/10 border border-emerald-400"
          : "bg-rose-500/10 border border-rose-400"
      }">
        <p class="font-semibold">
          ${answerRecord.isCorrect ? "Great!" : "Not quite."}
        </p>
        <p class="text-sm text-slate-200 mt-1">
          Correct answer: <span class="font-semibold">${correctOption}</span>
        </p>
        <button
          class="mt-3 text-sm font-semibold text-brand-200 underline"
          id="ask-ai"
        >
          Ask AI to explain
        </button>
      </div>
    `;
    document.getElementById("ask-ai").addEventListener("click", () =>
      showAIModal(question.stem, correctOption)
    );
  }

  document
    .getElementById("mark-question")
    .addEventListener("click", () => toggleMark(examId, currentIndex));

  document
    .getElementById("prev-question")
    .addEventListener("click", () => moveQuestion(examId, currentIndex - 1));

  const nextBtn = document.getElementById("next-question");
  if (!answerRecord) {
    nextBtn.disabled = true;
  }
  nextBtn.addEventListener("click", () => {
    if (!session.answers[currentIndex]) return;
    if (currentIndex === questions.length - 1) {
      finalizeExam(examId, questions.length);
    } else {
      moveQuestion(examId, currentIndex + 1);
    }
  });
}

async function handleAnswerSelection(examId, questionIndex, optionIndex) {
  const questions = await getExamQuestions(examId);
  const question = questions[questionIndex];
  const session = loadSession(examId, questions.length);
  session.answers[questionIndex] = {
    selectedIndex: optionIndex,
    isCorrect: optionIndex === question.answerIndex,
    answeredAt: Date.now()
  };
  session.updatedAt = Date.now();
  saveSession(examId, session);
  renderExamPage(examId);
}

async function moveQuestion(examId, nextIndex) {
  const questions = await getExamQuestions(examId);
  const session = loadSession(examId, questions.length);
  const safeIndex = Math.max(0, Math.min(nextIndex, questions.length - 1));
  session.currentIndex = safeIndex;
  saveSession(examId, session);
  renderExamPage(examId);
}

async function toggleMark(examId, questionIndex) {
  const questions = await getExamQuestions(examId);
  const session = loadSession(examId, questions.length);
  if (session.marked.includes(questionIndex)) {
    session.marked = session.marked.filter((idx) => idx !== questionIndex);
    toast.info("Question unmarked");
  } else {
    session.marked.push(questionIndex);
    toast.success("Question marked");
  }
  saveSession(examId, session);
  renderExamPage(examId);
}

async function finalizeExam(examId, totalQuestions) {
  const session = loadSession(examId, totalQuestions);
  const answered = session.answers.filter(Boolean);
  session.correctCount = answered.filter((answer) => answer.isCorrect).length;
  session.completed = true;
  session.completedAt = Date.now();
  saveSession(examId, session);
  navigateTo(`#/score/${examId}`);
}

async function renderScorePage(examId) {
  const exam = await db.exams.get(examId);
  if (!exam) {
    app.innerHTML = renderNotFound();
    return;
  }
  const session = loadSession(examId, exam.questionCount);
  if (!session.completed) {
    app.innerHTML = `
      <section class="max-w-xl mx-auto px-4 py-10 text-center space-y-4">
        <p class="text-slate-300">Finish the exam to view your score.</p>
        <button class="px-5 py-3 rounded-2xl bg-brand-600 font-semibold" id="return-to-exam">Back to exam</button>
      </section>
    `;
    document
      .getElementById("return-to-exam")
      .addEventListener("click", () => navigateTo(`#/exam/${examId}`));
    return;
  }

  const totalQuestions = exam.questionCount;
  const answered = session.answers.filter(Boolean).length;
  const correct = session.correctCount || 0;
  const incorrect = answered - correct;
  const unanswered = totalQuestions - answered;
  const percent = Math.round((correct / totalQuestions) * 100);

  app.innerHTML = `
    <section class="max-w-3xl mx-auto px-4 py-10 space-y-8 text-center">
      <h1 class="text-3xl font-semibold">${exam.name} – Score</h1>
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div>
          <p class="text-sm text-slate-400">Final score</p>
          <p class="text-5xl font-bold mt-2">${percent}%</p>
        </div>
        <div class="grid grid-cols-3 gap-4 text-sm">
          <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/60">
            <p class="text-emerald-200 text-xs uppercase tracking-wide">Correct</p>
            <p class="text-2xl font-semibold mt-2">${correct}</p>
          </div>
          <div class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/60">
            <p class="text-rose-200 text-xs uppercase tracking-wide">Incorrect</p>
            <p class="text-2xl font-semibold mt-2">${incorrect}</p>
          </div>
          <div class="p-4 rounded-2xl bg-slate-800 border border-slate-700">
            <p class="text-slate-300 text-xs uppercase tracking-wide">Unanswered</p>
            <p class="text-2xl font-semibold mt-2">${unanswered}</p>
          </div>
        </div>
        <div class="flex flex-col gap-3">
          <button class="w-full py-3 rounded-2xl bg-brand-600 font-semibold" id="review-all">Review full exam</button>
          <button
            class="w-full py-3 rounded-2xl bg-white/5 ${
              session.marked.length === 0 ? "opacity-40 cursor-not-allowed" : ""
            }"
            id="review-marked"
            ${session.marked.length === 0 ? "disabled" : ""}
          >
            Review marked questions
          </button>
          <button class="w-full py-3 rounded-2xl border border-slate-700" id="retake">Restart exam</button>
        </div>
      </div>
      <button class="text-sm text-brand-100" id="back-to-exams-from-score">Back to exams</button>
    </section>
  `;

  document
    .getElementById("review-all")
    .addEventListener("click", () => navigateTo(`#/review/${examId}`));
  const reviewMarkedBtn = document.getElementById("review-marked");
  if (session.marked.length > 0) {
    reviewMarkedBtn.addEventListener("click", () => navigateTo(`#/marked/${examId}`));
  }
  document
    .getElementById("retake")
    .addEventListener("click", async () => {
      resetSession(examId);
      toast.info("Session reset. Good luck!");
      navigateTo(`#/exam/${examId}`);
    });
  document
    .getElementById("back-to-exams-from-score")
    .addEventListener("click", () => navigateTo("#/exams"));
}

async function renderReviewPage(examId, { markedOnly = false } = {}) {
  const exam = await db.exams.get(examId);
  if (!exam) {
    app.innerHTML = renderNotFound();
    return;
  }
  const questions = await getExamQuestions(examId);
  const session = loadSession(examId, questions.length);
  const enriched = questions.map((question, index) => ({
    ...question,
    index,
    answer: session.answers[index] || null
  }));
  const filtered = markedOnly
    ? enriched.filter((item) => session.marked.includes(item.index))
    : enriched;

  app.innerHTML = `
    <section class="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div class="flex items-center justify-between">
        <button class="text-sm text-brand-100" id="back-from-review">← Back</button>
        <h1 class="text-xl font-semibold">${exam.name} – ${markedOnly ? "Marked" : "Review"}</h1>
      </div>
      <div id="review-list" class="space-y-4"></div>
      ${
        filtered.length === 0
          ? '<p class="text-center text-slate-400">No questions to display.</p>'
          : ""
      }
    </section>
  `;

  document
    .getElementById("back-from-review")
    .addEventListener("click", () => navigateTo("#/exams"));

  const listEl = document.getElementById("review-list");
  filtered.forEach((item) => {
    const card = document.createElement("article");
    card.className = "bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4";
    card.innerHTML = `
      <div class="text-xs text-slate-500 flex items-center justify-between">
        <span>Question ${item.index + 1}</span>
        <span>${item.category || "General"}</span>
      </div>
      <p class="text-base">${item.stem}</p>
      <div class="space-y-2">
        ${item.options
          .map((option, optionIndex) => {
            const isCorrect = optionIndex === item.answerIndex;
            const isSelected = item.answer?.selectedIndex === optionIndex;
            return `
              <div class="px-4 py-2 rounded-2xl border text-sm ${
                isCorrect
                  ? "border-emerald-400 bg-emerald-500/10"
                  : isSelected
                  ? "border-rose-400 bg-rose-500/10"
                  : "border-slate-800"
              }">
                ${String.fromCharCode(65 + optionIndex)}. ${option}
              </div>
            `;
          })
          .join("")}
      </div>
      <p class="text-sm text-slate-400">
        Your answer: ${item.answer ? String.fromCharCode(65 + item.answer.selectedIndex) : "—"}
      </p>
    `;
    listEl.appendChild(card);
  });
}

function renderNotFound() {
  return `
    <section class="min-h-screen flex items-center justify-center">
      <div class="text-center space-y-3">
        <h1 class="text-3xl font-semibold">Exam not found</h1>
        <button class="text-brand-100" onclick="window.location.hash='#/exams'">Back to list</button>
      </div>
    </section>
  `;
}

async function getExamQuestions(examId) {
  const questions = await db.questions.where("examId").equals(examId).toArray();
  return questions.sort((a, b) => a.order - b.order);
}

function sessionKey(examId) {
  return `qcm-session-${examId}`;
}

function loadSession(examId, questionCount = 0) {
  const existing = localStorage.getItem(sessionKey(examId));
  if (existing) {
    const parsed = JSON.parse(existing);
    parsed.answers = normalizeAnswerArray(parsed.answers, questionCount);
    parsed.marked = Array.isArray(parsed.marked)
      ? parsed.marked.filter((idx) => typeof idx === "number" && idx >= 0 && (!questionCount || idx < questionCount))
      : [];
    parsed.currentIndex = typeof parsed.currentIndex === "number" ? parsed.currentIndex : 0;
    parsed.completed = Boolean(parsed.completed);
    return parsed;
  }
  return {
    currentIndex: 0,
    answers: Array.from({ length: questionCount }, () => null),
    marked: [],
    completed: false
  };
}

function normalizeAnswerArray(existing, questionCount) {
  if (!Array.isArray(existing)) {
    return questionCount
      ? Array.from({ length: questionCount }, () => null)
      : [];
  }
  if (!questionCount) return existing;
  return Array.from({ length: questionCount }, (_, index) => existing[index] || null);
}

function saveSession(examId, session) {
  localStorage.setItem(sessionKey(examId), JSON.stringify(session));
}

function resetSession(examId) {
  localStorage.removeItem(sessionKey(examId));
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
