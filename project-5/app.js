const rosterURL = "https://jsonplaceholder.typicode.com/users?_limit=10"; //api for roster
const clockURL = "https://worldtimeapi.org/api/timezone/Asia/Kolkata"; // api for world clock

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
