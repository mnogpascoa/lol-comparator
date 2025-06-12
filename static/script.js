let dados = [];
let dadosFiltrados = [];

// Carregar dados do CSV e filtrar apenas de 2025
Papa.parse("static/BaseDeDados.csv", {
    download: true,
    header: true,
    complete: function(results) {
        dados = results.data.filter(item => item.Ano === '2025');
        preencherSelectsIniciais();
    },
    error: function(err) {
        console.error("Erro ao carregar o CSV:", err);
    }
});

function preencherSelectsIniciais() {
    preencherCampeonatos();
    preencherLados();
    preencherJogosRecentes();

    document.getElementById('liga').addEventListener('change', filtrarPorLiga);
    document.getElementById('side').addEventListener('change', preencherTimes);
}

function preencherCampeonatos() {
    const selectLiga = document.getElementById("liga");
    selectLiga.innerHTML = "<option value=''>Selecionar</option>";

    const campeonatos = [...new Set(dados.map(item => item.league))].sort();

    campeonatos.forEach(league => {
        const o = document.createElement("option");
        o.value = league;
        o.textContent = league;
        selectLiga.appendChild(o);
    });
}

function preencherLados() {
    const selectSide = document.getElementById("side");
    selectSide.innerHTML = "";
    ["", "Blue", "Red"].forEach(lado => {
        const o = document.createElement("option");
        o.value = lado;
        o.textContent = lado ? lado : "Todos";
        selectSide.appendChild(o);
    });
}

function preencherJogosRecentes() {
    const selectJR = document.getElementById("jogosRecentes");
    selectJR.innerHTML = "";
    ["", "10", "20", "30", "40", "50"].forEach(val => {
        const o = document.createElement("option");
        o.value = val;
        o.textContent = val ? val : "Todos";
        selectJR.appendChild(o);
    });
}

function filtrarPorLiga() {
    const liga = document.getElementById("liga").value;
    dadosFiltrados = liga ? dados.filter(item => item.league === liga) : [];
    preencherTimes();
}

function preencherTimes() {
    const select1 = document.getElementById("time1");
    const select2 = document.getElementById("time2");
    select1.innerHTML = "";
    select2.innerHTML = "";

    if (!dadosFiltrados.length) return;

    const side = document.getElementById("side").value;
    let base = dadosFiltrados;

    if (side) base = base.filter(item => item.Side === side);

    const times = [...new Set(base.map(item => item.Time))].sort();

    times.forEach(time => {
        const o1 = document.createElement("option");
        o1.value = time;
        o1.textContent = time;
        select1.appendChild(o1);

        const o2 = o1.cloneNode(true);
        select2.appendChild(o2);
    });
}

function comparar() {
    const liga = document.getElementById("liga").value;
    const side = document.getElementById("side").value;
    const time1 = document.getElementById("time1").value;
    const time2 = document.getElementById("time2").value;
    const JR = parseInt(document.getElementById("jogosRecentes").value);

    if (!liga || !time1 || !time2) {
        alert("Selecione campeonato e os dois times.");
        return;
    }

    let base = dados.filter(item => item.league === liga && (side ? item.Side === side : true));

    let dados1 = base.filter(item => item.Time === time1);
    let dados2 = base.filter(item => item.Time === time2);

    if (JR) {
        dados1 = dados1.slice(-JR);
        dados2 = dados2.slice(-JR);
    }

    const total1 = dados1.length;
    const wins1 = dados1.filter(item => item.Result === "Win").length;
    const total2 = dados2.length;
    const wins2 = dados2.filter(item => item.Result === "Win").length;

    document.getElementById("resultado").innerHTML = `
        <h3>Resultado:</h3>
        <p><strong>${time1}</strong>: ${wins1} vitórias em ${total1} jogos</p>
        <p><strong>${time2}</strong>: ${wins2} vitórias em ${total2} jogos</p>
    `;
}
