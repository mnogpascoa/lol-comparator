let dados = [];
let dadosFiltrados = [];

Papa.parse("static/BaseDeDados.csv", {
    download: true,
    header: true,
    complete: function(results) {
        dados = results.data.filter(item => item['Ano'] === '2025');
        carregarCampeonatos();
    }
});

function carregarCampeonatos() {
    const selectLiga = document.getElementById("liga");
    const campeonatos = [...new Set(dados.map(item => item.Campeonato))].sort();

    campeonatos.forEach(campeonato => {
        const option = document.createElement("option");
        option.value = campeonato;
        option.textContent = campeonato;
        selectLiga.appendChild(option);
    });
}

function filtrarPorLiga() {
    const ligaSelecionada = document.getElementById("liga").value;
    const selectTime1 = document.getElementById("time1");
    const selectTime2 = document.getElementById("time2");

    // Limpa os selects
    selectTime1.innerHTML = "";
    selectTime2.innerHTML = "";

    if (ligaSelecionada === "") return;

    dadosFiltrados = dados.filter(item => item.Campeonato === ligaSelecionada);

    const timesUnicos = [...new Set(dadosFiltrados.map(item => item.Time))].sort();

    timesUnicos.forEach(time => {
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

function comparar() {
    const campeonato = document.getElementById("liga").value;
    const lado = document.getElementById("side").value;
    const time1 = document.getElementById("time1").value;
    const time2 = document.getElementById("time2").value;
    const jogosRecentes = document.getElementById("jogosRecentes").value;

    if (!campeonato || !time1 || !time2) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }

    const payload = {
        campeonato,
        lado,
        time1,
        time2,
        jogosRecentes
    };

    fetch("/comparar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("resultado").innerHTML = data.resultado || "Resultado não disponível.";
    })
    .catch(err => {
        console.error("Erro na comparação:", err);
        document.getElementById("resultado").innerHTML = "Erro ao processar a comparação.";
    });
}
