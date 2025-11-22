const rosterURL = "https://jsonplaceholder.typicode.com/users?_limit=10"; //api for roster
const clockUrl = "https://worldtimeapi.org/api/timezone/Asia/Kolkata"; // api for world clock

//all major access in which we will feed the data
const providerSelect = document.getElementById("providerSelect");
const dateInput = document.getElementById("dateInput");
const loadSlotsBtn = document.getElementById("loadSlotsBtn");
const refreshBtn = document.getElementById("refreshBtn");
const slotsGrid = document.getElementById("slotsGrid");
const slotsHeadline = document.getElementById("slotsHeadline");
const slotMeta = document.getElementById("slotMeta");
const bookingsList = document.getElementById("bookingsList");
const clearBookingsBtn = document.getElementById("clearBookingsBtn");
const statProviders = document.getElementById("statProviders");
const statBookings = document.getElementById("statBookings");
const statClock = document.getElementById("statClock");
const lastSync = document.getElementById("lastSync");

//code for modal
const confirmModal = new bootstrap.Modal(
  document.getElementById("confirmModal")
);
const confirmTitle = document.getElementById("confirmTitle");
const confirmMeta = document.getElementById("confirmMeta");
const confirmBtn = document.getElementById("confirmBtn");
const notesInput = document.getElementById("notesInput");

//code for current state
const state = {
  providers: [],
  nowUtc: null,
  target: null,
  bookings: [],
  pendingSlot: null,
};

function saveBookings() {
  localStorage.setItem("quick-slots", JSON.stringify(state.bookings));
  statBookings.textContent = state.bookings.length; //update the booked slots
}

function readBookings() {
  state.bookings = JSON.parse(localStorage.getItem("quick-slots") || "[]");
}

//api calling
async function fetchProviders() {
  providerSelect.Disabled = true;
  providerSelect.innerHTML = `<option>Loading roster....</option>`;

  try {
    const res = await fetch(rosterURL);
    const data = await res.json();

    state.providers = data.map((person) => ({
      id: person.id,
      name: person.name,
      specialty: person.company?.bs || "General",
      city: person.address?.city || "remote",
    }));
    statProviders.textContent = state.providers.length;
    renderProviderSelect();
  } catch (err) {
    providerSelect.innerHTML = `<option>Error Loading name...</option>`;
    console.log(err);
  }
}
fetchProviders();

//render function
function renderProviderSelect() {
  providerSelect.disabled = false;
  providerSelect.innerHTML = `<option value =">Select Providers</option>`;

  state.providers.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.name} - ${p.specialty}`;
    providerSelect.appendChild(opt);
  });
}

//api call for clock

async function syncClock() {
  try {
    const res = await fetch(clockUrl);
    const data = await res.json();

    // Convert string date to JS Date()
    state.nowUtc = new Date(data.datetime);

    // Show time on UI
    statClock.textContent = state.nowUtc.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    lastSync.textContent = `Last synced ${new Date().toLocaleTimeString(
      "en-IN"
    )}`;
  } catch (err) {
    // fallback when time API fails
    console.warn("Clock sync failed, falling back to client time", err);

    state.nowUtc = new Date(); // local time
    statClock.textContent = state.nowUtc.toLocaleTimeString("en-IN");
    lastSync.textContent = `Fallback to client ${new Date().toLocaleTimeString(
      "en-IN"
    )}`;
  }
}
syncClock();

function setMinDate() {
  const today = new Date().toISOString.split("T")[0];
  dateInput.min = today;
  dateInput.value = today;
}

//slot builder from 9 to 5
function buildSlots(date) {
  const slots = [];

  for (let hour = 9; hour <= 17; hour++) {
    ["00", "30"].forEach((minute) => {
      const label = `${String(hour).padStart(2, "0")}:${minute}`; // 09:00, 09:30, etc.
      slots.push(label);
    });
  }

  // Convert each slot into an object with "disabled" flag
  return slots.map((label) => ({
    label,
    disabled: isSlotDisabled(date, label),
  }));
}

//disabled slot

function isSlotDisabled(date, slotLabel) {
  // Convert slot + date → JS Date()
  const targetDate = new Date(`${date}T${slotLabel}:00+05:30`);
  const now = state.nowUtc || new Date();

  // Rule 1: cannot book past times
  if (targetDate < now) return true;

  // Rule 2: cannot book already-booked slot for same provider
  const alreadyBooked = state.bookings.some(
    (item) =>
      item.date === date &&
      item.slot === slotLabel &&
      item.providerId === state.target?.providerId
  );

  return alreadyBooked;
}

function renderSlots(providerId, date) {
  const provider = state.providers.find((p) => p.id === Number(providerId));

  // If no provider or date selected → show placeholder
  if (!provider || !date) {
    slotsGrid.innerHTML = `<div class="col-12 text-center text-secondary">Select a provider and date to view availability.</div>`;
    return;
  }

  // Save current selection in global state
  state.target = { providerId: provider.id, providerName: provider.name, date };

  // Update header info
  slotsHeadline.textContent = `Slots for ${provider.name}`;
  slotMeta.textContent = `${new Date(
    date
  ).toDateString()} • refreshed ${new Date().toLocaleTimeString("en-IN")}`;

  const slots = buildSlots(date);

  slotsGrid.innerHTML = "";

  // Render each slot as a card
  slots.forEach((slot) => {
    const col = document.createElement("div");
    col.className = "col-6 col-xl-4";

    const card = document.createElement("div");
    card.className = `slot-card h-100 ${slot.disabled ? "disabled" : ""}`;
    card.innerHTML = `
      <div class="fw-semibold">${slot.label}</div>
      <div class="small text-secondary">${
        slot.disabled ? "Unavailable" : "Tap to book"
      }</div>
    `;

    // When available → clicking opens modal
    if (!slot.disabled) {
      card.onclick = () => openModal(provider, date, slot.label);
    }

    col.appendChild(card);
    slotsGrid.appendChild(col);
  });
}

//open modal
function openModal(provider, date, slotLabel) {
  state.pendingSlot = { provider, date, slotLabel };
  confirmTitle.textContent = provider.name;
  confirmMeta.textContent = `${date} . ${slotLabel} IST`;
  notesInput.value = "";
  confirmModal.show();
}

confirmBtn.addEventListener("click", () => {
  if (!state.pendingSlot) return;

  const payload = {
    id: crypto.randomUUID(),
    providerId: state.pendingSlot.provider.id,
    provider: state.pendingSlot.provider.name,
    specialty: state.pendingSlot.provider.specialty,
    date: state.pendingSlot.date,
    slot: state.pendingSlot.slotLabel,
    notes: notesInput.value.trim(),
  };
  state.bookings.push(payload);
  saveBookings();
  renderSlots(state.pendingSlot.provider.id, state.pendingSlot.date);
  readBookings();
  //   sendMail(payload) //u have to use SMTP and this is optional
  confirmModal.hide();
});

//booked appointments

function renderBookings() {
  bookingsList.innerHTML = "";

  // Empty state message
  if (!state.bookings.length) {
    bookingsList.innerHTML = `<div class="text-secondary small">No bookings yet.</div>`;
    return;
  }

  // Sort by date+time for clean ordering
  state.bookings
    .slice()
    .sort((a, b) => `${a.date}${a.slot}`.localeCompare(`${b.date}${b.slot}`))
    .forEach((booking) => {
      const card = document.createElement("div");
      card.className = "booking-card";

      card.innerHTML = `
        <div class="d-flex justify-content-between align-items-start gap-3">
          <div>
            <div class="fw-semibold">${booking.provider}</div>
            <div class="small text-secondary">${booking.date} · ${
        booking.slot
      }</div>
            <div class="small text-muted">${booking.notes || "No notes"}</div>
          </div>

          <button class="btn btn-sm btn-outline-danger" data-id="${booking.id}">
            <i class="bi bi-x"></i>
          </button>
        </div>
      `;

      // Remove booking on click
      card.querySelector("button").onclick = () => cancelBooking(booking.id);

      bookingsList.appendChild(card);
    });
}

//clear booking

clearBookingsBtn.addEventListener("click", () => {
  if (!state.bookings.length) return;

  if (confirm("clear all booking?")) {
    state.bookings = [];
    saveBookings();
    renderBookings();
    if (state.target) renderSlots(state.target.providerId, state.target.date);
  }
});

loadSlotsBtn.addEventListener("click", async () => {
  const providerId = providerSelect.value;
  const date = dateInput.value;

  if (!providerId || !date) {
    alert("please select the provider");
    return;
  }
  await syncClock();
  renderSlots(providerId, date);
});

//refresh btn

refreshBtn.addEventListener("click", async () => {
  await syncClock();
  if (state.target) renderSlots(state.target.providerId, state.target.date);
});

async function init() {
  readBookings();
  statBookings.textContent = state.bookings.length;
  setMinDate(); //prevent the user  selecting the past date

  await Promise.all([fetchProviders(), syncClock()]);
  readBookings();
}
document.addEventListener("DOMContentLoaded", init);
