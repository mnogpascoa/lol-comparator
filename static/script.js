let df = null;
let dfLiga = null;
let dfSide = null;
let allTeams = [];

Papa.parse('static/BaseDeDados.csv', {
    download: true,
    header: true,
    complete: function(results) {
        df = results.data.filter(row => row.position === 'team' && row.date && row.date.startsWith('2025'));
        if (df.length === 0) {
            alert('Nenhum dado válido encontrado!');
            return;
        }
        carregarLigas();
        carregarSides();
        carregarTimes();
    },
    error: function(error) {
        console.error('Erro ao carregar CSV:', error);
    }
});

function carregarLigas() {
    const ligas = [...new Set(df.map(row => row.league).filter(liga => liga))].sort();
    const selectLiga = document.getElementById('liga');
    selectLiga.innerHTML = '<option value="">Todos os campeonatos</option>';
    ligas.forEach(liga => {
        const option = document.createElement('option');
        option.value = liga;
        option.textContent = liga;
        selectLiga.appendChild(option);
    });
}

function carregarSides() {
    const sides = [...new Set(df.map(row => row.side).filter(side => side))].sort();
    const selectSide = document.getElementById('side');
    selectSide.innerHTML = '<option value="">Todos os lados</option>';
    sides.forEach(side => {
        const option = document.createElement('option');
        option.value = side;
        option.textContent = side;
        selectSide.appendChild(option);
    });
}

// Função carregarTimes atualizada para incluir novos seletores
function carregarTimes() {
    const liga = document.getElementById('liga').value;
    const side = document.getElementById('side').value;
    const recentGames = document.getElementById('recent-games').value;
    const killLine = document.getElementById('kill-line').value;
    const timeLine = document.getElementById('time-line').value;
    const dragonLine = document.getElementById('dragon-line').value; // Novo
    const baronLine = document.getElementById('baron-line').value; // Novo
    const towerLine = document.getElementById('tower-line').value; // Novo
    const time1Input = document.getElementById('time1');
    const time2Input = document.getElementById('time2');
    
    const time1Selecionado = time1Input.value;
    const time2Selecionado = time2Input.value;

    dfLiga = liga ? df.filter(row => row.league === liga) : df;
    dfSide = side ? dfLiga.filter(row => row.side === side) : dfLiga;

    const times = [...new Set(dfSide.map(row => row.teamname).filter(time => time))].sort();
    const datalist = document.getElementById('times-list');
    datalist.innerHTML = '';
    times.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        datalist.appendChild(option);
    });

    if (time1Selecionado && times.includes(time1Selecionado)) time1Input.value = time1Selecionado;
    else time1Input.value = '';
    if (time2Selecionado && times.includes(time2Selecionado)) time2Input.value = time2Selecionado;
    else time2Input.value = '';
}

// Novas funções para calcular estatísticas
function calcularDragonStats(dados, line) {
    const totalJogos = dados.length;
    if (totalJogos === 0) return { totalJogos: 0, dragonsBelow: 0, dragonsAbove: 0, percentBelow: 0, percentAbove: 0 };
    const dragonsBelow = dados.filter(row => parseFloat(row.totalDragons) < line || parseFloat(row.totalDragons) === 0).length;
    const dragonsAbove = totalJogos - dragonsBelow;
    const percentBelow = (dragonsBelow / totalJogos * 100).toFixed(2);
    const percentAbove = (dragonsAbove / totalJogos * 100).toFixed(2);
    return { totalJogos, dragonsBelow, dragonsAbove, percentBelow, percentAbove };
}

function calcularBaronStats(dados, line) {
    const totalJogos = dados.length;
    if (totalJogos === 0) return { totalJogos: 0, baronsBelow: 0, baronsAbove: 0, percentBelow: 0, percentAbove: 0 };
    const baronsBelow = dados.filter(row => parseFloat(row.totalBarons) < line || parseFloat(row.totalBarons) === 0).length;
    const baronsAbove = totalJogos - baronsBelow;
    const percentBelow = (baronsBelow / totalJogos * 100).toFixed(2);
    const percentAbove = (baronsAbove / totalJogos * 100).toFixed(2);
    return { totalJogos, baronsBelow, baronsAbove, percentBelow, percentAbove };
}

function calcularTowerStats(dados, line) {
    const totalJogos = dados.length;
    if (totalJogos === 0) return { totalJogos: 0, towersBelow: 0, towersAbove: 0, percentBelow: 0, percentAbove: 0 };
    const towersBelow = dados.filter(row => parseFloat(row.totalTowers) < line || parseFloat(row.totalTowers) === 0).length;
    const towersAbove = totalJogos - towersBelow;
    const percentBelow = (towersBelow / totalJogos * 100).toFixed(2);
    const percentAbove = (towersAbove / totalJogos * 100).toFixed(2);
    return { totalJogos, towersBelow, towersAbove, percentBelow, percentAbove };
}

// Função comparar atualizada
function comparar() {
    const liga = document.getElementById('liga').value;
    const side = document.getElementById('side').value;
    const recentGames = document.getElementById('recent-games').value;
    const killLine = parseFloat(document.getElementById('kill-line').value);
    const timeLineValue = parseInt(document.getElementById('time-line').value);
    const dragonLine = parseFloat(document.getElementById('dragon-line').value); // Novo
    const baronLine = parseFloat(document.getElementById('baron-line').value); // Novo
    const towerLine = parseFloat(document.getElementById('tower-line').value); // Novo
    const timeLine = isNaN(timeLineValue) ? 31 * 60 : timeLineValue * 60;
    const time1 = document.getElementById('time1').value;
    const time2 = document.getElementById('time2').value;

    if (!time1 || !time2 || time1 === time2) {
        alert('Selecione dois times diferentes!');
        return;
    }

    let dadosTime1 = dfSide.filter(row => row.teamname === time1);
    let dadosTime2 = dfSide.filter(row => row.teamname === time2);

    if (recentGames) {
        dadosTime1 = dadosTime1.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
        dadosTime2 = dadosTime2.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
    }

    if (dadosTime1.length === 0 || dadosTime2.length === 0) {
        alert('Dados insuficientes para os times selecionados!');
        return;
    }

    // Funções existentes (calcularKillStats, calcularTimeStats, calcularMedias) permanecem iguais
    function calcularKillStats(dados) {
    const totalJogos = dados.length;
    if (totalJogos === 0) return { totalJogos: 0, killsBelow: 0, killsAbove: 0, percentBelow: 0, percentAbove: 0 };
    const killsBelow = dados.filter(row => parseInt(row.totalKills) < killLine || parseInt(row.totalKills) === 0).length;
    const killsAbove = totalJogos - killsBelow;
    const percentBelow = (killsBelow / totalJogos * 100).toFixed(2);
    const percentAbove = (killsAbove / totalJogos * 100).toFixed(2);
    return { totalJogos, killsBelow, killsAbove, percentBelow, percentAbove };
}

function calcularTimeStats(dados) {
    const totalJogos = dados.length;
    if (totalJogos === 0) return { totalJogos: 0, timeBelow: 0, timeAbove: 0, percentBelow: 0, percentAbove: 0 };
    const timeBelow = dados.filter(row => parseInt(row.gamelength) < timeLine || parseInt(row.gamelength) === 0).length;
    const timeAbove = totalJogos - timeBelow;
    const percentBelow = (timeBelow / totalJogos * 100).toFixed(2);
    const percentAbove = (timeAbove / totalJogos * 100).toFixed(2);
    return { totalJogos, timeBelow, timeAbove, percentBelow, percentAbove };
}

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
    const timeStatsTime1 = calcularTimeStats(dadosTime1);
    const timeStatsTime2 = calcularTimeStats(dadosTime2);
    const dragonStatsTime1 = calcularDragonStats(dadosTime1, dragonLine); // Novo
    const dragonStatsTime2 = calcularDragonStats(dadosTime2, dragonLine); // Novo
    const baronStatsTime1 = calcularBaronStats(dadosTime1, baronLine); // Novo
    const baronStatsTime2 = calcularBaronStats(dadosTime2, baronLine); // Novo
    const towerStatsTime1 = calcularTowerStats(dadosTime1, towerLine); // Novo
    const towerStatsTime2 = calcularTowerStats(dadosTime2, towerLine); // Novo
    const mediasTime1 = calcularMedias(dadosTime1);
    const mediasTime2 = calcularMedias(dadosTime2);

    const timeLineMin = parseInt(document.getElementById('time-line').value);

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
            <tr><td>Under ${timeLineMin} min</td><td>${timeStatsTime1.percentBelow}%</td><td>${timeStatsTime2.percentBelow}%</td></tr>
            <tr><td>Over ${timeLineMin} min</td><td>${timeStatsTime1.percentAbove}%</td><td>${timeStatsTime2.percentAbove}%</td></tr>
            <tr><td>Under ${dragonLine} Dragons</td><td>${dragonStatsTime1.percentBelow}%</td><td>${dragonStatsTime2.percentBelow}%</td></tr>
            <tr><td>Over ${dragonLine} Dragons</td><td>${dragonStatsTime1.percentAbove}%</td><td>${dragonStatsTime2.percentAbove}%</td></tr>
            <tr><td>Under ${baronLine} Barons</td><td>${baronStatsTime1.percentBelow}%</td><td>${baronStatsTime2.percentBelow}%</td></tr>
            <tr><td>Over ${baronLine} Barons</td><td>${baronStatsTime1.percentAbove}%</td><td>${baronStatsTime2.percentAbove}%</td></tr>
            <tr><td>Under ${towerLine} Torres</td><td>${towerStatsTime1.percentBelow}%</td><td>${towerStatsTime2.percentBelow}%</td></tr>
            <tr><td>Over ${towerLine} Torres</td><td>${towerStatsTime1.percentAbove}%</td><td>${towerStatsTime2.percentAbove}%</td></tr>
        </table>
    `;
    console.log('Conteúdo da tabela:', tableContent);
    const resultado = document.getElementById('resultado');
    resultado.innerHTML = tableContent;
}
