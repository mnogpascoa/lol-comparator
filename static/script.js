// script.js
let dados = [];

function carregarDados() {
    Papa.parse("static/BaseDeDados.csv", {
        download: true,
        header: true,
        complete: function(results) {
            dados = results.data;
            carregarCampeonatos();
            carregarLados();
            carregarTimes();
        }
    });
}

function carregarCampeonatos() {
    const selectLiga = document.getElementById("liga");
    const campeonatos = [...new Set(dados.map(row => row.league))].sort();
    selectLiga.innerHTML = '<option value="">Todos</option>';
    campeonatos.forEach(campeonato => {
        const option = document.createElement("option");
        option.value = campeonato;
        option.textContent = campeonato;
        selectLiga.appendChild(option);
    });
}

function carregarLados() {
    const selectSide = document.getElementById("side");
    const lados = [...new Set(dados.map(row => row.side))].sort();
    selectSide.innerHTML = '<option value="">Todos</option>';
    lados.forEach(lado => {
        const option = document.createElement("option");
        option.value = lado;
        option.textContent = lado;
        selectSide.appendChild(option);
    });
}

function carregarTimes() {
    const selectTime1 = document.getElementById("time1");
    const selectTime2 = document.getElementById("time2");
    const ligaSelecionada = document.getElementById("liga").value;
    const sideSelecionado = document.getElementById("side").value;

    let timesFiltrados = dados;

    if (ligaSelecionada) {
        timesFiltrados = timesFiltrados.filter(row => row.league === ligaSelecionada);
    }
    if (sideSelecionado) {
        timesFiltrados = timesFiltrados.filter(row => row.side === sideSelecionado);
    }

    const times = [...new Set(timesFiltrados.map(row => row.teamname))].sort();

    selectTime1.innerHTML = '<option value="">Selecione o time</option>';
    selectTime2.innerHTML = '<option value="">Selecione o time</option>';

    times.forEach(time => {
        const option1 = document.createElement("option");
        option1.value = time;
        option1.textContent = time;
        selectTime1.appendChild(option1);

        const option2 = document.createElement("option");
        option2.value = time;
        option2.textContent = time;
        selectTime2.appendChild(option2);
    });
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

function comparar() {
    const time1 = document.getElementById("time1").value;
    const time2 = document.getElementById("time2").value;
    const ligaSelecionada = document.getElementById("liga").value;
    const sideSelecionado = document.getElementById("side").value;

    if (!time1 || !time2) {
        alert("Por favor, selecione os dois times.");
        return;
    }

    let dadosTime1 = dados.filter(row => row.teamname === time1);
    let dadosTime2 = dados.filter(row => row.teamname === time2);

    if (ligaSelecionada) {
        dadosTime1 = dadosTime1.filter(row => row.league === ligaSelecionada);
        dadosTime2 = dadosTime2.filter(row => row.league === ligaSelecionada);
    }
    if (sideSelecionado) {
        dadosTime1 = dadosTime1.filter(row => row.side === sideSelecionado);
        dadosTime2 = dadosTime2.filter(row => row.side === sideSelecionado);
    }

    if (dadosTime1.length === 0 || dadosTime2.length === 0) {
        document.getElementById("resultado").innerHTML = "Nenhum confronto encontrado com os filtros aplicados.";
        return;
    }

    const mediasTime1 = calcularMedias(dadosTime1);
    const mediasTime2 = calcularMedias(dadosTime2);

    let tabela = `<table>
        <tr><th>Estatística</th><th>${time1}</th><th>${time2}</th></tr>`;

    for (const key in mediasTime1) {
        tabela += `<tr>
            <td>${key}</td>
            <td>${mediasTime1[key]}</td>
            <td>${mediasTime2[key]}</td>
        </tr>`;
    }

    tabela += `</table>`;

    document.getElementById("resultado").innerHTML = tabela;
}

window.onload = carregarDados;
