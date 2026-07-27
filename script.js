// DATA BASE FICTÍCIA / PERSISTÊNCIA INICIAL
let frota = [
  { id: 1, tag: "CAT-01", categoria: "MÁQUINAS AMARAL", horimetro: 1248.5, status: "ATIVO", local: "MINA", ultPreventiva: "1200.0", proxPreventiva: "1400.0", horasParado: 0, problemas: "" },
  { id: 2, tag: "CAM-05", categoria: "CAMINHÕES", horimetro: 85200, status: "MANUTENÇÃO", local: "CIDADE", ultPreventiva: "80000", proxPreventiva: "90000", horasParado: 14.5, problemas: "Troca dos reparos do pistão e substituição das pastilhas de freio." },
  { id: 3, tag: "AMAR-02", categoria: "VEÍCULOS LEVES", horimetro: 45100, status: "ATIVO", local: "MINA", ultPreventiva: "40000", proxPreventiva: "50000", horasParado: 0, problemas: "" }
];

let colaboradores = [
  { id: 1, matricula: "GF-101", nome: "Marcos Antônio", setor: "Nucleação", cargo: "Operador de Máquinas" },
  { id: 2, matricula: "GF-102", nome: "José Oliveira", setor: "Manutenção", cargo: "Mecânico A" },
  { id: 3, matricula: "GF-103", nome: "Sérgio Pereira", setor: "Supressão", cargo: "Motosserrista" },
  { id: 4, matricula: "GF-104", nome: "Raimundo Nonato", setor: "Romaneio", cargo: "Conferente" }
];

let pedidosEPI = [
  { id: 1, colabId: 1, tipo: "EPI", descricao: "1 Botina de Segurança Nº 42, 1 Óculos Proteção", data: "25/07/2026", motivo: "Substituição por desgaste" },
  { id: 2, colabId: 2, tipo: "UNIFORME", descricao: "2 Camisas M, 2 Calças Tam 42", data: "26/07/2026", motivo: "Uniforme novo anual" }
];

let filtroManut = "TODOS";
let filtroSetorColab = "TODOS";

// INICIALIZAÇÃO DA PÁGINA
document.addEventListener("DOMContentLoaded", () => {
  renderManutencao();
  renderColaboradores();
  popularDropdowns();
});

// MUDANÇA DE ABAS
function switchTab(tabId) {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

  event.currentTarget.classList.add('active');
  document.getElementById(`tab-${tabId}`).classList.add('active');
}

// ABRIR E FECHAR MODAIS
function openModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// POPULAR DROPDOWNS DADOS
function popularDropdowns() {
  const selectTag = document.getElementById("diaria-tag");
  selectTag.innerHTML = frota.map(item => `<option value="${item.tag}">${item.tag} - (${item.categoria})</option>`).join('');

  const selectColab = document.getElementById("pedido-colaborador-id");
  selectColab.innerHTML = colaboradores.map(c => `<option value="${c.id}">${c.matricula} - ${c.nome} (${c.setor})</option>`).join('');
}

// ==========================================
// RENDERIZAÇÃO: MANUTENÇÃO
// ==========================================
function renderManutencao() {
  const tbody = document.getElementById("lista-manutencao");
  tbody.innerHTML = "";

  let ativos = 0, parados = 0;

  frota.forEach((item, index) => {
    if (filtroManut !== "TODOS" && item.categoria !== filtroManut) return;

    if (item.status === "ATIVO") ativos++;
    if (item.status === "MANUTENÇÃO") parados++;

    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${item.tag}</strong></td>
      <td>${item.categoria}</td>
      <td><strong>${item.horimetro}</strong> h/km</td>
      <td><span class="badge ${item.status === 'ATIVO' ? 'badge-ativo' : 'badge-manutencao'}">${item.status}</span></td>
      <td><span class="badge ${item.local === 'MINA' ? 'badge-mina' : 'badge-cidade'}">${item.local === 'MINA' ? '⛏️ Mina' : '🏙️ Cidade'}</span></td>
      <td>${item.ultPreventiva} / <strong>${item.proxPreventiva}</strong></td>
      <td><strong style="color:var(--danger-red)">${item.horasParado} h</strong></td>
      <td>
        <button class="btn-action-sm btn-edit" onclick="abrirModalManutCodigo(${index})"><i class="fa-solid fa-wrench"></i> Alterar</button>
        <button class="btn-action-sm btn-os" onclick="gerarOSDireta(${index})"><i class="fa-solid fa-file-lines"></i> O.S.</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("stat-manut-total").innerText = frota.length;
  document.getElementById("stat-manut-ativos").innerText = ativos;
  document.getElementById("stat-manut-parados").innerText = parados;
}

function filtrarManutencao(categoria) {
  filtroManut = categoria;
  document.querySelectorAll('#tab-manutencao .btn-filter').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  renderManutencao();
}

function abrirModalManutCodigo(index) {
  const item = frota[index];
  document.getElementById("manut-modal-index").value = index;
  document.getElementById("manut-modal-tag-title").innerText = item.tag;
  document.getElementById("manut-modal-problemas").value = item.problemas;
  document.getElementById("manut-modal-horas-parado").value = item.horasParado;
  document.getElementById("manut-modal-local").value = item.local;
  document.getElementById("manut-modal-status").value = item.status;

  openModal("modal-manutencao-codigo");
}

function salvarManutencaoCodigo(e) {
  e.preventDefault();
  const index = document.getElementById("manut-modal-index").value;
  frota[index].problemas = document.getElementById("manut-modal-problemas").value;
  frota[index].horasParado = parseFloat(document.getElementById("manut-modal-horas-parado").value);
  frota[index].local = document.getElementById("manut-modal-local").value;
  frota[index].status = document.getElementById("manut-modal-status").value;

  closeModal("modal-manutencao-codigo");
  renderManutencao();
}

// GERAR ORDEM DE SERVIÇO (O.S.)
function gerarOSDireta(index) {
  const item = frota[index];
  const hoje = new Date().toLocaleDateString('pt-BR');
  const hora = new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

  const area = document.getElementById("area-impressao-conteudo");
  area.innerHTML = `
    <div class="print-header">
      <h2>GRUPO FIUZA DIGITAL - ORDEM DE SERVIÇO DE MANUTENÇÃO</h2>
      <p>Setor de Oficina e Manutenção Mecânica</p>
    </div>
    <div class="print-info-grid">
      <div><strong>TAG / Equipamento:</strong> ${item.tag}</div>
      <div><strong>Data de Abertura:</strong> ${hoje} às ${hora}</div>
      <div><strong>Categoria:</strong> ${item.categoria}</div>
      <div><strong>Horímetro / KM Atual:</strong> ${item.horimetro}</div>
      <div><strong>Localização:</strong> ${item.local === 'MINA' ? 'Na Mina' : 'Na Cidade / Oficina'}</div>
      <div><strong>Horas Indisponível/Parado:</strong> ${item.horasParado} h</div>
    </div>
    <div class="print-box">
      <h4>📋 Lista de Defeitos / Falhas Encontradas:</h4>
      <p style="margin-top: 0.5rem; font-size: 0.95rem; font-style: italic;">${item.problemas || 'Nenhum defeito detalhado.'}</p>
    </div>
    <div class="print-box">
      <h4>📝 Observações e Peças Substituídas:</h4>
      <br><br><br>
    </div>
    <div class="print-signatures">
      <div>____________________________________<br><strong>Sr. Osvaldo (Chefe de Manutenção)</strong></div>
      <div>____________________________________<br><strong>Mecânico / Operador Responsável</strong></div>
    </div>
  `;

  document.getElementById("print-modal-title").innerText = `Ordem de Serviço (O.S.) - ${item.tag}`;
  openModal("modal-impressao");
}

function gerarOSFromModal() {
  const index = document.getElementById("manut-modal-index").value;
  closeModal("modal-manutencao-codigo");
  gerarOSDireta(index);
}

// ==========================================
// RENDERIZAÇÃO: COLABORADORES E EPIS
// ==========================================
function renderColaboradores() {
  const tbody = document.getElementById("lista-colaboradores");
  tbody.innerHTML = "";

  colaboradores.forEach(c => {
    if (filtroSetorColab !== "TODOS" && c.setor !== filtroSetorColab) return;

    // Buscar pedidos deste colaborador
    const pedidosColab = pedidosEPI.filter(p => p.colabId === c.id);
    const qtdPedidos = pedidosColab.length;

    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${c.matricula}</strong></td>
      <td>${c.nome}</td>
      <td><span class="badge badge-sector">${c.setor}</span></td>
      <td>${c.cargo}</td>
      <td>
        ${qtdPedidos > 0 
          ? `<span class="badge badge-ativo">${qtdPedidos} pedido(s)</span>` 
          : `<span style="color:var(--text-muted); font-size:0.8rem;">Nenhum pedido</span>`}
      </td>
      <td>
        ${qtdPedidos > 0 ? `<button class="btn-action-sm btn-os" onclick="relatorioIndividualColab(${c.id})"><i class="fa-solid fa-print"></i> Ver Pedido</button>` : ''}
        <button class="btn-action-sm btn-delete" onclick="removerColaborador(${c.id})"><i class="fa-solid fa-trash"></i> Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("stat-colab-total").innerText = colaboradores.length;
  document.getElementById("stat-pedidos-total").innerText = pedidosEPI.length;
}

function filtrarSetor(setor) {
  filtroSetorColab = setor;
  document.querySelectorAll('#tab-colaboradores .btn-filter').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  renderColaboradores();
}

function salvarNovoColaborador(e) {
  e.preventDefault();
  const novo = {
    id: Date.now(),
    matricula: document.getElementById("colab-matricula").value,
    nome: document.getElementById("colab-nome").value,
    setor: document.getElementById("colab-setor").value,
    cargo: document.getElementById("colab-cargo").value
  };
  colaboradores.push(novo);
  closeModal("modal-add-colaborador");
  popularDropdowns();
  renderColaboradores();
}

function removerColaborador(id) {
  if (confirm("Tem certeza que deseja remover este colaborador?")) {
    colaboradores = colaboradores.filter(c => c.id !== id);
    pedidosEPI = pedidosEPI.filter(p => p.colabId !== id);
    popularDropdowns();
    renderColaboradores();
  }
}

function salvarPedidoEPI(e) {
  e.preventDefault();
  const colabId = parseInt(document.getElementById("pedido-colaborador-id").value);
  const novoPedido = {
    id: Date.now(),
    colabId: colabId,
    tipo: document.getElementById("pedido-tipo-item").value,
    descricao: document.getElementById("pedido-descricao").value,
    data: new Date().toLocaleDateString('pt-BR'),
    motivo: document.getElementById("pedido-motivo").value
  };
  pedidosEPI.push(novoPedido);
  closeModal("modal-novo-pedido-epi");
  renderColaboradores();
}

// RELATÓRIO DE PEDIDOS INDIVIDUAL
function relatorioIndividualColab(colabId) {
  const colab = colaboradores.find(c => c.id === colabId);
  const pedidos = pedidosEPI.filter(p => p.colabId === colabId);

  const area = document.getElementById("area-impressao-conteudo");
  area.innerHTML = `
    <div class="print-header">
      <h2>GRUPO FIUZA DIGITAL - SOLICITAÇÃO INDIVIDUAL DE EPI / UNIFORME</h2>
      <p>Ficha de Entrega e Requisição de Material</p>
    </div>
    <div class="print-info-grid">
      <div><strong>Colaborador:</strong> ${colab.nome}</div>
      <div><strong>Matrícula:</strong> ${colab.matricula}</div>
      <div><strong>Setor:</strong> ${colab.setor}</div>
      <div><strong>Cargo:</strong> ${colab.cargo}</div>
    </div>
    <div class="print-box">
      <h4>📦 Itens Solicitados:</h4>
      ${pedidos.map(p => `
        <div style="margin-top: 0.8rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem;">
          <strong>[${p.tipo}] Data: ${p.data}</strong><br>
          <span>Descrição: ${p.descricao}</span><br>
          <small style="color:#64748b;">Motivo: ${p.motivo || 'N/A'}</small>
        </div>
      `).join('')}
    </div>
    <div class="print-signatures">
      <div>____________________________________<br><strong>Assinatura do Colaborador</strong></div>
      <div>____________________________________<br><strong>Almoxarifado / Responsável</strong></div>
    </div>
  `;

  document.getElementById("print-modal-title").innerText = `Pedido de EPI - ${colab.nome}`;
  openModal("modal-impressao");
}

// RELATÓRIO GERAL DE PEDIDOS
function abrirRelatorioPedidosGeneral() {
  const area = document.getElementById("area-impressao-conteudo");
  
  let htmlItens = pedidosEPI.map(p => {
    const c = colaboradores.find(col => col.id === p.colabId) || { nome: 'N/A', matricula: 'N/A', setor: 'N/A' };
    return `
      <tr>
        <td>${c.matricula}</td>
        <td>${c.nome}</td>
        <td>${c.setor}</td>
        <td>${p.tipo}</td>
        <td>${p.descricao}</td>
        <td>${p.data}</td>
      </tr>
    `;
  }).join('');

  area.innerHTML = `
    <div class="print-header">
      <h2>GRUPO FIUZA DIGITAL - RELATÓRIO GERAL DE REQUISIÇÕES</h2>
      <p>Controle das Solicitações de EPIs e Uniformes por Setor</p>
    </div>
    <table style="width:100%; border-collapse:collapse; margin-top:1rem; font-size:0.85rem;">
      <thead>
        <tr style="background:#f1f5f9; text-align:left;">
          <th style="padding:6px;">Matrícula</th>
          <th style="padding:6px;">Nome</th>
          <th style="padding:6px;">Setor</th>
          <th style="padding:6px;">Tipo</th>
          <th style="padding:6px;">Descrição</th>
          <th style="padding:6px;">Data</th>
        </tr>
      </thead>
      <tbody>
        ${htmlItens}
      </tbody>
    </table>
    <div class="print-signatures" style="margin-top:4rem;">
      <div>____________________________________<br><strong>Sr. Osvaldo (Chefe)</strong></div>
      <div>____________________________________<br><strong>Gerência de Operações</strong></div>
    </div>
  `;

  document.getElementById("print-modal-title").innerText = `Relatório Geral de Pedidos de EPI`;
  openModal("modal-impressao");
}

// SALVAR APONTAMENTO DIÁRIO
function salvarApontamentoDiario(e) {
  e.preventDefault();
  const tag = document.getElementById("diaria-tag").value;
  const op = document.getElementById("diaria-operador").value;
  const ini = parseFloat(document.getElementById("diaria-horim-ini").value);
  const fim = parseFloat(document.getElementById("diaria-horim-fim").value);
  const total = (fim - ini).toFixed(1);

  const tbody = document.getElementById("lista-diaria");
  const tr = document.createElement("tr");
  const dataHora = new Date().toLocaleDateString('pt-BR') + ' - ' + new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});

  tr.innerHTML = `
    <td>${dataHora}</td>
    <td><strong>${tag}</strong></td>
    <td>${op}</td>
    <td>${ini}</td>
    <td>${fim}</td>
    <td>${total} h</td>
    <td><span class="badge badge-mina">Mina</span></td>
    <td><span class="badge badge-ativo">Operacional</span></td>
  `;
  tbody.prepend(tr);

  // Atualizar Horímetro no objeto frota
  const itemFrota = frota.find(f => f.tag === tag);
  if (itemFrota) {
    itemFrota.horimetro = fim;
    renderManutencao();
  }

  closeModal("modal-novo-apontamento");
}
