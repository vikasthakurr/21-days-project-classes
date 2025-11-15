// Add Project Form Logic
document
  .getElementById("saveProjectBtn")
  .addEventListener("click", function () {
    const name = document.getElementById("projectName").value.trim();
    const team = document.getElementById("projectTeam").value.trim();
    const progress = document.getElementById("projectProgress").value;
    const due = document.getElementById("projectDue").value;
    const desc = document.getElementById("projectDescription").value.trim();

    if (!name || !team || !progress || !due) {
      alert("Please fill all required fields!");
      return;
    }

    const projectHTML = `
            <div class="col-md-6 col-lg-4">
              <div class="card border-0 shadow-sm h-100">
                <div class="card-body">
                  <h6 class="fw-bold">${name}</h6>
                  <p class="text-muted mb-2">
                    Team: <strong>${team}</strong>
                  </p>
                  <div class="progress mb-2" style="height: 10px">
                    <div class="progress-bar bg-primary" style="width: ${progress}%"></div>
                  </div>
                  <small class="text-muted">${progress}% complete</small>
                  <p class="mt-2 small text-muted">${desc}</p>
                </div>
                <div class="card-footer bg-white border-0 d-flex justify-content-between">
                  <span><i class="fa-regular fa-calendar"></i> Due: ${due}</span>
                  <a href="#" class="btn btn-sm btn-outline-primary">View</a>
                </div>
              </div>
            </div>
          `;

    document
      .querySelector("#projects .row.g-4")
      .insertAdjacentHTML("beforeend", projectHTML);

    // Close modal and reset form
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("addProjectModal")
    );
    modal.hide();
    document.getElementById("addProjectForm").reset();
  });
