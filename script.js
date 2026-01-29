const dia = localStorage.getItem("treinoDia");
const hora = localStorage.getItem("treinoHora");
const btn = document.getElementById("btnTreino");

if (dia && hora) {
  btn.innerText = `Treino ${dia} às ${hora} — Confirmar presença`;
} else {
  btn.innerText = "Treino ainda não definido";
  btn.disabled = true;
}

btn.onclick = () => {
  if (!confirm(`Você concorda com o treino em ${dia} às ${hora}?`)) {
    alert("Espere o próximo recrutamento.");
    return;
  }

  const candidatos = JSON.parse(localStorage.getItem("candidatos") || "[]");

  candidatos.push({
    nome: nome.value,
    idade: idade.value,
    discord: discord.value,
    cargo: cargo.value,
    tiro: tiro.value,
    p1: p1.value
  });

  localStorage.setItem("candidatos", JSON.stringify(candidatos));
  alert("Candidatura enviada!");
};
