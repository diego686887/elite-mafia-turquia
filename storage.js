// Sistema de sincronização entre abas/dispositivos

class SyncManager {
    constructor() {
        this.channel = null;
        this.syncEnabled = localStorage.getItem('syncEnabled') === 'true';
        this.init();
    }
    
    init() {
        // Usar BroadcastChannel para sincronização entre abas
        if ('BroadcastChannel' in window) {
            this.channel = new BroadcastChannel('elite_mafia_sync');
            
            this.channel.onmessage = (event) => {
                this.handleSyncMessage(event.data);
            };
        }
        
        // Usar localStorage events para navegadores antigos
        window.addEventListener('storage', (event) => {
            if (event.key === 'treinoData') {
                this.handleTreinoUpdate(event.newValue);
            }
        });
    }
    
    handleSyncMessage(data) {
        switch (data.type) {
            case 'TREINO_UPDATE':
                localStorage.setItem('treinoData', JSON.stringify(data.payload));
                this.notifyUpdate('treino', data.payload);
                break;
                
            case 'CANDIDATURA_NOVA':
                this.handleNovaCandidatura(data.payload);
                break;
                
            case 'SYNC_REQUEST':
                this.sendCurrentState();
                break;
        }
    }
    
    handleTreinoUpdate(newValue) {
        try {
            const treinoData = JSON.parse(newValue);
            this.notifyUpdate('treino', treinoData);
        } catch (e) {
            console.error('Erro ao processar atualização:', e);
        }
    }
    
    notifyUpdate(type, data) {
        const event = new CustomEvent(`${type}Updated`, { detail: data });
        window.dispatchEvent(event);
        
        // Mostrar notificação visual
        if (type === 'treino') {
            this.showNotification('Treino atualizado!', 'A data do treino foi alterada.');
        }
    }
    
    showNotification(title, message) {
        // Usar Notification API se disponível
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body: message, icon: '🔱' });
        }
        
        // Ou mostrar alerta simples
        if (!('Notification' in window)) {
            console.log(`${title}: ${message}`);
        }
    }
    
    sendTreinoUpdate(treinoData) {
        if (this.channel) {
            this.channel.postMessage({
                type: 'TREINO_UPDATE',
                payload: treinoData,
                timestamp: Date.now()
            });
        }
        
        // Forçar evento storage para navegadores antigos
        localStorage.setItem('treinoData', JSON.stringify(treinoData));
        localStorage.setItem('lastUpdate', Date.now().toString());
    }
    
    sendCurrentState() {
        const state = {
            treinoData: localStorage.getItem('treinoData'),
            candidaturas: localStorage.getItem('candidaturas'),
            timestamp: Date.now()
        };
        
        if (this.channel) {
            this.channel.postMessage({
                type: 'STATE_SYNC',
                payload: state
            });
        }
    }
    
    enableSync() {
        this.syncEnabled = true;
        localStorage.setItem('syncEnabled', 'true');
        this.sendCurrentState();
    }
    
    disableSync() {
        this.syncEnabled = false;
        localStorage.setItem('syncEnabled', 'false');
    }
}

// Inicializar sincronização
const syncManager = new SyncManager();

// Exportar para uso global
window.SyncManager = syncManager;