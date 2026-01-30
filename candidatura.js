// Sistema de gerenciamento de candidaturas

class SistemaCandidatura {
    constructor() {
        this.candidaturas = this.carregarCandidaturas();
        this.candidatoAtual = null;
        this.init();
    }
    
    init() {
        console.log('Sistema de Candidatura iniciado');
        
        // Verificar candidatura em andamento
        this.verificarCandidaturaAndamento();
        
        // Configurar listeners
        this.configurarListeners();
    }
    
    // Carregar candidaturas do localStorage
    carregarCandidaturas() {
        const dados = localStorage.getItem('candidaturas');
        return dados ? JSON.parse(dados) : [];
    }
    
    // Salvar candidaturas no localStorage
    salvarCandidaturas() {
        localStorage.setItem('candidaturas', JSON.stringify(this.candidaturas));
        
        // Disparar evento de atualização
        const event = new CustomEvent('candidaturasAtualizadas', {
            detail: { total: this.candidaturas.length }
        });
        window.dispatchEvent(event);
    }
    
    // Criar nova candidatura
    criarCandidatura(dadosPessoais) {
        const candidatura = {
            id: this.gerarIDCandidatura(),
            ...dadosPessoais,
            status: 'em_andamento',
            dataInicio: new Date().toISOString(),
            etapaAtual: 'dados_pessoais'
        };
        
        this.candidatoAtual = candidatura;
        localStorage.setItem('candidaturaAtual', JSON.stringify(candidatura));
        
        return candidatura;
    }
    
    // Atualizar candidatura atual
    atualizarCandidatura(dados) {
        if (!this.candidatoAtual) {
            this.candidatoAtual = this.carregarCandidaturaAtual();
        }
        
        if (this.candidatoAtual) {
            Object.assign(this.candidatoAtual, dados);
            this.candidatoAtual.ultimaAtualizacao = new Date().toISOString();
            localStorage.setItem('candidaturaAtual', JSON.stringify(this.candidatoAtual));
        }
    }
    
    // Completar etapa
    completarEtapa(etapa, dados) {
        this.atualizarCandidatura({
            [etapa]: dados,
            etapaAtual: this.getProximaEtapa(etapa)
        });
    }
    
    // Finalizar candidatura
    finalizarCandidatura(dadosFinais) {
        if (!this.candidatoAtual) {
            throw new Error('Nenhuma candidatura em andamento');
        }
        
        const candidaturaFinal = {
            ...this.candidatoAtual,
            ...dadosFinais,
            status: 'pendente',
            dataEnvio: new Date().toISOString(),
            etapaAtual: 'concluido',
            numeroCandidatura: this.candidaturas.length + 1
        };
        
        // Adicionar à lista
        this.candidaturas.push(candidaturaFinal);
        this.salvarCandidaturas();
        
        // Limpar candidatura atual
        this.candidatoAtual = null;
        localStorage.removeItem('candidaturaAtual');
        
        // Registrar log
        window.EliteMafia.registrarLog('candidatura_finalizada', {
            id: candidaturaFinal.id,
            nome: candidaturaFinal.nome
        });
        
        return candidaturaFinal;
    }
    
    // Carregar candidatura atual do localStorage
    carregarCandidaturaAtual() {
        const dados = localStorage.getItem('candidaturaAtual');
        return dados ? JSON.parse(dados) : null;
    }
    
    // Verificar se há candidatura em andamento
    verificarCandidaturaAndamento() {
        this.candidatoAtual = this.carregarCandidaturaAtual();
        
        if (this.candidatoAtual) {
            console.log('Candidatura em andamento encontrada:', this.candidatoAtual.nome);
            
            // Verificar se está na página correta
            this.redirecionarParaEtapa();
        }
    }
    
    // Redirecionar para etapa atual
    redirecionarParaEtapa() {
        const paginaAtual = window.location.pathname;
        const etapas = {
            'dados_pessoais': 'candidatura.html',
            'perguntas': 'perguntas.html',
            'confirmacao': 'confirmacao.html'
        };
        
        if (this.candidatoAtual && this.candidatoAtual.etapaAtual) {
            const paginaDestino = etapas[this.candidatoAtual.etapaAtual];
            
            if (paginaDestino && !paginaAtual.includes(paginaDestino)) {
                // Mostrar notificação
                window.EliteMafia.mostrarNotificacao(
                    'Candidatura em andamento',
                    `Continuando candidatura de ${this.candidatoAtual.nome}`,
                    'info'
                );
                
                // Redirecionar após breve delay
                setTimeout(() => {
                    window.location.href = paginaDestino;
                }, 2000);
            }
        }
    }
    
    // Gerar ID único para candidatura
    gerarIDCandidatura() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `CAND_${timestamp}_${random}`.toUpperCase();
    }
    
    // Obter próxima etapa
    getProximaEtapa(etapaAtual) {
        const fluxo = {
            'dados_pessoais': 'perguntas',
            'perguntas': 'confirmacao',
            'confirmacao': 'concluido'
        };
        
        return fluxo[etapaAtual] || 'dados_pessoais';
    }
    
    // Validar dados pessoais
    validarDadosPessoais(dados) {
        const erros = [];
        
        if (!dados.nome || dados.nome.trim().length < 3) {
            erros.push('Nome deve ter pelo menos 3 caracteres');
        }
        
        if (!dados.idade || !window.EliteMafia.validarIdade(dados.idade)) {
            erros.push('Idade deve ser entre 12 e 99 anos');
        }
        
        if (!dados.discord || !dados.discord.includes('#')) {
            erros.push('Discord deve estar no formato: usuario#1234');
        }
        
        if (!dados.roblox || dados.roblox.trim().length < 2) {
            erros.push('Nome do Roblox inválido');
        }
        
        return {
            valido: erros.length === 0,
            erros: erros
        };
    }
    
    // Configurar listeners de formulário
    configurarListeners() {
        // Formulário de dados pessoais
        const formPessoal = document.getElementById('formPessoal');
        if (formPessoal) {
            formPessoal.addEventListener('submit', (e) => this.handleSubmitPessoal(e));
        }
        
        // Formulário de perguntas
        const formPerguntas = document.getElementById('formPerguntas');
        if (formPerguntas) {
            formPerguntas.addEventListener('submit', (e) => this.handleSubmitPerguntas(e));
        }
    }
    
    // Handler para dados pessoais
    handleSubmitPessoal(event) {
        event.preventDefault();
        
        const dados = {
            nome: document.getElementById('nome').value,
            idade: document.getElementById('idade').value,
            discord: document.getElementById('discord').value,
            roblox: document.getElementById('roblox').value
        };
        
        // Validar
        const validacao = this.validarDadosPessoais(dados);
        
        if (!validacao.valido) {
            alert('Erros:\n' + validacao.erros.join('\n'));
            return;
        }
        
        // Criar ou atualizar candidatura
        if (!this.candidatoAtual) {
            this.criarCandidatura(dados);
        } else {
            this.atualizarCandidatura(dados);
        }
        
        // Completar etapa
        this.completarEtapa('dadosPessoais', dados);
        
        // Redirecionar para próxima página
        window.location.href = 'perguntas.html';
    }
    
    // Handler para perguntas
    handleSubmitPerguntas(event) {
        event.preventDefault();
        
        const dados = {
            motivacao: document.getElementById('motivacao').value,
            p1: document.querySelector('input[name="p1"]:checked')?.value,
            tiros: document.querySelector('input[name="tiros"]:checked')?.value
        };
        
        // Validar
        if (!dados.motivacao || dados.motivacao.trim().length < 10) {
            alert('Por favor, explique melhor sua motivação (mínimo 10 caracteres)');
            return;
        }
        
        if (!dados.p1 || !dados.tiros) {
            alert('Por favor, responda todas as perguntas');
            return;
        }
        
        // Atualizar candidatura
        this.completarEtapa('perguntas', dados);
        
        // Mostrar modal de confirmação (será tratado na página)
        return dados;
    }
    
    // Estatísticas
    getEstatisticas() {
        const total = this.candidaturas.length;
        const pendentes = this.candidaturas.filter(c => c.status === 'pendente').length;
        const aprovadas = this.candidaturas.filter(c => c.status === 'aprovado').length;
        const rejeitadas = this.candidaturas.filter(c => c.status === 'rejeitado').length;
        
        return {
            total,
            pendentes,
            aprovadas,
            rejeitadas,
            taxaAprovacao: total > 0 ? ((aprovadas / total) * 100).toFixed(1) : 0
        };
    }
    
    // Buscar candidatura por ID
    buscarPorID(id) {
        return this.candidaturas.find(c => c.id === id);
    }
    
    // Buscar candidatura por Discord
    buscarPorDiscord(discord) {
        return this.candidaturas.find(c => c.discord.toLowerCase() === discord.toLowerCase());
    }
    
    // Verificar se Discord já está cadastrado
    discordJaCadastrado(discord) {
        return this.candidaturas.some(c => 
            c.discord.toLowerCase() === discord.toLowerCase() &&
            c.status !== 'rejeitado'
        );
    }
    
    // Cancelar candidatura atual
    cancelarCandidatura() {
        if (this.candidatoAtual) {
            window.EliteMafia.registrarLog('candidatura_cancelada', {
                id: this.candidatoAtual.id,
                nome: this.candidatoAtual.nome
            });
            
            this.candidatoAtual = null;
            localStorage.removeItem('candidaturaAtual');
        }
    }
}

// Inicializar sistema
const sistemaCandidatura = new SistemaCandidatura();

// Exportar para uso global
window.SistemaCandidatura = sistemaCandidatura;