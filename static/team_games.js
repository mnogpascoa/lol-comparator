// Variável global para armazenar os dados do CSV
let df;

// Função para obter o parâmetro 'teamname' da URL
function getTeamNameFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return decodeURIComponent(urlParams.get('teamname'));
}

// Função para carregar o CSV
function loadCSV() {
    Papa.parse('/lol-comparator/static/BaseDadosDesseAno.csv', {
        download: true,
        header: true,
        complete: function(results) {
            df = results.data;
            console.log('CSV carregado, primeiros 5 registros:', df.slice(0, 5)); // Depuração
            displayTeamData();
        },
        error: function(error) {
            console.error('Erro ao carregar CSV:', error);
            document.getElementById('team-info').innerHTML = '<p>Erro ao carregar os dados! Verifique se o arquivo está disponível.</p>';
        }
    });
}

// Função para exibir os dados do time
function displayTeamData() {
    const teamName = getTeamNameFromURL();
    if (!teamName) {
        document.getElementById('team-info').innerHTML = '<p>Nenhum time selecionado!</p>';
        return;
    }

    const teamData = df.filter(row => row.teamname === teamName);

    if (teamData.length === 0) {
        document.getElementById('team-info').innerHTML = `<p>Nenhuma partida encontrada para o time ${teamName}!</p>`;
        return;
    }

    document.getElementById('team-info').innerHTML = `<h2>Partidas de ${teamName} (2025)</h2>`;

    let tableContent = `
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Liga</th>
                    <th>Lado</th>
                    <th>Vitória</th>
                    <th>Adversário</th>
                    <th>Duração (min)</th>
                    <th>Kills</th>
                    <th>Deaths</th>
                    <th>Assists</th>
                    <th>Primeira Torre</th>
                    <th>Primeiro Dragão</th>
                    <th>Primeiro Sangue</th>
                    <th>Total Dragões</th>
                    <th>Total Barons</th>
                    <th>Total Torres</th>
                    <th>Total Inibidores</th>
                </tr>
            </thead>
            <tbody>
    `;

    teamData.sort((a, b) => new Date(b.date) - new Date(a.date));

    teamData.forEach(row => {
        tableContent += `
            <tr>
                <td>${row.date || '-'}</td>
                <td>${row.league || '-'}</td>
                <td>${row.side || '-'}</td>
                <td>${row.result || '-'}</td>
                <td>${row.adversa_team || '-'}</td>
                <td>${row.gamelength || '-'}</td>
                <td>${row.kills || '-'}</td>
                <td>${row.deaths || '-'}</td>
                <td>${row.assists || '-'}</td>
                <td>${row.firsttower || '-'}</td>
                <td>${row.firstdragon || '-'}</td>
                <td>${row.firstblood || '-'}</td>
                <td>${row.totalDragons || '-'}</td>
                <td>${row.totalBarons || '-'}</td>
                <td>${row.totalTowers || '-'}</td>
                <td>${row.totalInhibitors || '-'}</td>
            </tr>
        `;
    });

    tableContent += `
            </tbody>
        </table>
    `;
    document.getElementById('games-table').innerHTML = tableContent;
}

// Iniciar o carregamento do CSV quando a página carrega
window.onload = loadCSV;
