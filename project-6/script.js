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
