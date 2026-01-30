// Sistema de sincronização básico
function sincronizarTreino(treino) {
    // Simular sincronização entre dispositivos
    localStorage.setItem('lastSync', new Date().toISOString());
    
    // Em um sistema real, aqui você enviaria para um servidor
    console.log('Treino sincronizado:', treino);
    
    // Notificar outros dispositivos (simulação)
    if (window.BroadcastChannel) {
        const channel = new BroadcastChannel('treino_channel');
        channel.postMessage({
            type: 'UPDATE_TREINO',
            data: treino
        });
    }
}

// Ouvir por atualizações de outros dispositivos
if (window.BroadcastChannel) {
    const channel = new BroadcastChannel('treino_channel');
    channel.onmessage = function(event) {
        if (event.data.type === 'UPDATE_TREINO') {
            localStorage.setItem('treinoData', JSON.stringify(event.data.data));
            
            // Atualizar a página se estiver na página de perguntas
            if (window.location.pathname.includes('perguntas.html')) {
                location.reload();
            }
            
            alert('Treino atualizado por outro dispositivo!');
        }
    };
}

// Sistema de persistência de sessão
function verificarSessaoAdmin() {
    const lastActivity = localStorage.getItem('lastActivity');
    const now = Date.now();
    
    if (lastActivity && (now - lastActivity > 3600000)) { // 1 hora
        localStorage.removeItem('adminLogged');
    }
    
    localStorage.setItem('lastActivity', now);
}

// Atualizar atividade a cada 5 minutos
setInterval(verificarSessaoAdmin, 300000);

// Inicializar
verificarSessaoAdmin();