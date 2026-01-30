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
        p1: document.getElementById("p1").value,
        id: Date.now() // Adiciona um ID único para cada candidato
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
    // Atualizar também na página de candidatura se estiver aberta
    if (diaTreino) {
        diaTreino.innerText = "Treino marcado para: " + novo;
    }
}

// FUNÇÃO PARA EXCLUIR CANDIDATO
function excluirCandidato(id) {
    if (!confirm("Tem certeza que deseja excluir este candidato?")) {
        return;
    }
    
    let candidatos = JSON.parse(localStorage.getItem("candidatos")) || [];
    
    // Filtra removendo o candidato com o ID correspondente
    candidatos = candidatos.filter(candidato => candidato.id !== id);
    
    // Salva a lista atualizada
    localStorage.setItem("candidatos", JSON.stringify(candidatos));
    
    // Recarrega a lista na tela
    carregarCandidatos();
    
    alert("Candidato excluído com sucesso!");
}

// FUNÇÃO PARA CARREGAR CANDIDATOS NA ÁREA ADMIN
function carregarCandidatos() {
    const lista = document.getElementById("listaCandidatos");
    const contador = document.getElementById("contador");
    
    if (lista && contador) {
        let candidatos = JSON.parse(localStorage.getItem("candidatos")) || [];
        contador.innerText = candidatos.length;
        
        // Limpar lista antes de recarregar
        lista.innerHTML = '';
        
        // Se não houver candidatos
        if (candidatos.length === 0) {
            let li = document.createElement("li");
            li.innerText = "Nenhum candidato cadastrado.";
            li.style.color = "#999";
            lista.appendChild(li);
            return;
        }
        
        // Adicionar cada candidato à lista com botão de excluir
        candidatos.forEach(c => {
            let li = document.createElement("li");
            
            // Criar conteúdo do candidato
            let conteudo = document.createElement("div");
            conteudo.innerHTML = `
                <strong>Nome:</strong> ${c.nome} | 
                <strong>Idade:</strong> ${c.idade} | 
                <strong>Discord:</strong> ${c.discord}<br>
                <strong>Cargo:</strong> ${c.cargo} | 
                <strong>Tiro:</strong> ${c.tiro} | 
                <strong>P1:</strong> ${c.p1}
            `;
            
            // Criar botão de excluir
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

// CARREGAR CANDIDATOS QUANDO A PÁGINA ADMIN FOR ABERTA
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('listaCandidatos')) {
        carregarCandidatos();
    }
});
