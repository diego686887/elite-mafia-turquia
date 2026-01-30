// ==================== SINCRONIZAÇÃO (NOVA) ====================
const API_KEY = '$2a$10$59L4ur895kSE2c6lxNsB7eBp2T.l55.HgfTBTDSJGyDCCrOFvSe8S';
let binId = localStorage.getItem('elite_bin_id');

// Criar banco online automaticamente
async function criarBancoOnline() {
    try {
        const dados = {
            horario: localStorage.getItem("horario") || "Sexta-feira às 20:00",
            candidatos: JSON.parse(localStorage.getItem("candidatos") || "[]")
        };
        
        const resposta = await fetch('https://api.jsonbin.io/v3/b', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify(dados)
        });
        
        const dadosResposta = await resposta.json();
        binId = dadosResposta.metadata.id;
        localStorage.setItem('elite_bin_id', binId);
        return true;
    } catch (erro) {
        console.log("Modo offline - sem sincronização");
        return false;
    }
}

// Buscar dados online
async function buscarOnline() {
    try {
        if (!binId) return false;
        
        const resposta = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
            headers: { 'X-Master-Key': API_KEY }
        });
        
        const dados = await resposta.json();
        const registro = dados.record;
        
        // Mesclar dados: se online tem dados, usa eles
        if (registro.horario) {
            localStorage.setItem("horario", registro.horario);
        }
        if (registro.candidatos) {
            localStorage.setItem("candidatos", JSON.stringify(registro.candidatos));
        }
        
        return true;
    } catch (erro) {
        return false;
    }
}

// Enviar dados online
async function enviarOnline() {
    try {
        if (!binId) {
            const criado = await criarBancoOnline();
            if (!criado) return false;
        }
        
        const dados = {
            horario: localStorage.getItem("horario") || "Sexta-feira às 20:00",
            candidatos: JSON.parse(localStorage.getItem("candidatos") || "[]")
        };
        
        await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify(dados)
        });
        
        return true;
    } catch (erro) {
        return false;
    }
}

// Iniciar sincronização
async function iniciarSync() {
    // Primeiro busca online
    await buscarOnline();
    
    // Atualiza variáveis locais
    horario = localStorage.getItem("horario") || "Sexta-feira às 20:00";
    
    // Atualiza display se existir
    if (diaTreino) {
        diaTreino.innerText = "Treino marcado para: " + horario;
    }
    
    // Atualiza lista se for admin
    if (lista && contador) {
        let candidatos = JSON.parse(localStorage.getItem("candidatos")) || [];
        contador.innerText = candidatos.length;
        lista.innerHTML = '';
        
        candidatos.forEach(c => {
            let li = document.createElement("li");
            li.innerText =
                `Nome: ${c.nome} | Idade: ${c.idade} | Discord: ${c.discord} | Cargo: ${c.cargo} | Tiro: ${c.tiro} | P1: ${c.p1}`;
            lista.appendChild(li);
        });
    }
    
    // Sincroniza a cada 10 segundos
    setInterval(async () => {
        await buscarOnline();
        horario = localStorage.getItem("horario") || "Sexta-feira às 20:00";
        if (diaTreino) {
            diaTreino.innerText = "Treino marcado para: " + horario;
        }
    }, 10000);
}

// ==================== CÓDIGO ORIGINAL (INTACTO) ====================
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
    
    // Envia online em segundo plano
    enviarOnline();

    alert("Candidatura enviada com sucesso!");
    document.getElementById("formCandidatura").reset();
}

// ADMIN
function salvarHorario() {
    let novo = document.getElementById("novoHorario").value;
    if (novo.trim() === "") return;

    localStorage.setItem("horario", novo);
    alert("Horário atualizado!");
    
    // Envia online
    enviarOnline();
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

// ==================== INICIAR TUDO ====================
// Inicia sincronização quando página carrega
document.addEventListener('DOMContentLoaded', iniciarSync);
