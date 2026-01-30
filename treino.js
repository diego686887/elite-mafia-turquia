// Sistema de datas do treino
function carregarDataTreino() {
    let treinoData = localStorage.getItem('treinoData');
    
    if (!treinoData) {
        // Data padrão (próximo sábado às 20:00)
        const hoje = new Date();
        const diasParaSabado = (6 - hoje.getDay() + 7) % 7 || 7;
        const dataTreino = new Date(hoje);
        dataTreino.setDate(hoje.getDate() + diasParaSabado);
        
        treinoData = {
            data: dataTreino.toLocaleDateString('pt-BR'),
            hora: '20:00',
            criadoEm: new Date().toISOString()
        };
        
        localStorage.setItem('treinoData', JSON.stringify(treinoData));
    }
    
    return JSON.parse(treinoData);
}

// Atualizar data do treino
function atualizarDataTreino(novaData, novaHora) {
    const treinoData = {
        data: novaData,
        hora: novaHora,
        atualizadoEm: new Date().toISOString()
    };
    
    localStorage.setItem('treinoData', JSON.stringify(treinoData));
    
    // Disparar evento de atualização
    const event = new CustomEvent('treinoAtualizado', { detail: treinoData });
    window.dispatchEvent(event);
    
    return treinoData;
}

// Formatar data para exibição
function formatarDataTreino(treinoData) {
    if (!treinoData) treinoData = carregarDataTreino();
    
    return {
        data: treinoData.data,
        hora: treinoData.hora,
        completo: `${treinoData.data} às ${treinoData.hora}`
    };
}

// Sistema de lembretes
function configurarLembreteTreino() {
    const treinoData = carregarDataTreino();
    
    // Converter para Date object
    const [dia, mes, ano] = treinoData.data.split('/');
    const [hora, minuto] = treinoData.hora.split(':');
    
    const dataTreino = new Date(ano, mes - 1, dia, hora, minuto);
    const agora = new Date();
    
    const diferencaMs = dataTreino - agora;
    const diferencaHoras = Math.floor(diferencaMs / (1000 * 60 * 60));
    
    if (diferencaHoras <= 24 && diferencaHoras > 0) {
        // Lembrete 24h antes
        console.log(`Lembrete: Treino em ${diferencaHoras} horas!`);
        // Aqui você pode adicionar notificações do navegador
    }
}

// Executar lembretes a cada hora
setInterval(configurarLembreteTreino, 3600000);
configurarLembreteTreino();