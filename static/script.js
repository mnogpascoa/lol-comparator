let dados = [];
let times = [];

window.onload = function () {
    Papa.parse('static/BaseDeDados.csv', {
        download: true,
        header: true,
        complete: function (results) {
            // Manter apenas jogos do ano de 2025
            dados = results.data.filter(row => row.date && row.date.includes('2025'));

            // Gerar lista de times distintos com base nos dados de 2025
            times = [...new Set(dados.map(d => d.teamname).filter(Boolean))];

            preencherFiltros();
        }
    });
};

function preencherFiltros() {
    const selectLado = document.getElementById('side');
    const selectLiga = document.getElementById('liga');

    const lados = [...new Set(dados.map(item => item.lado).filter(Boolean))];
    const ligas = [...new Set(dados.map(item => item.league).filter(Boolean))];

    adicionarOpcoes(selectLado, ['Todos', ...lados]);
    adicionarOpcoes(selectLiga, ['Todos', ...ligas]);
}

function adicionarOpcoes(select, valores) {
    select.innerHTML = '';
    valores.forEach(valor => {
        const option = document.createElement('option');
        option.value = valor;
        option.textContent = valor;
        select.appendChild(option);
    });
}

function mostrarSugestoes(input, sugestoesId) {
    const texto = input.value.toLowerCase();
    const container = document.getElementById(sugestoesId);
    container.innerHTML = '';
    container.style.display = 'block';

    if (!texto) {
        container.style.display = 'none';
        return;
    }

    const filtrados = times.filter(t => t.toLowerCase().includes(texto));

    filtrados.slice(0, 10).forEach(time => {
        const div = document.createElement('div');
        div.textContent = time;
        div.onclick = () => {
            input.value = time;
            container.innerHTML = '';
            container.style.display = 'none';
        };
        container.appendChild(div);
    });
}

function comparar() {
    const time1 = document.getElementById('time1').value.trim();
    const time2 = document.getElementById('time2').value.trim();
    const lado = document.getElementById('side').value;
    const liga = document.getElementById('liga').value;

    if (!time1 || !time2) {
        alert('Preencha os dois times!');
        return;
    }

    const filtro = (item, time) => {
        const ladoOk = lado === 'Todos' || item.lado === lado;
        const ligaOk = liga === 'Todos' || item.league === liga;
        return item.teamname === time && ladoOk && ligaOk;
    };

    const jogosTime1 = dados.filter(item => filtro(item, time1));
    const jogosTime2 = dados.filter(item => filtro(item, time2));

    mostrarEstatisticas(time1, jogosTime1, time2, jogosTime2);
}

function calcularMedias(dados) {
    const jogos = dados.length;
    if (jogos === 0) {
        return null;
    }

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

function mostrarEstatisticas(time1, jogos1, time2, jogos2) {
    const div = document.getElementById('resultado');
    div.innerHTML = '';

    const stats1 = calcularMedias(jogos1);
    const stats2 = calcularMedias(jogos2);

    if (!stats1 && !stats2) {
        div.textContent = 'Nenhum jogo encontrado para os times selecionados com os filtros aplicados.';
        return;
    }

    const bloco = (nome, stats) => {
        if (!stats) {
            return `<h3>${nome}</h3><p>Nenhum jogo encontrado.</p>`;
        }

        return `
            <h3>${nome}</h3>
            <ul>
                <li>Jogos: ${stats['Jogos']}</li>
                <li>Vitórias: ${stats['Vitórias']}</li>
                <li>Vitórias (%): ${stats['Vitórias (%)']}%</li>
                <li>Torres (%): ${stats['Torres (%)']}%</li>
                <li>Dragões (%): ${stats['Dragões (%)']}%</li>
                <li>Primeiro Sangue (%): ${stats['Primeiro Sangue (%)']}%</li>
            </ul>
        `;
    };

    div.innerHTML = bloco(time1, stats1) + bloco(time2, stats2);
}
