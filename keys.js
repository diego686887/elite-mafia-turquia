// Sistema de gerenciamento de keys administrativas

class SistemaKeys {
    constructor() {
        this.keys = this.carregarKeys();
        this.deviceId = this.obterDeviceId();
        this.init();
    }
    
    init() {
        console.log('Sistema de Keys iniciado');
        this.validarKeysExpiradas();
    }
    
    // Obter ID único do dispositivo
    obterDeviceId() {
        let deviceId = localStorage.getItem('deviceId');
        
        if (!deviceId) {
            // Gerar ID único baseado em características do navegador
            const userAgent = navigator.userAgent;
            const platform = navigator.platform;
            const languages = navigator.languages.join(',');
            
            const hashString = userAgent + platform + languages + Date.now();
            
            // Hash simples
            let hash = 0;
            for (let i = 0; i < hashString.length; i++) {
                const char = hashString.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            
            deviceId = 'device_' + Math.abs(hash).toString(36);
            localStorage.setItem('deviceId', deviceId);
        }
        
        return deviceId;
    }
    
    // Carregar keys do localStorage
    carregarKeys() {
        const dados = localStorage.getItem('adminKeys');
        return dados ? JSON.parse(dados) : [];
    }
    
    // Salvar keys no localStorage
    salvarKeys() {
        localStorage.setItem('adminKeys', JSON.stringify(this.keys));
        
        // Disparar evento
        const event = new CustomEvent('keysAtualizadas', {
            detail: { total: this.keys.length }
        });
        window.dispatchEvent(event);
    }
    
    // Gerar nova key
    gerarKey(tipo = 'device', nomeAdmin = 'Admin', expiracaoDias = 30) {
        // Gerar key complexa
        const parte1 = Math.random().toString(36).substr(2, 6).toUpperCase();
        const parte2 = Math.random().toString(36).substr(2, 6).toUpperCase();
        const parte3 = Math.random().toString(36).substr(2, 6).toUpperCase();
        
        const key = `ELITE_${parte1}_${parte2}_${parte3}`;
        
        // Calcular data de expiração
        const dataExpiracao = new Date();
        dataExpiracao.setDate(dataExpiracao.getDate() + expiracaoDias);
        
        // Criar objeto da key
        const keyObj = {
            key: key,
            tipo: tipo,
            deviceId: tipo === 'device' ? this.deviceId : 'all',
            nomeAdmin: nomeAdmin,
            criadaEm: new Date().toISOString(),
            expiraEm: dataExpiracao.toISOString(),
            usos: 0,
            ultimoUso: null,
            ativa: true,
            id: this.gerarIDKey()
        };
        
        // Adicionar à lista
        this.keys.push(keyObj);
        this.salvarKeys();
        
        // Registrar log
        window.EliteMafia.registrarLog('key_gerada', {
            key: key,
            tipo: tipo,
            admin: nomeAdmin
        });
        
        return keyObj;
    }
    
    // Validar key
    validarKey(key) {
        // Limpar key (remover espaços)
        const keyLimpa = key.trim().toUpperCase();
        
        // Encontrar key
        const keyObj = this.keys.find(k => 
            k.key === keyLimpa && 
            k.ativa === true
        );
        
        if (!keyObj) {
            return {
                valida: false,
                motivo: 'Key não encontrada ou inativa'
            };
        }
        
        // Verificar expiração
        if (new Date(keyObj.expiraEm) < new Date()) {
            return {
                valida: false,
                motivo: 'Key expirada'
            };
        }
        
        // Verificar dispositivo (se for do tipo device)
        if (keyObj.tipo === 'device' && keyObj.deviceId !== this.deviceId) {
            return {
                valida: false,
                motivo: 'Key não autorizada para este dispositivo'
            };
        }
        
        // Atualizar estatísticas de uso
        keyObj.usos++;
        keyObj.ultimoUso = new Date().toISOString();
        this.salvarKeys();
        
        // Registrar log
        window.EliteMafia.registrarLog('key_validada', {
            key: keyLimpa,
            dispositivo: this.deviceId,
            sucesso: true
        });
        
        return {
            valida: true,
            keyObj: keyObj,
            dispositivoCompativel: keyObj.tipo === 'device' ? keyObj.deviceId === this.deviceId : true
        };
    }
    
    // Revogar key (desativar)
    revogarKey(key) {
        const keyIndex = this.keys.findIndex(k => k.key === key);
        
        if (keyIndex !== -1) {
            this.keys[keyIndex].ativa = false;
            this.keys[keyIndex].revogadaEm = new Date().toISOString();
            this.salvarKeys();
            
            window.EliteMafia.registrarLog('key_revogada', { key: key });
            return true;
        }
        
        return false;
    }
    
    // Renovar key (estender expiração)
    renovarKey(key, diasAdicionais = 30) {
        const keyObj = this.keys.find(k => k.key === key);
        
        if (keyObj) {
            const novaExpiracao = new Date(keyObj.expiraEm);
            novaExpiracao.setDate(novaExpiracao.getDate() + diasAdicionais);
            
            keyObj.expiraEm = novaExpiracao.toISOString();
            keyObj.renovadaEm = new Date().toISOString();
            this.salvarKeys();
            
            return true;
        }
        
        return false;
    }
    
    // Validar keys expiradas
    validarKeysExpiradas() {
        const agora = new Date();
        let keysExpiradas = 0;
        
        this.keys.forEach(key => {
            if (key.ativa && new Date(key.expiraEm) < agora) {
                key.ativa = false;
                key.expiradaAuto = true;
                keysExpiradas++;
            }
        });
        
        if (keysExpiradas > 0) {
            this.salvarKeys();
            console.log(`${keysExpiradas} keys expiradas foram desativadas automaticamente`);
        }
    }
    
    // Gerar ID único para key
    gerarIDKey() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 4);
        return `KEY_${timestamp}_${random}`.toUpperCase();
    }
    
    // Obter estatísticas
    getEstatisticas() {
        const total = this.keys.length;
        const ativas = this.keys.filter(k => k.ativa).length;
        const expiradas = this.keys.filter(k => !k.ativa && k.expiraEm).length;
        const deviceKeys = this.keys.filter(k => k.tipo === 'device').length;
        const allKeys = this.keys.filter(k => k.tipo === 'all').length;
        
        return {
            total,
            ativas,
            expiradas,
            deviceKeys,
            allKeys,
            usoTotal: this.keys.reduce((sum, k) => sum + (k.usos || 0), 0)
        };
    }
    
    // Listar keys por tipo
    listarKeys(filtro = 'todas') {
        switch (filtro) {
            case 'ativas':
                return this.keys.filter(k => k.ativa);
            case 'expiradas':
                return this.keys.filter(k => !k.ativa);
            case 'device':
                return this.keys.filter(k => k.tipo === 'device');
            case 'all':
                return this.keys.filter(k => k.tipo === 'all');
            default:
                return this.keys;
        }
    }
    
    // Buscar key por admin
    buscarPorAdmin(nomeAdmin) {
        return this.keys.filter(k => 
            k.nomeAdmin.toLowerCase().includes(nomeAdmin.toLowerCase())
        );
    }
    
    // Limpar todas as keys
    limparTodasKeys() {
        if (confirm('⚠️ TEM CERTEZA? Isso removerá TODAS as keys permanentemente!')) {
            this.keys = [];
            this.salvarKeys();
            
            window.EliteMafia.registrarLog('keys_limpas', { total: this.keys.length });
            return true;
        }
        
        return false;
    }
    
    // Exportar keys para JSON
    exportarKeys() {
        const dados = {
            exportadoEm: new Date().toISOString(),
            totalKeys: this.keys.length,
            keys: this.keys
        };
        
        return JSON.stringify(dados, null, 2);
    }
    
    // Importar keys de JSON
    importarKeys(jsonString) {
        try {
            const dados = JSON.parse(jsonString);
            
            if (dados.keys && Array.isArray(dados.keys)) {
                // Validar cada key
                const keysValidas = dados.keys.filter(k => 
                    k.key && k.tipo && k.nomeAdmin
                );
                
                this.keys = [...this.keys, ...keysValidas];
                this.salvarKeys();
                
                window.EliteMafia.registrarLog('keys_importadas', { 
                    total: keysValidas.length 
                });
                
                return {
                    sucesso: true,
                    importadas: keysValidas.length,
                    total: this.keys.length
                };
            }
        } catch (error) {
            console.error('Erro ao importar keys:', error);
        }
        
        return {
            sucesso: false,
            erro: 'Formato inválido'
        };
    }
    
    // Formatar data para exibição
    formatarDataExpiracao(dataISO) {
        const data = new Date(dataISO);
        const agora = new Date();
        const diffDias = Math.ceil((data - agora) / (1000 * 60 * 60 * 24));
        
        if (diffDias < 0) {
            return `Expirada há ${Math.abs(diffDias)} dias`;
        } else if (diffDias === 0) {
            return 'Expira hoje';
        } else if (diffDias === 1) {
            return 'Expira amanhã';
        } else if (diffDias <= 7) {
            return `Expira em ${diffDias} dias`;
        } else {
            return `Expira em ${data.toLocaleDateString('pt-BR')}`;
        }
    }
}

// Inicializar sistema
const sistemaKeys = new SistemaKeys();

// Exportar para uso global
window.SistemaKeys = sistemaKeys;

// Funções auxiliares globais
function gerarKeyAdmin() {
    const nome = prompt('Nome do Admin:', 'Admin');
    const tipo = confirm('Key para todos os dispositivos?\nOK = Todos\nCancelar = Apenas este dispositivo') ? 'all' : 'device';
    
    if (nome) {
        const keyObj = sistemaKeys.gerarKey(tipo, nome);
        
        alert(`KEY GERADA:\n\n🔑 ${keyObj.key}\n\nAdmin: ${keyObj.nomeAdmin}\nTipo: ${tipo === 'device' ? 'Dispositivo Único' : 'Todos os Dispositivos'}\nExpira: ${new Date(keyObj.expiraEm).toLocaleDateString('pt-BR')}\n\n⚠️ SALVE ESTA KEY EM UM LOCAL SEGURO!\nEla só será mostrada uma vez.`);
        
        return keyObj.key;
    }
    
    return null;
}

function validarKeyAcesso() {
    const key = prompt('Digite a key de acesso:');
    
    if (key) {
        const resultado = sistemaKeys.validarKey(key);
        
        if (resultado.valida) {
            // Salvar sessão
            localStorage.setItem('adminSession', JSON.stringify({
                key: key,
                validadoEm: new Date().toISOString(),
                deviceId: sistemaKeys.deviceId
            }));
            
            alert('✅ ACESSO PERMITIDO!\nKey válida para este dispositivo.');
            return true;
        } else {
            alert(`❌ ACESSO NEGADO!\nMotivo: ${resultado.motivo}`);
            return false;
        }
    }
    
    return false;
}