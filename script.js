// ==================== SINCRONIZAÇÃO COM NUVEM ====================
const API_KEY = '$2a$10$59L4ur895kSE2c6lxNsB7eBp2T.l55.HgfTBTDSJGyDCCrOFvSe8S';
let BIN_ID = null;

// Criar bin automaticamente se não existir
async function criarBin() {
    try {
        const dados = {
            horario: localStorage.getItem("horario") || "Sexta-feira às 20:00",
            candidatos: JSON.parse(localStorage.getItem("candidatos") || "[]")
        };
        
        const response = await fetch('https://api.jsonbin.io/v3/b', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY,
                'X-Bin-Name': 'EliteTurquia'
            },
            body: JSON.stringify(dados)
        });
        
        const data = await response.json();
        BIN_ID = data.metadata.id;
        localStorage.setItem('jsonbin_id', BIN_ID);
        return true;
    } catch (error) {
        console.log("Modo offline - usando dados locais");
        return false;
    }
}

// Buscar dados da nuvem
async function buscarDaNuvem() {
    try {
        BIN_ID = localStorage.getItem('jsonbin_id');
        if (!BIN_ID) return false;
        
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': API_KEY }
        });
        
        const data = await response.json();
        const record = data.record;
        
        // Atualizar dados locais com os da nuvem
        if (record.horario) {
            localStorage.setItem("horario", record.horario);
        }
        if (record.candidatos) {
            localStorage.setItem("candidatos", JSON.stringify(record.candidatos));
        }
        
        return true;
    } catch (error) {
        return false;
    }
}

// Enviar dados para nuvem
async function enviarParaNuvem() {
    try {
        if (!BIN_ID) {
            await criarBin();
            if (!BIN_ID) return false;
        }
        
        const dados = {
            horario: localStorage.getItem("horario") || "Sexta-feira às 20:00",
            candidatos: JSON.parse(localStorage.getItem("candidatos") || "[]"),
            atualizadoEm: new Date().toISOString()
        };
        
        await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify(dados)
        });
        
        return true;
    } catch (error) {
        return false;
    }
}

// ==================== CÓDIGO ORIGINAL (MANTIDO) ====================
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
    
    // Enviar para nuvem em segundo plano
    enviarParaNuvem();

    alert("Candidatura enviada com sucesso!");
    document.getElementById("formCandidatura").reset();
}

// ADMIN
function salvarHorario() {
    let novo = document.getElementById("novoHorario").value;
    if (novo.trim() === "") return;

    localStorage.setItem("horario", novo);
    horario = novo;
    
    // Enviar para nuvem
    enviarParaNuvem();
    
    alert("Horário atualizado!");
    
    // Atualizar também na página de candidatura se estiver aberta
    if (diaTreino) {
        diaTreino.innerText = "Treino marcado para: " + novo;
    }
}

// LISTAR CANDIDATOS
const lista = document.getElementById("listaCandidatos");
const contador = document.getElementById("contador");

if (lista && contador) {
    let candidatos = JSON.parse(localStorage.getItem("candidatos")) || [];
    contador.innerText = candidatos.length;
    
    // Limpar lista antes de recarregar
    lista.innerHTML = '';

    candidatos.forEach(c => {
        let li = document.createElement("li");
        li.innerHTML = `
            <div>
                <strong>Nome:</strong> ${c.nome} | 
                <strong>Idade:</strong> ${c.idade} | 
                <strong>Discord:</strong> ${c.discord} | 
                <strong>Cargo:</strong> ${c.cargo} | 
                <strong>Tiro:</strong> ${c.tiro} | 
                <strong>P1:</strong> ${c.p1}
            </div>
            <button onclick="excluirCandidato(${c.id})" style="
                background: #8B0000;
                padding: 5px 10px;
                font-size: 12px;
                margin-left: 10px;
                cursor: pointer;
            ">
                Excluir
            </button>
        `;
        lista.appendChild(li);
    });
}

// FUNÇÃO PARA EXCLUIR CANDIDATO
async function excluirCandidato(id) {
    if (!confirm("Tem certeza que deseja excluir este candidato?")) {
        return;
    }
    
    let candidatos = JSON.parse(localStorage.getItem("candidatos")) || [];
    candidatos = candidatos.filter(candidato => candidato.id !== id);
    localStorage.setItem("candidatos", JSON.stringify(candidatos));
    
    // Enviar para nuvem
    await enviarParaNuvem();
    
    // Recarrega a lista na tela
    location.reload();
}

// ==================== INICIALIZAR SINCRONIZAÇÃO ====================
async function iniciarSincronizacao() {
    // Primeiro: tentar buscar dados da nuvem
    await buscarDaNuvem();
    
    // Atualizar variáveis locais com possíveis dados da nuvem
    horario = localStorage.getItem("horario") || "Sexta-feira às 20:00";
    
    // Atualizar display se existir
    if (diaTreino) {
        diaTreino.innerText = "Treino marcado para: " + horario;
    }
    
    // Atualizar lista de candidatos se for admin
    if (lista && contador) {
        let candidatos = JSON.parse(localStorage.getItem("candidatos")) || [];
        contador.innerText = candidatos.length;
        lista.innerHTML = '';
        
        candidatos.forEach(c => {
            let li = document.createElement("li");
            li.innerHTML = `
                <div>
                    <strong>Nome:</strong> ${c.nome} | 
                    <strong>Idade:</strong> ${c.idade} | 
                    <strong>Discord:</strong> ${c.discord} | 
                    <strong>Cargo:</strong> ${c.cargo} | 
                    <strong>Tiro:</strong> ${c.tiro} | 
                    <strong>P1:</strong> ${c.p1}
                </div>
                <button onclick="excluirCandidato(${c.id})" style="
                    background: #8B0000;
                    padding: 5px 10px;
                    font-size: 12px;
                    margin-left: 10px;
                    cursor: pointer;
                ">
                    Excluir
                </button>
            `;
            lista.appendChild(li);
        });
    }
    
    // Sincronizar a cada 5 segundos
    setInterval(async () => {
        await buscarDaNuvem();
        horario = localStorage.getItem("horario") || "Sexta-feira às 20:00";
        if (diaTreino) {
            diaTreino.innerText = "Treino marcado para: " + horario;
        }
    }, 5000);
}

// Iniciar quando a página carregar
document.addEventListener('DOMContentLoaded', iniciarSincronizacao);
