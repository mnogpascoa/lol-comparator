
    let df = [];
    let dfSide = [];

    Papa.parse("static/BaseDeDados.csv", {
        download: true,
        header: true,
        complete: function(results) {
            df = results.data.filter(row => row.date && row.date.startsWith("2025")); // Apenas ano 2025
            carregarLigas();
            carregarSides();
            carregarTimes();
        }
    });

    function carregarLigas() {
        const ligas = [...new Set(df.map(row => row.league).filter(liga => liga))].sort();
        const selectLiga = document.getElementById('liga');
        selectLiga.innerHTML = '';
        ligas.forEach(liga => {
            const option = document.createElement('option');
            option.value = liga;
            option.textContent = liga;
            selectLiga.appendChild(option);
        });
    }

    function carregarSides() {
        const sides = [...new Set(df.map(row => row.side).filter(side => side))].sort();
        const selectSide = document.getElementById('side');
        selectSide.innerHTML = '';
        sides.forEach(side => {
            const option = document.createElement('option');
            option.value = side;
            option.textContent = side;
            selectSide.appendChild(option);
        });
    }

    function carregarTimes() {
        const selectTime1 = document.getElementById('time1');
        const selectTime2 = document.getElementById('time2');
        selectTime1.innerHTML = '';
        selectTime2.innerHTML = '';

        const base = dfSide.length > 0 ? dfSide : df;
        const times = [...new Set(base.map(row => row.teamname).filter(t => t))].sort();

        times.forEach(time => {
            const option1 = document.createElement('option');
            option1.value = time;
            option1.textContent = time;
            selectTime1.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = time;
            option2.textContent = time;
            selectTime2.appendChild(option2);
        });
    }

    function filtrarPorLiga() {
        const ligaSelecionada = document.getElementById('liga').value;
        dfSide = df.filter(row => row.league === ligaSelecionada);
        carregarTimes();
    }

    function filtrarPorSide() {
        const sideSelecionado = document.getElementById('side').value;
        dfSide = df.filter(row => row.side === sideSelecionado);
        carregarTimes();
    }

    function comparar() {
        const time1 = document.getElementById('time1').value;
        const time2 = document.getElementById('time2').value;
        const jogosRecentes = parseInt(document.getElementById('jogosRecentes').value);

        if (!time1 || !time2) {
            document.getElementById('resultado').innerHTML = 'Por favor, selecione os dois times.';
            return;
        }

        let dados = dfSide.length > 0 ? dfSide : df;

        let dadosTime1 = dados.filter(row => row.teamname === time1);
        let dadosTime2 = dados.filter(row => row.teamname === time2);

        if (jogosRecentes) {
            dadosTime1 = dadosTime1.slice(-jogosRecentes);
            dadosTime2 = dadosTime2.slice(-jogosRecentes);
        }

        const vitorias1 = dadosTime1.filter(row => row.result === "Win").length;
        const total1 = dadosTime1.length;
        const mediaKills1 = dadosTime1.reduce((soma, row) => soma + parseFloat(row.kills || 0), 0) / total1 || 0;

        const vitorias2 = dadosTime2.filter(row => row.result === "Win").length;
        const total2 = dadosTime2.length;
        const mediaKills2 = dadosTime2.reduce((soma, row) => soma + parseFloat(row.kills || 0), 0) / total2 || 0;

        const resultadoHTML = `
            <h3>Resultados:</h3>
            <p><strong>${time1}</strong> - Vitórias: ${vitorias1}, Jogos: ${total1}, Média de Kills: ${mediaKills1.toFixed(2)}</p>
            <p><strong>${time2}</strong> - Vitórias: ${vitorias2}, Jogos: ${total2}, Média de Kills: ${mediaKills2.toFixed(2)}</p>
        `;

        document.getElementById('resultado').innerHTML = resultadoHTML;
    }

