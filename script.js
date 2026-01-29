// CARREGAR HORÁRIO
let horario = localStorage.getItem("horario") || "Sexta-feira às 20:00";

const diaTreino = document.getElementById("diaTreino");
if (diaTreino) {
    diaTreino.innerText = "Treino marcado para: " + horario;
}

// CONFIRMAÇÃO
function confirmarHorario() {
    let confirma = confirm(
        "Você realmente concorda com o dia e horário: " + horario + "?"
    );

    if (!confirma) {
        alert("Aguarde o próximo recrutamento.");
        return;
    }

    let candidato = {
        nome: document.getElementById("nome").value,
        idade: document.getElementById("idade").value,
        discord: document.getElementById("discord").value,
        cargo: document.getElementById("cargo").value,
        tiro: document.getElementById("tiro").value,
        p1: document.getElementById("p1").value
    };

    let candidatos = JSON.parse(localStorage.getItem("candidatos")) || [];
    candidatos.push(candidato);
    localStorage.setItem("candidatos", JSON.stringify(candidatos));

    alert("Candidatura enviada com sucesso!");
    document.getElementById("formCandidatura").reset();
}

// ADMIN
function salvarHorario() {
    let novo = document.getElementById("novoHorario").value;
    if (novo.trim() === "") return;

    localStorage.setItem("horario", novo);
    alert("Horário atualizado!");
}

// LISTAR CANDIDATOS
const lista = document.getElementById("listaCandidatos");
const contador = document.getElementById("contador");

if (lista && contador) {
    let candidatos = JSON.parse(localStorage.getItem("candidatos")) || [];
    contador.innerText = candidatos.length;

    candidatos.forEach(c => {
        let li = document.createElement("li");
        li.innerText =
            `Nome: ${c.nome} | Idade: ${c.idade} | Discord: ${c.discord} | Cargo: ${c.cargo} | Tiro: ${c.tiro} | P1: ${c.p1}`;
        lista.appendChild(li);
    });
}
