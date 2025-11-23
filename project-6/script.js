//schema for resume
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

//DOM ACCESS

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

const collection = {};
const navButtons = new Map();
const templateButtons = new Map();
let sectionObserver;

//start function

startApp();
function startApp() {
  setupTemplates();
  buildForm();
  bindUI();
  setPreviewBg("plain");
  markTemplate(state.templateKey);
  drawPreview();
  refreshStats();
}

function setupTemplates() {
  templateSelect.innerHTML = "";
  if (!templatePills) {
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
  templateSelect.addEventListener("click", (e) => {
    state.templateKey = e.target.value;
    markTemplate(state.templateKey);
    drawPreview();
  });
}
