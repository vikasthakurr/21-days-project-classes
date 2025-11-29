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

const LS_KEY = "taskmate.tasks.v1";

let tasks = loadTask();

function loadTask() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.log("loading error", e);
    return [];
  }
}
function saveTasks() {
  localStorage.setItem(LS_KEY, JSON.stringify(tasks));
  render();
}

//unique id function
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function fmtDate(d) {
  try {
    const dt = new Date(d);
    if (isNaN(dt)) return "";
    return dt.toLocaleString();
  } catch (e) {
    return "";
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleIn.value.trim();
  if (!title) return titleIn.focus();

  const notes = notesIn.value.trim();

  const due = dueIn.value
    ? new Date(dueIn.value + "T00:00:00").toString()
    : null;

  const priority = priorityIn.value;
  const editing = editingId.value;

  if (editing) {
    const t = tasks.find((x) => x.id === editing);
    if (t) {
      t.title = title;
      t.notes = notes;
      t.due = due;
      t.priority = priority;
      t.updateAt = new Date().toISOString();
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
      updateAt: new Date().toISOString(),
      reminded: false,
    };
    tasks.unshift(newTask);
  }
  saveTasks();
  form.reset();
});
