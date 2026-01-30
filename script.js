// ==================== CONFIG ====================
const API_KEY = "$2a$10$59L4ur895kSE2c6lxNsB7eBp2T.l55.HgfTBTDSJGyDCCrOFvSe8S";
const BIN_ID = "697d22b5d0ea881f4094279d";

const URL_GET = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;
const URL_PUT = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// ELEMENTOS
const diaTreino = document.getElementById("diaTreino");
const lista = document.getElementById("listaCandidatos");
const contador = document.getElementById("contador");

// ==================== FUNÇÕES BASE ====================
async function buscarDados() {
  const res = await fetch(URL_GET, {
    headers: {
      "X-Master-Key": API_KEY,
      "Cache-Control": "no-cache"
    }
  });
  const data = await res.json();
  return data.record;
}

async function salvarDados(dados) {
  await fetch(URL_PUT, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY
    },
    body: JSON.stringify(dados)
  });
}

// ==================== ATUALIZAR TELA ====================
async function atualizarTela() {
  try {
    const dados = await buscarDados();

    if (diaTreino) {
      diaTreino.innerText = "Treino marcado para: " + dados.horario;
    }

    if (lista && contador) {
      lista.innerHTML = "";
      contador.innerText = dados.candidatos.length;

      dados.candidatos.forEach(c => {
        const li = document.createElement("li");
        li.innerText =
          `Nome: ${c.nome} | Idade: ${c.idade} | Discord: ${c.discord} | Cargo: ${c.cargo} | Tiro: ${c.tiro} | P1: ${c.p1}`;
        lista.appendChild(li);
      });
    }
  } catch (e) {
    console.error("Erro ao atualizar tela", e);
  }
}

// ==================== ADMIN ====================
async function salvarHorario() {
  const novo = document.getElementById("novoHorario").value;
  if (!novo.trim()) return;

  const dados = await buscarDados();
  dados.horario = novo;

  await salvarDados(dados);
  alert("Horário atualizado!");
  atualizarTela();
}

// ==================== CANDIDATURA ====================
async function confirmarHorario() {
  const confirma = confirm("Você confirma o horário do treino?");
  if (!confirma) return;

  const dados = await buscarDados();

  const candidato = {
    nome: document.getElementById("nome").value,
    idade: document.getElementById("idade").value,
    discord: document.getElementById("discord").value,
    cargo: document.getElementById("cargo").value,
    tiro: document.getElementById("tiro").value,
    p1: document.getElementById("p1").value
  };

  dados.candidatos.push(candidato);

  await salvarDados(dados);
  alert("Candidatura enviada com sucesso!");
  document.getElementById("formCandidatura").reset();
}

// ==================== SYNC AUTOMÁTICO ====================
document.addEventListener("DOMContentLoaded", () => {
  atualizarTela();
  setInterval(atualizarTela, 5000); // força sync no mobile
});
