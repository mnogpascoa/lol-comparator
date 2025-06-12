let dados = [];

window.onload = function () {
    Papa.parse('static/BaseDeDados.csv', {
        download: true,
        header: true,
        complete: function (results) {
            dados = results.data;
            preencherSelectsIniciais();
        }
    });
};

function preencherSelectsIniciais() {
    const selectLado = document.getElementById('side');
    const selectLiga = document.getElementById('liga');

    const lados = [...new Set(dados.map(item => item.lado).filter(Boolean))];
    const ligas = [...new Set(dados.map(item => item.league).filter(Boolean))];

    adicionarOpcoes(selectLado, ['Todos', ...lados]);
    adicionarOpcoes(selectLiga, ['Todos', ...ligas]);

    carregarTimes();
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

function carregarTimes() {
    const ligaSelecionada = document.getElementById('liga').value;
    const ladoSelecionado = document.getElementById('side').value;

    const dadosFiltrados = dados.filter(item => {
        const ligaOk = ligaSelecionada === 'Todos' || item.league === ligaSelecionada;
        const ladoOk = ladoSelecionado === 'Todos' || item.lado === ladoSelecionado;
        return ligaOk && ladoOk;
    });

    const times = [...new Set(dadosFiltrados.flatMap(item => [item.time1, item.time2]).filter(Boolean))];

    atualizarSelect(document.getElementById('time1'), times, 'Selecione o time');
    atualizarSelect(document.getElementById('time2'), times, 'Selecione o time');
}

function atualizarSelect(selectElement, valores, textoPadrao) {
    selectElement.innerHTML = '';
    const optionPadrao = document.createElement('option');
    optionPadrao.value = '';
    optionPadrao.textContent = textoPadrao;
    selectElement.appendChild(optionPadrao);

    valores.forEach(valor => {
        const option = document.createElement('option');
        option.value = valor;
        option.textContent = valor;
        selectElement.appendChild(option);
    });
}

function comparar() {
    const time1 = document.getElementById('time1').value;
    const time2 = document.getElementById('time2').value;

    if (!time1 || !time2) {
        alert("Selecione os dois times para comparar.");
        return;
    }

    const ligaSelecionada = document.getElementById('liga').value;
    const ladoSelecionado = document.getElementById('side').value;

    const dadosFiltrados = dados.filter(item => {
        const ligaOk = ligaSelecionada === 'Todos' || item.league === ligaSelecionada;
        const ladoOk = ladoSelecionado === 'Todos' || item.lado === ladoSelecionado;
        const confrontoOk = (
            (item.time1 === time1 && item.time2 === time2) ||
            (item.time1 === time2 && item.time2 === time1)
        );
        return ligaOk && ladoOk && confrontoOk;
    });

    mostrarResultado(dadosFiltrados);
}

function mostrarResultado(dados) {
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = '';

    if (dados.length === 0) {
        resultadoDiv.textContent = 'Nenhum confronto encontrado com os filtros aplicados.';
        return;
    }

    const tabela = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const colunas = Object.keys(dados[0]);

    const trHead = document.createElement('tr');
    colunas.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    dados.forEach(linha => {
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
