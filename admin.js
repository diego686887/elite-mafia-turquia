function entrar() {
  const key = keyInput.value;
  const keys = JSON.parse(localStorage.getItem("keys") || "[]");

  if (!keys.includes(key)) {
    alert("KEY inválida");
    return;
  }

  login.style.display = "none";
  painel.style.display = "block";
  carregar();
}

function salvarTreino() {
  localStorage.setItem("treinoDia", diaTreino.value);
  localStorage.setItem("treinoHora", horaTreino.value);
  alert("Treino atualizado");
}

function carregar() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  const candidatos = JSON.parse(localStorage.getItem("candidatos") || "[]");
  contador.innerText = candidatos.length;

  candidatos.forEach((c, i) => {
    const li = document.createElement("li");
    li.innerHTML = `${c.nome} (${c.idade}) <button onclick="excluir(${i})">Excluir</button>`;
    lista.appendChild(li);
  });
}

function excluir(i) {
  const candidatos = JSON.parse(localStorage.getItem("candidatos"));
  candidatos.splice(i, 1);
  localStorage.setItem("candidatos", JSON.stringify(candidatos));
  carregar();
}
