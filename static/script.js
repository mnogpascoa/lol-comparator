let df = null; // Dados filtrados do CSV (position == 'team' e year == 2025)
let dfLiga = null; // Dados filtrados pelo campeonato selecionado
let dfSide = null; // Dados filtrados por side
let allTeams = []; // Lista de todos os times disponíveis

Papa.parse('static/BaseDeDados.csv', {
    download: true,
    header: true,
    complete: function(results) {
        console.log('CSV carregado com sucesso');
        // Filtrar linhas onde position == 'team' e ano == 2025
        df = results.data.filter(row => row.position === 'team' && row.date && row.date.startsWith('2025'));
        if (df.length === 0) {
            console.error('Nenhum dado encontrado com position == team e ano == 2025');
            alert('Nenhum dado válido encontrado no CSV (position == team e ano == 2025)!');
            return;
        }
        console.log('Dados filtrados (position == team, ano == 2025):', df.length, 'linhas');
        carregarLigas();
        carregarSides();
        carregarTimes();
    },
    error: function(error) {
        console.error('Erro ao carregar CSV:', error);
        alert('Falha ao carregar os dados. Verifique a URL do CSV: ' + error.message);
    }
});

function carregarLigas() {
    if (!df) return;
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
    if (!df) return;
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
    if (!df) return;
    const liga = document.getElementById('liga').value;
    const side = document.getElementById('side').value;
    const time1Input = document.getElementById('time1');
    const time2Input = document.getElementById('time2');
    
    // Salvar os times selecionados atualmente
    const time1Selecionado = time1Input.value;
    const time2Selecionado = time2Input.value;

    // Filtrar dados pelo campeonato, se selecionado
    dfLiga = liga ? df.filter(row => row.league === liga) : df;
    
    // Aplicar filtro de side, se selecionado
    dfSide = side ? dfLiga.filter(row => row.side === side) : dfLiga;
    
    console.log('=== Dados Filtrados (position == team, league == ' + (liga || 'todos') + (side ? ', side == ' + side : ', todos os lados') + ', ano == 2025) ===');
    console.log('Colunas:', Object.keys(dfSide[0] || {}));
    console.log('Total de linhas filtradas:', dfSide.length);
    console.table(dfSide.slice(0, 10));
    console.log('Dados completos (dfSide):', dfSide);
    
    if (dfSide.length === 0) {
        console.error('Nenhum dado encontrado para a combinação selecionada:', liga, side);
        alert('Nenhum dado encontrado para a combinação selecionada!');
        document.getElementById('times-list').innerHTML = '';
        time1Input.value = time2Input.value = '';
        return;
    }

    // Carregar times disponíveis
    const times = [...new Set(dfSide.map(row => row.teamname).filter(time => time))].sort();
    const datalist = document.getElementById('times-list');
    datalist.innerHTML = '';
    times.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        datalist.appendChild(option);
    });

    // Restaurar times selecionados, se ainda forem válidos
    if (time1Selecionado && times.includes(time1Selecionado)) {
        time1Input.value = time1Selecionado;
    } else {
        time1Input.value = '';
    }
    if (time2Selecionado && times.includes(time2Selecionado)) {
        time2Input.value = time2Selecionado;
    } else {
        time2Input.value = '';
    }

    // Armazenar todos os times para validação no comparar
    if (!liga && !side) {
        allTeams = times;
    }
}

function comparar() {
    const liga = document.getElementById('liga').value;
    const side = document.getElementById('side').value;
    const time1 = document.getElementById('time1').value;
    const time2 = document.getElementById('time2').value;

    // Validações
    if (!time1 || !time2) {
        alert('Selecione os dois times!');
        return;
    }
    if (time1 === time2) {
        alert('Selecione times diferentes!');
        return;
    }
    if (!dfSide) {
        alert('Nenhum dado disponível para a combinação selecionada!');
        return;
    }

    // Validar se os times existem nos dados filtrados
    const timesDisponiveis = [...new Set(dfSide.map(row => row.teamname).filter(time => time))];
    if (!timesDisponiveis.includes(time1) || !timesDisponiveis.includes(time2)) {
        alert('Um ou ambos os times não são válidos para a combinação selecionada!');
        return;
    }

    // Filtrar dados por time
    const dadosTime1 = dfSide.filter(row => row.teamname === time1);
    const dadosTime2 = dfSide.filter(row => row.teamname === time2);
    console.log(`Dados para ${time1}:`, dadosTime1.slice(0, 3));
    console.log(`Dados para ${time2}:`, dadosTime2.slice(0, 3));

    if (dadosTime1.length === 0 || dadosTime2.length === 0) {
        alert('Time inválido para a combinação selecionada!');
        return;
    }

    function calcularMedias(dados) {
        const jogos = dados.length;
        const vitorias = dados.reduce((sum, row) => sum + (parseInt(row.result) || 0), 0);
        const vitoriasPercent = (vitorias / jogos) * 100;
        const torresPercent = dados.reduce((sum, row) => sum + (parseInt(row.firsttower) || 0), 0) / jogos * 100;
        const dragoesPercent = dados.reduce((sum, row) => sum + (parseInt(row.firstdragon) || 0), 0) / jogos * 100;
        const firstBloodPercent = dados.reduce((sum, row) => sum + (parseInt(row.firstblood) || 0), 0) / jogos * 100;
        return {
            'Jogos': jogos,
            'Vitórias': vitorias,
            'Vitórias (%)': vitoriasPercent.toFixed(2),
            'Torres (%)': torresPercent.toFixed(2),
            'Dragões (%)': dragoesPercent.toFixed(2),
            'Primeiro Sangue (%)': firstBloodPercent.toFixed(2)
        };
    }

    const mediasTime1 = calcularMedias(dadosTime1);
    const mediasTime2 = calcularMedias(dadosTime2);
    console.log(`Médias ${time1}:`, mediasTime1);
    console.log(`Médias ${time2}:`, mediasTime2);

    const resultado = document.getElementById('resultado');
    resultado.innerHTML = `
        <h2>Comparação: ${time1} vs ${time2} ${side ? '(' + side + ')' : ''} ${liga ? '(' + liga + ')' : ''} (2025)</h2>
        <table>
            <tr>
                <th>Estatística</th>
                <th>${time1}</th>
                <th>${time2}</th>
            </tr>
            <tr>
                <td>Jogos Disputados</td>
                <td>${mediasTime1.Jogos}</td>
                <td>${mediasTime2.Jogos}</td>
            </tr>
            <tr>
                <td>Vitórias</td>
                <td>${mediasTime1.Vitórias}</td>
                <td>${mediasTime2.Vitórias}</td>
            </tr>
            <tr>
                <td>Vitórias (%)</td>
                <td>${mediasTime1['Vitórias (%)']}</td>
                <td>${mediasTime2['Vitórias (%)']}</td>
            </tr>
            <tr>
                <td>Primeira Torre (%)</td>
                <td>${mediasTime1['Torres (%)']}</td>
                <td>${mediasTime2['Torres (%)']}</td>
            </tr>
            <tr>
                <td>Primeiro Dragão (%)</td>
                <td>${mediasTime1['Dragões (%)']}</td>
                <td>${mediasTime2['Dragões (%)']}</td>
            </tr>
            <tr>
                <td>Primeiro Sangue (%)</td>
                <td>${mediasTime1['Primeiro Sangue (%)']}</td>
                <td>${mediasTime2['Primeiro Sangue (%)']}</td>
            </tr>
        </table>
    `;
}
