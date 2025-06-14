// Variável global para armazenar os dados do CSV
let df = null;

// Lista de campeonatos Tier 1
const TIER1_LEAGUES = ['LCK', 'LPL', 'LEC', 'LCS', 'LTA', 'LTA N', 'WLDS', 'MSI', 'EWC', 'LCP'];

// Função para carregar o CSV
function loadCSV() {
    Papa.parse('BaseDadosChamp.csv', {
        download: true,
        header: true,
        complete: function(results) {
            df = results.data;
            // Filtrar linhas com dados vazios ou inválidos nas colunas team_* e adversa_*
            df = df.filter(row => {
                const teamCols = ['team_top', 'team_jng', 'team_mid', 'team_bot', 'team_sup'];
                const adversaCols = ['adversa_top', 'adversa_jng', 'adversa_mid', 'adversa_bot', 'adversa_sup'];
                const allCols = [...teamCols, ...adversaCols];
                const hasValidChamps = allCols.every(col => row[col] && row[col].trim() !== '');
                const hasValidKills = row.totalKills && !isNaN(parseFloat(row.totalKills));
                const hasValidLength = row.gamelength && !isNaN(parseInt(row.gamelength));
                return hasValidChamps && hasValidKills && hasValidLength;
            });
            console.log('CSV carregado, primeiros 5 registros após filtragem:', df.slice(0, 5));
            console.log('Total de linhas após filtragem:', df.length);
            populateChampions();
            populatePatches();
            populateLeagues();
        },
        error: function(error) {
            console.error('Erro ao carregar CSV:', error);
            document.getElementById('champ-stats-table').innerHTML = '<p>Erro ao carregar os dados!</p>';
        }
    });
}

// Função para preencher o datalist com os nomes dos campeões
function populateChampions() {
    const champions = [...new Set(df.map(row => row.champion).filter(name => name && name.trim() !== ''))].sort();
    const datalist = document.getElementById('champions-list');
    datalist.innerHTML = '';
    champions.forEach(champion => {
        const option = document.createElement('option');
        option.value = champion;
        datalist.appendChild(option);
    });
}

// Função para preencher o select de patches
function populatePatches() {
    const patches = [...new Set(df.map(row => row.patch).filter(patch => patch && patch.trim() !== ''))].sort((a, b) => parseFloat(b) - parseFloat(a));
    const selectPatch = document.getElementById('patch-filter');
    selectPatch.innerHTML = '<option value="">Todos os Patches</option>';
    patches.forEach(patch => {
        const option = document.createElement('option');
        option.value = patch;
        option.textContent = patch;
        selectPatch.appendChild(option);
    });
}

// Função para preencher o select de ligas
function populateLeagues() {
    const leagues = [...new Set(df.map(row => row.league).filter(league => league && league.trim() !== ''))].sort();
    const selectLeague = document.getElementById('league-filter');
    leagues.forEach(league => {
        if (!selectLeague.querySelector(`option[value="${league}"]`)) {
            const option = document.createElement('option');
            option.value = league;
            option.textContent = league;
            selectLeague.appendChild(option);
        }
    });
}

// Função para mapear exceções de nomes de campeões
function getCleanChampionName(championName) {
    const exceptions = {
        "Cho'Gath": "Chogath",
        "Kai'Sa": "Kaisa",
        "Bel'Veth": "Belveth",
        "Nunu & Willump": "Nunu",
        "K'Sante": "KSante"
    };
    return exceptions[championName] || championName.replace(/['\s]/g, '');
}

// Função para atualizar a imagem do campeão
function updateImage(champId) {
    const champInput = document.getElementById(champId);
    const imageDiv = document.getElementById(`${champId}-image`);
    if (champInput.value) {
        const cleanName = getCleanChampionName(champInput.value);
        const imgUrl = `https://gol.gg/_img/champions_icon/${cleanName}.png`;
        imageDiv.innerHTML = `<img src="${imgUrl}" alt="${champInput.value}" style="max-width: 100px; max-height: 100px;">`;
    } else {
        imageDiv.innerHTML = '';
    }
}

// Função para calcular médias (jogos, vitórias, vitórias %)
function calcularMedias(dados, isTeam2 = false) {
    const jogos = dados.length;
    const vitorias = dados.reduce((sum, row) => sum + (parseInt(row.result) === (isTeam2 ? 0 : 1) ? 1 : 0), 0);
    const winRate = jogos > 0 ? (vitorias / jogos * 100).toFixed(2) : 0;
    return {
        'Jogos': jogos,
        'Vitórias': vitorias,
        'Vitórias (%)': winRate
    };
}

// Função para calcular estatísticas de kills (under/over)
function calcularKillStats(dados, killLine) {
    const totalJogos = dados.length;
    if (totalJogos === 0) return { totalJogos: 0, killsBelow: 0, killsAbove: 0, percentBelow: 0, percentAbove: 0 };
    const killsBelow = dados.filter(row => {
        const kills = parseFloat(row.totalKills);
        return !isNaN(kills) && (kills < killLine || kills === 0);
    }).length;
    const killsAbove = totalJogos - killsBelow;
    const percentBelow = (killsBelow / totalJogos * 100).toFixed(2);
    const percentAbove = (killsAbove / totalJogos * 100).toFixed(2);
    return { totalJogos, killsBelow, killsAbove, percentBelow, percentAbove };
}

// Função para calcular estatísticas de tempo (under/over)
function calcularTimeStats(dados, timeLine) {
    const totalJogos = dados.length;
    if (totalJogos === 0) return { totalJogos: 0, timeBelow: 0, timeAbove: 0, percentBelow: 0, percentAbove: 0 };
    const timeBelow = dados.filter(row => {
        const length = parseInt(row.gamelength);
        return !isNaN(length) && (length < timeLine || length === 0);
    }).length;
    const timeAbove = totalJogos - timeBelow;
    const percentBelow = (timeBelow / totalJogos * 100).toFixed(2);
    const percentAbove = (timeAbove / totalJogos * 100).toFixed(2);
    return { totalJogos, timeBelow, timeAbove, percentBelow, percentAbove };
}

// Função para gerar a tabela
function gerarTabela(medias1, medias2, killStats1, killStats2, timeStats1, timeStats2, selectedChamps1, selectedChamps2, killLine, timeLine) {
    let tableContent = '<table>';
    tableContent += '<tr><th>Estatística</th>';
    if (selectedChamps1.length > 0) tableContent += `<th>${selectedChamps1.map(c => c.name).join(' & ')}</th>`;
    if (selectedChamps2.length > 0) tableContent += `<th>${selectedChamps2.map(c => c.name).join(' & ')}</th>`;
    tableContent += '</tr>';

    tableContent += '<tr><td>Jogos Disputados</td>';
    if (selectedChamps1.length > 0) tableContent += `<td>${medias1.Jogos}</td>`;
    if (selectedChamps2.length > 0) tableContent += `<td>${medias2.Jogos}</td>`;
    tableContent += '</tr>';

    tableContent += '<tr><td>Vitórias</td>';
    if (selectedChamps1.length > 0) tableContent += `<td>${medias1.Vitórias}</td>`;
    if (selectedChamps2.length > 0) tableContent += `<td>${medias2.Vitórias}</td>`;
    tableContent += '</tr>';

    tableContent += '<tr><td>Vitórias (%)</td>';
    if (selectedChamps1.length > 0) tableContent += `<td>${medias1['Vitórias (%)']}%</td>`;
    if (selectedChamps2.length > 0) tableContent += `<td>${medias2['Vitórias (%)']}%</td>`;
    tableContent += '</tr>';

    tableContent += `<tr><td>Under ${killLine} Kills</td>`;
    if (selectedChamps1.length > 0) tableContent += `<td>${killStats1.percentBelow}%</td>`;
    if (selectedChamps2.length > 0) tableContent += `<td>${killStats2.percentBelow}%</td>`;
    tableContent += '</tr>';

    tableContent += `<tr><td>Over ${killLine} Kills</td>`;
    if (selectedChamps1.length > 0) tableContent += `<td>${killStats1.percentAbove}%</td>`;
    if (selectedChamps2.length > 0) tableContent += `<td>${killStats2.percentAbove}%</td>`;
    tableContent += '</tr>';

    tableContent += `<tr><td>Under ${timeLine} min</td>`;
    if (selectedChamps1.length > 0) tableContent += `<td>${timeStats1.percentBelow}%</td>`;
    if (selectedChamps2.length > 0) tableContent += `<td>${timeStats2.percentBelow}%</td>`;
    tableContent += '</tr>';

    tableContent += `<tr><td>Over ${timeLine} min</td>`;
    if (selectedChamps1.length > 0) tableContent += `<td>${timeStats1.percentAbove}%</td>`;
    if (selectedChamps2.length > 0) tableContent += `<td>${timeStats2.percentAbove}%</td>`;
    tableContent += '</tr>';

    tableContent += '</table>';

    return tableContent;
}

// Função para gerar título dinâmico
function gerarTitulo(selectedChamps1, selectedChamps2, patchFilter, yearFilter, recentGames, leagueFilter, isConfrontoDireto = false) {
    const h2 = document.createElement('h2');

    if (selectedChamps1.length > 0) {
        const team1Text = selectedChamps1.length > 1 ? `(${selectedChamps1.map(c => c.name).join(' & ')})` : selectedChamps1[0].name;
        h2.appendChild(document.createTextNode(team1Text));
    }

    if (selectedChamps2.length > 0) {
        const team2Text = selectedChamps2.length > 1 ? `(${selectedChamps2.map(c => c.name).join(' & ')})` : selectedChamps2[0].name;
        h2.appendChild(document.createTextNode(isConfrontoDireto ? ' vs ' : ' + '));
        h2.appendChild(document.createTextNode(team2Text));
    }

    if (patchFilter) h2.appendChild(document.createTextNode(` (Patch ${patchFilter})`));
    if (yearFilter) h2.appendChild(document.createTextNode(` (${yearFilter})`));
    if (leagueFilter && leagueFilter !== 'tier1') h2.appendChild(document.createTextNode(` (${leagueFilter})`));
    if (leagueFilter === 'tier1') h2.appendChild(document.createTextNode(` (Principais / Tier 1)`));
    if (recentGames) h2.appendChild(document.createTextNode(` (Últimos ${recentGames} jogos)`));

    return h2;
}

// Função para Stats Individual
function generateStats() {
    const champs1 = ['champ1_1', 'champ1_2', 'champ1_3'];
    const champs2 = ['champ2_1', 'champ2_2', 'champ2_3'];
    const lanes1 = ['lane1_1', 'lane1_2', 'lane1_3'];
    const lanes2 = ['lane2_1', 'lane2_2', 'lane2_3'];
    const patchFilter = document.getElementById('patch-filter').value;
    const yearFilter = document.getElementById('year-filter').value;
    const recentGames = document.getElementById('recent-games').value;
    const leagueFilter = document.getElementById('league-filter').value;
    const killLine = parseFloat(document.getElementById('kill-line').value);
    const timeLine = parseInt(document.getElementById('time-line').value);

    const selectedChamps1 = champs1.filter(id => document.getElementById(id).value).map(id => ({
        name: document.getElementById(id).value,
        lane: document.getElementById(lanes1[champs1.indexOf(id)]).value
    }));
    const selectedChamps2 = champs2.filter(id => document.getElementById(id).value).map(id => ({
        name: document.getElementById(id).value,
        lane: document.getElementById(lanes2[champs2.indexOf(id)]).value
    }));

    if (selectedChamps1.length === 0 && selectedChamps2.length === 0) {
        document.getElementById('champ-stats-table').innerHTML = '<p>Selecione pelo menos um campeão!</p>';
        return;
    }

    // Aplicar filtros
    let filteredData = df;

    // Filtro por ano
    if (yearFilter !== '') {
        filteredData = filteredData.filter(row => {
            if (!row.date) return false;
            const date = new Date(row.date);
            const year = date.getFullYear();
            return !isNaN(year) && year === parseInt(yearFilter);
        });
    }

    // Filtro por patch
    if (patchFilter !== '') {
        filteredData = filteredData.filter(row => row.patch === patchFilter);
    }

    // Filtro por liga
    if (leagueFilter !== '') {
        if (leagueFilter === 'tier1') {
            filteredData = filteredData.filter(row => TIER1_LEAGUES.includes(row.league));
        } else {
            filteredData = filteredData.filter(row => row.league === leagueFilter);
        }
    }

    let filteredData1 = [];
    let filteredData2 = [];

    if (selectedChamps1.length > 0) {
        filteredData1 = filteredData.filter(row => {
            return selectedChamps1.every(champ => {
                const laneCol = champ.lane ? `team_${champ.lane}` : ['team_top', 'team_jng', 'team_mid', 'team_bot', 'team_sup'].find(col => row[col] === champ.name);
                return laneCol && row[laneCol] === champ.name;
            });
        });
    }

    if (selectedChamps2.length > 0) {
        filteredData2 = filteredData.filter(row => {
            return selectedChamps2.every(champ => {
                const laneCol = champ.lane ? `adversa_${champ.lane}` : ['adversa_top', 'adversa_jng', 'adversa_mid', 'adversa_bot', 'adversa_sup'].find(col => row[col] === champ.name);
                return laneCol && row[laneCol] === champ.name;
            });
        });
    }

    // Filtro por jogos recentes
    if (recentGames !== '') {
        if (filteredData1.length > 0) {
            filteredData1 = filteredData1.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
        }
        if (filteredData2.length > 0) {
            filteredData2 = filteredData2.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
        }
    }

    // Logs de depuração (descomente para verificar)
    // console.log('filteredData1 length:', filteredData1.length, 'filteredData2 length:', filteredData2.length);
    // console.log('filteredData1 totalKills:', filteredData1.map(row => row.totalKills));
    // console.log('filteredData2 totalKills:', filteredData2.map(row => row.totalKills));

    const medias1 = selectedChamps1.length > 0 ? calcularMedias(filteredData1, false) : { 'Jogos': 0, 'Vitórias': 0, 'Vitórias (%)': 0 };
    const medias2 = selectedChamps2.length > 0 ? calcularMedias(filteredData2, true) : { 'Jogos': 0, 'Vitórias': 0, 'Vitórias (%)': 0 };
    const killStats1 = selectedChamps1.length > 0 ? calcularKillStats(filteredData1, killLine) : { percentBelow: 0, percentAbove: 0 };
    const killStats2 = selectedChamps2.length > 0 ? calcularKillStats(filteredData2, killLine) : { percentBelow: 0, percentAbove: 0 };
    const timeStats1 = selectedChamps1.length > 0 ? calcularTimeStats(filteredData1, timeLine) : { percentBelow: 0, percentAbove: 0 };
    const timeStats2 = selectedChamps2.length > 0 ? calcularTimeStats(filteredData2, timeLine) : { percentBelow: 0, percentAbove: 0 };

    const tableContent = gerarTabela(medias1, medias2, killStats1, killStats2, timeStats1, timeStats2, selectedChamps1, selectedChamps2, killLine, timeLine);

    const resultado = document.getElementById('champ-stats-table');
    resultado.innerHTML = '';
    const h2 = gerarTitulo(selectedChamps1, selectedChamps2, patchFilter, yearFilter, recentGames, leagueFilter, false);
    resultado.appendChild(h2);
    resultado.insertAdjacentHTML('beforeend', tableContent);
}

// Função para Confronto Direto
function confrontoDireto() {
    const champs1 = ['champ1_1', 'champ1_2', 'champ1_3'];
    const champs2 = ['champ2_1', 'champ2_2', 'champ2_3'];
    const lanes1 = ['lane1_1', 'lane1_2', 'lane1_3'];
    const lanes2 = ['lane2_1', 'lane2_2', 'lane2_3'];
    const patchFilter = document.getElementById('patch-filter').value;
    const yearFilter = document.getElementById('year-filter').value;
    const recentGames = document.getElementById('recent-games').value;
    const leagueFilter = document.getElementById('league-filter').value;
    const killLine = parseFloat(document.getElementById('kill-line').value);
    const timeLine = parseInt(document.getElementById('time-line').value);

    const selectedChamps1 = champs1.filter(id => document.getElementById(id).value).map(id => ({
        name: document.getElementById(id).value,
        lane: document.getElementById(lanes1[champs1.indexOf(id)]).value
    }));
    const selectedChamps2 = champs2.filter(id => document.getElementById(id).value).map(id => ({
        name: document.getElementById(id).value,
        lane: document.getElementById(lanes2[champs2.indexOf(id)]).value
    }));

    if (selectedChamps1.length === 0 || selectedChamps2.length === 0) {
        document.getElementById('champ-stats-table').innerHTML = '<p>Selecione pelo menos um campeão de cada time para o Confronto Direto!</p>';
        return;
    }

    // Aplicar filtros
    let filteredData = df;

    // Filtro por ano
    if (yearFilter !== '') {
        filteredData = filteredData.filter(row => {
            if (!row.date) return false;
            const date = new Date(row.date);
            const year = date.getFullYear();
            return !isNaN(year) && year === parseInt(yearFilter);
        });
    }

    // Filtro por patch
    if (patchFilter !== '') {
        filteredData = filteredData.filter(row => row.patch === patchFilter);
    }

    // Filtro por liga
    if (leagueFilter !== '') {
        if (leagueFilter === 'tier1') {
            filteredData = filteredData.filter(row => TIER1_LEAGUES.includes(row.league));
        } else {
            filteredData = filteredData.filter(row => row.league === leagueFilter);
        }
    }

    // Filtro para confronto direto
    filteredData = filteredData.filter(row => {
        return selectedChamps1.every(champ => {
            const laneCol = champ.lane ? `team_${champ.lane}` : ['team_top', 'team_jng', 'team_mid', 'team_bot', 'team_sup'].find(col => row[col] === champ.name);
            return laneCol && row[laneCol] === champ.name;
        }) && selectedChamps2.every(champ => {
            const laneCol = champ.lane ? `adversa_${champ.lane}` : ['adversa_top', 'adversa_jng', 'adversa_mid', 'adversa_bot', 'adversa_sup'].find(col => row[col] === champ.name);
            return laneCol && row[laneCol] === champ.name;
        });
    });

    // Filtro por jogos recentes
    if (recentGames !== '') {
        filteredData = filteredData.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
    }

    // Calcular estatísticas, mesmo que filteredData esteja vazio
    const medias1 = filteredData.length > 0 ? calcularMedias(filteredData, false) : { 'Jogos': 0, 'Vitórias': 0, 'Vitórias (%)': 0 };
    const medias2 = filteredData.length > 0 ? {
        'Jogos': filteredData.length,
        'Vitórias': filteredData.length - medias1.Vitórias,
        'Vitórias (%)': filteredData.length > 0 ? ((filteredData.length - medias1.Vitórias) / filteredData.length * 100).toFixed(2) : 0
    } : { 'Jogos': 0, 'Vitórias': 0, 'Vitórias (%)': 0 };
    const killStats1 = filteredData.length > 0 ? calcularKillStats(filteredData, killLine) : { percentBelow: 0, percentAbove: 0 };
    const killStats2 = killStats1; // Mesmos dados para under/over kills
    const timeStats1 = filteredData.length > 0 ? calcularTimeStats(filteredData, timeLine) : { percentBelow: 0, percentAbove: 0 };
    const timeStats2 = timeStats1; // Mesmos dados para under/over tempo

    const tableContent = gerarTabela(medias1, medias2, killStats1, killStats2, timeStats1, timeStats2, selectedChamps1, selectedChamps2, killLine, timeLine);

    const resultado = document.getElementById('champ-stats-table');
    resultado.innerHTML = '';
    const h2 = gerarTitulo(selectedChamps1, selectedChamps2, patchFilter, yearFilter, recentGames, leagueFilter, true);
    resultado.appendChild(h2);
    resultado.insertAdjacentHTML('beforeend', tableContent);
}

// Iniciar o carregamento do CSV quando a página carrega
window.onload = loadCSV;