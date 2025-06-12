// Função para obter o parâmetro 'teamname' da URL
function getTeamNameFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return decodeURIComponent(urlParams.get('teamname'));
}

// Carregar e processar o CSV
Papa.parse('BaseDadosDesseAno.csv', {
    download: true,
    header: true,
    complete: function(results) {
        const teamName = getTeamNameFromURL();
        if (!teamName) {
            document.getElementById('team-info').innerHTML = '<p>Nenhum time selecionado!</p>';
            return;
        }

        // Filtrar dados para o time escolhido e para 2025
        const teamData = results.data.filter(row => 
            row.teamname === teamName);

        if (teamData.length === 0) {
            document.getElementById('team-info').innerHTML = `<p>Nenhuma partida encontrada para o time ${teamName}!</p>`;
            return;
        }

        // Exibir nome do time
        document.getElementById('team-info').innerHTML = `<h2>Partidas de ${teamName} (2025)</h2>`;

        // Criar tabela
        let tableContent = `
            <table>
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
        `;

        // Ordenar por data (mais recente primeiro)
        teamData.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Adicionar linhas à tabela
        teamData.forEach(row => {
            tableContent += `
                <tr>
                    <td>${row.date || '-'}</td>
                    <td>${row.league || '-'}</td>
                    <td>${row.side || '-'}</td>
                    <td>${row.result ||'-'}</td>
                    <td>${row.adversa_team ||'-'}</td>
                    <td>${(row.gamelength / 60 || 0).toFixed(2) || '-'}</td>
                    <td>${row.kills ||'-'}</td>
                    <td>${row.deaths ||'-'}</td>
                    <td>${row.assists ||'-'}</td>
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

        tableContent += `</table>`;
        document.getElementById('games-table').innerHTML = tableContent;
    },
    error: function(error) {
        console.error('Erro ao carregar CSV:', error);
        document.getElementById('team-info').innerHTML = '<p>Erro ao carregar os dados!</p>';
    }
});
