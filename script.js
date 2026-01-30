// ==================== CONFIGURAÇÃO ====================
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
            criadoEm: new Date().toISOString(),
            dispositivo: navigator.userAgent
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
        if (!criado) {
            mostrarStatus("❌ Não foi possível criar banco de dados online", "red");
            return false;
        }
    }
    
    try {
        // PRIMEIRO: Buscar da nuvem
        console.log("📥 Buscando da nuvem...");
        const response = await fetch(getLatestUrl(), {
            headers: {
                'X-Master-Key': API_KEY
            }
        });
        
        if (response.ok) {
            const dadosRemotos = await response.json();
            const record = dadosRemotos.record || dadosRemotos;
            
            // Mesclar dados: prioridade para os mais recentes
            const dadosLocais = {
                horario: localStorage.getItem("horario") || "Sexta-feira às 20:00",
                candidatos: JSON.parse(localStorage.getItem("candidatos") || "[]"),
                ultimaAtualizacaoLocal: localStorage.getItem("ultimaAtualizacao")
            };
            
            // Comparar timestamps para ver qual é mais recente
            if (record.ultimaAtualizacao && dadosLocais.ultimaAtualizacaoLocal) {
                const remotoTime = new Date(record.ultimaAtualizacao).getTime();
                const localTime = new Date(dadosLocais.ultimaAtualizacaoLocal).getTime();
                
                if (remotoTime > localTime) {
                    // Dados remotos são mais recentes
                    localStorage.setItem("horario", record.horario || dadosLocais.horario);
                    localStorage.setItem("candidatos", JSON.stringify(record.candidatos || dadosLocais.candidatos));
                    console.log("✅ Dados atualizados da nuvem (remoto mais recente)");
                } else {
                    // Dados locais são mais recentes - enviar para nuvem
                    await enviarParaNuvem();
                }
            } else {
                // Se não tem timestamp, usar dados remotos
                localStorage.setItem("horario", record.horario || dadosLocais.horario);
                localStorage.setItem("candidatos", JSON.stringify(record.candidatos || dadosLocais.candidatos));
            }
            
            mostrarStatus("✅ Sincronizado com a nuvem", "green");
            return true;
        }
        
    } catch (error) {
        console.warn("⚠️ Erro ao sincronizar:", error);
    }
    
    // Se falhou ao buscar, tentar enviar nossos dados
    try {
        await enviarParaNuvem();
        mostrarStatus("📤 Dados enviados para a nuvem", "blue");
        return true;
    } catch (error) {
        console.error("❌ Falha total na sincronização:", error);
        mostrarStatus("⚠️ Modo offline - usando dados locais", "orange");
        return false;
    }
}

async function enviarParaNuvem() {
    if (!BIN_ID) return false;
    
    const dadosParaEnviar = {
        horario: localStorage.getItem("horario") || "Sexta-feira às 20:00",
        candidatos: JSON.parse(localStorage.getItem("candidatos") || "[]"),
        ultimaAtualizacao: new Date().toISOString(),
        dispositivo: navigator.platform,
        userAgent: navigator.userAgent
    };
    
    const response = await fetch(getBinUrl(), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': API_KEY
        },
        body: JSON.stringify(dadosParaEnviar)
    });
    
    if (!response.ok) {
        throw new Error(`Erro ao enviar: ${response.status}`);
    }
    
    localStorage.setItem("ultimaAtualizacao", new Date().toISOString());
    console.log("✅ Dados enviados para nuvem");
    return true;
}

// ==================== FUNÇÕES PRINCIPAIS ====================
function getHorario() {
    return localStorage.getItem("horario") || "Sexta-feira às 20:00";
}

function atualizarDisplayHorario() {
    const diaTreino = document.getElementById("diaTreino");
    if (diaTreino) {
        const horario = getHorario();
        diaTreino.innerHTML = `<strong>📅 Treino marcado para:</strong><br><span style="color:#ffcc00;font-size:1.2em;">${horario}</span>`;
    }
}

async function salvarHorario() {
    let novo = document.getElementById("novoHorario")?.value.trim();
    if (!novo || novo === "") {
        alert("Digite um horário válido!");
        return;
    }
    
    // Salvar localmente
    localStorage.setItem("horario", novo);
    
    // Salvar na nuvem
    const sucesso = await enviarParaNuvem();
    
    if (sucesso) {
        mostrarStatus("✅ Horário salvo e sincronizado!", "green", 3000);
        atualizarDisplayHorario();
        
        // Feedback visual no botão
        const btn = document.querySelector("button[onclick='salvarHorario()']");
        if (btn) {
            const original = btn.innerHTML;
            btn.innerHTML = "✅ SALVO!";
            btn.style.background = "green";
            setTimeout(() => {
                btn.innerHTML = original;
                btn.style.background = "";
            }, 2000);
        }
    } else {
        mostrarStatus("⚠️ Horário salvo apenas localmente", "orange", 3000);
        atualizarDisplayHorario();
    }
}

// ==================== CANDIDATOS ====================
function confirmarHorario() {
    const horario = getHorario();
    
    if (!confirm(`Você concorda com o horário do treino?\n\n📅 ${horario}\n\nClique OK para confirmar.`)) {
        alert("Candidatura cancelada.");
        return;
    }
    
    // Validar campos
    const campos = ['nome', 'idade', 'discord', 'cargo', 'tiro', 'p1'];
    for (let campo of campos) {
        const el = document.getElementById(campo);
        if (!el || !el.value.trim()) {
            alert(`Preencha o campo: ${campo}`);
            if (el) el.focus();
            return;
        }
    }
    
    const candidato = {
        id: Date.now() + Math.random(),
        nome: document.getElementById("nome").value.trim(),
        idade: document.getElementById("idade").value,
        discord: document.getElementById("discord").value.trim(),
        cargo: document.getElementById("cargo").value.trim(),
        tiro: document.getElementById("tiro").value,
        p1: document.getElementById("p1").value,
        dataCadastro: new Date().toLocaleString('pt-BR'),
        timestamp: Date.now()
    };
    
    let candidatos = JSON.parse(localStorage.getItem("candidatos") || "[]");
    candidatos.push(candidato);
    localStorage.setItem("candidatos", JSON.stringify(candidatos));
    
    // Sincronizar com a nuvem
    enviarParaNuvem().then(() => {
        console.log("Candidato enviado para nuvem");
    });
    
    alert("✅ Candidatura enviada com sucesso!");
    document.getElementById("formCandidatura")?.reset();
}

function carregarCandidatos() {
    const lista = document.getElementById("listaCandidatos");
    const contador = document.getElementById("contador");
    
    if (!lista || !contador) return;
    
    let candidatos = JSON.parse(localStorage.getItem("candidatos") || "[]");
    contador.textContent = candidatos.length;
    lista.innerHTML = "";
    
    if (candidatos.length === 0) {
        lista.innerHTML = '<li style="text-align:center; padding:20px; color:#999;">Nenhum candidato cadastrado.</li>';
        return;
    }
    
    // Ordenar por mais recente
    candidatos.sort((a, b) => b.timestamp - a.timestamp);
    
    candidatos.forEach(c => {
        let li = document.createElement("li");
        li.innerHTML = `
            <div class="candidato-info">
                <strong>👤 ${c.nome}</strong> (${c.idade} anos)<br>
                <strong>📱 Discord:</strong> ${c.discord}<br>
                <strong>💼 Cargo:</strong> ${c.cargo}<br>
                <strong>🎯 Tiro:</strong> ${c.tiro} | <strong>🔫 P1:</strong> ${c.p1}<br>
                <small style="color:#888;">${c.dataCadastro}</small>
            </div>
            <button class="btn-excluir" onclick="excluirCandidato(${c.id})">
                🗑️ Excluir
            </button>
        `;
        lista.appendChild(li);
    });
}

async function excluirCandidato(id) {
    if (!confirm("Tem certeza que deseja excluir este candidato?")) return;
    
    let candidatos = JSON.parse(localStorage.getItem("candidatos") || "[]");
    const novoTotal = candidatos.filter(c => c.id !== id);
    localStorage.setItem("candidatos", JSON.stringify(novoTotal));
    
    // Sincronizar
    await enviarParaNuvem();
    
    carregarCandidatos();
    mostrarStatus("✅ Candidato excluído e sincronizado", "green", 2000);
}

// ==================== INTERFACE ====================
function mostrarStatus(mensagem, cor, tempo = 3000) {
    // Remover status anterior
    const antigo = document.getElementById('statusGlobal');
    if (antigo) antigo.remove();
    
    // Criar novo status
    const statusEl = document.createElement('div');
    statusEl.id = 'statusGlobal';
    statusEl.innerHTML = mensagem;
    statusEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${cor === 'green' ? '#2ecc71' : cor === 'red' ? '#e74c3c' : '#f39c12'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(statusEl);
    
    // Remover após tempo
    setTimeout(() => {
        if (statusEl.parentNode) {
            statusEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (statusEl.parentNode) statusEl.remove();
            }, 300);
        }
    }, tempo);
}

// ==================== INICIALIZAÇÃO ====================
async function iniciarSistema() {
    console.log("🚀 Iniciando sistema Elite Turquia...");
    
    // Verificar se tem API key
    if (!API_KEY || API_KEY.includes('SUA_API_KEY')) {
        mostrarStatus("⚠️ Configure sua API Key primeiro", "red", 5000);
        return;
    }
    
    // 1. Atualizar interface imediatamente
    atualizarDisplayHorario();
    
    // 2. Se for admin, carregar candidatos
    if (document.getElementById('listaCandidatos')) {
        carregarCandidatos();
        
        // Adicionar botão de sincronização
        const btnSync = document.createElement('button');
        btnSync.innerHTML = "🔄 SINCRONIZAR AGORA";
        btnSync.style.cssText = `
            display: block;
            margin: 10px auto;
            padding: 10px 20px;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
        `;
        btnSync.onclick = async () => {
            btnSync.innerHTML = "🔄 Sincronizando...";
            btnSync.disabled = true;
            await sincronizarComNuvem();
            carregarCandidatos();
            atualizarDisplayHorario();
            btnSync.innerHTML = "🔄 SINCRONIZAR AGORA";
            btnSync.disabled = false;
        };
        
        const contador = document.getElementById("contador");
        if (contador && contador.parentNode) {
            contador.parentNode.appendChild(btnSync);
        }
    }
    
    // 3. Sincronizar com a nuvem (com delay para não travar)
    setTimeout(async () => {
        await sincronizarComNuvem();
        atualizarDisplayHorario();
        if (document.getElementById('listaCandidatos')) {
            carregarCandidatos();
        }
    }, 1000);
    
    // 4. Sincronizar periodicamente a cada 30 segundos
    setInterval(async () => {
        await sincronizarComNuvem();
    }, 30000);
}

// ==================== EVENTOS ====================
document.addEventListener('DOMContentLoaded', iniciarSistema);
window.addEventListener('load', iniciarSistema);

// Adicionar CSS para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .btn-excluir {
        background: #c0392b;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.3s;
    }
    
    .btn-excluir:hover {
        background: #e74c3c;
    }
`;
document.head.appendChild(style);

// ==================== EXPORTAR FUNÇÕES GLOBAIS ====================
window.salvarHorario = salvarHorario;
window.confirmarHorario = confirmarHorario;
window.carregarCandidatos = carregarCandidatos;
window.excluirCandidato = excluirCandidato;
window.sincronizarComNuvem = sincronizarComNuvem;
window.atualizarDisplayHorario = atualizarDisplayHorario;
