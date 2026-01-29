let candidatos = JSON.parse(localStorage.getItem("candidatos")) || [];

function salvarCandidato(dados) {
  candidatos.push(dados);
  localStorage.setItem("candidatos", JSON.stringify(candidatos));
}

function carregarCandidatos() {
  const lista = document.getElementById("listaCandidatos");
  const contador = document.getElementById("contador");
  if (!lista || !contador) return;

  lista.innerHTML = "";
  contador.innerText = candidatos.length;

  candidatos.forEach((c, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${c.nome}</strong> (${c.idade})<br>
      Discord: ${c.discord}<br>
      Cargo: ${c.cargo} | Tiro: ${c.tiro} | P1: ${c.p1}<br>
      <button onclick="excluirCandidato(${i})">Excluir</button>
    `;
    lista.appendChild(li);
  });
}

function excluirCandidato(index) {
  if (!confirm("Excluir candidato?")) return;
  candidatos.splice(index, 1);
  localStorage.setItem("candidatos", JSON.stringify(candidatos));
  carregarCandidatos();
}

document.addEventListener("DOMContentLoaded", carregarCandidatos);
