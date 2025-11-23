const schema = [
  {
    id: "identity",
    title: "Identity",
    fields: [
      {
        key: "fullName",
        label: "Full name",
        type: "text",
        placeholder: "Ada Lovelace",
      },
      {
        key: "role",
        label: "Professional title",
        type: "text",
        placeholder: "Computing Pioneer",
      },
      {
        key: "summary",
        label: "Summary",
        type: "textarea",
        placeholder: "2-3 sentence professional snapshot",
        rows: 3,
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    fields: [
      {
        key: "email",
        label: "Email",
        type: "email",
        placeholder: "ada@example.com",
      },
      { key: "phone", label: "Phone", type: "tel", placeholder: "+1 555 0100" },
      {
        key: "location",
        label: "Location",
        type: "text",
        placeholder: "London, UK",
      },
      {
        key: "website",
        label: "Portfolio / Website",
        type: "url",
        placeholder: "https://",
      },
    ],
  },
  {
    id: "skills",
    title: "Skills",
    fields: [
      {
        key: "skills",
        label: "Key skills (comma separated)",
        type: "text",
        placeholder: "Systems design, Data viz, Leadership",
      },
    ],
  },
  {
    id: "experience",
    title: "Experience",
    repeatable: true,
    fields: [
      { key: "company", label: "Company", type: "text" },
      { key: "title", label: "Role", type: "text" },
      {
        key: "period",
        label: "Period",
        type: "text",
        placeholder: "2022 - Present",
      },
      {
        key: "highlights",
        label: "Highlights (bullet per line)",
        type: "textarea",
        rows: 3,
      },
    ],
  },
  {
    id: "education",
    title: "Education",
    repeatable: true,
    fields: [
      { key: "school", label: "Institution", type: "text" },
      { key: "degree", label: "Degree", type: "text" },
      { key: "period", label: "Period", type: "text" },
      { key: "details", label: "Details", type: "textarea", rows: 2 },
    ],
  },
];

const templates = {
  minimal: {
    label: "Minimal",
    className: "template-minimal",
    render: (data) => `
      <header>
        <h1>${data.fullName || "Your Name"}</h1>
        <p class="text-muted">${data.role || "Title"}</p>
        <p>${joinValues(
          [data.email, data.phone, data.location, data.website],
          " · "
        )}</p>
      </header>
      <section>
        <h2>Summary</h2>
        <p>${data.summary || defaultSummary()}</p>
      </section>
      ${drawListSection(
        "Experience",
        data.experience,
        (item) => `
          <div class="mb-3">
            <strong>${item.title || "Role"}</strong> — ${
          item.company || "Company"
        }
            <div class="text-muted">${item.period || "Timeline"}</div>
            ${drawHighlights(item.highlights)}
          </div>
      `
      )}
      ${drawListSection(
        "Education",
        data.education,
        (item) => `
          <div class="mb-3">
            <strong>${item.degree || "Degree"}</strong>, ${
          item.school || "School"
        }
            <div class="text-muted">${item.period || "Timeline"}</div>
            <p>${item.details || ""}</p>
          </div>
      `
      )}
      ${drawSkills(data.skillsArray)}
    `,
  },
  card: {
    label: "Card",
    className: "template-card",
    render: (data) => `
      <header class="mb-4">
        <h1>${data.fullName || "Your Name"}</h1>
        <p class="lead mb-2">${data.role || "Title"}</p>
        <div class="d-flex flex-wrap gap-2 text-muted">
          ${drawBadges(
            cleanValues([data.email, data.phone, data.location, data.website])
          )}
        </div>
      </header>
      <section class="mb-4">
        <h2>About</h2>
        <p>${data.summary || defaultSummary()}</p>
      </section>
      <section class="mb-4">
        <h2>Experience</h2>
        ${drawCardList(
          data.experience,
          (item) => `
            <div>
              <div class="fw-semibold">${item.title || "Role"}</div>
              <div class="text-muted small">${item.company || "Company"} · ${
            item.period || "Timeline"
          }</div>
              ${drawHighlights(item.highlights)}
            </div>
        `
        )}
      </section>
      <section class="mb-4">
        <h2>Education</h2>
        ${drawCardList(
          data.education,
          (item) => `
            <div>
              <div class="fw-semibold">${item.degree || "Degree"}</div>
              <div class="text-muted small">${item.school || "School"} · ${
            item.period || "Timeline"
          }</div>
              <p class="mb-0">${item.details || ""}</p>
            </div>
        `
        )}
      </section>
      ${drawSkills(data.skillsArray)}
    `,
  },
};

const state = {
  data: {},
  templateKey: "minimal",
};

const EXPORT_STYLES = `
  body { font-family: "Inter","Segoe UI",system-ui,-apple-system,sans-serif; margin: 0; padding: 2rem; }
  h1 { font-size: 2rem; margin-bottom: 0.25rem; }
  h2 { font-size: 1.1rem; letter-spacing: 0.08em; text-transform: uppercase; color: #0d6efd; margin-top: 1.5rem; }
  ul { padding-left: 1.2rem; }
  .badge-skill { background: rgba(13,110,253,.12); color: #0d6efd; margin: 0.1rem; padding: 0.25rem 0.75rem; border-radius: 999px; display: inline-block; }
  .template-minimal { border-left: 4px solid #0d6efd; padding-left: 1.5rem; }
  .template-card { border: 1px solid #e9ecef; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.05); }
  .export-card { border: 1px solid #e9ecef; border-radius: .75rem; padding: 1rem; margin-bottom: 1rem; background: #f8f9fa; }
`;

const form = document.getElementById("resumeForm");
const preview = document.getElementById("resumePreview");
const templateSelect = document.getElementById("templateSelect");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");
const templatePills = document.getElementById("templatePills");
const templateCount = document.getElementById("templateCount");
const sectionCount = document.getElementById("sectionCount");
const fieldProgress = document.getElementById("fieldProgress");
const sectionNav = document.getElementById("sectionNav");
const liveMeta = document.getElementById("liveMeta");
const previewPane = document.querySelector(".preview-pane");
const previewBgButtons = document.querySelectorAll("[data-preview-bg]");
const themeToggle = document.getElementById("themeToggle");

const collections = {};
const navButtons = new Map();
const templateButtons = new Map();
let sectionObserver;

startApp();

function startApp() {
  // Role: bootstraps templates, form, bindings, and initial render.
  setupTemplates();
  buildForm();
  bindUI();
  setPreviewBg("plain");
  markTemplate(state.templateKey);
  drawPreview();
  refreshStats();
}

function setupTemplates() {
  // Role: fills template selector + pills and hooks template switching.
  templateSelect.innerHTML = "";
  if (templatePills) {
    templatePills.innerHTML = "";
  }

  Object.entries(templates).forEach(([key, template]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = template.label;
    templateSelect.appendChild(option);

    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "template-pill";
    pill.textContent = template.label;
    pill.addEventListener("click", () => {
      state.templateKey = key;
      templateSelect.value = key;
      markTemplate(key);
      drawPreview();
    });
    templatePills?.appendChild(pill);
    templateButtons.set(key, pill);
  });

  templateSelect.value = state.templateKey;
  templateSelect.addEventListener("change", (e) => {
    state.templateKey = e.target.value;
    markTemplate(state.templateKey);
    drawPreview();
  });
}

function buildForm() {
  // Role: builds schema-driven form sections and observers.
  sectionObserver = new IntersectionObserver(watchSections, {
    root: null, // root: null means the browser viewport acts as the observation root.
    threshold: 0.35, // threshold: callback fires when 35% of the section is visible.
  });

  schema.forEach((section) => {
    const wrapper = document.createElement("section");
    wrapper.className = "vstack gap-3 border-bottom pb-4";
    wrapper.dataset.section = section.id;
    wrapper.id = section.id;

    const heading = document.createElement("div");
    heading.className = "form-section-title";
    heading.textContent = section.title;
    wrapper.appendChild(heading);

    if (section.repeatable) {
      const collection = document.createElement("div");
      collection.className = "vstack gap-3";
      collection.dataset.collection = section.id;
      collections[section.id] = collection;
      wrapper.appendChild(collection);

      const controls = document.createElement("div");
      controls.className = "d-flex justify-content-end";
      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className = "btn btn-sm btn-outline-primary";
      addBtn.textContent = `Add ${section.title}`;
      addBtn.addEventListener("click", () => addRepeater(section, collection));
      controls.appendChild(addBtn);
      wrapper.appendChild(controls);

      addRepeater(section, collection);
    } else {
      const sectionBody = document.createElement("div");
      sectionBody.className = "vstack gap-3";
      section.fields.forEach((field) => {
        sectionBody.appendChild(buildField(section, field));
      });
      wrapper.appendChild(sectionBody);
    }

    form.appendChild(wrapper);
    addSectionLink(section);
    sectionObserver.observe(wrapper);
  });
}

function buildField(section, field, index = null) {
  // Role: creates a single input/textarea for the form schema.
  const fieldId =
    index !== null
      ? `${section.id}-${field.key}-${index}`
      : `${section.id}-${field.key}`;
  const container = document.createElement("div");

  const label = document.createElement("label");
  label.className = "form-label small text-uppercase text-muted";
  label.htmlFor = fieldId;
  label.textContent = field.label;

  let input;
  if (field.type === "textarea") {
    input = document.createElement("textarea");
    input.rows = field.rows || 4;
    input.className = "form-control";
  } else {
    input = document.createElement("input");
    input.type = field.type;
    input.className = "form-control";
  }
  input.placeholder = field.placeholder || "";
  input.id = fieldId;
  input.dataset.section = section.id;
  input.dataset.key = field.key;
  if (index !== null) {
    input.dataset.index = index;
  }
  input.addEventListener("input", handleInput);

  container.appendChild(label);
  container.appendChild(input);
  return container;
}

function handleInput(event) {
  // Role: syncs user input into state then refreshes preview stats.
  const { section, key, index } = event.target.dataset;
  const value = event.target.value;

  if (isRepeater(section)) {
    const idx = Number(index);
    state.data[section] = state.data[section] || [];
    state.data[section][idx] = state.data[section][idx] || {};
    state.data[section][idx][key] = value;
  } else {
    state.data[key] = value;
  }
  drawPreview();
  refreshStats();
}

function isRepeater(sectionId) {
  // Role: tells whether a schema section supports repeats.
  return schema.find((section) => section.id === sectionId)?.repeatable;
}

function addRepeater(section, collection) {
  // Role: inserts a repeatable section card with inputs.
  const index = collection.childElementCount;
  const card = document.createElement("div");
  card.className = "border rounded-3 p-3 bg-light position-relative";
  card.dataset.index = index;

  section.fields.forEach((field) => {
    card.appendChild(buildField(section, field, index));
  });

  if (index > 0) {
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn-close position-absolute top-0 end-0 m-2";
    removeBtn.addEventListener("click", () => removeRepeater(section.id, card));
    card.appendChild(removeBtn);
  }

  collection.appendChild(card);
}

function removeRepeater(sectionId, card) {
  const collection = card.parentElement;
  collection.removeChild(card);
  Array.from(collection.children).forEach((child, idx) => {
    child.dataset.index = idx;
    child.querySelectorAll("[data-index]").forEach((input) => {
      input.dataset.index = idx;
    });
  });
  if (state.data[sectionId]) {
    state.data[sectionId].splice(Number(card.dataset.index), 1);
  }
  drawPreview();
  refreshStats();
}

function drawPreview() {
  // Role: regenerates the resume preview pane HTML.
  const template = templates[state.templateKey];
  const prepared = prepareData();
  preview.className = `resume-preview ${template.className}`;
  preview.innerHTML = template.render(prepared);
  refreshMeta();
}

function prepareData() {
  // Role: normalizes state into template-friendly data.
  const payload = { ...state.data };
  payload.skillsArray = (payload.skills || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  payload.experience = (payload.experience || []).map((item = {}) => ({
    ...item,
    highlights: (item.highlights || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  }));

  payload.education = (payload.education || []).map((item = {}) => ({
    ...item,
  }));

  return payload;
}

function drawListSection(title, items = [], renderer) {
  // Role: renders a titled list-style resume section.
  if (!items.length) return "";
  return `
    <section>
      <h2>${title}</h2>
      ${items.map(renderer).join("")}
    </section>
  `;
}

function drawCardList(items = [], renderer) {
  if (!items.length)
    return `<p class="text-muted">Add entries in the form.</p>`;
  return items
    .map(
      (item) => `
      <div class="border rounded-3 p-3 mb-3 bg-light export-card">
        ${renderer(item)}
      </div>
    `
    )
    .join("");
}

function drawHighlights(highlights = []) {
  const filtered = (Array.isArray(highlights) ? highlights : [])
    .map((line) => line.trim())
    .filter(Boolean);
  if (!filtered.length) return "";
  return `
    <ul>
      ${filtered.map((line) => `<li>${line}</li>`).join("")}
    </ul>
  `;
}

function drawSkills(skills = []) {
  if (!skills?.length) return "";
  return `
    <section>
      <h2>Skills</h2>
      <div class="d-flex flex-wrap">
        ${skills
          .map(
            (skill) =>
              `<span class="badge rounded-pill badge-skill">${skill}</span>`
          )
          .join("")}
      </div>
    </section>
  `;
}

function drawBadges(items) {
  if (!items.length) return "";
  return items
    .map((item) => `<span class="badge text-bg-light">${item}</span>`)
    .join("");
}

function joinValues(values, separator = " ") {
  return values.filter(Boolean).join(separator);
}

function cleanValues(values = []) {
  return values.filter(Boolean);
}

function defaultSummary() {
  // Role: returns fallback copy for empty summaries.
  return "Seasoned professional focused on measurable business value and elegant systems.";
}

function bindUI() {
  if (templateCount) {
    templateCount.textContent = Object.keys(templates).length;
  }
  if (sectionCount) {
    sectionCount.textContent = schema.length;
  }

  previewBgButtons.forEach((btn) =>
    btn.addEventListener("click", () => setPreviewBg(btn.dataset.previewBg))
  );

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
}

function markTemplate(key) {
  // Role: highlights the active template pill button.
  templateButtons.forEach((pill, templateKey) => {
    pill.classList.toggle("active", templateKey === key);
  });
}

function addSectionLink(section) {
  // Role: adds a nav button for a form section.
  if (!sectionNav) return;
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = section.title;
  button.addEventListener("click", () => {
    document.getElementById(section.id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
  sectionNav.appendChild(button);
  navButtons.set(section.id, button);
}

function watchSections(entries) {
  // Role: tracks which section is within view.
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      setActiveSection(entry.target.id);
    }
  });
}

function setActiveSection(sectionId) {
  // Role: marks the nav button that is in view.
  navButtons.forEach((button, id) => {
    button.classList.toggle("active", id === sectionId);
  });
}

function setPreviewBg(mode) {
  // Role: changes preview background treatment.
  previewBgButtons.forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.previewBg === mode)
  );
  if (!previewPane) return;
  previewPane.classList.remove("grid", "slate");
  if (mode === "grid") {
    previewPane.classList.add("grid");
  }
  if (mode === "slate") {
    previewPane.classList.add("slate");
  }
}
