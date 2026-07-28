// ==========================================
// DADOS DE EXEMPLO (SUBSTITUA PELOS SEUS DADOS OU FIREBASE)
// ==========================================
let frota = [
  { id: 1, tag: "CAT-01", categoria: "Equipamentos", horimetro: 1248.5, status: "ATIVO", local: "MINA", ultPreventiva: "1200.0", proxPreventiva: "1400.0", horasParado: 0, problemas: "" },
  { id: 2, tag: "CAM-05", categoria: "Caminhões", horimetro: 85200, status: "MANUTENÇÃO", local: "CIDADE", ultPreventiva: "80000", proxPreventiva: "90000", horasParado: 14.5, problemas: "Troca dos reparos do pistão e pastilhas." },
  { id: 3, tag: "AMAR-02", categoria: "Caminhonetes", horimetro: 45100, status: "ATIVO", local: "MINA", ultPreventiva: "40000", proxPreventiva: "50000", horasParado: 0, problemas: "" }
];

let colaboradores = [
  { id: 1, matricula: "GF-101", nome: "Marcos Antônio", setor: "Nucleação", cargo: "Operador de Máquinas" },
  { id: 2, matricula: "GF-102", nome: "José Oliveira", setor: "Manutenção", cargo: "Mecânico A" },
  { id: 3, matricula: "GF-103", nome: "Sérgio Pereira", setor: "Supressão", cargo: "Motosserrista" },
  { id: 4, matricula: "GF-104", nome: "Raimundo Nonato", setor: "Romaneio", cargo: "Conferente" }
];

let pedidosEPI = [
  { id: 1, colabId: 1, tipo: "EPI", descricao: "1 Botina Nº 42, 1 Óculos Proteção", data: "25/07/2026", motivo: "Substituição por desgaste" }
];

let registrosDiarios = [
  { data: "27/07/2026 - 07:00", tag: "CAT-01", operador: "João Silva", horimIni: 1240.0, horimFim: 1248.5, total: 8.5, local: "MINA" }
];

let filtroCategoriaAtual = "TODOS";
let filtroSetorAtual = "TODOS";

// ==========================================
// INICIALIZAÇÃO DA PÁGINA
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  renderDiaria();
  renderManutencao();
  renderColaboradores();
  popularDropdowns();
});

// ==========================================
// TROCA DE ABAS
// ==========================================
function switchTab(tabId) {
  // Remove classe ativa das abas e conteúdos
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  // Adiciona na aba clicada
  if (window.event && window.event.currentTarget) {
    window.event.currentTarget.classList.add('active');
  }
  
  const targetContent = document.getElementById(`tab-${tabId}`);
  if (targetContent) {
    targetContent.classList.add('active');
  }
}

// ==========================================
// CONTROLADOR DE MODAIS (POP-UPS)
// ==========================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}

// ==========================================
// RENDERIZAR TABELAS
// ==========================================
function renderDiaria() {
  const tbody = document.getElementById("lista-diaria-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  registrosDiarios.forEach(r => {
    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.data}</td>
      <td><strong>${r.tag}</strong></td>
      <td>${r.operador}</td>
      <td>${r.horimIni}</td>
      <td>${r.horimFim}</td>
      <td><strong>${r.total} h</strong></td>
      <td><span class="pill">${r.local === 'MINA' ? '⛏️ Mina' : '🏙️ Cidade'}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderManutencao() {
  const tbody = document.getElementById("lista-manutencao-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  frota.forEach((item, index) => {
    if (filtroCategoriaAtual !== "TODOS" && item.categoria !== filtroCategoriaAtual) return;

    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${item.tag}</strong></td>
      <td>${item.categoria}</td>
      <td><strong>${item.horimetro}</strong></td>
      <td><span style="color:${item.status === 'ATIVO' ? '#15803d' : '#b91c1c'}; font-weight:bold;">${item.status}</span></td>
      <td>${item.local === 'MINA' ? '⛏️ Mina' : '🏙️ Cidade'}</td>
      <td>${item.ultPreventiva}</td>
      <td>${item.proxPreventiva}</td>
      <td><strong style="color:#b91c1c;">${item.horasParado} h</strong></td>
      <td>
        <button class="btn-action btn-blue" style="padding:0.3rem 0.6rem; font-size:0.75rem;" onclick="abrirModalManutencao(${index})">
          <i class="fa-solid fa-pen"></i> Alterar
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderColaboradores() {
  const tbody = document.getElementById("lista-colaboradores-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  colaboradores.forEach(c => {
    if (filtroSetorAtual !== "TODOS" && c.setor !== filtroSetorAtual) return;

    const pedidos = pedidosEPI.filter(p => p.colabId === c.id);

    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${c.matricula}</strong></td>
      <td>${c.nome}</td>
      <td><span class="pill">${c.setor}</span></td>
      <td>${c.cargo}</td>
      <td>${pedidos.length} pedido(s)</td>
      <td>
        <button class="btn-action btn-dark" style="padding:0.3rem 0.6rem; font-size:0.75rem;" onclick="removerColaborador(${c.id})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================================
// FILTROS
// ==========================================
function filterCategory(cat) {
  filtroCategoriaAtual = cat;
  document.querySelectorAll('.filter-pills .pill').forEach(btn => btn.classList.remove('active'));
  if (window.event && window.event.target) window.event.target.classList.add('active');
  renderManutencao();
}

function filterSector(setor) {
  filtroSetorAtual = setor;
  document.querySelectorAll('.sector-filters .pill-sector').forEach(btn => btn.classList.remove('active'));
  if (window.event && window.event.target) window.event.target.classList.add('active');
  renderColaboradores();
}

// ==========================================
// UTILITÁRIOS & DROPDOWNS
// ==========================================
function popularDropdowns() {
  const selectTag = document.getElementById("diaria-select-tag");
  if (selectTag) {
    selectTag.innerHTML = frota.map(item => `<option value="${item.tag}">${item.tag} - (${item.categoria})</option>`).join('');
  }
}

function salvarApontamento(e) {
  e.preventDefault();
  const tag = document.getElementById("diaria-select-tag").value;
  const op = document.getElementById("diaria-operador").value;
  const ini = parseFloat(document.getElementById("diaria-horim-ini").value);
  const fim = parseFloat(document.getElementById("diaria-horim-fim").value);
  const total = (fim - ini).toFixed(1);

  const agora = new Date();
  const dataStr = agora.toLocaleDateString('pt-BR') + ' - ' + agora.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});

  registrosDiarios.unshift({
    data: dataStr,
    tag: tag,
    operador: op,
    horimIni: ini,
    horimFim: fim,
    total: total,
    local: "MINA"
  });

  renderDiaria();
  closeModal('modal-apontamento');
}

function removerColaborador(id) {
  if (confirm("Deseja realmente remover este colaborador?")) {
    colaboradores = colaboradores.filter(c => c.id !== id);
    renderColaboradores();
  }
}
