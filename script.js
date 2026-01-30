// CARREGAR HORÁRIO - FUNÇÃO SEPARADA
function carregarHorario() {
    let horario = localStorage.getItem("horario") || "Sexta-feira às 20:00";
    const diaTreino = document.getElementById("diaTreino");
    
    if (diaTreino) {
        diaTreino.innerText = "Treino marcado para: " + horario;
    }
    
    return horario;
}

// INICIALIZAR HORÁRIO QUANDO A PÁGINA CARREGAR
let horario = carregarHorario();

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
        p1: document.getElementById("p1").value,
        id: Date.now()
    };

    let candidatos = JSON.parse(localStorage.getItem("candidatos")) || [];
    candidatos.push(candidato);
    localStorage.setItem("candidatos", JSON.stringify(candidatos));

    alert("Candidatura enviada com sucesso!");
    document.getElementById("formCandidatura").reset();
}

// ADMIN - SALVAR HORÁRIO
function salvarHorario() {
    let novo = document.getElementById("novoHorario").value;
    if (novo.trim() === "") return;

    localStorage.setItem("horario", novo);
    alert("Horário atualizado!");
    
    // Atualizar a variável global e a exibição
    horario = novo;
    carregarHorario();
}

// FUNÇÃO PARA EXCLUIR CANDIDATO
function excluirCandidato(id) {
    if (!confirm("Tem certeza que deseja excluir este candidato?")) {
        return;
    }
    
    let candidatos = JSON.parse(localStorage.getItem("candidatos")) || [];
    candidatos = candidatos.filter(candidato => candidato.id !== id);
    localStorage.setItem("candidatos", JSON.stringify(candidatos));
    
    carregarCandidatos();
    alert("Candidato excluído com sucesso!");
}

// FUNÇÃO PARA CARREGAR CANDIDATOS
function carregarCandidatos() {
    const lista = document.getElementById("listaCandidatos");
    const contador = document.getElementById("contador");
    
    if (lista && contador) {
        let candidatos = JSON.parse(localStorage.getItem("candidatos")) || [];
        contador.innerText = candidatos.length;
        lista.innerHTML = '';
        
        if (candidatos.length === 0) {
            let li = document.createElement("li");
            li.innerText = "Nenhum candidato cadastrado.";
            li.style.color = "#999";
            lista.appendChild(li);
            return;
        }
        
        candidatos.forEach(c => {
            let li = document.createElement("li");
            let conteudo = document.createElement("div");
            conteudo.innerHTML = `
                <strong>Nome:</strong> ${c.nome} | 
                <strong>Idade:</strong> ${c.idade} | 
                <strong>Discord:</strong> ${c.discord}<br>
                <strong>Cargo:</strong> ${c.cargo} | 
                <strong>Tiro:</strong> ${c.tiro} | 
                <strong>P1:</strong> ${c.p1}
            `;
            
            let botaoExcluir = document.createElement("button");
            botaoExcluir.innerText = "Excluir";
            botaoExcluir.style.marginLeft = "10px";
            botaoExcluir.style.background = "#8B0000";
            botaoExcluir.style.padding = "5px 10px";
            botaoExcluir.style.fontSize = "12px";
            botaoExcluir.onclick = function() {
                excluirCandidato(c.id);
            };
            
            li.appendChild(conteudo);
            li.appendChild(botaoExcluir);
            lista.appendChild(li);
        });
    }
}

// INICIALIZAR TUDO QUANDO A PÁGINA CARREGAR
document.addEventListener('DOMContentLoaded', function() {
    // Sempre carregar o horário atual
    carregarHorario();
    
    // Se estiver na página admin, carregar candidatos
    if (document.getElementById('listaCandidatos')) {
        carregarCandidatos();
    }
    
    // Atualizar horário a cada 2 segundos (para mobile)
    setInterval(carregarHorario, 2000);
});

// TAMBÉM INICIALIZAR QUANDO A PÁGINA ESTIVER COMPLETAMENTE CARREGADA
window.addEventListener('load', function() {
    carregarHorario();
    if (document.getElementById('listaCandidatos')) {
        carregarCandidatos();
    }
});
