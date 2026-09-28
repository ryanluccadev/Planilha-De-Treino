/* ===== Meu Treino ===== */
const CHAVE = "meuTreino.dados";
const CHAVE_TEMA = "meuTreino.tema";
const CHAVE_TREINOS = "meuTreino.treinos";
const GRUPOS = ["Costas", "Bíceps", "Peito", "Ombro", "Tríceps", "Perna"];

// Exercícios padrão: [grupo, nome, peso, séries]
const PADRAO = [
  ["Costas","Puxada Triângulo",60,4],["Costas","T Bar Row",60,3],["Costas","Remada Baixa",40,6],
  ["Bíceps","Rosca Direta",12.5,4],["Bíceps","Rosca Scott",25,4],
  ["Peito","Supino Inclinado",17.5,4],["Peito","Crucifixo Máquina",70,4],
  ["Ombro","Elevação Lateral",12.5,3],["Ombro","Desenvolvimento Halter",15,4],
  ["Tríceps","Tríceps Corda",50,5],["Tríceps","Tríceps Francês",30,7],
  ["Perna","Cadeira Flexora",90,5],["Perna","Mesa Flexora",60,4],["Perna","Leg Press 45",140,5],
  ["Perna","Cadeira Extensora",110,6],["Perna","Elevação Pélvica",50,6],["Perna","Cadeira Adutora",110,6],
  ["Perna","Panturrilha em Pé",80,6]
];

// As fotos ficam em fotos.js (embutidas), então não dependem de pastas nem do celular
function fotoDe(ex) {
  if (ex.imagem) return ex.imagem;
  const n = ex.id.startsWith("p") ? Number(ex.id.slice(1)) : -1;
  const nome = PADRAO[n] ? PADRAO[n][1] : ex.nome;
  return (typeof FOTOS !== "undefined" && FOTOS[nome]) || placeholder(ex.grupo);
}


// Treinos padrão: [id, nome, exercícios]
const TREINOS_PADRAO = [
  ["t-costas-biceps", "Costas e Bíceps", ["Puxada Triângulo","T Bar Row","Remada Baixa","Rosca Direta","Rosca Scott"]],
  ["t-peito-ombro-triceps", "Peito, Ombro e Tríceps", ["Supino Inclinado","Crucifixo Máquina","Elevação Lateral","Desenvolvimento Halter","Tríceps Corda","Tríceps Francês"]],
  ["t-perna", "Perna", ["Cadeira Flexora","Mesa Flexora","Leg Press 45","Cadeira Extensora"]],
  ["t-superiores", "Superiores", ["T Bar Row","Puxada Triângulo","Supino Inclinado","Elevação Lateral","Rosca Scott","Tríceps Francês"]],
  ["t-inferiores", "Inferiores", ["Leg Press 45","Cadeira Flexora","Elevação Pélvica","Cadeira Adutora","Panturrilha em Pé"]]
];

let exercicios = [];
let treinos = [];
let treinosSel = [];
let filtros = [];   // grupos musculares selecionados (vazio = todos)
let telaAtual = "treino";

/* ---------- Dados ---------- */
function criarPadrao() {
  return PADRAO.map(([grupo, nome, peso, series], i) =>
    ({ id: "p" + i, grupo, nome, peso, series, imagem: "" }));
}
function criarTreinosPadrao() {
  const base = criarPadrao();
  return TREINOS_PADRAO.map(([id, nome, itens]) =>
    ({ id, nome, ids: itens.map(n => base.find(e => e.nome === n).id) }));
}
function carregar() {
  try {
    const salvo = localStorage.getItem(CHAVE);
    exercicios = salvo ? JSON.parse(salvo) : criarPadrao();
    // Limpa caminhos de foto antigos (só fotos enviadas pelo usuário ficam salvas)
    exercicios.forEach(e => { if (e.imagem && !e.imagem.startsWith("data:")) e.imagem = ""; });
  } catch { exercicios = criarPadrao(); }
  try {
    const t = localStorage.getItem(CHAVE_TREINOS);
    treinos = t ? JSON.parse(t) : criarTreinosPadrao();
  } catch { treinos = criarTreinosPadrao(); }
}
function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(exercicios));
    localStorage.setItem(CHAVE_TREINOS, JSON.stringify(treinos));
  }
  catch { toast("Não foi possível salvar (armazenamento cheio)."); }
}

/* ---------- Utilidades ---------- */
const $ = (s) => document.querySelector(s);
const esc = (t) => String(t).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmtPeso = (n) => String(n).replace(".", ",") + " kg";

// Imagem padrão elegante (SVG gerado na hora) quando não há foto
function placeholder(grupo) {
  const letra = (grupo || "?")[0];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b2118"/><stop offset="1" stop-color="#4a2b12"/></linearGradient></defs><rect width="120" height="120" fill="url(#g)"/><g fill="#ff7a1a"><rect x="26" y="50" width="10" height="20" rx="3"/><rect x="38" y="42" width="11" height="36" rx="3"/><rect x="84" y="50" width="10" height="20" rx="3"/><rect x="71" y="42" width="11" height="36" rx="3"/><rect x="49" y="56" width="22" height="8" rx="2"/></g><text x="60" y="104" font-family="sans-serif" font-size="14" font-weight="700" fill="#ff9a4d" text-anchor="middle">${esc(grupo)}</text></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

let timerToast;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.classList.add("mostra");
  clearTimeout(timerToast);
  timerToast = setTimeout(() => t.classList.remove("mostra"), 2400);
}

// Liga/desliga um item da lista de filtros ("todos" limpa a seleção)
function alternar(lista, valor) {
  if (valor === "todos") return [];
  return lista.includes(valor) ? lista.filter(v => v !== valor) : [...lista, valor];
}

/* ---------- Renderização ---------- */
function cardHTML(ex, compacto) {
  return `<article class="card ${compacto ? "compacto" : ""}">
    <img src="${fotoDe(ex)}" data-grupo="${esc(ex.grupo)}" alt="${esc(ex.nome)}" loading="lazy">
    <div class="info">
      <h3>${esc(ex.nome)}</h3>
      <div class="dados">
        <span class="tag peso"><b>${fmtPeso(ex.peso)}</b></span>
        <span class="tag"><b>${ex.series}</b> séries</span>
      </div>
    </div>
    <button class="btn-editar" data-editar="${ex.id}">EDITAR</button>
  </article>`;
}

const botaoAdd = `<button class="btn btn-primario btn-add" data-add>+ ADICIONAR EXERCÍCIO</button>`;

function renderTreino() {
  treinosSel = treinosSel.filter(id => treinos.some(t => t.id === id));
  const todos = treinosSel.length === 0;
  const chips = `<button class="chip ${todos ? "ativo" : ""}" data-treino="todos">Todos</button>` +
    treinos.map(t => `<button class="chip ${treinosSel.includes(t.id) ? "ativo" : ""}" data-treino="${t.id}">${esc(t.nome)}</button>`).join("");

  // Uma seção por treino selecionado, na ordem definida em cada treino
  let secoes = treinos
    .filter(t => todos || treinosSel.includes(t.id))
    .map(t => ({ nome: t.nome, lista: t.ids.map(id => exercicios.find(e => e.id === id)).filter(Boolean) }));
  if (todos) {
    const usados = new Set(treinos.flatMap(t => t.ids));
    const soltos = exercicios.filter(e => !usados.has(e.id));
    if (soltos.length) secoes.push({ nome: "Sem treino", lista: soltos });
  }

  let html = `<div class="filtros">${chips}</div>`;
  secoes.forEach(sec => {
    if (!sec.lista.length && todos) return;
    html += `<section class="grupo"><h2>${esc(sec.nome.toUpperCase())} <small>${sec.lista.length} exercício${sec.lista.length === 1 ? "" : "s"}</small></h2>
      <div class="grid">${sec.lista.map(e => cardHTML(e)).join("")}</div></section>`;
  });
  if (!secoes.some(sec => sec.lista.length)) html += `<p class="vazio">Nenhum exercício aqui ainda.<br>Adicione exercícios na aba Exercícios.</p>`;
  $("#tela-treino").innerHTML = html;
}

function renderExercicios() {
  const chips = ["Todos", ...GRUPOS].map(g => {
    const ativo = g === "Todos" ? filtros.length === 0 : filtros.includes(g);
    return `<button class="chip ${ativo ? "ativo" : ""}" data-filtro="${g}">${g}</button>`;
  }).join("");
  const lista = exercicios.filter(e => !filtros.length || filtros.includes(e.grupo));
  $("#tela-exercicios").innerHTML = `<h2 class="titulo-tela">Todos os exercícios</h2>
    <div class="filtros">${chips}</div>${botaoAdd}
    <div class="grid">${lista.map(e => cardHTML(e, true)).join("") || `<p class="vazio">Nada por aqui.</p>`}</div>`;
}

function renderizar() { renderTreino(); renderExercicios(); }

/* ---------- Modal ---------- */
function abrirModal(html) {
  $("#modal").innerHTML = html;
  $("#overlay").hidden = false;
  const primeiro = $("#modal input, #modal select");
  if (primeiro) setTimeout(() => primeiro.focus(), 50);
}
function fecharModal() { $("#overlay").hidden = true; $("#modal").innerHTML = ""; }

function confirmar(titulo, texto, textoBotao, acao) {
  abrirModal(`<h2>${titulo}</h2><p>${texto}</p>
    <div class="acoes"><button class="btn btn-sec" data-fechar>CANCELAR</button>
    <button class="btn btn-perigo" id="ok-confirmar">${textoBotao}</button></div>`);
  $("#ok-confirmar").onclick = () => { fecharModal(); acao(); };
}

// Formulário usado tanto para adicionar quanto para editar
let imagemNova = "";
function abrirFormulario(id) {
  const ex = id ? exercicios.find(e => e.id === id) : null;
  imagemNova = ex ? ex.imagem : "";
  const opcoes = GRUPOS.map(g => `<option ${ex && ex.grupo === g ? "selected" : ""}>${g}</option>`).join("");
  abrirModal(`<h2>${ex ? "Editar exercício" : "Novo exercício"}</h2>
    <div class="campo"><span>Grupo muscular</span><select id="f-grupo" ${ex ? "disabled" : ""}>${opcoes}</select></div>
    <label class="campo" id="c-nome"><span>Nome do exercício</span>
      <input id="f-nome" type="text" maxlength="40" value="${ex ? esc(ex.nome) : ""}" placeholder="Ex.: Supino Reto">
      <div class="msg-erro">Digite o nome do exercício.</div></label>
    <div class="linha2">
      <label class="campo" id="c-peso"><span>Peso (kg)</span>
        <input id="f-peso" type="number" inputmode="decimal" step="0.5" min="0" value="${ex ? ex.peso : ""}" placeholder="0">
        <div class="msg-erro">Informe um peso válido.</div></label>
      <label class="campo" id="c-series"><span>Séries</span>
        <input id="f-series" type="number" inputmode="numeric" min="1" max="99" value="${ex ? ex.series : ""}" placeholder="4">
        <div class="msg-erro">Informe as séries (1 a 99).</div></label>
    </div>
    <div class="bloco"><p class="rotulo">Incluir nos treinos</p><div class="chks" id="f-treinos">${treinos.map(t =>
      `<label class="chk"><input type="checkbox" value="${t.id}" ${(ex ? t.ids.includes(ex.id) : treinosSel.includes(t.id)) ? "checked" : ""}><span>${esc(t.nome)}</span></label>`).join("")}</div></div>
    <label class="campo"><span>Imagem (opcional)</span><input id="f-img" type="file" accept="image/*"></label>
    <div class="acoes"><button class="btn btn-sec" data-fechar>CANCELAR</button>
    <button class="btn btn-primario" id="f-salvar">SALVAR</button></div>
    ${ex ? `<button class="btn-texto-perigo" id="f-excluir">Excluir exercício</button>` : ""}`);

  $("#f-img").onchange = (e) => redimensionar(e.target.files[0]);
  $("#f-salvar").onclick = () => salvarFormulario(ex);
  if (ex) $("#f-excluir").onclick = () => confirmar("Excluir exercício?",
    `“${esc(ex.nome)}” será removido do seu treino.`, "EXCLUIR", () => {
      exercicios = exercicios.filter(e => e.id !== ex.id);
      treinos.forEach(t => { t.ids = t.ids.filter(i => i !== ex.id); });
      salvar(); renderizar(); toast("Exercício excluído");
    });
}

// Reduz a foto para não estourar o limite do localStorage
function redimensionar(arquivo) {
  if (!arquivo) return;
  const leitor = new FileReader();
  leitor.onload = () => {
    const img = new Image();
    img.onload = () => {
      const lado = 320, c = document.createElement("canvas");
      c.width = c.height = lado;
      const min = Math.min(img.width, img.height);
      c.getContext("2d").drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, lado, lado);
      imagemNova = c.toDataURL("image/jpeg", 0.75);
    };
    img.src = leitor.result;
  };
  leitor.readAsDataURL(arquivo);
}

function salvarFormulario(ex) {
  const nome = $("#f-nome").value.trim();
  const peso = parseFloat($("#f-peso").value);
  const series = parseInt($("#f-series").value, 10);
  const okNome = nome.length > 0;
  const okPeso = !isNaN(peso) && peso >= 0;
  const okSeries = !isNaN(series) && series >= 1 && series <= 99;
  $("#c-nome").classList.toggle("erro", !okNome);
  $("#c-peso").classList.toggle("erro", !okPeso);
  $("#c-series").classList.toggle("erro", !okSeries);
  if (!(okNome && okPeso && okSeries)) return;

  let alvo = ex;
  if (ex) {
    Object.assign(ex, { nome, peso, series, imagem: imagemNova });
  } else {
    alvo = { id: "u" + Date.now(), grupo: $("#f-grupo").value, nome, peso, series, imagem: imagemNova };
    exercicios.push(alvo);
  }
  // Atualiza em quais treinos o exercício aparece
  const marcados = [...document.querySelectorAll("#f-treinos input:checked")].map(i => i.value);
  treinos.forEach(t => {
    const tem = t.ids.includes(alvo.id), quer = marcados.includes(t.id);
    if (quer && !tem) t.ids.push(alvo.id);
    if (!quer && tem) t.ids = t.ids.filter(i => i !== alvo.id);
  });
  salvar(); renderizar(); fecharModal();
  toast(ex ? "Alterações salvas" : "Exercício adicionado");
}

/* ---------- Navegação e eventos ---------- */
// Se uma foto não carregar (arquivo faltando), mostra o placeholder
document.addEventListener("error", (e) => {
  const img = e.target;
  if (img.tagName === "IMG" && img.dataset.grupo && !img.src.startsWith("data:")) img.src = placeholder(img.dataset.grupo);
}, true);

function irPara(tela) {
  telaAtual = tela;
  document.querySelectorAll(".tela").forEach(t => t.classList.remove("ativa"));
  $("#tela-" + tela).classList.add("ativa");
  document.querySelectorAll(".nav-inferior button").forEach(b => b.classList.toggle("ativo", b.dataset.tela === tela));
  window.scrollTo({ top: 0 });
}

document.addEventListener("click", (e) => {
  const alvo = e.target.closest("button, .overlay");
  if (!alvo) return;
  if (alvo.dataset.tela) irPara(alvo.dataset.tela);
  else if (alvo.dataset.editar) abrirFormulario(alvo.dataset.editar);
  else if ("add" in alvo.dataset) abrirFormulario();
  else if (alvo.dataset.treino) {
    treinosSel = alternar(treinosSel, alvo.dataset.treino); renderTreino();
    document.querySelector(`#tela-treino [data-treino="${alvo.dataset.treino}"]`).scrollIntoView({ inline: "center", block: "nearest" });
  }
  else if (alvo.dataset.filtro) {
    filtros = alternar(filtros, alvo.dataset.filtro === "Todos" ? "todos" : alvo.dataset.filtro); renderExercicios();
    document.querySelector(`#tela-exercicios [data-filtro="${alvo.dataset.filtro}"]`).scrollIntoView({ inline: "center", block: "nearest" });
  }
  else if ("fechar" in alvo.dataset) fecharModal();
  else if (alvo.id === "overlay" && e.target === alvo) fecharModal();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharModal(); });

$("#btn-restaurar").onclick = () => confirmar("Restaurar padrão?",
  "Seus exercícios atuais serão substituídos pela lista original.", "RESTAURAR", () => {
    exercicios = criarPadrao(); treinos = criarTreinosPadrao(); treinosSel = [];
    salvar(); renderizar(); toast("Exercícios padrão restaurados");
  });
$("#btn-limpar").onclick = () => confirmar("Limpar todos os dados?",
  "Todos os exercícios e configurações serão apagados. Essa ação não pode ser desfeita.", "LIMPAR TUDO", () => {
    exercicios = []; treinos = []; treinosSel = [];
    localStorage.removeItem(CHAVE); localStorage.removeItem(CHAVE_TREINOS); localStorage.removeItem(CHAVE_TEMA);
    aplicarTema("dark"); renderizar(); toast("Dados apagados");
  });

/* ---------- Tema ---------- */
function aplicarTema(tema) {
  document.documentElement.dataset.theme = tema;
  $("#switch-tema").checked = tema === "dark";
  document.querySelector('meta[name="theme-color"]').content = tema === "dark" ? "#121212" : "#f6f3ef";
}
$("#switch-tema").onchange = (e) => {
  const tema = e.target.checked ? "dark" : "light";
  aplicarTema(tema);
  try { localStorage.setItem(CHAVE_TEMA, tema); } catch {}
};

/* ---------- Início ---------- */
carregar();
if (typeof LOGO !== "undefined") document.querySelector(".logo").src = LOGO;
aplicarTema(localStorage.getItem(CHAVE_TEMA) || "dark");
renderizar();