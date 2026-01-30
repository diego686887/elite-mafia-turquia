// Sistema de navegação e funções gerais da Elite Mafia Turquia

// Inicialização do sistema
document.addEventListener('DOMContentLoaded', function() {
    inicializarSistema();
    verificarCompatibilidade();
    carregarConfiguracoes();
});

// Função de inicialização
function inicializarSistema() {
    console.log('🔱 Sistema Elite Mafia Turquia iniciado');
    
    // Verificar se é primeira visita
    if (!localStorage.getItem('primeiraVisita')) {
        localStorage.setItem('primeiraVisita', new Date().toISOString());
        mostrarBoasVindas();
    }
    
    // Configurar tema escuro (garantir)
    document.documentElement.style.backgroundColor = '#000';
    document.body.style.backgroundColor = '#000';
    
    // Adicionar efeitos visuais
    adicionarEfeitosVisuais();
}

// Verificar compatibilidade do navegador
function verificarCompatibilidade() {
    const requisitos = {
        localStorage: 'localStorage' in window,
        sessionStorage: 'sessionStorage' in window,
        JSON: 'JSON' in window
    };
    
    if (!requisitos.localStorage || !requisitos.JSON) {
        mostrarErroCompatibilidade();
    }
}

// Carregar configurações do sistema
function carregarConfiguracoes() {
    // Configurações padrão
    const configPadrao = {
        tema: 'escuro',
        idioma: 'pt-BR',
        notificacoes: true,
        autoSave: true
    };
    
    let config = localStorage.getItem('configSistema');
    if (!config) {
        localStorage.setItem('configSistema', JSON.stringify(configPadrao));
        config = configPadrao;
    } else {
        config = JSON.parse(config);
    }
    
    return config;
}

// Funções de navegação
function navegarPara(pagina) {
    // Salvar estado atual
    const estado = {
        paginaAtual: window.location.pathname,
        timestamp: Date.now()
    };
    
    sessionStorage.setItem('ultimaPagina', JSON.stringify(estado));
    
    // Navegar
    window.location.href = pagina;
}

function voltarPagina() {
    const estado = sessionStorage.getItem('ultimaPagina');
    if (estado) {
        const { paginaAtual } = JSON.parse(estado);
        window.location.href = paginaAtual || 'index.html';
    } else {
        window.history.back();
    }
}

// Sistema de logs
function registrarLog(acao, dados = {}) {
    const log = {
        acao: acao,
        dados: dados,
        usuario: localStorage.getItem('usuarioAtual') || 'anonimo',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        pagina: window.location.pathname
    };
    
    // Salvar logs (limitar a 100 registros)
    let logs = JSON.parse(localStorage.getItem('sistemaLogs')) || [];
    logs.unshift(log);
    
    if (logs.length > 100) {
        logs = logs.slice(0, 100);
    }
    
    localStorage.setItem('sistemaLogs', JSON.stringify(logs));
    return log;
}

// Funções de utilidade
function formatarData(data) {
    if (!data) data = new Date();
    if (typeof data === 'string') data = new Date(data);
    
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarIdade(idade) {
    idade = parseInt(idade);
    return !isNaN(idade) && idade >= 12 && idade <= 99;
}

function gerarID(tamanho = 8) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    
    for (let i = 0; i < tamanho; i++) {
        id += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    
    return id;
}

// Sistema de notificações
function mostrarNotificacao(titulo, mensagem, tipo = 'info') {
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    
    // Cores por tipo
    const cores = {
        info: '#007bff',
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545'
    };
    
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${cores[tipo]}20;
        color: white;
        border-left: 4px solid ${cores[tipo]};
        border-radius: 4px;
        z-index: 9999;
        max-width: 300px;
        animation: slideIn 0.3s ease;
        backdrop-filter: blur(10px);
    `;
    
    notificacao.innerHTML = `
        <strong>${titulo}</strong>
        <p style="margin: 5px 0 0 0; font-size: 14px;">${mensagem}</p>
    `;
    
    document.body.appendChild(notificacao);
    
    // Remover após 5 segundos
    setTimeout(() => {
        notificacao.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notificacao.remove(), 300);
    }, 5000);
    
    // Registrar log
    registrarLog('notificacao_exibida', { titulo, tipo });
}

// Adicionar CSS para animações
function adicionarEstilosDinamicos() {
    const estilo = document.createElement('style');
    estilo.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .pulse {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
    `;
    
    document.head.appendChild(estilo);
}

// Efeitos visuais
function adicionarEfeitosVisuais() {
    // Adicionar efeito de digitação em títulos
    const titulos = document.querySelectorAll('h1[data-digitar]');
    titulos.forEach(titulo => {
        const texto = titulo.textContent;
        titulo.textContent = '';
        
        let i = 0;
        const digitar = () => {
            if (i < texto.length) {
                titulo.textContent += texto.charAt(i);
                i++;
                setTimeout(digitar, 50);
            }
        };
        
        digitar();
    });
    
    // Adicionar efeito hover em botões
    const botoes = document.querySelectorAll('.btn');
    botoes.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Função de boas-vindas
function mostrarBoasVindas() {
    setTimeout(() => {
        mostrarNotificacao(
            'Bem-vindo à Elite Mafia Turquia',
            'Sistema de candidaturas inicializado com sucesso!',
            'info'
        );
    }, 1000);
}

// Função de erro de compatibilidade
function mostrarErroCompatibilidade() {
    document.body.innerHTML = `
        <div style="padding: 40px; text-align: center;">
            <h1 style="color: #ff4444;">⚠️ ERRO DE COMPATIBILIDADE</h1>
            <p>Seu navegador não suporta alguns recursos necessários.</p>
            <p>Atualize para a versão mais recente ou use outro navegador.</p>
            <p>Recomendado: Chrome, Firefox ou Edge atualizados.</p>
        </div>
    `;
}

// Exportar funções para uso global
window.EliteMafia = {
    navegarPara,
    voltarPagina,
    mostrarNotificacao,
    formatarData,
    validarIdade,
    gerarID,
    registrarLog
};

// Adicionar estilos dinâmicos
adicionarEstilosDinamicos();