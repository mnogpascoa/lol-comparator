// Variável global para armazenar os dados do CSV
let df = null;
let dfLiga = null;
let dfSide = null;
let dfResult = null;
let allTeams = [];

Papa.parse('BaseDadosDesseAno.csv', {
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

function calcularKillStats(dados, killLine) {
    const totalJogos = dados.length;
    if (totalJogos === 0) return { totalJogos: 0, killsBelow: 0, killsAbove: 0, percentBelow: 0, percentAbove: 0 };
    const killsBelow = dados.filter(row => parseFloat(row.totalKills) < killLine || parseFloat(row.totalKills) === 0).length;
    const killsAbove = totalJogos - killsBelow;
    const percentBelow = (killsBelow / totalJogos * 100).toFixed(2);
    const percentAbove = (killsAbove / totalJogos * 100).toFixed(2);
    return { totalJogos, killsBelow, killsAbove, percentBelow, percentAbove };
}

function calcularTimeStats(dados, timeLine) {
    const totalJogos = dados.length;
    if (totalJogos === 0) return { totalJogos: 0, timeBelow: 0, timeAbove: 0, percentBelow: 0, percentAbove: 0 };
    const timeBelow = dados.filter(row => parseInt(row.gamelength) < timeLine || parseInt(row.gamelength) === 0).length;
    const timeAbove = totalJogos - timeBelow;
    const percentBelow = (timeBelow / totalJogos * 100).toFixed(2);
    const percentAbove = (timeAbove / totalJogos * 100).toFixed(2);
    return { totalJogos, timeBelow, timeAbove, percentBelow, percentAbove };
}

function calcularDragonStats(dados, dragonLine) {
    const totalJogos = dados.length;
    if (totalJogos === 0) return { totalJogos: 0, dragonsBelow: 0, dragonsAbove: 0, percentBelow: 0, percentAbove: 0 };
    const dragonsBelow = dados.filter(row => parseFloat(row.totalDragons) < dragonLine || parseFloat(row.totalDragons) === 0).length;
    const dragonsAbove = totalJogos - dragonsBelow;
    const percentBelow = (dragonsBelow / totalJogos * 100).toFixed(2);
    const percentAbove = (dragonsAbove / totalJogos * 100).toFixed(2);
    return { totalJogos, dragonsBelow, dragonsAbove, percentBelow, percentAbove };
}

function calcularBaronStats(dados, baronLine) {
    const totalJogos = dados.length;
    if (totalJogos === 0) return { totalJogos: 0, baronsBelow: 0, baronsAbove: 0, percentBelow: 0, percentAbove: 0 };
    const baronsBelow = dados.filter(row => parseFloat(row.totalBarons) < baronLine || parseFloat(row.totalBarons) === 0).length;
    const baronsAbove = totalJogos - baronsBelow;
    const percentBelow = (baronsBelow / totalJogos * 100).toFixed(2);
    const percentAbove = (baronsAbove / totalJogos * 100).toFixed(2);
    return { totalJogos, baronsBelow, baronsAbove, percentBelow, percentAbove };
}

function calcularTowerStats(dados, towerLine) {
    const totalJogos = dados.length;
    if (totalJogos === 0) return { totalJogos: 0, towersBelow: 0, towersAbove: 0, percentBelow: 0, percentAbove: 0 };
    const towersBelow = dados.filter(row => parseFloat(row.totalTowers) < towerLine || parseFloat(row.totalTowers) === 0).length;
    const towersAbove = totalJogos - towersBelow;
    const percentBelow = (towersBelow / totalJogos * 100).toFixed(2);
    const percentAbove = (towersAbove / totalJogos * 100).toFixed(2);
    return { totalJogos, towersBelow, towersAbove, percentBelow, percentAbove };
}

function calcularInhibitorStats(dados, inhibitorLine) {
    const totalJogos = dados.length;
    if (totalJogos === 0) return { totalJogos: 0, inhibitorsBelow: 0, inhibitorsAbove: 0, percentBelow: 0, percentAbove: 0 };
    const inhibitorsBelow = dados.filter(row => parseFloat(row.totalInhibitors) < inhibitorLine || parseFloat(row.totalInhibitors) === 0).length;
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
        'Primeira Torre': (torres / jogos * 100 || 0).toFixed(2),
        'Primeiro Dragão': (dragoes / jogos * 100 || 0).toFixed(2),
        'Primeiro Sangue': (firstBlood / jogos * 100 || 0).toFixed(2)
    };
}

function gerarTabela(statsTime1, statsTime2, mediasTime1, mediasTime2, time1, time2, killLine, timeLineMin, dragonLine, baronLine, towerLine, inhibitorLine) {
    let tableContent = '';
    if (!time2 || time1 === time2) {
        tableContent = `
            <table>
                <tr><th>Estatística</th><th>${time1}</th></tr>
                <tr><td>Jogos Disputados</td><td>${mediasTime1.Jogos}</td></tr>
                <tr><td>Vitórias</td><td>${mediasTime1.Vitórias}</td></tr>
                <tr><td>Vitórias (%)</td><td>${mediasTime1['Vitórias (%)']}%</td></tr>
                <tr><td>Primeira Torre</td><td>${mediasTime1['Primeira Torre']}%</td></tr>
                <tr><td>Primeiro Dragão</td><td>${mediasTime1['Primeiro Dragão']}%</td></tr>
                <tr><td>Primeiro Sangue</td><td>${mediasTime1['Primeiro Sangue']}%</td></tr>
                <tr><td>Under ${killLine} Kill</td><td>${statsTime1.killStats.percentBelow}%</td></tr>
                <tr><td>Over ${killLine} Kill</td><td>${statsTime1.killStats.percentAbove}%</td></tr>
                <tr><td>Under ${timeLineMin} min</td><td>${statsTime1.timeStats.percentBelow}%</td></tr>
                <tr><td>Over ${timeLineMin} min</td><td>${statsTime1.timeStats.percentAbove}%</td></tr>
                <tr><td>Under ${dragonLine} Dragon</td><td>${statsTime1.dragonStats.percentBelow}%</td></tr>
                <tr><td>Over ${dragonLine} Dragon</td><td>${statsTime1.dragonStats.percentAbove}%</td></tr>
                <tr><td>Under ${baronLine} Baron</td><td>${statsTime1.baronStats.percentBelow}%</td></tr>
                <tr><td>Over ${baronLine} Baron</td><td>${statsTime1.baronStats.percentAbove}%</td></tr>
                <tr><td>Under ${towerLine} Tower</td><td>${statsTime1.towerStats.percentBelow}%</td></tr>
                <tr><td>Over ${towerLine} Tower</td><td>${statsTime1.towerStats.percentAbove}%</td></tr>
                <tr><td>Under ${inhibitorLine} Inhibitor</td><td>${statsTime1.inhibitorStats.percentBelow}%</td></tr>
                <tr><td>Over ${inhibitorLine} Inhibitor</td><td>${statsTime1.inhibitorStats.percentAbove}%</td></tr>
            </table>
        `;
    } else {
        tableContent = `
            <table>
                <tr><th>Estatística</th><th>${time1}</th><th>${time2}</th></tr>
                <tr><td>Jogos Disputados</td><td>${mediasTime1.Jogos}</td><td>${mediasTime2.Jogos}</td></tr>
                <tr><td>Vitórias</td><td>${mediasTime1.Vitórias}</td><td>${mediasTime2.Vitórias}</td></tr>
                <tr><td>Vitórias (%)</td><td>${mediasTime1['Vitórias (%)']}</td><td>${mediasTime2['Vitórias (%)']}</td></tr>
                <tr><td>Primeira Torre</td><td>${mediasTime1['Primeira Torre']}</td><td>${mediasTime2['Primeira Torre']}</td></tr>
                <tr><td>Primeiro Dragão</td><td>${mediasTime1['Primeiro Dragão']}</td><td>${mediasTime2['Primeiro Dragão']}</td></tr>
                <tr><td>Primeiro Sangue</td><td>${mediasTime1['Primeiro Sangue']}</td><td>${mediasTime2['Primeiro Sangue']}</td></tr>
                <tr><td>Under ${killLine} Kill</td><td>${statsTime1.killStats.percentBelow}%</td><td>${statsTime2.killStats.percentBelow}%</td></tr>
                <tr><td>Over ${killLine} Kill</td><td>${statsTime1.killStats.percentAbove}%</td><td>${statsTime2.killStats.percentAbove}%</td></tr>
                <tr><td>Under ${timeLineMin} min</td><td>${statsTime1.timeStats.percentBelow}%</td><td>${statsTime2.timeStats.percentBelow}%</td></tr>
                <tr><td>Over ${timeLineMin} min</td><td>${statsTime1.timeStats.percentAbove}%</td><td>${statsTime2.timeStats.percentAbove}%</td></tr>
                <tr><td>Under ${dragonLine} Dragon</td><td>${statsTime1.dragonStats.percentBelow}%</td><td>${statsTime2.dragonStats.percentBelow}%</td></tr>
                <tr><td>Over ${dragonLine} Dragon</td><td>${statsTime1.dragonStats.percentAbove}%</td><td>${statsTime2.dragonStats.percentAbove}%</td></tr>
                <tr><td>Under ${baronLine} Baron</td><td>${statsTime1.baronStats.percentBelow}%</td><td>${statsTime2.baronStats.percentBelow}%</td></tr>
                <tr><td>Over ${baronLine} Baron</td><td>${statsTime1.baronStats.percentAbove}%</td><td>${statsTime2.baronStats.percentAbove}%</td></tr>
                <tr><td>Under ${towerLine} Tower</td><td>${statsTime1.towerStats.percentBelow}%</td><td>${statsTime2.towerStats.percentBelow}%</td></tr>
                <tr><td>Over ${towerLine} Tower</td><td>${statsTime1.towerStats.percentAbove}%</td><td>${statsTime2.towerStats.percentAbove}%</td></tr>
                <tr><td>Under ${inhibitorLine} Inhibitor</td><td>${statsTime1.inhibitorStats.percentBelow}%</td><td>${statsTime2.inhibitorStats.percentBelow}%</td></tr>
                <tr><td>Over ${inhibitorLine} Inhibitor</td><td>${statsTime1.inhibitorStats.percentAbove}%</td><td>${statsTime2.inhibitorStats.percentAbove}%</td></tr>
            </table>
        `;
    }
    return tableContent;
}

function gerarTitulo(time1, time2, side, liga, resultFilter, recentGames, separator) {
    const h2 = document.createElement('h2');
    
    if (time1) {
        const link1 = document.createElement('a');
        link1.href = `team_games.html?teamname=${encodeURIComponent(time1)}`;
        link1.target = '_blank';
        link1.textContent = time1;
        h2.appendChild(link1);
    }
    
    if (time2 && time1 !== time2) {
        h2.appendChild(document.createTextNode(` ${separator} `));
        const link2 = document.createElement('a');
        link2.href = `team_games.html?teamname=${encodeURIComponent(time2)}`;
        link2.target = '_blank';
        link2.textContent = time2;
        h2.appendChild(link2);
    }
    
    if (side) h2.appendChild(document.createTextNode(` (${side})`));
    if (liga) h2.appendChild(document.createTextNode(` (${liga})`));
    if (resultFilter !== '') h2.appendChild(document.createTextNode(` (${resultFilter === '1' ? 'Vitórias' : 'Derrotas'})`));
    if (recentGames) h2.appendChild(document.createTextNode(` (Últimos ${recentGames} jogos)`));
    
    return h2;
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

    if (!time1) {
        alert('Selecione pelo menos o Time 1!');
        return;
    }

    // Aplicar filtros para obter dfResult
    let dfLiga = liga ? df.filter(row => row.league === liga) : df;
    let dfSide = side ? dfLiga.filter(row => row.side === side) : dfLiga;
    let dfResult = resultFilter !== '' ? dfSide.filter(row => parseInt(row.result) === parseInt(resultFilter)) : dfSide;

    let dadosTime1 = time1 ? dfResult.filter(row => row.teamname === time1) : [];
    let dadosTime2 = time2 ? dfResult.filter(row => row.teamname === time2) : [];

    if (recentGames) {
        dadosTime1 = dadosTime1.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
        if (time2) dadosTime2 = dadosTime2.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
    }

    if (dadosTime1.length === 0 && (!time2 || dadosTime2.length === 0)) {
        alert('Dados insuficientes para os times selecionados!');
        return;
    }

    const statsTime1 = {
        killStats: calcularKillStats(dadosTime1, killLine),
        timeStats: calcularTimeStats(dadosTime1, timeLine),
        dragonStats: calcularDragonStats(dadosTime1, dragonLine),
        baronStats: calcularBaronStats(dadosTime1, baronLine),
        towerStats: calcularTowerStats(dadosTime1, towerLine),
        inhibitorStats: calcularInhibitorStats(dadosTime1, inhibitorLine)
    };

    const statsTime2 = time2 ? {
        killStats: calcularKillStats(dadosTime2, killLine),
        timeStats: calcularTimeStats(dadosTime2, timeLine),
        dragonStats: calcularDragonStats(dadosTime2, dragonLine),
        baronStats: calcularBaronStats(dadosTime2, baronLine),
        towerStats: calcularTowerStats(dadosTime2, towerLine),
        inhibitorStats: calcularInhibitorStats(dadosTime2, inhibitorLine)
    } : {
        killStats: { percentBelow: 0, percentAbove: 0 },
        timeStats: { percentBelow: 0, percentAbove: 0 },
        dragonStats: { percentBelow: 0, percentAbove: 0 },
        baronStats: { percentBelow: 0, percentAbove: 0 },
        towerStats: { percentBelow: 0, percentAbove: 0 },
        inhibitorStats: { percentBelow: 0, percentAbove: 0 }
    };

    const mediasTime1 = calcularMedias(dadosTime1);
    const mediasTime2 = time2 ? calcularMedias(dadosTime2) : {
        'Jogos': 0,
        'Vitórias': 0,
        'Vitórias (%)': 0,
        'Primeira Torre': 0,
        'Primeiro Dragão': 0,
        'Primeiro Sangue': 0
    };

    const timeLineMin = parseInt(document.getElementById('time-line').value);

    const tableContent = gerarTabela(statsTime1, statsTime2, mediasTime1, mediasTime2, time1, time2, killLine, timeLineMin, dragonLine, baronLine, towerLine, inhibitorLine);

    console.log('Conteúdo da tabela (sem título):', tableContent);

    const resultado = document.getElementById('resultado');
    resultado.innerHTML = ''; // Limpar conteúdo anterior
    const h2 = gerarTitulo(time1, time2, side, liga, resultFilter, recentGames, '&');
    
    resultado.appendChild(h2);
    resultado.insertAdjacentHTML('beforeend', tableContent);
    
    console.log('Título renderizado:', h2.outerHTML);
}

function confrontoDireto() {
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

    if (!time1 || !time2 || time1 === time2) {
        alert('Selecione dois times diferentes para o Confronto Direto!');
        return;
    }

    // Aplicar filtros para obter dfResult
    let dfLiga = liga ? df.filter(row => row.league === liga) : df;
    let dfSide = side ? dfLiga.filter(row => row.side === side) : dfLiga;
    let dfResult = resultFilter !== '' ? dfSide.filter(row => parseInt(row.result) === parseInt(resultFilter)) : dfSide;

    let dadosTime1 = dfResult.filter(row => row.teamname === time1 && row.adversa_team === time2);
    let dadosTime2 = dfResult.filter(row => row.teamname === time2 && row.adversa_team === time1);

    if (recentGames) {
        dadosTime1 = dadosTime1.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
        dadosTime2 = dadosTime2.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
    }

    if (dadosTime1.length === 0 && dadosTime2.length === 0) {
        alert('Nenhum confronto direto encontrado entre os times selecionados com os filtros aplicados!');
        return;
    }

    const statsTime1 = {
        killStats: calcularKillStats(dadosTime1, killLine),
        timeStats: calcularTimeStats(dadosTime1, timeLine),
        dragonStats: calcularDragonStats(dadosTime1, dragonLine),
        baronStats: calcularBaronStats(dadosTime1, baronLine),
        towerStats: calcularTowerStats(dadosTime1, towerLine),
        inhibitorStats: calcularInhibitorStats(dadosTime1, inhibitorLine)
    };

    const statsTime2 = {
        killStats: calcularKillStats(dadosTime2, killLine),
        timeStats: calcularTimeStats(dadosTime2, timeLine),
        dragonStats: calcularDragonStats(dadosTime2, dragonLine),
        baronStats: calcularBaronStats(dadosTime2, baronLine),
        towerStats: calcularTowerStats(dadosTime2, towerLine),
        inhibitorStats: calcularInhibitorStats(dadosTime2, inhibitorLine)
    };

    const mediasTime1 = calcularMedias(dadosTime1);
    const mediasTime2 = calcularMedias(dadosTime2);

    const timeLineMin = parseInt(document.getElementById('time-line').value);

    const tableContent = gerarTabela(statsTime1, statsTime2, mediasTime1, mediasTime2, time1, time2, killLine, timeLineMin, dragonLine, baronLine, towerLine, inhibitorLine);

    console.log('Conteúdo da tabela (sem título):', tableContent);

    const resultado = document.getElementById('resultado');
    resultado.innerHTML = ''; // Limpar conteúdo anterior
    const h2 = gerarTitulo(time1, time2, side, liga, resultFilter, recentGames, 'vs');
    
    resultado.appendChild(h2);
    resultado.insertAdjacentHTML('beforeend', tableContent);
    
    console.log('Título renderizado:', h2.outerHTML);
}
