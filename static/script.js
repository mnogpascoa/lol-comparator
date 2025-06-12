function comparar() {
    const liga = document.getElementById('liga').value;
    const side = document.getElementById('side').value;
    const recentGames = document.getElementById('recent-games').value;
    const killLine = parseFloat(document.getElementById('kill-line').value); // Valor da linha de kills
    const time1 = document.getElementById('time1').value;
    const time2 = document.getElementById('time2').value;

    if (!time1 || !time2 || time1 === time2) {
        alert('Selecione dois times diferentes!');
        return;
    }

    let dadosTime1 = dfSide.filter(row => row.teamname === time1);
    let dadosTime2 = dfSide.filter(row => row.teamname === time2);

    // Aplicar filtro de jogos recentes, se aplicável
    if (recentGames) {
        dadosTime1 = dadosTime1.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
        dadosTime2 = dadosTime2.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
    }

    if (dadosTime1.length === 0 || dadosTime2.length === 0) {
        alert('Dados insuficientes para os times selecionados!');
        return;
    }

    // Função para calcular as estatísticas de kills
    function calcularKillStats(dados) {
        const totalJogos = dados.length;
        if (totalJogos === 0) return { totalJogos: 0, killsBelow: 0, killsAbove: 0, percentBelow: 0, percentAbove: 0 };
        const killsBelow = dados.filter(row => parseInt(row.totalKills) < killLine || parseInt(row.totalKills) === 0).length;
        const killsAbove = totalJogos - killsBelow;
        const percentBelow = (killsBelow / totalJogos * 100).toFixed(2);
        const percentAbove = (killsAbove / totalJogos * 100).toFixed(2);
        return { totalJogos, killsBelow, killsAbove, percentBelow, percentAbove };
    }

    // Função para calcular as estatísticas básicas e adicionais
    function calcularMedias(dados) {
        const jogos = dados.length;
        const vitorias = dados.reduce((sum, row) => sum + (parseInt(row.result) || 0), 0);
        const torres = dados.reduce((sum, row) => sum + (parseInt(row.firsttower) || 0), 0);
        const dragoes = dados.reduce((sum, row) => sum + (parseInt(row.firstdragon) || 0), 0);
        const firstBlood = dados.reduce((sum, row) => sum + (parseInt(row.firstblood) || 0), 0);
        return {
            'Jogos': jogos,
            'Vitórias': vitorias,
            'Vitórias (%)': (vitorias / jogos * 100 || 0).toFixed(2),
            'Primeira Torre (%)': (torres / jogos * 100 || 0).toFixed(2),
            'Primeiro Dragão (%)': (dragoes / jogos * 100 || 0).toFixed(2),
            'Primeiro Sangue (%)': (firstBlood / jogos * 100 || 0).toFixed(2)
        };
    }

    const statsTime1 = calcularKillStats(dadosTime1);
    const statsTime2 = calcularKillStats(dadosTime2);
    const mediasTime1 = calcularMedias(dadosTime1);
    const mediasTime2 = calcularMedias(dadosTime2);

    // Log do conteúdo da tabela antes de renderizar
    const tableContent = `
        <h2>Comparação: ${time1} vs ${time2} ${side ? '(' + side + ')' : ''} ${liga ? '(' + liga + ')' : ''} (2025) ${recentGames ? '(Últimos ' + recentGames + ' jogos)' : ''}</h2>
        <table>
            <tr><th>Estatística</th><th>${time1}</th><th>${time2}</th></tr>
            <tr><td>Jogos Disputados</td><td>${mediasTime1.Jogos}</td><td>${mediasTime2.Jogos}</td></tr>
            <tr><td>Vitórias</td><td>${mediasTime1.Vitórias}</td><td>${mediasTime2.Vitórias}</td></tr>
            <tr><td>Vitórias (%)</td><td>${mediasTime1['Vitórias (%)']}</td><td>${mediasTime2['Vitórias (%)']}</td></tr>
            <tr><td>Primeira Torre (%)</td><td>${mediasTime1['Primeira Torre (%)']}</td><td>${mediasTime2['Primeira Torre (%)']}</td></tr>
            <tr><td>Primeiro Dragão (%)</td><td>${mediasTime1['Primeiro Dragão (%)']}</td><td>${mediasTime2['Primeiro Dragão (%)']}</td></tr>
            <tr><td>Primeiro Sangue (%)</td><td>${mediasTime1['Primeiro Sangue (%)']}</td><td>${mediasTime2['Primeiro Sangue (%)']}</td></tr>
            <tr><td>Under ${killLine} Kill</td><td>${statsTime1.percentBelow}%</td><td>${statsTime2.percentBelow}%</td></tr>
            <tr><td>Over ${killLine} Kill</td><td>${statsTime1.percentAbove}%</td><td>${statsTime2.percentAbove}%</td></tr>
        </table>
    `;
    console.log('Conteúdo da tabela:', tableContent); // Log para debug
    const resultado = document.getElementById('resultado');
    resultado.innerHTML = tableContent;
}
