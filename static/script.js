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

function carregarTimes() {
    const liga = document.getElementById('liga').value;
    const side = document.getElementById('side').value;
    const recentGames = document.getElementById('recent-games').value;
    const killLine = document.getElementById('kill-line').value;
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
        const killsBelow = dados.filter(row => parseInt(row.totalKills) < killLine).length;
        const killsAbove = totalJogos - killsBelow;
        const percentBelow = (killsBelow / totalJogos * 100).toFixed(2);
        const percentAbove = (killsAbove / totalJogos * 100).toFixed(2);
        return { totalJogos, killsBelow, killsAbove, percentBelow, percentAbove };
    }

    const statsTime1 = calcularKillStats(dadosTime1);
    const statsTime2 = calcularKillStats(dadosTime2);

    // Calcular médias básicas (exemplo simplificado)
    function calcularMedias(dados) {
        const jogos = dados.length;
        const vitorias = dados.reduce((sum, row) => sum + (parseInt(row.result) || 0), 0);
        return {
            'Jogos': jogos,
            'Vitórias': vitorias,
            'Vitórias (%)': (vitorias / jogos * 100).toFixed(2)
        };
    }

    const mediasTime1 = calcularMedias(dadosTime1);
    const mediasTime2 = calcularMedias(dadosTime2);

    const resultado = document.getElementById('resultado');
    resultado.innerHTML = `
        <h2>Comparação: ${time1} vs ${time2} ${side ? '(' + side + ')' : ''} ${liga ? '(' + liga + ')' : ''} (2025) ${recentGames ? '(Últimos ' + recentGames + ' jogos)' : ''}</h2>
        <table>
            <tr><th>Estatística</th><th>${time1}</th><th>${time2}</th></tr>
            <tr><td>Jogos Disputados</td><td>${mediasTime1.Jogos}</td><td>${mediasTime2.Jogos}</td></tr>
            <tr><td>Vitórias</td><td>${mediasTime1.Vitórias}</td><td>${mediasTime2.Vitórias}</td></tr>
            <tr><td>Vitórias (%)</td><td>${mediasTime1['Vitórias (%)']}</td><td>${mediasTime2['Vitórias (%)']}</td></tr>
            <tr><td>Under ${killLine} Kill</td><td>${statsTime1.percentBelow}%</td><td>${statsTime2.percentBelow}%</td></tr>
            <tr><td>Over ${killLine} Kill</td><td>${statsTime1.percentAbove}%</td><td>${statsTime2.percentAbove}%</td></tr>
        </table>
    `;
}
