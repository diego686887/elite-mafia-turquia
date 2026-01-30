// ==================== CONFIGURAÇÃO JSONBIN ====================
const API_KEY = '$2a$10$59L4ur895kSE2c6lxNsB7eBp2T.l55.HgfTBTDSJGyDCCrOFvSe8S';
let BIN_ID = localStorage.getItem('jsonbin_id') || null;

// URLs da API
function getBinUrl() {
    if (!BIN_ID) return null;
    return `https://api.jsonbin.io/v3/b/${BIN_ID}`;
}

function getLatestUrl() {
    if (!BIN_ID) return null;
    return `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;
}

// ==================== CRIAR BIN AUTOMATICAMENTE ====================
async function criarBinInicial() {
    try {
        console.log("🆕 Criando novo bin...");
        
        const dadosIniciais = {
            horario: localStorage.getItem("horario") || "Sexta-feira às 20:00",
            candidatos: JSON.parse(localStorage.getItem("candidatos") || "[]"),
            criadoEm: new Date().toISOString()
        };
        
        const response = await fetch('https://api.jsonbin.io/v3/b', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY,
                'X-Bin-Name': 'EliteTurquiaDB'
            },
            body: JSON.stringify(dadosIniciais)
        });
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        BIN_ID = data.metadata.id;
        localStorage.setItem('jsonbin_id', BIN_ID);
        
        console.log("✅ Bin criado com ID:", BIN_ID);
        return true;
    } catch (error) {
        console.error("❌ Erro ao criar bin:", error);
        return false;
    }
}

// ==================== SINCRONIZAR DADOS ====================
async function sincronizarComNuvem() {
    // Se não tem BIN_ID, cria um primeiro
    if (!BIN_ID) {
        const criado = await criarBinInicial();
        if (!criado) return false;
    }
    
    try {
        // Buscar da nuvem
        const response = await fetch(getLatestUrl(), {
            headers: { 'X-Master-Key': API_KEY }
        });
        
        if (response.ok) {
            const dadosRemotos = await response.json();
            const record = dadosRemotos.record || dadosRemotos;
            
            // Atualizar localStorage com dados da nuvem
            if (record.horario) {
                localStorage.setItem("horario", record.horario);
            }
            if (record.candidatos) {
                localStorage.setItem("candidatos", JSON.stringify(record.candidatos));
            }
            
            console.log("✅ Dados sincronizados da nuvem");
            return true;
        }
    } catch (error) {
        console.warn("⚠️ Erro ao buscar da nuvem:", error);
    }
    
    return false;
}

async function enviarParaNuvem() {
    if (!BIN_ID) return false;
    
    const dadosParaEnviar = {
        horario: localStorage.getItem("horario") || "Sexta-feira às 20:00",
        candidatos: JSON.parse(localStorage.getItem("candidatos") || "[]"),
        ultimaAtualizacao: new Date().toISOString()
    };
    
    try {
        const response = await fetch(getBinUrl(), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify(dadosParaEnviar)
        });
        
        if (!response.ok) throw new Error(`Erro: ${response.status}`);
        
        console.log("✅ Dados enviados para nuvem");
        return true;
    } catch (error) {
        console.error("❌ Erro ao enviar:", error);
        return false;
    }
}

// ==================== FUNÇÕES PRINCIPAIS (MANTIDAS) ====================
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
        id: Date.now()
    };

    let candidatos = JSON.parse(localStorage.getItem("candidatos")) || [];
    candidatos.push(candidato);
    localStorage.setItem("candidatos", JSON.stringify(candidatos));
    
    // Enviar para nuvem
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
    
    alert("Horário atualizado e sincronizado!");
    
    // Atualizar display se estiver na página de candidatura
    if (diaTreino) {
        diaTreino.innerText = "Treino marcado para: " + novo;
    }
}

// LISTAR CANDIDATOS
function carregarCandidatos() {
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
                    <strong>Discord:</strong> ${c.discord}<br>
                    <strong>Cargo:</strong> ${c.cargo} | 
                    <strong>Tiro:</strong> ${c.tiro} | 
                    <strong>P1:</strong> ${c.p1}
                </div>
                <button onclick="excluirCandidato(${c.id})" class="btn-excluir">
                    Excluir
                </button>
            `;
            lista.appendChild(li);
        });
    }
}

// EXCLUIR CANDIDATO
async function excluirCandidato(id) {
    if (!confirm("Tem certeza que deseja excluir este candidato?")) {
        return;
    }
    
    let candidatos = JSON.parse(localStorage.getItem("candidatos")) || [];
    candidatos = candidatos.filter(candidato => candidato.id !== id);
    localStorage.setItem("candidatos", JSON.stringify(candidatos));
    
    // Enviar para nuvem
    await enviarParaNuvem();
    
    carregarCandidatos();
    alert("Candidato excluído com sucesso!");
}

// ==================== INICIALIZAÇÃO ====================
async function iniciarSistema() {
    console.log("Iniciando sistema...");
    
    // Sincronizar com a nuvem
    await sincronizarComNuvem();
    
    // Atualizar horário local
    horario = localStorage.getItem("horario") || "Sexta-feira às 20:00";
    
    // Atualizar display do horário
    if (diaTreino) {
        diaTreino.innerText = "Treino marcado para: " + horario;
    }
    
    // Se for admin, carregar candidatos
    if (document.getElementById('listaCandidatos')) {
        carregarCandidatos();
    }
    
    // Sincronizar a cada 10 segundos
    setInterval(async () => {
        await sincronizarComNuvem();
        horario = localStorage.getItem("horario") || "Sexta-feira às 20:00";
        if (diaTreino) {
            diaTreino.innerText = "Treino marcado para: " + horario;
        }
    }, 10000); // 10 segundos
}

// Iniciar quando a página carregar
document.addEventListener('DOMContentLoaded', iniciarSistema);
window.addEventListener('load', iniciarSistema);

// Tornar funções globais
window.salvarHorario = salvarHorario;
window.confirmarHorario = confirmarHorario;
window.carregarCandidatos = carregarCandidatos;
window.excluirCandidato = excluirCandidato;
