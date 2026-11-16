const state = {
  users: [],
  search: "",
  deletingUser: null
};

const elements = {
  tableBody: document.querySelector("#users-table-body"),
  emptyState: document.querySelector("#empty-state"),
  totalUsers: document.querySelector("#total-users"),
  activeUsers: document.querySelector("#active-users"),
  inactiveUsers: document.querySelector("#inactive-users"),
  overview: document.querySelector("#overview"),
  usersSection: document.querySelector("#users"),
  navLinks: document.querySelectorAll(".nav-link"),
  searchInput: document.querySelector("#search-input"),
  newUserButton: document.querySelector("#new-user-button"),
  userModal: document.querySelector("#user-modal"),
  userForm: document.querySelector("#user-form"),
  formTitle: document.querySelector("#form-title"),
  formError: document.querySelector("#form-error"),
  userId: document.querySelector("#user-id"),
  name: document.querySelector("#name"),
  email: document.querySelector("#email"),
  login: document.querySelector("#login"),
  password: document.querySelector("#password"),
  passwordHelp: document.querySelector("#password-help"),
  active: document.querySelector("#active"),
  saveButton: document.querySelector("#save-user-button"),
  deleteModal: document.querySelector("#delete-modal"),
  deleteUserName: document.querySelector("#delete-user-name"),
  confirmDeleteButton: document.querySelector("#confirm-delete-button"),
  loadingOverlay: document.querySelector("#loading-overlay"),
  toast: document.querySelector("#toast")
};

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Não foi possível concluir a solicitação.");
  }

  return data;
}

function setLoading(visible) {
  elements.loadingOverlay.hidden = !visible;
}

let toastTimer;
function showToast(message, type = "success") {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.className = `toast ${type === "error" ? "error" : ""}`;
  elements.toast.hidden = false;
  toastTimer = setTimeout(() => {
    elements.toast.hidden = true;
  }, 3500);
}

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

function filteredUsers() {
  const term = state.search.trim().toLowerCase();
  if (!term) return state.users;

  return state.users.filter((user) => (
    user.name.toLowerCase().includes(term)
    || user.email.toLowerCase().includes(term)
    || user.login.toLowerCase().includes(term)
  ));
}

function render() {
  const users = filteredUsers();
  const activeCount = state.users.filter((user) => user.active).length;

  elements.totalUsers.textContent = state.users.length;
  elements.activeUsers.textContent = activeCount;
  elements.inactiveUsers.textContent = state.users.length - activeCount;
  elements.emptyState.hidden = users.length > 0;
  elements.tableBody.hidden = users.length === 0;

  elements.tableBody.innerHTML = users.map((user) => `
    <tr>
      <td>
        <span class="person-cell">
          <span class="avatar" aria-hidden="true">${escapeHtml(initials(user.name))}</span>
          ${escapeHtml(user.name)}
        </span>
      </td>
      <td>${escapeHtml(user.email)}</td>
      <td>${escapeHtml(user.login)}</td>
      <td>
        <span class="status-badge ${user.active ? "active" : "inactive"}">
          ${user.active ? "Ativo" : "Inativo"}
        </span>
      </td>
      <td class="actions-column">
        <span class="row-actions">
          <button class="icon-button" type="button" data-edit-id="${user.id}" aria-label="Editar ${escapeHtml(user.name)}">✎</button>
          <button class="icon-button delete" type="button" data-delete-id="${user.id}" aria-label="Excluir ${escapeHtml(user.name)}">⌫</button>
        </span>
      </td>
    </tr>
  `).join("");
}

function navigateToSection(sectionId) {
  const section = sectionId === "overview" ? elements.overview : elements.usersSection;
  if (!section) return;

  section.scrollIntoView({ behavior: "smooth", block: "start" });
  elements.navLinks.forEach((link) => {
    const isCurrent = link.getAttribute("href") === `#${sectionId}`;
    link.classList.toggle("active", isCurrent);
    link.toggleAttribute("aria-current", isCurrent);
  });

  if (sectionId === "overview") {
    section.classList.remove("section-highlight");
    window.setTimeout(() => section.classList.add("section-highlight"), 20);
    window.setTimeout(() => section.classList.remove("section-highlight"), 850);
  }
}

async function loadUsers() {
  setLoading(true);
  try {
    state.users = await request("/users");
    render();
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setLoading(false);
  }
}

function openCreateModal() {
  elements.userForm.reset();
  elements.userId.value = "";
  elements.active.checked = true;
  elements.password.required = true;
  elements.passwordHelp.textContent = "Obrigatória no cadastro.";
  elements.formTitle.textContent = "Novo usuário";
  elements.formError.hidden = true;
  elements.userModal.showModal();
}

function openEditModal(user) {
  elements.userForm.reset();
  elements.userId.value = user.id;
  elements.name.value = user.name;
  elements.email.value = user.email;
  elements.login.value = user.login;
  elements.active.checked = user.active;
  elements.password.required = false;
  elements.passwordHelp.textContent = "Deixe em branco para manter a senha atual.";
  elements.formTitle.textContent = "Editar usuário";
  elements.formError.hidden = true;
  elements.userModal.showModal();
}

function closeUserModal() {
  elements.userModal.close();
}

async function saveUser(event) {
  event.preventDefault();
  elements.formError.hidden = true;

  if (!elements.userForm.reportValidity()) {
    return;
  }

  const id = elements.userId.value;
  const payload = {
    name: elements.name.value,
    email: elements.email.value,
    login: elements.login.value,
    active: elements.active.checked,
    ...(elements.password.value ? { password: elements.password.value } : {})
  };

  elements.saveButton.disabled = true;
  elements.saveButton.textContent = "Salvando...";

  try {
    await request(id ? `/users/${id}` : "/users", {
      method: id ? "PATCH" : "POST",
      body: JSON.stringify(payload)
    });
    closeUserModal();
    await loadUsers();
    showToast(id ? "Usuário atualizado com sucesso." : "Usuário cadastrado com sucesso.");
  } catch (error) {
    elements.formError.textContent = error.message;
    elements.formError.hidden = false;
  } finally {
    elements.saveButton.disabled = false;
    elements.saveButton.textContent = "Salvar usuário";
  }
}

function openDeleteModal(user) {
  state.deletingUser = user;
  elements.deleteUserName.textContent = user.name;
  elements.deleteModal.showModal();
}

async function deleteUser() {
  if (!state.deletingUser) return;

  elements.confirmDeleteButton.disabled = true;
  elements.confirmDeleteButton.textContent = "Excluindo...";

  try {
    await request(`/users/${state.deletingUser.id}`, { method: "DELETE" });
    elements.deleteModal.close();
    state.deletingUser = null;
    await loadUsers();
    showToast("Usuário excluído com sucesso.");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    elements.confirmDeleteButton.disabled = false;
    elements.confirmDeleteButton.textContent = "Sim, excluir";
  }
}

elements.newUserButton.addEventListener("click", openCreateModal);
elements.userForm.addEventListener("submit", saveUser);
elements.searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  render();
});

elements.navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    navigateToSection(link.getAttribute("href").slice(1));
  });
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", closeUserModal);
});

document.querySelectorAll("[data-close-delete]").forEach((button) => {
  button.addEventListener("click", () => elements.deleteModal.close());
});

elements.confirmDeleteButton.addEventListener("click", deleteUser);

elements.tableBody.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-id]");
  const deleteButton = event.target.closest("[data-delete-id]");

  if (editButton) {
    const user = state.users.find((item) => item.id === editButton.dataset.editId);
    if (user) openEditModal(user);
  }

  if (deleteButton) {
    const user = state.users.find((item) => item.id === deleteButton.dataset.deleteId);
    if (user) openDeleteModal(user);
  }
});

loadUsers();
