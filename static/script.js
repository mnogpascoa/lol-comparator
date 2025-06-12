let dados = [];

window.onload = function () {
    Papa.parse('static/BaseDeDados.csv', {
        download: true,
        header: true,
        complete: function (results) {
            dados = results.data;
            preencherFiltrosIniciais();
            preencherListaDeTimes();
        }
    });
};

function preencherFiltrosIniciais() {
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

function preencherListaDeTimes() {
    const lista = document.getElementById('listaTimes');
    const timesUnicos = [...new Set(dados.map(item => item.teamname).filter(Boolean))];
    lista.innerHTML = '';
    timesUnicos.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        lista.appendChild(option);
    });
}

function comparar() {
    const time1 = document.getElementById('time1').value.trim();
    const time2 = document.getElementById('time2').value.trim();
    const lado = document.getElementById('side').value;
    const liga = document.getElementById('liga').value;

    if (!time1 || !time2) {
        alert('Por favor, preencha os dois times para comparar.');
        return;
    }

    const resultados = dados.filter(item => {
        const ligaOk = liga === 'Todos' || item.league === liga;
        const ladoOk = lado === 'Todos' || item.lado === lado;
        const confrontoOk = (
            (item.time1 === time1 && item.time2 === time2) ||
            (item.time1 === time2 && item.time2 === time1)
        );
        return ligaOk && ladoOk && confrontoOk;
    });

    mostrarResultado(resultados);
}

function mostrarResultado(dadosFiltrados) {
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = '';

    if (dadosFiltrados.length === 0) {
        resultadoDiv.textContent = 'Nenhum confronto encontrado com os filtros aplicados.';
        return;
    }

    const tabela = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const colunas = Object.keys(dadosFiltrados[0]);

    const trHead = document.createElement('tr');
    colunas.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    dadosFiltrados.forEach(linha => {
        const tr = document.createElement('tr');
        colunas.forEach(col => {
            const td = document.createElement('td');
            td.textContent = linha[col];
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    tabela.appendChild(thead);
    tabela.appendChild(tbody);
    resultadoDiv.appendChild(tabela);
}
