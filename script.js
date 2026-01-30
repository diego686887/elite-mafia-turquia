const API_KEY = "$2a$10$59L4ur895kSE2c6lxNsB7eBp2T.l55.HgfTBTDSJGyDCCrOFvSe8S";
const BIN_ID = "697d22b5d0ea881f4094279d";
const BASE_URL = "https://api.jsonbin.io/v3/b";

// ==================== BUSCAR DADOS ====================
async function buscarOnline() {
  const res = await fetch(`${BASE_URL}/${BIN_ID}/latest`, {
    headers: { "X-Master-Key": API_KEY }
  });
  const data = await res.json();
  return data.record;
}

// ==================== SALVAR DADOS ====================
async function salvarOnline(dados) {
  await fetch(`${BASE_URL}/${BIN_ID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY
    },
    body: JSON.stringify(dados)
  });
}

// ==================== INICIAR ====================
async function iniciarSync() {
  const dados = await buscarOnline();

  // horário
  if (dados.treino && dados.treino.dia && dados.treino.hora) {
    const texto = `${dados.treino.dia} às ${dados.treino.hora}`;
    localStorage.setItem("horario", texto);
    const diaTreino = document.getElementById("diaTreino");
    if (diaTreino) diaTreino.innerText = "Treino marcado para: " + texto;
  }

  // admin lista
  const lista = document.getElementById("listaCandidatos");
  const contador = document.getElementById("contador");

  if (lista && contador) {
    lista.innerHTML = "";
    contador.innerText = dados.candidaturas.length;

    dados.candidaturas.forEach(c => {
      const li = document.createElement("li");
      li.innerText =
        `Nome: ${c.nome} | Idade: ${c.idade} | Discord: ${c.discord} | Cargo: ${c.cargo} | Tiro: ${c.tiro} | P1: ${c.p1}`;
      lista.appendChild(li);
    });
  }
}

// ==================== CANDIDATURA ====================
async function confirmarHorario() {
  const dados = await buscarOnline();

  const candidato = {
    nome: nome.value,
    idade: idade.value,
    discord: discord.value,
    cargo: cargo.value,
    tiro: tiro.value,
    p1: p1.value
  };

  dados.candidaturas.push(candidato);
  await salvarOnline(dados);

  alert("Candidatura enviada!");
  formCandidatura.reset();
}

// ==================== ADMIN ====================
async function salvarHorario() {
  const novo = document.getElementById("novoHorario").value;
  if (!novo) return;

  const [dia, hora] = novo.split(" ");
  const dados = await buscarOnline();

  dados.treino = {
    dia: dia,
    hora: hora || "20:00"
  };

  await salvarOnline(dados);
  alert("Horário atualizado!");
}

document.addEventListener("DOMContentLoaded", iniciarSync);
