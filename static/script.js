let dados = [];
let times = [];
let lados = [];

function inicializar() {
    Papa.parse('static/BaseDeDados.csv', {
        download: true,
        header: true,
        complete: function(results) {
            // Filtra só jogos do ano 2025
            dados = results.data.filter(row => row.date && row.date.startsWith('2025'));

            // Extrai times únicos que jogaram em 2025
            times = [...new Set(dados.map(row => row.teamname))].sort();

            // Extrai lados únicos da coluna 'side' + adiciona "Todos" no começo
            lados = [...new Set(dados.map(row => row.side))].filter(s => s).sort();
            lados.unshift("Todos");

            // Popula filtro lado
            const selectSide = document.getElementById('side');
            selectSide.innerHTML = '';
            lados.forEach(lado => {
                const option = document.createElement('option');
                option.value = lado;
                option.textContent = lado;
                selectSide.appendChild(option);
            });

            // Popula filtro campeonato (liga)
            const selectLiga = document.getElementById('liga');
            // Extrai ligas únicas em 2025
            const ligas = [...new Set(dados.map(row => row.league))].filter(l => l).sort();
            selectLiga.innerHTML = '<option value="Todos">Todos</option>';
            ligas.forEach(liga => {
                const option = document.createElement('option');
                option.value = liga;
                option.textContent = liga;
                selectLiga.appendChild(option);
            });
        }
    });
}

// Função para mostrar sugestões abaixo do input
function mostrarSugestoes(input, containerId) {
    const container = document.getElementById(containerId);
    const valor = input.value.toLowerCase();

    if (!valor) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }

    const sugeridos = times.filter(t => t.toLowerCase().includes(valor)).slice(0, 10);

    if (sugeridos.length === 0) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }

    container.innerHTML = '';
    sugeridos.forEach(time => {
        const div = document.createElement('div');
        div.textContent = time;
        div.onclick = () => {
            input.value = time;
            container.style.display = 'none';
            container.innerHTML = '';
        };
        container.appendChild(div);
    });
    container.style.display = 'block';
}

// Limpa os inputs de time e sugestões ao mudar lado ou liga
function limparTimes() {
    document.getElementById('time1').value = '';
    document.getElementById('time2').value = '';
    document.getElementById('sugestoesTime1').style.display = 'none';
    document.getElementById('sugestoesTime2').style.display = 'none';
}

function comparar() {
    const time1 = document.getElementById('time1').value.trim();
    const time2 = document.getElementById('time2').value.trim();
    const lado = document.getElementById('side').value;
    const liga = document.getElementById('liga').value;

    if (!time1 || !time2) {
        alert('Por favor, selecione ou digite os dois times.');
        return;
    }

    // Filtra os dados para time1
    let dadosTime1 = dados.filter(row => row.teamname === time1);
    // Filtra lado se não for "Todos"
    if (lado !== "Todos") dadosTime1 = dadosTime1.filter(row => row.side === lado);
    // Filtra liga se não for "Todos"
    if (liga !== "Todos") dadosTime1 = dadosTime1.filter(row => row.league === liga);

    // Filtra os dados para time2
    let dadosTime2 = dados.filter(row => row.teamname === time2);
    if (lado !== "Todos") dadosTime2 = dadosTime2.filter(row => row.side === lado);
    if (liga !== "Todos") dadosTime2 = dadosTime2.filter(row => row.league === liga);

    if (dadosTime1.length === 0 && dadosTime2.length === 0) {
        document.getElementById('resultado').innerHTML = '<p>Nenhum dado encontrado para os times selecionados e filtros aplicados.</p>';
        return;
    }

    const mediasTime1 = calcularMedias(dadosTime1);
    const mediasTime2 = calcularMedias(dadosTime2);

    mostrarResultado(time1, mediasTime1, time2, mediasTime2);
}

function calcularMedias(dados) {
    const jogos = dados.length;
    const vitorias = dados.reduce((sum, row) => sum + (parseInt(row.result) || 0), 0);
    const vitoriasPercent = jogos ? (vitorias / jogos) * 100 : 0;
    const torresPercent = jogos ? dados.reduce((sum, row) => sum + (parseInt(row.firsttower) || 0), 0) / jogos * 100 : 0;
    const dragoesPercent = jogos ? dados.reduce((sum, row) => sum + (parseInt(row.firstdragon) || 0), 0) / jogos * 100 : 0;
    const firstBloodPercent = jogos ? dados.reduce((sum, row) => sum + (parseInt(row.firstblood) || 0), 0) / jogos * 100 : 0;

    return {
        'Jogos': jogos,
        'Vitórias': vitorias,
        'Vitórias (%)': vitoriasPercent.toFixed(2),
        'Torres (%)': torresPercent.toFixed(2),
        'Dragões (%)': dragoesPercent.toFixed(2),
        'Primeiro Sangue (%)': firstBloodPercent.toFixed(2)
    };
}

function mostrarResultado(time1, medias1, time2, medias2) {
    const tabela = `
        <table>
            <thead>
                <tr>
                    <th>Estatística</th>
                    <th>${time1}</th>
                    <th>${time2}</th>
                </tr>
            </thead>
            <tbody>
                ${Object.keys(medias1).map(chave => `
                    <tr>
                        <td>${chave}</td>
                        <td>${medias1[chave]}</td>
                        <td>${medias2[chave]}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('resultado').innerHTML = tabela;
}

// Inicializa ao carregar a página
window.onload = inicializar;
