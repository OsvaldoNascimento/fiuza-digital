/* ==========================================
   SISTEMA FIUZA DIGITAL - REGRA DE NEGÓCIOS
   ========================================== */

// Registro do Service Worker para suporte PWA/Offline
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('Service Worker registrado com sucesso!'))
            .catch(err => console.log('Falha ao registrar Service Worker: ', err));
    });
}

/* ------------------------------------------
   DADOS NATIVOS DA FROTA E EQUIPES
   ------------------------------------------ */
const padraoEquipamentos = [
    { tipo: "TRATOR DE ESTEIRA", tags: ["SH_430", "SH_445", "SH_449", "SH_565", "SH_567", "SH_569", "SH_847", "SH_886"] },
    { tipo: "PÁ CARREGADEIRA", tags: ["SH_168", "SH_461", "SH_10299", "SH_10389", "SH_10390", "SH_10781", "SH_10782"] },
    { tipo: "ESCAVADEIRA HIDRÁULICA", tags: ["SH_400", "SH_403", "SH_435", "SH_443", "SH_471"] },
    { tipo: "GARRA TRAÇADORA", tags: ["SH_462", "SH_463", "SH_464", "SH_10774", "SH_10777"] },
    { tipo: "MOTONIVELADORA", tags: ["SH_451", "SH_460"] }
];

const padraoCB = [
    { tipo: "CAMINHÃO BASCULANTE", tags: ["SH_234", "SH_235", "SH_236", "SH_237", "SH_252", "SH_262", "SH_272", "SH_273", "SH_274", "SH_275", "SH_307", "SH_10740", "SH_10741", "SH_10742", "SH_10743", "SH_10744", "SH_10745", "SH_10746", "SH_10747", "SH_10748", "SH_10749"] },
    { tipo: "CAMINHÃO MADEIREIRO", tags: ["SH_212"] },
    { tipo: "CAMINHÃO PIPA", tags: ["SH_220", "SH_222", "SH_231"] },
    { tipo: "CAMINHÃO COMBOIO", tags: ["SH_243", "SH_10575"] },
    { tipo: "CAMINHÃO OFICINA", tags: ["SH_269"] },
    { tipo: "CAMINHÃO PRANCHA", tags: ["SH_305", "SH_311"] },
    { tipo: "ÔNIBUS", tags: ["SH_10719", "SH_10787"] }
];

const padraoPickup = [
    { tipo: "CAMINHONETE / PICK-UP", tags: ["SH_10699", "SH_10717", "SH_10718", "SH_10765"] }
];

const padraoMotoristas = [
    "CARLOS ANTONIO PINHEIRO DO NASCIMENTO", "CLEITON ALVES DE OLIVEIRA", "EMILSON MARTINS MOREIRA",
    "ERNANDES RODRIGUES COSTA", "EVANDO FRANCISCO RODRIGUES COSTA", "FRANCISCO ADRIANO DA SILVEIRA LIMA",
    "FRANCISCO DE ASSIS LOPES RIBEIRO", "GILBERTO PORTELA DE ARAUJO", "JHONATAN OLIVEIRA BEZERRA",
    "JIMMY LEAL LOPES", "JOSE MARCOS DUARTE SILVA", "JOSE ROBERTO BAENA BARBOSA", "MANOEL MOURA DA SILVA",
    "MARCELO ANTONIO MOURA GALVAO", "OBEDE MELO DA SILVA", "ORDERLEI ALVES GONÇALVES",
    "RAIMUNDO NONATO LIMA MESQUITA", "REINALDO GONÇALVES FERREIRA", "SALES ALVES MARIM",
    "FRANCISCO NUNES DE MORAIS", "ELISVALDO SARGES RODRIGUES", "ZULRIARLLS GONÇALVES"
];

const padraoMotoristasPickup = ["ADELSON DE OLIVEIRA ARAUJO", "ALEX TAVARES", "MILTON PINA C.", "OSVALDO NASCIMENTO", "VICENTE AIRES R."];
const padraoEncarregados = ["MILTON PINA C.", "OSVALDO NASCIMENTO", "VICENTE AIRES R."];
const padraoOperadores = [
    "ROSÁRIO MOREIRA DA COSTA", "AGNALDO LEANDRO DA SILVA", "ANTONIO JOSE DA SILVA",
    "DANIEL SANTOS ABREU SOUSA", "EDINALDO DE SOUSA SILVA", "ELIOMAR FERREIRA DE ASSUNCAO",
    "ROBERTO ALVES DA SILVA", "TAMIRES DE SOUSA MARQUES", "VALDO MONTEIRO CORREA",
    "DHOW ALBERTH PINHEIRO RAMOS", "ADRIANO BRITO MOREIRA", "ALDOLINO EVANGELISTA DE SOUZA",
    "JOSE DE RIBAMAR LIMA", "JOSE FERNANDO DE OLIVEIRA BARBOSA", "JOSE GENTIL LIMA",
    "VALDEMIR FERREIRA DE BRITO", "ANTONIO MARCOS SANTOS ARAUJO"
];

// Estado local da aplicação
let listaEquipamentos = JSON.parse(localStorage.getItem('fiuza_equipamentos_v3')) || padraoEquipamentos;
let listaCB = JSON.parse(localStorage.getItem('fiuza_cb_v3')) || padraoCB;
let listaPickup = JSON.parse(localStorage.getItem('fiuza_pickup_v3')) || padraoPickup;

let listaMotoristas = JSON.parse(localStorage.getItem('fiuza_motoristas')) || padraoMotoristas;
let listaMotoristasPickup = JSON.parse(localStorage.getItem('fiuza_motoristas_pickup')) || padraoMotoristasPickup;
let listaEncarregados = JSON.parse(localStorage.getItem('fiuza_encarregados_v2')) || padraoEncarregados;
let listaOperadores = JSON.parse(localStorage.getItem('fiuza_operadores')) || padraoOperadores;

let dadosManutencao = JSON.parse(localStorage.getItem('fiuza_manutencao_status')) || {};

let categoriaFrotaAtual = 'equipamento';
let tipoProfissionalAtual = 'operador';
let horimetroPermitidoEdicao = false;
let filtroManutAtual = 'TODOS';
let filtroColabAtual = 'TODOS';

/* ------------------------------------------
   CONFIGURAÇÃO DO FIREBASE E REDE
   ------------------------------------------ */
const firebaseConfig = {
    apiKey: "AIzaSyBs9tGAhk2dRWKHsyCujHqywe08Z...",
    authDomain: "fiuza-digital.firebaseapp.com",
    projectId: "fiuza-digital",
    storageBucket: "fiuza-digital.appspot.com",
    messagingSenderId: "1061198364805",
    appId: "1:1061198364805:web:98924dbc63a61b...",
    measurementId: "G-X1JGTE3D4G"
};

if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    var db = firebase.firestore();
    db.enablePersistence().catch(() => {});
}

window.addEventListener('online', atualizarStatusRede);
window.addEventListener('offline', atualizarStatusRede);

function atualizarStatusRede() {
    const statusBar = document.getElementById('status-rede');
    if (!statusBar) return;
    if (navigator.onLine) {
        statusBar.className = "status-bar online";
        statusBar.innerText = "Conectado - Sincronização Ativa";
    } else {
        statusBar.className = "status-bar offline";
        statusBar.innerText = "Modo Offline - Dados salvos localmente";
    }
}

/* ------------------------------------------
   NAVEGAÇÃO ENTRE TELAS (HOME <-> MÓDULOS)
   ------------------------------------------ */
function navigateTo(screenId) {
    document.querySelectorAll('.screen-content').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`screen-${screenId}`);
    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/* ------------------------------------------
   FUNÇÕES DA PARTE DIÁRIA
   ------------------------------------------ */
function renderizarEncarregados() {
    const select = document.getElementById('encarregado');
    if(!select) return;
    select.innerHTML = '<option value="" disabled selected>Selecione...</option>';
    listaEncarregados.forEach(nome => {
        select.innerHTML += `<option value="${nome}">${nome}</option>`;
    });
}

function renderizarTiposEquipamento() {
    const selectTipo = document.getElementById('select-tipo-equipamento');
    if(!selectTipo) return;
    selectTipo.innerHTML = '<option value="" disabled selected>Selecione o Tipo...</option>';

    let lista = categoriaFrotaAtual === 'equipamento' ? listaEquipamentos : (categoriaFrotaAtual === 'cb' ? listaCB : listaPickup);

    lista.forEach((item, idx) => {
        selectTipo.innerHTML += `<option value="${idx}">${item.tipo}</option>`;
    });

    if (lista.length > 0) {
        selectTipo.value = "0";
        renderizarTagsPorTipo();
    }
}

function alterarTipoEquipamento() {
    renderizarTagsPorTipo();
}

function renderizarTagsPorTipo() {
    const selectTipo = document.getElementById('select-tipo-equipamento');
    const selectTag = document.getElementById('select-identificacao');
    if(!selectTag) return;
    selectTag.innerHTML = '<option value="" disabled selected>Selecione a TAG...</option>';

    const idxTipo = parseInt(selectTipo.value);
    let lista = categoriaFrotaAtual === 'equipamento' ? listaEquipamentos : (categoriaFrotaAtual === 'cb' ? listaCB : listaPickup);

    if (!isNaN(idxTipo) && lista[idxTipo]) {
        lista[idxTipo].tags.forEach(tag => {
            selectTag.innerHTML += `<option value="${tag}">${tag}</option>`;
        });
    }
}

function renderizarProfissionais() {
    const select = document.getElementById('select-profissional');
    if(!select) return;
    select.innerHTML = '<option value="" disabled selected>Selecione...</option>';
    
    let lista = [];
    if (tipoProfissionalAtual === 'operador') {
        lista = listaOperadores;
    } else if (categoriaFrotaAtual === 'pickup') {
        lista = listaMotoristasPickup;
    } else {
        lista = listaMotoristas;
    }

    lista.forEach(nome => {
        select.innerHTML += `<option value="${nome}">${nome}</option>`;
    });
}

function selecionarCategoriaFrota(cat) {
    categoriaFrotaAtual = cat;
    document.getElementById('btn-cat-equipamento').classList.toggle('active', cat === 'equipamento');
    document.getElementById('btn-cat-cb').classList.toggle('active', cat === 'cb');
    document.getElementById('btn-cat-pickup').classList.toggle('active', cat === 'pickup');
    
    renderizarTiposEquipamento();

    if (cat === 'equipamento') {
        selecionarTipoProfissional('operador');
    } else {
        selecionarTipoProfissional('motorista');
    }
}

function selecionarTipoProfissional(tipo) {
    tipoProfissionalAtual = tipo;
    document.getElementById('btn-tipo-operador').classList.toggle('active', tipo === 'operador');
    document.getElementById('btn-tipo-motorista').classList.toggle('active', tipo === 'motorista');
    renderizarProfissionais();
}

function aoSelecionarTag() {
    const tagSelecionada = document.getElementById('select-identificacao').value;
    const inputHini = document.getElementById('horimetro_inicio');
    
    if (!tagSelecionada) return;

    if (typeof db !== 'undefined') {
        db.collection("relatorios")
            .where("identificacao_tag", "==", tagSelecionada)
            .orderBy("criadoEm", "desc")
            .limit(1)
            .get()
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    const ultimoRelatorio = querySnapshot.docs[0].data();
                    if (ultimoRelatorio.horimetro_fim !== undefined) {
                        inputHini.value = ultimoRelatorio.horimetro_fim;
                        localStorage.setItem(`fiuza_ultimo_hfim_${tagSelecionada}`, ultimoRelatorio.horimetro_fim);
                        renderizarPainelManutencao();
                        return;
                    }
                }
                const ultimoLocal = localStorage.getItem(`fiuza_ultimo_hfim_${tagSelecionada}`);
                inputHini.value = ultimoLocal || "0.0";
            })
            .catch(() => {
                const ultimoLocal = localStorage.getItem(`fiuza_ultimo_hfim_${tagSelecionada}`);
                inputHini.value = ultimoLocal || "0.0";
            });
    } else {
        const ultimoLocal = localStorage.getItem(`fiuza_ultimo_hfim_${tagSelecionada}`);
        inputHini.value = ultimoLocal || "0.0";
    }

    inputHini.readOnly = true;
    horimetroPermitidoEdicao = false;
}

function confirmarAlteracaoHorimetroInicio() {
    const inputHini = document.getElementById('horimetro_inicio');
    if (horimetroPermitidoEdicao) return;

    const resposta = confirm("Você quer alterar o horímetro inicial do equipamento?");
    if (resposta) {
        horimetroPermitidoEdicao = true;
        inputHini.readOnly = false;
        inputHini.focus();
    } else {
        inputHini.blur();
    }
}

function adicionarEncarregado() {
    const novo = prompt("Digite o nome do novo Encarregado:");
    if (novo && novo.trim() !== '') {
        const valor = novo.trim().toUpperCase();
        listaEncarregados.push(valor);
        listaEncarregados.sort();
        localStorage.setItem('fiuza_encarregados_v2', JSON.stringify(listaEncarregados));
        renderizarEncarregados();
        renderizarListaColaboradores();
        document.getElementById('encarregado').value = valor;
    }
}

function removerEncarregado() {
    const select = document.getElementById('encarregado');
    const selecionado = select.value;
    if (!selecionado) return alert('Selecione um encarregado para remover!');

    if (confirm(`Deseja remover "${selecionado}" da lista?`)) {
        listaEncarregados = listaEncarregados.filter(nome => nome !== selecionado);
        localStorage.setItem('fiuza_encarregados_v2', JSON.stringify(listaEncarregados));
        renderizarEncarregados();
        renderizarListaColaboradores();
    }
}

function adicionarIdentificacao() {
    let lista = categoriaFrotaAtual === 'equipamento' ? listaEquipamentos : (categoriaFrotaAtual === 'cb' ? listaCB : listaPickup);
    const selectTipo = document.getElementById('select-tipo-equipamento');
    let idxTipo = parseInt(selectTipo.value);

    if (isNaN(idxTipo)) {
        let tiposTexto = lista.map((item, idx) => `${idx + 1} - ${item.tipo}`).join('\n');
        let escolha = prompt(`Escolha o Tipo de Equipamento:\n\n${tiposTexto}`);
        idxTipo = parseInt(escolha) - 1;
    }

    if (isNaN(idxTipo) || !lista[idxTipo]) return alert("Tipo de equipamento inválido!");

    const tipoNome = lista[idxTipo].tipo;
    const novaTag = prompt(`Digite a nova TAG para ${tipoNome} (Ex: SH_100):`);

    if (novaTag && novaTag.trim() !== '') {
        let tagFormatada = novaTag.trim().toUpperCase();
        if (!tagFormatada.startsWith('SH_')) tagFormatada = 'SH_' + tagFormatada;

        lista[idxTipo].tags.push(tagFormatada);

        if (categoriaFrotaAtual === 'equipamento') {
            localStorage.setItem('fiuza_equipamentos_v3', JSON.stringify(listaEquipamentos));
        } else if (categoriaFrotaAtual === 'cb') {
            localStorage.setItem('fiuza_cb_v3', JSON.stringify(listaCB));
        } else {
            localStorage.setItem('fiuza_pickup_v3', JSON.stringify(listaPickup));
        }

        selectTipo.value = idxTipo.toString();
        renderizarTagsPorTipo();
        renderizarPainelManutencao();
        document.getElementById('select-identificacao').value = tagFormatada;
        aoSelecionarTag();
    }
}

function removerIdentificacao() {
    const selectTag = document.getElementById('select-identificacao');
    const tagSelecionada = selectTag.value;
    if (!tagSelecionada) return alert('Selecione uma TAG para remover!');

    const selectTipo = document.getElementById('select-tipo-equipamento');
    const idxTipo = parseInt(selectTipo.value);
    let lista = categoriaFrotaAtual === 'equipamento' ? listaEquipamentos : (categoriaFrotaAtual === 'cb' ? listaCB : listaPickup);

    if (confirm(`Deseja remover a TAG "${tagSelecionada}"?`)) {
        lista[idxTipo].tags = lista[idxTipo].tags.filter(t => t !== tagSelecionada);

        if (categoriaFrotaAtual === 'equipamento') {
            localStorage.setItem('fiuza_equipamentos_v3', JSON.stringify(listaEquipamentos));
        } else if (categoriaFrotaAtual === 'cb') {
            localStorage.setItem('fiuza_cb_v3', JSON.stringify(listaCB));
        } else {
            localStorage.setItem('fiuza_pickup_v3', JSON.stringify(listaPickup));
        }

        renderizarTagsPorTipo();
        renderizarPainelManutencao();
    }
}

function adicionarProfissional() {
    const tipoNome = tipoProfissionalAtual === 'operador' ? 'Operador' : 'Motorista';
    const novo = prompt(`Digite o nome do novo ${tipoNome}:`);
    if (novo && novo.trim() !== '') {
        const valor = novo.trim().toUpperCase();
        if (tipoProfissionalAtual === 'operador') {
            listaOperadores.push(valor);
            listaOperadores.sort();
            localStorage.setItem('fiuza_operadores', JSON.stringify(listaOperadores));
        } else if (categoriaFrotaAtual === 'pickup') {
            listaMotoristasPickup.push(valor);
            listaMotoristasPickup.sort();
            localStorage.setItem('fiuza_motoristas_pickup', JSON.stringify(listaMotoristasPickup));
        } else {
            listaMotoristas.push(valor);
            listaMotoristas.sort();
            localStorage.setItem('fiuza_motoristas', JSON.stringify(listaMotoristas));
        }
        renderizarProfissionais();
        renderizarListaColaboradores();
        document.getElementById('select-profissional').value = valor;
    }
}

function removerProfissional() {
    const select = document.getElementById('select-profissional');
    const selecionado = select.value;
    if (!selecionado) return alert('Selecione um nome para remover!');

    if (confirm(`Deseja remover "${selecionado}" da lista?`)) {
        if (tipoProfissionalAtual === 'operador') {
            listaOperadores = listaOperadores.filter(nome => nome !== selecionado);
            localStorage.setItem('fiuza_operadores', JSON.stringify(listaOperadores));
        } else if (categoriaFrotaAtual === 'pickup') {
            listaMotoristasPickup = listaMotoristasPickup.filter(nome => nome !== selecionado);
            localStorage.setItem('fiuza_motoristas_pickup', JSON.stringify(listaMotoristasPickup));
        } else {
            listaMotoristas = listaMotoristas.filter(nome => nome !== selecionado);
            localStorage.setItem('fiuza_motoristas', JSON.stringify(listaMotoristas));
        }
        renderizarProfissionais();
        renderizarListaColaboradores();
    }
}

function salvarRelatorio() {
    const frente = document.getElementById('frente').value;
    const encarregado = document.getElementById('encarregado').value;
    const profissional = document.getElementById('select-profissional').value;
    const identificacao = document.getElementById('select-identificacao').value;
    const hFimVal = parseFloat(document.getElementById('horimetro_fim').value) || 0;

    const dados = {
        data: document.getElementById('data').value,
        frente: frente,
        encarregado: encarregado,
        categoria_frota: categoriaFrotaAtual,
        identificacao_tag: identificacao,
        funcao_profissional: tipoProfissionalAtual,
        nome_profissional: profissional,
        horimetro_inicio: parseFloat(document.getElementById('horimetro_inicio').value) || 0,
        horimetro_fim: hFimVal,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    };

    if(!frente || !encarregado || !identificacao || !profissional) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    if (typeof db !== 'undefined') {
        db.collection("relatorios").add(dados)
        .then(() => {
            localStorage.setItem(`fiuza_ultimo_hfim_${identificacao}`, hFimVal);
            renderizarPainelManutencao();
            alert('✓ Relatório salvo com sucesso!');
        })
        .catch((error) => {
            alert("Erro ao salvar: " + error.message);
        });
    } else {
        localStorage.setItem(`fiuza_ultimo_hfim_${identificacao}`, hFimVal);
        renderizarPainelManutencao();
        alert('✓ Relatório salvo localmente!');
    }
}

function gerarPDF() {
    const data = document.getElementById('data').value;
    const frente = document.getElementById('frente').value;
    const encarregado = document.getElementById('encarregado').value;
    const profissional = document.getElementById('select-profissional').value;
    const identificacao = document.getElementById('select-identificacao').value;
    const hini = parseFloat(document.getElementById('horimetro_inicio').value) || 0;
    const hfim = parseFloat(document.getElementById('horimetro_fim').value) || 0;

    if(!frente || !encarregado || !identificacao || !profissional) {
        alert('Por favor, preencha os dados do relatório antes de gerar o PDF!');
        return;
    }

    const dataFormatada = data.split('-').reverse().join('/');
    const hTotal = (hfim - hini).toFixed(1);

    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        content: [
            {
                columns: [
                    { text: 'GRUPO FIUZA', fontSize: 18, bold: true, color: '#003366' },
                    { text: 'RELATÓRIO DE OPERAÇÃO DIÁRIA', alignment: 'right', fontSize: 10, color: '#666666', margin: [0, 5, 0, 0] }
                ]
            },
            { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 3, lineColor: '#FF6600' }] },
            { text: ' ', margin: [0, 10] },
            {
                table: {
                    widths: ['50%', '50%'],
                    body: [
                        [{ text: `Data: ${dataFormatada}`, fillColor: '#f9f9f9', padding: 8 }, { text: `Frente de Serviço: ${frente}`, fillColor: '#f9f9f9', padding: 8 }],
                        [{ text: `Encarregado: ${encarregado}`, colSpan: 2, padding: 8 }, {}],
                        [{ text: `TAG / Frota: ${identificacao}`, fillColor: '#f9f9f9', padding: 8 }, { text: `Função: ${tipoProfissionalAtual.toUpperCase()}`, fillColor: '#f9f9f9', padding: 8 }],
                        [{ text: `Nome: ${profissional}`, colSpan: 2, padding: 8 }, {}],
                        [{ text: `Horímetro Inicial: ${hini}`, fillColor: '#f9f9f9', padding: 8 }, { text: `Horímetro Final: ${hfim}`, fillColor: '#f9f9f9', padding: 8 }],
                        [{ text: `Total de Horas Trabalhadas: ${hTotal} hrs`, colSpan: 2, fillColor: '#eef2f5', bold: true, color: '#003366', padding: 10 }, {}]
                    ]
                }
            }
        ]
    };

    pdfMake.createPdf(docDefinition).download(`ParteDiaria_${identificacao}_${data}.pdf`);
}

/* ------------------------------------------
   FUNÇÕES DE MANUTENÇÃO & ORDENS DE SERVIÇO
   ------------------------------------------ */
function obterTodasAsTagsCompletas() {
    let resultado = [];
    listaEquipamentos.forEach(fam => fam.tags.forEach(t => resultado.push({ tag: t, tipo: fam.tipo, cat: 'equipamento' })));
    listaCB.forEach(fam => fam.tags.forEach(t => resultado.push({ tag: t, tipo: fam.tipo, cat: 'cb' })));
    listaPickup.forEach(fam => fam.tags.forEach(t => resultado.push({ tag: t, tipo: fam.tipo, cat: 'pickup' })));
    return resultado;
}

function renderizarPainelManutencao() {
    const tbody = document.getElementById('lista-manutencao-body');
    if(!tbody) return;
    tbody.innerHTML = '';

    const todas = obterTodasAsTagsCompletas();

    todas.forEach(item => {
        if (filtroManutAtual !== 'TODOS' && item.cat !== filtroManutAtual) return;

        let horimAtual = localStorage.getItem(`fiuza_ultimo_hfim_${item.tag}`) || '0.0';
        
        let mData = dadosManutencao[item.tag] || {
            status: 'ATIVO',
            local: 'MINA',
            ultPrev: (parseFloat(horimAtual) > 250 ? parseFloat(horimAtual) - 100 : 0).toFixed(1),
            proxPrev: (parseFloat(horimAtual) + 250).toFixed(1),
            horasParado: 0.0,
            problemas: ''
        };

        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item.tag}</strong></td>
            <td>${item.tipo}</td>
            <td><strong>${horimAtual}</strong> h/km</td>
            <td>
                <span class="badge ${mData.status === 'ATIVO' ? 'badge-ativo' : 'badge-manut'}">
                    ${mData.status === 'ATIVO' ? '🟢 ATIVO' : '🔴 EM MANUTENÇÃO'}
                </span>
            </td>
            <td>${mData.local === 'MINA' ? '⛏️ Mina' : '🏙️ Cidade'}</td>
            <td>${mData.ultPrev} / <strong>${mData.proxPrev}</strong></td>
            <td><strong style="color:#dc3545">${mData.horasParado} h</strong></td>
            <td>
                <div class="actions-cell">
                    <button class="btn-table btn-table-edit" onclick="abrirModalManutencaoTag('${item.tag}')"><i class="fa-solid fa-pen"></i> Alterar</button>
                    <button class="btn-table btn-table-os" onclick="abrirEditorOS('${item.tag}')"><i class="fa-solid fa-file-lines"></i> O.S.</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filtrarManutencao(cat) {
    filtroManutAtual = cat;
    document.querySelectorAll('#screen-manutencao .pill').forEach(btn => btn.classList.remove('active'));
    if(window.event && window.event.target) window.event.target.classList.add('active');
    renderizarPainelManutencao();
}

function abrirModalManutencaoTag(tag) {
    let horimAtual = localStorage.getItem(`fiuza_ultimo_hfim_${tag}`) || '0.0';
    let mData = dadosManutencao[tag] || {
        status: 'ATIVO',
        local: 'MINA',
        horasParado: 0.0,
        problemas: ''
    };

    document.getElementById('manut-modal-tag-id').value = tag;
    document.getElementById('manut-modal-tag').innerText = tag;
    document.getElementById('manut-modal-status').value = mData.status;
    document.getElementById('manut-modal-local').value = mData.local;
    document.getElementById('manut-modal-horas-parado').value = mData.horasParado;
    document.getElementById('manut-modal-problemas').value = mData.problemas;

    abrirModal('modal-codigo-manutencao');
}

function salvarStatusManutencao(e) {
    e.preventDefault();
    let tag = document.getElementById('manut-modal-tag-id').value;
    let horimAtual = parseFloat(localStorage.getItem(`fiuza_ultimo_hfim_${tag}`) || 0);

    dadosManutencao[tag] = {
        status: document.getElementById('manut-modal-status').value,
        local: document.getElementById('manut-modal-local').value,
        ultPrev: (horimAtual > 250 ? horimAtual - 100 : 0).toFixed(1),
        proxPrev: (horimAtual + 250).toFixed(1),
        horasParado: parseFloat(document.getElementById('manut-modal-horas-parado').value) || 0.0,
        problemas: document.getElementById('manut-modal-problemas').value
    };

    localStorage.setItem('fiuza_manutencao_status', JSON.stringify(dadosManutencao));
    fecharModal('modal-codigo-manutencao');
    renderizarPainelManutencao();
}

function gerarOSDaModal() {
    let tag = document.getElementById('manut-modal-tag-id').value;
    fecharModal('modal-codigo-manutencao');
    abrirEditorOS(tag);
}

function abrirEditorOS(tag) {
    let horimAtual = localStorage.getItem(`fiuza_ultimo_hfim_${tag}`) || '0.0';
    let mData = dadosManutencao[tag] || { local: 'MINA', problemas: '' };
    let hoje = new Date();

    document.getElementById('os-tag').value = tag;
    document.getElementById('os-data').value = hoje.toISOString().split('T')[0];
    document.getElementById('os-hora').value = hoje.toTimeString().substring(0, 5);
    document.getElementById('os-horimetro').value = horimAtual;
    document.getElementById('os-local').value = mData.local;
    document.getElementById('os-problemas').value = mData.problemas || 'Inspeção e manutenção preventiva geral.';
    document.getElementById('os-observacoes').value = '';

    abrirModal('modal-os-editor');
}

function emitirPDFOS() {
    let tag = document.getElementById('os-tag').value;
    let dataOS = document.getElementById('os-data').value.split('-').reverse().join('/');
    let horaOS = document.getElementById('os-hora').value;
    let horimOS = document.getElementById('os-horimetro').value;
    let localOS = document.getElementById('os-local').value === 'MINA' ? 'Na Mina' : 'Na Cidade / Oficina';
    let problemasOS = document.getElementById('os-problemas').value;
    let obsOS = document.getElementById('os-observacoes').value;

    const docDef = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        content: [
            {
                columns: [
                    { text: 'GRUPO FIUZA', fontSize: 18, bold: true, color: '#003366' },
                    { text: 'ORDEM DE SERVIÇO DE MANUTENÇÃO (O.S.)', alignment: 'right', fontSize: 10, color: '#FF6600', bold: true }
                ]
            },
            { canvas: [{ type: 'line', x1: 0, y1: 8, x2: 515, y2: 8, lineWidth: 2, lineColor: '#003366' }] },
            { text: ' ', margin: [0, 8] },
            {
                table: {
                    widths: ['33%', '33%', '34%'],
                    body: [
                        [
                            { text: `TAG: ${tag}`, bold: true, fillColor: '#f2f2f2', padding: 6 },
                            { text: `Data: ${dataOS} às ${horaOS}`, fillColor: '#f2f2f2', padding: 6 },
                            { text: `Horímetro/KM: ${horimOS}`, fillColor: '#f2f2f2', padding: 6 }
                        ],
                        [
                            { text: `Localização: ${localOS}`, colSpan: 2, padding: 6 },
                            {},
                            { text: `Status: EM MANUTENÇÃO`, color: '#dc3545', bold: true, padding: 6 }
                        ]
                    ]
                }
            },
            { text: ' ', margin: [0, 5] },
            { text: '📋 LISTA DE PROBLEMAS / FALHAS CONSTATADAS', fontSize: 11, bold: true, color: '#003366' },
            {
                table: {
                    widths: ['100%'],
                    body: [[{ text: problemasOS || 'Nenhum problema detalhado.', padding: 10, minHeight: 60 }]]
                }
            },
            { text: ' ', margin: [0, 5] },
            { text: '📝 OBSERVAÇÕES E SERVIÇOS EXECUTADOS', fontSize: 11, bold: true, color: '#003366' },
            {
                table: {
                    widths: ['100%'],
                    body: [[{ text: obsOS || '\n\n\n', padding: 10 }]]
                }
            },
            { text: ' ', margin: [0, 25] },
            {
                columns: [
                    { text: '_____________________________________\nOsvaldo Nascimento\nChefe de Manutenção', alignment: 'center', fontSize: 9 },
                    { text: '_____________________________________\nResponsável Técnico / Mecânico', alignment: 'center', fontSize: 9 }
                ]
            }
        ]
    };

    pdfMake.createPdf(docDef).download(`OS_Manutencao_${tag}_${dataOS.replace(/\//g, '-')}.pdf`);
    fecharModal('modal-os-editor');
}

/* ------------------------------------------
   FUNÇÕES DE GESTÃO DE COLABORADORES
   ------------------------------------------ */
function renderizarListaColaboradores() {
    const tbody = document.getElementById('lista-colaboradores-body');
    if(!tbody) return;
    tbody.innerHTML = '';

    let listaTodos = [];
    listaEncarregados.forEach(nome => listaTodos.push({ nome: nome, funcao: 'Encarregado' }));
    listaOperadores.forEach(nome => listaTodos.push({ nome: nome, funcao: 'Operador' }));
    listaMotoristas.forEach(nome => listaTodos.push({ nome: nome, funcao: 'Motorista' }));
    listaMotoristasPickup.forEach(nome => listaTodos.push({ nome: nome, funcao: 'Motorista (Pick-up)' }));

    listaTodos.forEach(item => {
        if (filtroColabAtual !== 'TODOS' && !item.funcao.includes(filtroColabAtual)) return;

        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item.nome}</strong></td>
            <td>${item.funcao}</td>
            <td>
                <button class="btn-table btn-table-del" onclick="removerColaboradorGeral('${item.nome}', '${item.funcao}')"><i class="fa-solid fa-trash"></i> Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filtrarColaboradores(funcao) {
    filtroColabAtual = funcao;
    document.querySelectorAll('#screen-colaboradores .pill-sector').forEach(btn => btn.classList.remove('active'));
    if(window.event && window.event.target) window.event.target.classList.add('active');
    renderizarListaColaboradores();
}

function adicionarColaboradorDireto() {
    const opcao = prompt("Qual a função do novo colaborador?\n1 - Encarregado\n2 - Operador\n3 - Motorista");
    if (!opcao) return;

    let tipo = '';
    if (opcao === '1') tipo = 'Encarregado';
    else if (opcao === '2') tipo = 'Operador';
    else if (opcao === '3') tipo = 'Motorista';
    else return alert('Opção inválida!');

    const novoNome = prompt(`Digite o nome do novo ${tipo}:`);
    if (novoNome && novoNome.trim() !== '') {
        const valor = novoNome.trim().toUpperCase();

        if (tipo === 'Encarregado') {
            listaEncarregados.push(valor);
            listaEncarregados.sort();
            localStorage.setItem('fiuza_encarregados_v2', JSON.stringify(listaEncarregados));
            renderizarEncarregados();
        } else if (tipo === 'Operador') {
            listaOperadores.push(valor);
            listaOperadores.sort();
            localStorage.setItem('fiuza_operadores', JSON.stringify(listaOperadores));
            renderizarProfissionais();
        } else if (tipo === 'Motorista') {
            listaMotoristas.push(valor);
            listaMotoristas.sort();
            localStorage.setItem('fiuza_motoristas', JSON.stringify(listaMotoristas));
            renderizarProfissionais();
        }

        renderizarListaColaboradores();
        alert(`✓ ${tipo} ${valor} adicionado com sucesso!`);
    }
}

function removerColaboradorGeral(nome, funcao) {
    if (!confirm(`Deseja remover "${nome}"?`)) return;

    if (funcao === 'Encarregado') {
        listaEncarregados = listaEncarregados.filter(n => n !== nome);
        localStorage.setItem('fiuza_encarregados_v2', JSON.stringify(listaEncarregados));
        renderizarEncarregados();
    } else if (funcao === 'Operador') {
        listaOperadores = listaOperadores.filter(n => n !== nome);
        localStorage.setItem('fiuza_operadores', JSON.stringify(listaOperadores));
        renderizarProfissionais();
    } else {
        listaMotoristas = listaMotoristas.filter(n => n !== nome);
        listaMotoristasPickup = listaMotoristasPickup.filter(n => n !== nome);
        localStorage.setItem('fiuza_motoristas', JSON.stringify(listaMotoristas));
        localStorage.setItem('fiuza_motoristas_pickup', JSON.stringify(listaMotoristasPickup));
        renderizarProfissionais();
    }

    renderizarListaColaboradores();
}

/* ------------------------------------------
   FUNÇÕES UTILITÁRIAS E INICIALIZAÇÃO
   ------------------------------------------ */
function abrirModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'flex';
}

function fecharModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

// Execução ao carregar a página DOM
document.addEventListener("DOMContentLoaded", () => {
    const inputData = document.getElementById('data');
    if (inputData) inputData.valueAsDate = new Date();

    renderizarEncarregados();
    renderizarTiposEquipamento();
    renderizarProfissionais();
    renderizarPainelManutencao();
    renderizarListaColaboradores();
    atualizarStatusRede();
});
