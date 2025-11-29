const LS_KEY = "taskmate.tasks.v1";
const form = document.getElementById("taskForm");
const titleIn = document.getElementById("title");
const notesIn = document.getElementById("notes");
const dueIn = document.getElementById("due");
const priorityIn = document.getElementById("priority");
const tasksNode = document.getElementById("tasks");
const search = document.getElementById("search");
const filterStatus = document.getElementById("filterStatus");
const sortBy = document.getElementById("sortBy");
const countNode = document.getElementById("count");
const editingId = document.getElementById("editingId");
const notifyPermBtn = document.getElementById("notifyPermBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

let tasks = loadTasks();

// ===== Storage helpers =====
function loadTasks() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("load error", e);
    return [];
  }
}
function saveTasks() {
  localStorage.setItem(LS_KEY, JSON.stringify(tasks));
  render();
}

// ===== Utilities =====
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function fmtDateISO(d) {
  try {
    const dt = new Date(d);
    if (isNaN(dt)) return "";
    return dt.toLocaleString();
  } catch (e) {
    return "";
  }
}

// ===== CRUD operations =====
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = titleIn.value.trim();
  if (!title) return titleIn.focus();
  const notes = notesIn.value.trim();
  const due = dueIn.value
    ? new Date(dueIn.value + "T00:00:00").toISOString()
    : null;
  const priority = priorityIn.value;
  const editing = editingId.value;

  if (editing) {
    // update
    const t = tasks.find((x) => x.id === editing);
    if (t) {
      t.title = title;
      t.notes = notes;
      t.due = due;
      t.priority = priority;
      t.updatedAt = new Date().toISOString();
    }
    editingId.value = "";
    document.getElementById("saveBtn").textContent = "Add Task";
  } else {
    const newTask = {
      id: uid(),
      title,
      notes,
      due,
      priority,
      done: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reminded: false,
    };
    tasks.unshift(newTask);
  }

  saveTasks();
  form.reset();
});

function editTask(id) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  titleIn.value = t.title;
  notesIn.value = t.notes || "";
  priorityIn.value = t.priority || "medium";
  if (t.due) {
    const dt = new Date(t.due);
    const pad = (n) => String(n).padStart(2, "0");
    const local =
      dt.getFullYear() + "-" + pad(dt.getMonth() + 1) + "-" + pad(dt.getDate());
    dueIn.value = local;
  } else {
    dueIn.value = "";
  }
  editingId.value = id;
  document.getElementById("saveBtn").textContent = "Save";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleDone(id) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  t.done = !t.done;
  t.updatedAt = new Date().toISOString();
  saveTasks();
}
function removeTask(id) {
  if (!confirm("Delete this task?")) return;
  tasks = tasks.filter((x) => x.id !== id);
  saveTasks();
}

function clearAll() {
  if (!confirm("Clear all tasks permanently?")) return;
  tasks = [];
  saveTasks();
}

clearAllBtn.addEventListener("click", clearAll);
