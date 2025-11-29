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

// ===== Render =====
function render() {
  const q = search.value.trim().toLowerCase();
  let out = tasks.slice();
  if (filterStatus.value === "active") out = out.filter((t) => !t.done);
  if (filterStatus.value === "completed") out = out.filter((t) => t.done);
  if (filterStatus.value === "due") {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    out = out.filter(
      (t) =>
        t.due &&
        new Date(t.due).getTime() - now <= day &&
        new Date(t.due).getTime() > now
    );
  }
  if (q)
    out = out.filter((t) =>
      (t.title + " " + (t.notes || "")).toLowerCase().includes(q)
    );

  // sort
  if (sortBy.value === "createdDesc")
    out.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (sortBy.value === "createdAsc")
    out.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  if (sortBy.value === "dueAsc")
    out.sort(
      (a, b) =>
        (a.due ? new Date(a.due).getTime() : Infinity) -
        (b.due ? new Date(b.due).getTime() : Infinity)
    );
  if (sortBy.value === "priorityHigh") {
    const map = { high: 0, medium: 1, low: 2 };
    out.sort((a, b) => map[a.priority] - map[b.priority]);
  }

  // render
  tasksNode.innerHTML = "";
  if (out.length === 0) {
    tasksNode.innerHTML =
      '<div class="small" style="opacity:0.7">No tasks yet — add one on the left.</div>';
  }
  out.forEach((t) => {
    const el = document.createElement("div");
    el.className = "task" + (t.done ? " completed" : "");
    const dueSoon =
      t.due &&
      new Date(t.due).getTime() - Date.now() <= 24 * 60 * 60 * 1000 &&
      new Date(t.due).getTime() > Date.now();
    el.innerHTML = `
          <div style="width:18px;flex:0 0 18px;margin-top:4px">
            <input type="checkbox" ${
              t.done ? "checked" : ""
            } aria-label="done" />
          </div>
          <div class="left">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div>
                <div class="title">${escapeHtml(t.title)}</div>
                <div class="meta">${
                  t.notes
                    ? escapeHtml(t.notes)
                    : '<span style="opacity:0.7">No details</span>'
                }</div>
              </div>
              <div class="actions">
                ${t.priority ? `<span class="chip">${t.priority}</span>` : ""}
                ${
                  t.due
                    ? `<span class="chip" title="Due">${fmtDateISO(
                        t.due
                      )}</span>`
                    : ""
                }
                ${
                  dueSoon
                    ? `<span class="chip" style="background:rgba(255,80,80,0.08);border:1px solid rgba(255,80,80,0.12);">Due soon</span>`
                    : ""
                }
                <button class="btn ghost" data-action="edit" title="Edit">Edit</button>
                <button class="btn ghost" data-action="delete" title="Delete">Delete</button>
              </div>
            </div>
            <div class="small">Created: ${fmtDateISO(t.createdAt)}</div>
          </div>
        `;

    // wire actions
    const chk = el.querySelector("input[type=checkbox]");
    chk.addEventListener("change", () => toggleDone(t.id));
    el.querySelector("[data-action=edit]").addEventListener("click", () =>
      editTask(t.id)
    );
    el.querySelector("[data-action=delete]").addEventListener("click", () =>
      removeTask(t.id)
    );

    tasksNode.appendChild(el);
  });

  countNode.textContent = tasks.length;
}

// escape for safety
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ===== Notifications =====
async function ensurePermission() {
  if (!("Notification" in window)) {
    alert("Notifications are not supported in this browser.");
    return false;
  }
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const p = await Notification.requestPermission();
  return p === "granted";
}

notifyPermBtn.addEventListener("click", async () => {
  const ok = await ensurePermission();
  notifyPermBtn.textContent = ok
    ? "Notifications enabled"
    : "Enable Notifications";
});

function sendNotification(title, body) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, silent: false });
  } catch (e) {
    console.warn("notify failed", e);
  }
}

// check reminders every 20 seconds for demo (use 60s+ in production)
setInterval(() => {
  const now = Date.now();
  tasks.forEach((t) => {
    if (t.due && !t.reminded) {
      const d = new Date(t.due).getTime();
      // remind when due time passed or within 60 seconds
      if (now >= d) {
        sendNotification("Task due: " + t.title, t.notes || "");
        t.reminded = true; // avoid duplicate
        t.updatedAt = new Date().toISOString();
        saveTasks();
      }
    }
  });
}, 20000);

// Save tasks when window unloads
window.addEventListener("beforeunload", saveTasks);

// search / filters events
[search, filterStatus, sortBy].forEach((el) =>
  el.addEventListener("input", render)
);

// initial render
render();

//dummy task
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

if (tasks.length === 0) {
  tasks.push({
    id: uid(), // Call the uid() function here
    title: "Welcome to Project-7",
    notes: "use the project 7 code to build the full project",
    priority: "high",
    due: null,
    done: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reminded: false,
  });
  saveTasks();
}
