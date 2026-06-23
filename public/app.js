const state = {
  token: localStorage.getItem('medcontrol:token'),
  user: JSON.parse(localStorage.getItem('medcontrol:user') || 'null'),
  data: {
    pacientes: [],
    medicamentos: [],
    prescricoes: [],
    registros: [],
  },
};

const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

const endpoints = {
  login: '/auth/login',
  pacientes: '/api/pacientes',
  medicamentos: '/api/medicamentos',
  prescricoes: '/api/prescricoes',
  registros: '/api/registros-uso',
};

function getDoseMaxima(med) {
  return med.doseMaximaDiaria ?? med['doseMáximaDiaria'] ?? med['doseMÃ¡ximaDiaria'] ?? med['doseMÃƒÂ¡ximaDiaria'] ?? '-';
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function getUserRole() {
  return state.user?.role || state.user?.tipo || 'USER';
}

function showToast(message, type = 'success') {
  const toast = $('#toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  window.setTimeout(() => {
    toast.className = 'toast';
  }, 3200);
}

async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(path, { ...options, headers });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Nao foi possivel concluir a operacao');
  }

  return payload.data ?? payload;
}

function switchShell(isLoggedIn) {
  $('#loginView').hidden = isLoggedIn;
  $('#appView').hidden = !isLoggedIn;
}

async function login(event) {
  event.preventDefault();
  const email = $('#loginEmail').value.trim();
  const senha = $('#loginPassword').value;

  try {
    const data = await api(endpoints.login, {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });

    state.token = data.token;
    state.user = data.usuario;
    localStorage.setItem('medcontrol:token', state.token);
    localStorage.setItem('medcontrol:user', JSON.stringify(state.user));
    hydrateUser();
    switchShell(true);
    await loadAll();
    showToast('Login realizado com sucesso');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function logout() {
  localStorage.removeItem('medcontrol:token');
  localStorage.removeItem('medcontrol:user');
  state.token = null;
  state.user = null;
  switchShell(false);
}

function hydrateUser() {
  const name = state.user?.nome || state.user?.name || 'Usuario';
  const email = state.user?.email || '';
  $('#userName').textContent = name;
  $('#userEmail').textContent = email;
  $('#roleBadge').textContent = getUserRole();
  $('#userInitials').textContent = name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
}

async function loadResource(key, url) {
  try {
    state.data[key] = await api(url);
  } catch (error) {
    state.data[key] = [];
    showToast(error.message, 'error');
  }
}

async function loadAll() {
  await Promise.all([
    loadResource('pacientes', endpoints.pacientes),
    loadResource('medicamentos', endpoints.medicamentos),
    loadResource('prescricoes', endpoints.prescricoes),
    loadResource('registros', endpoints.registros),
  ]);
  renderAll();
}

function renderAll() {
  renderDashboard();
  renderPacientes();
  renderMedicamentos();
  renderPrescricoes();
  renderRegistros();
  syncAdminControls();
}

function syncAdminControls() {
  const isAdmin = getUserRole() === 'ADMIN';
  $$('[data-modal="paciente"], [data-modal="medicamento"]').forEach(button => {
    button.hidden = !isAdmin;
  });
}

function renderDashboard() {
  $('#metricPacientes').textContent = state.data.pacientes.length;
  $('#metricMedicamentos').textContent = state.data.medicamentos.length;
  $('#metricPrescricoes').textContent = state.data.prescricoes.length;
  $('#metricRegistros').textContent = state.data.registros.length;

  const vencidas = state.data.prescricoes.filter(item => item.dataFim && new Date(item.dataFim) < new Date());
  const interacoes = state.data.prescricoes.filter(item => item.alertas || item.interacoes?.length);
  const alerts = [
    ...interacoes.map(item => ({
      type: 'warning',
      title: 'Interacao medicamentosa',
      text: item.alertas?.mensagem || `${item.interacoes?.length || 1} interacao(oes) encontrada(s).`,
    })),
    ...vencidas.map(item => ({
      type: 'danger',
      title: 'Prescricao vencida',
      text: `Finalizada em ${formatDate(item.dataFim)}.`,
    })),
  ];

  $('#clinicalAlerts').innerHTML = (alerts.length ? alerts : [{
    type: 'success',
    title: 'Nenhum alerta critico',
    text: 'As prescricoes carregadas nao indicam bloqueios clinicos no momento.',
  }]).map(alert => `
    <div class="alert-item ${alert.type}">
      <strong>${alert.title}</strong>
      <p>${alert.text}</p>
    </div>
  `).join('');

  const activity = [
    ...state.data.registros.slice(0, 3).map(item => ({
      title: 'Registro de uso',
      text: `${formatDate(item.dataHora || item.takenAt)} - dose ${item.dosagem || item.dose || '-'}`
    })),
    ...state.data.prescricoes.slice(0, 2).map(item => ({
      title: 'Prescricao',
      text: `${item.frequencia || item.frequency || '-'}h de frequencia`
    })),
  ];

  $('#recentActivity').innerHTML = (activity.length ? activity : [{
    title: 'Sem atividade recente',
    text: 'Os novos registros aparecerao aqui.'
  }]).map(item => `
    <div class="activity-item">
      <strong>${item.title}</strong>
      <p>${item.text}</p>
    </div>
  `).join('');
}

function renderPacientes() {
  $('#pacientesTable').innerHTML = state.data.pacientes.map(item => `
    <tr>
      <td>${item.nome || item.name || '-'}</td>
      <td>${item.idade ?? item.age ?? '-'}</td>
      <td>${item.email || '-'}</td>
      <td class="actions">
        <button class="button ghost" data-view-only="${item.id}">Visualizar</button>
        <button class="button ghost" data-edit="paciente" data-id="${item.id}">Editar</button>
        <button class="button danger" data-delete="paciente" data-id="${item.id}">Excluir</button>
      </td>
    </tr>
  `).join('') || emptyRow(4);
}

function renderMedicamentos() {
  $('#medicamentosTable').innerHTML = state.data.medicamentos.map(item => `
    <tr>
      <td>${item.nome || item.name || '-'}</td>
      <td>${getDoseMaxima(item)}</td>
      <td>${item.intervaloMinimoHoras ?? item.minIntervalHours ?? '-'}h</td>
      <td>${item.unidade || item.unit || 'mg'}</td>
      <td class="actions">
        <button class="button ghost" data-edit="medicamento" data-id="${item.id}">Editar</button>
        <button class="button danger" data-delete="medicamento" data-id="${item.id}">Excluir</button>
      </td>
    </tr>
  `).join('') || emptyRow(5);
}

function renderPrescricoes() {
  const banner = $('#interactionBanner');
  const withInteraction = state.data.prescricoes.find(item => item.alertas || item.interacoes?.length);
  if (withInteraction) {
    banner.hidden = false;
    banner.className = 'clinical-banner warning';
    banner.innerHTML = `<strong>Interacao medicamentosa detectada</strong><p>${withInteraction.alertas?.mensagem || 'Revise os medicamentos combinados nesta prescricao.'}</p>`;
  } else {
    banner.hidden = true;
  }

  $('#prescricoesTable').innerHTML = state.data.prescricoes.map(item => `
    <tr>
      <td>${item.paciente?.nome || item.patient?.name || item.usuarioId || '-'}</td>
      <td>${item.medicamento?.nome || item.medication?.name || item.medicamentoId || '-'}</td>
      <td>${item.dosagem || item.dosage || '-'} ${item.unidade || item.unit || 'mg'}</td>
      <td>${item.frequencia || item.frequency || '-'}h</td>
      <td>${formatDate(item.dataInicio || item.startDate)}</td>
      <td>${formatDate(item.dataFim || item.endDate)}</td>
      <td class="actions">
        <button class="button danger" data-delete="prescricao" data-id="${item.id}">Excluir</button>
      </td>
    </tr>
  `).join('') || emptyRow(7);
}

function renderRegistros() {
  $('#registrosTable').innerHTML = state.data.registros.map(item => {
    const prescricao = item.prescricao || item.prescription || {};
    const medicamento = prescricao.medicamento || prescricao.medication || {};
    return `
      <tr>
        <td>${formatDate(item.dataHora || item.takenAt)}</td>
        <td>${medicamento.nome || medicamento.name || '-'}</td>
        <td>${item.dosagem || item.dose || '-'} ${medicamento.unidade || 'mg'}</td>
        <td>${item.prescricaoId || item.prescriptionId || '-'}</td>
        <td class="actions">
          <button class="button danger" data-delete="registro" data-id="${item.id}">Excluir</button>
        </td>
      </tr>
    `;
  }).join('') || emptyRow(5);
}

function emptyRow(columns) {
  return `<tr><td colspan="${columns}">Nenhum registro encontrado.</td></tr>`;
}

function setView(viewName) {
  $$('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === viewName));
  $$('.view').forEach(item => item.classList.toggle('active-view', item.id === viewName));
  const labels = {
    dashboard: ['Visao geral', 'Dashboard'],
    pacientes: ['Cadastro', 'Pacientes'],
    medicamentos: ['Farmacia clinica', 'Medicamentos'],
    prescricoes: ['Tratamentos', 'Prescricoes'],
    registros: ['Administracao', 'Registro de Uso'],
  };
  $('#sectionEyebrow').textContent = labels[viewName][0];
  $('#sectionTitle').textContent = labels[viewName][1];
}

function openModal(type, id = null) {
  const modal = $('#modalBackdrop');
  const form = $('#modalForm');
  const config = modalConfigs[type](id);
  $('#modalTitle').textContent = config.title;
  form.dataset.type = type;
  form.dataset.id = id || '';
  form.innerHTML = config.body + `
    <div class="modal-actions">
      <button class="button" type="button" id="cancelModal">Cancelar</button>
      <button class="button primary" type="submit">${config.submitLabel}</button>
    </div>
  `;
  modal.hidden = false;
}

const modalConfigs = {
  paciente: id => ({
    title: id ? 'Editar paciente' : 'Novo paciente',
    submitLabel: id ? 'Salvar alteracoes' : 'Cadastrar paciente',
    body: `
      <label>Nome<input name="nome" required /></label>
      <label>Email<input name="email" type="email" required /></label>
      <label>Idade<input name="idade" type="number" min="0" /></label>
      <label>Senha inicial<input name="senha" type="password" ${id ? '' : 'required'} /></label>
    `,
  }),
  medicamento: id => ({
    title: id ? 'Editar medicamento' : 'Novo medicamento',
    submitLabel: id ? 'Salvar alteracoes' : 'Cadastrar medicamento',
    body: `
      <label>Nome<input name="nome" required /></label>
      <label>Descricao<textarea name="descricao"></textarea></label>
      <label>Dose maxima diaria<input name="doseMaximaDiaria" type="number" min="1" required /></label>
      <label>Intervalo minimo em horas<input name="intervaloMinimoHoras" type="number" min="1" required /></label>
      <label>Unidade<input name="unidade" value="mg" required /></label>
    `,
  }),
  prescricao: () => ({
    title: 'Nova prescricao',
    submitLabel: 'Cadastrar prescricao',
    body: `
      <label>Paciente<select name="usuarioId" required>${state.data.pacientes.map(p => `<option value="${p.id}">${p.nome || p.name || p.email}</option>`).join('')}</select></label>
      <label>Medicamento<select name="medicamentoId" required>${state.data.medicamentos.map(m => `<option value="${m.id}">${m.nome || m.name}</option>`).join('')}</select></label>
      <label>Dosagem<input name="dosagem" type="number" min="1" required /></label>
      <label>Frequencia em horas<input name="frequencia" type="number" min="1" required /></label>
      <label>Data inicio<input name="dataInicio" type="datetime-local" required /></label>
      <label>Data fim<input name="dataFim" type="datetime-local" required /></label>
      <label>Observacoes<textarea name="notasAdicionais"></textarea></label>
    `,
  }),
  registro: () => ({
    title: 'Novo registro de uso',
    submitLabel: 'Registrar uso',
    body: `
      <label>Prescricao<select name="prescricaoId" required>${state.data.prescricoes.map(p => `<option value="${p.id}">${p.id}</option>`).join('')}</select></label>
      <label>Dose administrada<input name="dosagem" type="number" min="1" required /></label>
      <label>Data/Hora<input name="dataHora" type="datetime-local" required /></label>
      <label>Observacoes<textarea name="notas"></textarea></label>
    `,
  }),
};

function closeModal() {
  $('#modalBackdrop').hidden = true;
}

function formDataToObject(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  ['idade', 'dosagem', 'frequencia', 'doseMaximaDiaria', 'intervaloMinimoHoras'].forEach(key => {
    if (data[key] !== undefined && data[key] !== '') data[key] = Number(data[key]);
  });
  if (data.frequencia !== undefined) data.frequencia = `${data.frequencia}h`;
  if (data.dataInicio) data.dataInicio = new Date(data.dataInicio).toISOString();
  if (data.dataFim) data.dataFim = new Date(data.dataFim).toISOString();
  if (data.dataHora) data.dataHora = new Date(data.dataHora).toISOString();
  return data;
}

async function submitModal(event) {
  event.preventDefault();
  const type = event.currentTarget.dataset.type;
  const id = event.currentTarget.dataset.id;
  const body = formDataToObject(event.currentTarget);
  const configs = {
    paciente: { url: id ? `/api/users/${id}` : endpoints.pacientes, method: id ? 'PUT' : 'POST' },
    medicamento: { url: id ? `${endpoints.medicamentos}/${id}` : endpoints.medicamentos, method: id ? 'PUT' : 'POST' },
    prescricao: { url: endpoints.prescricoes, method: 'POST' },
    registro: { url: endpoints.registros, method: 'POST' },
  };

  try {
    const result = await api(configs[type].url, {
      method: configs[type].method,
      body: JSON.stringify(body),
    });
    if (result.alertas?.length || result.alertas?.detalhes?.length) {
      const banner = type === 'registro' ? $('#usageAlertBanner') : $('#interactionBanner');
      banner.hidden = false;
      banner.className = 'clinical-banner warning';
      banner.innerHTML = `<strong>Alerta clinico</strong><p>${JSON.stringify(result.alertas)}</p>`;
    }
    closeModal();
    await loadAll();
    showToast('Registro salvo com sucesso');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function deleteResource(type, id) {
  const map = {
    paciente: endpoints.pacientes,
    medicamento: endpoints.medicamentos,
    prescricao: endpoints.prescricoes,
    registro: endpoints.registros,
  };

  if (!window.confirm('Confirmar exclusao? O registro sera ocultado das listagens.')) return;

  try {
    await api(`${map[type]}/${id}`, { method: 'DELETE' });
    await loadAll();
    showToast('Exclusao realizada com sucesso');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function bindEvents() {
  $('#loginForm').addEventListener('submit', login);
  $('#logoutButton').addEventListener('click', logout);
  $('#closeModal').addEventListener('click', closeModal);
  $('#modalForm').addEventListener('submit', submitModal);
  $('#modalBackdrop').addEventListener('click', event => {
    if (event.target.id === 'modalBackdrop' || event.target.id === 'cancelModal') closeModal();
  });
  $$('.nav-item').forEach(item => item.addEventListener('click', () => setView(item.dataset.view)));
  document.addEventListener('click', event => {
    const modalButton = event.target.closest('[data-modal]');
    const deleteButton = event.target.closest('[data-delete]');
    const editButton = event.target.closest('[data-edit]');
    if (modalButton) openModal(modalButton.dataset.modal);
    if (deleteButton) deleteResource(deleteButton.dataset.delete, deleteButton.dataset.id);
    if (editButton) openModal(editButton.dataset.edit, editButton.dataset.id);
  });
  $('#globalSearch').addEventListener('input', event => {
    const value = event.target.value.toLowerCase();
    document.querySelectorAll('tbody tr').forEach(row => {
      row.hidden = value && !row.textContent.toLowerCase().includes(value);
    });
  });
}

async function init() {
  bindEvents();
  if (state.token && state.user) {
    hydrateUser();
    switchShell(true);
    await loadAll();
  }
}

init();
