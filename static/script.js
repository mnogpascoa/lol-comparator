// Variável global para armazenar os dados do CSV
let df = null;
let dfLiga = null;
let dfSide = null;
let dfResult = null;
let allTeams = [];

Papa.parse('static/BaseDadosDesseAno.csv', {
    download: true,
    header: true,
    complete: function(results) {
        df = results.data;
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

function carregarTimes() {
    const liga = document.getElementById('liga').value;
    const side = document.getElementById('side').value;
    const resultFilter = document.getElementById('result-filter').value;
    const recentGames = document.getElementById('recent-games').value;
    const killLine = document.getElementById('kill-line').value;
    const timeLine = document.getElementById('time-line').value;
    const dragonLine = document.getElementById('dragon-line').value;
    const baronLine = document.getElementById('baron-line').value;
    const towerLine = document.getElementById('tower-line').value;
    const inhibitorLine = document.getElementById('inhibitor-line').value;
    const time1Input = document.getElementById('time1');
    const time2Input = document.getElementById('time2');
    
    const time1Selecionado = time1Input.value;
    const time2Selecionado = time2Input.value;

    // Filtro por liga
    dfLiga = liga ? df.filter(row => row.league === liga) : df;

    // Filtro por lado
    dfSide = side ? dfLiga.filter(row => row.side === side) : dfLiga;

    // Filtro por resultado (Vitórias/Derrotas)
    dfResult = resultFilter !== '' ? dfSide.filter(row => parseInt(row.result) === parseInt(resultFilter)) : dfSide;

    // Extrair times disponíveis após todos os filtros
    const times = [...new Set(dfResult.map(row => row.teamname).filter(time => time))].sort();
    const datalist = document.getElementById('times-list');
    datalist.innerHTML = '';
    times.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        datalist.appendChild(option);
    });

    // Manter seleções válidas nos inputs de time
    if (time1Selecionado && times.includes(time1Selecionado)) time1Input.value = time1Selecionado;
    else time1Input.value = '';
    if (time2Selecionado && times.includes(time2Selecionado)) time2Input.value = time2Selecionado;
    else time2Input.value = '';
}

function comparar() {
    const liga = document.getElementById('liga').value;
    const side = document.getElementById('side').value;
    const resultFilter = document.getElementById('result-filter').value;
    const recentGames = document.getElementById('recent-games').value;
    const killLine = parseFloat(document.getElementById('kill-line').value);
    const timeLineValue = parseInt(document.getElementById('time-line').value);
    const dragonLine = parseFloat(document.getElementById('dragon-line').value);
    const baronLine = parseFloat(document.getElementById('baron-line').value);
    const towerLine = parseFloat(document.getElementById('tower-line').value);
    const inhibitorLine = parseFloat(document.getElementById('inhibitor-line').value);
    const timeLine = isNaN(timeLineValue) ? 31 : timeLineValue;
    const time1 = document.getElementById('time1').value;
    const time2 = document.getElementById('time2').value;

    // Aplicar filtros para obter dfResult
    let dfLiga = liga ? df.filter(row => row.league === liga) : df;
    let dfSide = side ? dfLiga.filter(row => row.side === side) : dfLiga;
    let dfResult = resultFilter !== '' ? dfSide.filter(row => parseInt(row.result) === parseInt(resultFilter)) : dfSide;

    // Determinar o time principal (usa time2 se time1 estiver vazio, caso contrário usa time1)
    const primaryTime = time1 || time2;
    const secondaryTime = (time1 && time2 && time1 !== time2) ? time2 : null;

    let dadosTime1 = primaryTime ? dfResult.filter(row => row.teamname === primaryTime) : [];
    let dadosTime2 = secondaryTime ? dfResult.filter(row => row.teamname === secondaryTime) : [];

    if (recentGames) {
        dadosTime1 = dadosTime1.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
        if (secondaryTime) dadosTime2 = dadosTime2.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
    }

    if (dadosTime1.length === 0 && (!secondaryTime || dadosTime2.length === 0)) {
        alert('Dados insuficientes para os times selecionados!');
        return;
    }

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

    function calcularDragonStats(dados) {
        const totalJogos = dados.length;
        if (totalJogos === 0) return { totalJogos: 0, dragonsBelow: 0, dragonsAbove: 0, percentBelow: 0, percentAbove: 0 };
        const dragonsBelow = dados.filter(row => parseInt(row.totalDragons) < dragonLine || parseInt(row.totalDragons) === 0).length;
        const dragonsAbove = totalJogos - dragonsBelow;
        const percentBelow = (dragonsBelow / totalJogos * 100).toFixed(2);
        const percentAbove = (dragonsAbove / totalJogos * 100).toFixed(2);
        return { totalJogos, dragonsBelow, dragonsAbove, percentBelow, percentAbove };
    }

    function calcularBaronStats(dados) {
        const totalJogos = dados.length;
        if (totalJogos === 0) return { totalJogos: 0, baronsBelow: 0, baronsAbove: 0, percentBelow: 0, percentAbove: 0 };
        const baronsBelow = dados.filter(row => parseInt(row.totalBarons) < baronLine || parseInt(row.totalBarons) === 0).length;
        const baronsAbove = totalJogos - baronsBelow;
        const percentBelow = (baronsBelow / totalJogos * 100).toFixed(2);
        const percentAbove = (baronsAbove / totalJogos * 100).toFixed(2);
        return { totalJogos, baronsBelow, baronsAbove, percentBelow, percentAbove };
    }

    function calcularTowerStats(dados) {
        const totalJogos = dados.length;
        if (totalJogos === 0) return { totalJogos: 0, towersBelow: 0, towersAbove: 0, percentBelow: 0, percentAbove: 0 };
        const towersBelow = dados.filter(row => parseInt(row.totalTowers) < towerLine || parseInt(row.totalTowers) === 0).length;
        const towersAbove = totalJogos - towersBelow;
        const percentBelow = (towersBelow / totalJogos * 100).toFixed(2);
        const percentAbove = (towersAbove / totalJogos * 100).toFixed(2);
        return { totalJogos, towersBelow, towersAbove, percentBelow, percentAbove };
    }

    function calcularInhibitorStats(dados) {
        const totalJogos = dados.length;
        if (totalJogos === 0) return { totalJogos: 0, inhibitorsBelow: 0, inhibitorsAbove: 0, percentBelow: 0, percentAbove: 0 };
        const inhibitorsBelow = dados.filter(row => parseInt(row.totalInhibitors) < inhibitorLine || parseInt(row.totalInhibitors) === 0).length;
        const inhibitorsAbove = totalJogos - inhibitorsBelow;
        const percentBelow = (inhibitorsBelow / totalJogos * 100).toFixed(2);
        const percentAbove = (inhibitorsAbove / totalJogos * 100).toFixed(2);
        return { totalJogos, inhibitorsBelow, inhibitorsAbove, percentBelow, percentAbove };
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
    const statsTime2 = secondaryTime ? calcularKillStats(dadosTime2) : { totalJogos: 0, killsBelow: 0, killsAbove: 0, percentBelow: 0, percentAbove: 0 };
    const timeStatsTime1 = calcularTimeStats(dadosTime1);
    const timeStatsTime2 = secondaryTime ? calcularTimeStats(dadosTime2) : { totalJogos: 0, timeBelow: 0, timeAbove: 0, percentBelow: 0, percentAbove: 0 };
    const dragonStatsTime1 = calcularDragonStats(dadosTime1);
    const dragonStatsTime2 = secondaryTime ? calcularDragonStats(dadosTime2) : { totalJogos: 0, dragonsBelow: 0, dragonsAbove: 0, percentBelow: 0, percentAbove: 0 };
    const baronStatsTime1 = calcularBaronStats(dadosTime1);
    const baronStatsTime2 = secondaryTime ? calcularBaronStats(dadosTime2) : { totalJogos: 0, baronsBelow: 0, baronsAbove: 0, percentBelow: 0, percentAbove: 0 };
    const towerStatsTime1 = calcularTowerStats(dadosTime1);
    const towerStatsTime2 = secondaryTime ? calcularTowerStats(dadosTime2) : { totalJogos: 0, towersBelow: 0, towersAbove: 0, percentBelow: 0, percentAbove: 0 };
    const inhibitorStatsTime1 = calcularInhibitorStats(dadosTime1);
    const inhibitorStatsTime2 = secondaryTime ? calcularInhibitorStats(dadosTime2) : { totalJogos: 0, inhibitorsBelow: 0, inhibitorsAbove: 0, percentBelow: 0, percentAbove: 0 };
    const mediasTime1 = calcularMedias(dadosTime1);
    const mediasTime2 = secondaryTime ? calcularMedias(dadosTime2) : { 'Jogos': 0, 'Vitórias': 0, 'Vitórias (%)': 0, 'Primeira Torre (%)': 0, 'Primeiro Dragão (%)': 0, 'Primeiro Sangue (%)': 0 };

    const timeLineMin = parseInt(document.getElementById('time-line').value);

    // Determinar o conteúdo da tabela com base em 1 ou 2 times
    let tableContent = '';
    if (!secondaryTime) {
        // Exibe apenas os dados de primaryTime
        tableContent = `
            <table>
                <tr><th>Estatística</th><th>${primaryTime}</th></tr>
                <tr><td>Jogos Disputados</td><td>${mediasTime1.Jogos}</td></tr>
                <tr><td>Vitórias</td><td>${mediasTime1.Vitórias}</td></tr>
                <tr><td>Vitórias (%)</td><td>${mediasTime1['Vitórias (%)']}</td></tr>
                <tr><td>Primeira Torre (%)</td><td>${mediasTime1['Primeira Torre (%)']}</td></tr>
                <tr><td>Primeiro Dragão (%)</td><td>${mediasTime1['Primeiro Dragão (%)']}</td></tr>
                <tr><td>Primeiro Sangue (%)</td><td>${mediasTime1['Primeiro Sangue (%)']}</td></tr>
                <tr><td>Under ${killLine} Kill</td><td>${statsTime1.percentBelow}%</td></tr>
                <tr><td>Over ${killLine} Kill</td><td>${statsTime1.percentAbove}%</td></tr>
                <tr><td>Under ${timeLineMin} min</td><td>${timeStatsTime1.percentBelow}%</td></tr>
                <tr><td>Over ${timeLineMin} min</td><td>${timeStatsTime1.percentAbove}%</td></tr>
                <tr><td>Under ${dragonLine} Dragon</td><td>${dragonStatsTime1.percentBelow}%</td></tr>
                <tr><td>Over ${dragonLine} Dragon</td><td>${dragonStatsTime1.percentAbove}%</td></tr>
                <tr><td>Under ${baronLine} Baron</td><td>${baronStatsTime1.percentBelow}%</td></tr>
                <tr><td>Over ${baronLine} Baron</td><td>${baronStatsTime1.percentAbove}%</td></tr>
                <tr><td>Under ${towerLine} Tower</td><td>${towerStatsTime1.percentBelow}%</td></tr>
                <tr><td>Over ${towerLine} Tower</td><td>${towerStatsTime1.percentAbove}%</td></tr>
                <tr><td>Under ${inhibitorLine} Inhibitor</td><td>${inhibitorStatsTime1.percentBelow}%</td></tr>
                <tr><td>Over ${inhibitorLine} Inhibitor</td><td>${inhibitorStatsTime1.percentAbove}%</td></tr>
            </table>
        `;
    } else {
        // Exibe a comparação entre primaryTime e secondaryTime
        tableContent = `
            <table>
                <tr><th>Estatística</th><th>${primaryTime}</th><th>${secondaryTime}</th></tr>
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
                <tr><td>Under ${dragonLine} Dragon</td><td>${dragonStatsTime1.percentBelow}%</td><td>${dragonStatsTime2.percentBelow}%</td></tr>
                <tr><td>Over ${dragonLine} Dragon</td><td>${dragonStatsTime1.percentAbove}%</td><td>${dragonStatsTime2.percentAbove}%</td></tr>
                <tr><td>Under ${baronLine} Baron</td><td>${baronStatsTime1.percentBelow}%</td><td>${baronStatsTime2.percentBelow}%</td></tr>
                <tr><td>Over ${baronLine} Baron</td><td>${baronStatsTime1.percentAbove}%</td><td>${baronStatsTime2.percentAbove}%</td></tr>
                <tr><td>Under ${towerLine} Tower</td><td>${towerStatsTime1.percentBelow}%</td><td>${towerStatsTime2.percentBelow}%</td></tr>
                <tr><td>Over ${towerLine} Tower</td><td>${towerStatsTime1.percentAbove}%</td><td>${towerStatsTime2.percentAbove}%</td></tr>
                <tr><td>Under ${inhibitorLine} Inhibitor</td><td>${inhibitorStatsTime1.percentBelow}%</td><td>${inhibitorStatsTime2.percentBelow}%</td></tr>
                <tr><td>Over ${inhibitorLine} Inhibitor</td><td>${inhibitorStatsTime1.percentAbove}%</td><td>${inhibitorStatsTime2.percentAbove}%</td></tr>
            </table>
        `;
    }

    console.log('Conteúdo da tabela (sem título):', tableContent);

    // Criar o título dinamicamente
    const resultado = document.getElementById('resultado');
    resultado.innerHTML = ''; // Limpar conteúdo anterior
    const h2 = document.createElement('h2');
    if (!secondaryTime) {
        // Apenas o nome do primaryTime com link
        const link1 = document.createElement('a');
        link1.href = `static/team_games.html?teamname=${encodeURIComponent(primaryTime)}`;
        link1.target = '_blank';
        link1.textContent = primaryTime;
        h2.appendChild(link1);
    } else {
        // Comparação com primaryTime vs secondaryTime
        const link1 = document.createElement('a');
        link1.href = `static/team_games.html?teamname=${encodeURIComponent(primaryTime)}`;
        link1.target = '_blank';
        link1.textContent = primaryTime;
        h2.appendChild(link1);
        h2.appendChild(document.createTextNode(' vs '));
        const link2 = document.createElement('a');
        link2.href = `static/team_games.html?teamname=${encodeURIComponent(secondaryTime)}`;
        link2.target = '_blank';
        link2.textContent = secondaryTime;
        h2.appendChild(link2);
    }
    
    if (side) h2.appendChild(document.createTextNode(` (${side})`));
    if (liga) h2.appendChild(document.createTextNode(` (${liga})`));
    if (resultFilter !== '') h2.appendChild(document.createTextNode(` (${resultFilter === '1' ? 'Vitórias' : 'Derrotas'})`));
    h2.appendChild(document.createTextNode(' (2025)'));
    if (recentGames) h2.appendChild(document.createTextNode(` (Últimos ${recentGames} jogos)`));
    
    resultado.appendChild(h2);
    resultado.insertAdjacentHTML('beforeend', tableContent);
    
    console.log('Título renderizado:', h2.outerHTML);
}
