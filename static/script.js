let dados = []; // aqui vai seu CSV ou dados já carregados
let campeonatosFiltrados = [];
let timesPorCampeonato = {};

document.addEventListener("DOMContentLoaded", () => {
    // Exemplo de carregar CSV (ajuste conforme seu fluxo)
    Papa.parse("static/BaseDeDados.csv", {
        download: true,
        header: true,
        complete: function(results) {
            dados = results.data;
            filtrarCampeonatos2025();
            preencherSelectLiga();
            preencherSelectSide();
            // times só serão carregados após escolher campeonato
        }
    });
});

function filtrarCampeonatos2025() {
    campeonatosFiltrados = [...new Set(dados
        .filter(row => row.Ano === "2025")
        .map(row => row.Campeonato)
        .filter(c => c))];
}

function preencherSelectLiga() {
    const liga = document.getElementById("liga");
    liga.innerHTML = ""; // limpa opções

    campeonatosFiltrados.forEach(camp => {
        const option = document.createElement("option");
        option.value = camp;
        option.textContent = camp;
        liga.appendChild(option);
    });
}

function preencherSelectSide() {
    const side = document.getElementById("side");
    side.innerHTML = "";

    const lados = ["Blue", "Red"]; // exemplo, ajuste conforme sua base
    lados.forEach(l => {
        const option = document.createElement("option");
        option.value = l;
        option.textContent = l;
        side.appendChild(option);
    });
}

function filtrarPorLiga() {
    const liga = document.getElementById("liga").value;

    if (!liga) {
        limparTimes();
        return;
    }

    // filtrar times desse campeonato e ano 2025
    const timesFiltrados = [...new Set(dados
        .filter(row => row.Ano === "2025" && row.Campeonato === liga)
        .flatMap(row => [row.Time1, row.Time2])
        .filter(t => t))];

    preencherTimes(timesFiltrados);
}

function preencherTimes(times) {
    const time1 = document.getElementById("time1");
    const time2 = document.getElementById("time2");

    time1.innerHTML = "";
    time2.innerHTML = "";

    times.forEach(t => {
        const option1 = document.createElement("option");
        option1.value = t;
        option1.textContent = t;
        time1.appendChild(option1);

        const option2 = document.createElement("option");
        option2.value = t;
        option2.textContent = t;
        time2.appendChild(option2);
    });
}

function limparTimes() {
    document.getElementById("time1").innerHTML = "";
    document.getElementById("time2").innerHTML = "";
}

function filtrarPorSide() {
    // Aqui você pode implementar filtro se necessário, ex. filtrar times por lado
    // Por enquanto não altera os times, apenas serve como filtro para sua lógica de comparação
}

function comparar() {
    const liga = document.getElementById("liga").value;
    const side = document.getElementById("side").value;
    const time1 = document.getElementById("time1").value;
    const time2 = document.getElementById("time2").value;
    const jogosRecentes = document.getElementById("jogosRecentes").value;

    if (!liga || !time1 || !time2) {
        alert("Escolha campeonato e os dois times antes de comparar.");
        return;
    }

    // Aqui você pode aplicar o filtro de jogos recentes na sua base, por exemplo:
    // filtrar dados para os últimos N jogos de cada time antes de calcular médias e vitórias

    // Exemplo simples (ajuste conforme seus dados)
    const jogosTime1 = dados
        .filter(row => row.Ano === "2025" && row.Campeonato === liga && (row.Time1 === time1 || row.Time2 === time1));
    const jogosTime2 = dados
        .filter(row => row.Ano === "2025" && row.Campeonato === liga && (row.Time1 === time2 || row.Time2 === time2));

    const n = parseInt(jogosRecentes);
    const jogosRecentesTime1 = n ? jogosTime1.slice(-n) : jogosTime1;
    const jogosRecentesTime2 = n ? jogosTime2.slice(-n) : jogosTime2;

    // Calcule suas médias e vitórias aqui usando jogosRecentesTime1 e jogosRecentesTime2

    document.getElementById("resultado").textContent = `Comparando ${time1} vs ${time2} no campeonato ${liga} (últimos ${jogosRecentes || "todos"} jogos).`;
}
