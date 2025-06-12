let dados = [];
let times = [];

window.onload = function () {
    Papa.parse('static/BaseDeDados.csv', {
        download: true,
        header: true,
        complete: function (results) {
            // Filtra apenas linhas que contêm '2025' na data
            dados = results.data.filter(row =>
                row.date && row.date.includes('2025')
            );

            // Extrai times únicos
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

function mostrarSugestoes(input, sugestaoId) {
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

    const resultados = dados.filter(item => {
        const ligaOk = liga === 'Todos' || item.league === liga;
        const ladoOk = lado === 'Todos' || item.lado === lado;
        const confronto = (
            (item.time1 === time1 && item.time2 === time2) ||
            (item.time1 === time2 && item.time2 === time1)
        );
        return ligaOk && ladoOk && confronto;
    });

    mostrarResultado(resultados);
}

function mostrarResultado(lista) {
    const div = document.getElementById('resultado');
    div.innerHTML = '';

    if (lista.length === 0) {
        div.textContent = 'Nenhum confronto encontrado com os filtros.';
        return;
    }

    const tabela = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    Object.keys(lista[0]).forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    tabela.appendChild(thead);

    const tbody = document.createElement('tbody');
    lista.forEach(row => {
        const tr = document.createElement('tr');
        Object.values(row).forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    tabela.appendChild(tbody);

    div.appendChild(tabela);
}
