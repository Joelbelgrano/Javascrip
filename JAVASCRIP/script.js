// Tasas de interés según el tipo de préstamo y la tasa fija o variable
const tasasDeInteres = {
    personal: { fija: 12, variable: 15 },
    hipotecario: { fija: 8, variable: 10 },
    automotriz: { fija: 9, variable: 12 },
    estudiantil: { fija: 5, variable: 7 }
};

// historial de simulaciones
let historialSimulaciones = [{}];  // array para un cálculo.

// Configuración del gráfico
const ctx = document.getElementById('grafico').getContext('2d');
const grafico = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Balance Restante',
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Mes'
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Balance Restante'
                }
            }
        }
    }
});

// Función para actualizar el gráfico
function actualizarGrafico(labels, data) {
    grafico.data.labels = labels;
    grafico.data.datasets[0].data = data;
    grafico.update();
}

// Función para validar la entrada del usuario
function validarEntrada(element) {
    const value = parseFloat(element.value);
    if (isNaN(value) || value <= 0) {
        element.classList.add('invalid');
        element.style.borderColor = 'red';
    } else {
        element.classList.remove('invalid');
        element.style.borderColor = '';
    }
}

// Función para calcular la cuota mensual
function calcularCuotaMensual(capital, tasaInteresAnual, meses) {
    const tasaInteresMensual = tasaInteresAnual / 12 / 100;
    return (capital * tasaInteresMensual) / (1 - Math.pow(1 + tasaInteresMensual, -meses));
}

// Función para calcular el balance restante después de cada pago
function calcularBalance(capital, tasaInteresAnual, meses, cuotaMensual) {
    const tasaInteresMensual = tasaInteresAnual / 12 / 100;
    const balances = [];
    const labels = [];

    let balance = capital;
    for (let i = 0; i < meses; i++) {
        const interes = balance * tasaInteresMensual;
        const principal = cuotaMensual - interes;
        balance -= principal;
        balances.push(balance.toFixed(2));
        labels.push(`Mes ${i + 1}`);
    }

    return { balances, labels };
}

// Función para mostrar los porcentajes de cada tipo de crédito y variante
function mostrarPorcentajes(tipoPrestamo, tipoTasa) {
    const totalCreditos = Object.keys(tasasDeInteres).length * 2;
    const porcentajePrestamo = (1 / totalCreditos) * 100;
    const porcentajeTasa = porcentajePrestamo / 2;

    document.getElementById("porcentajes").innerHTML = `
        <h3>Porcentajes del Crédito Seleccionado</h3>
        <p>Tipo de Préstamo (${tipoPrestamo}): ${porcentajePrestamo.toFixed(2)}%</p>
        <p>Tipo de Tasa (${tipoTasa}): ${porcentajeTasa.toFixed(2)}%</p>
    `;
}

// Función para agregar o reemplazar la simulación en el historial
function agregarHistorial(tipoPrestamo, capital, meses, tipoTasa, cuotaMensual, balances) {
    historialSimulaciones[0] = { 
        tipoPrestamo,
        capital,
        meses,
        tipoTasa,
        cuotaMensual,
        balances
    };
}

// Función para mostrar el historial de simulaciones en la página
function mostrarHistorial() {
    const historialDiv = document.getElementById("historial");
    let historialTexto = "<h3>Historial de Simulaciones:</h3>";

    if (Object.keys(historialSimulaciones[0]).length === 0) {
        historialTexto += "<p>No hay simulaciones en el historial.</p>";
    } else {
        const simulacion = historialSimulaciones[0]; 
        const balancesTexto = simulacion.balances.map((balance, index) => `Mes ${index + 1}: $${balance}`).join('<br>');
        historialTexto += `
            <h4>Tipo de Préstamo: ${simulacion.tipoPrestamo}</h4>
            Capital Inicial: $${simulacion.capital}<br>
            Número de Meses: ${simulacion.meses}<br>
            Tipo de Tasa: ${simulacion.tipoTasa}<br>
            Cuota Mensual: $${simulacion.cuotaMensual}<br>
            Balance Restante:<br>${balancesTexto}<br><br>
        `;
    }

    historialDiv.innerHTML = historialTexto;
}

// Función para calcular y mostrar operaciones básicas
function mostrarOperaciones() {
    const a = parseFloat(prompt("Ingrese el primer número:"));
    const b = parseFloat(prompt("Ingrese el segundo número:"));
    
    if (isNaN(a) || isNaN(b)) {
        alert("Por favor, ingrese números válidos.");
        return;
    }

    const suma = a + b;
    const resta = a - b;
    const concatenacion = a.toString() + b.toString();
    const division = b !== 0 ? a / b : "No se puede dividir entre cero";
    const porcentaje = (a * b) / 100;

    alert(`Resultados:\nSuma: ${suma}\nResta: ${resta}\nConcatenación: ${concatenacion}\nDivisión: ${division}\nPorcentaje: ${porcentaje}`);
}

// Función principal del simulador
function simuladorDeCredito() {
    const tipoPrestamo = document.getElementById("tipoPrestamo").value;
    const capital = parseFloat(document.getElementById("capital").value);
    const meses = parseInt(document.getElementById("meses").value);
    const tipoTasa = document.getElementById("tipoTasa").value;

    if (isNaN(capital) || isNaN(meses) || capital <= 0 || meses <= 0) {
        document.getElementById("resultado").innerText = "Por favor, ingrese valores válidos.";
        document.getElementById("advertencia").innerText = "";
        document.getElementById("balance").innerText = "";
        document.getElementById("amortizacion").innerText = "";
        document.getElementById("porcentajes").innerText = "";
        return;
    }

    const tasaInteresAnual = tasasDeInteres[tipoPrestamo][tipoTasa];
    const cuotaMensual = calcularCuotaMensual(capital, tasaInteresAnual, meses);

    document.getElementById("resultado").innerText = `La cuota mensual es: $${cuotaMensual}`;

    document.getElementById("advertencia").innerText = tasaInteresAnual > 8 ? "Advertencia: La tasa de interés es muy alta." : "";

    const { balances, labels } = calcularBalance(capital, tasaInteresAnual, meses, cuotaMensual);
    document.getElementById("balance").innerHTML = balances.map((balance, index) => `Mes ${index + 1}: $${balance}`).join('<br>');

    document.getElementById("amortizacion").innerHTML = `<h3>Resumen del Plan de Pagos:</h3>${balances.map((balance, index) => `Mes ${index + 1}: $${balance}`).join('<br>')}`;

    mostrarPorcentajes(tipoPrestamo, tipoTasa);

    agregarHistorial(tipoPrestamo, capital, meses, tipoTasa, cuotaMensual, balances);
    mostrarHistorial();
    actualizarGrafico(labels, balances);
}

// Función para simular el crédito utilizando prompt
function simularConPrompt() {
    const tipoPrestamo = prompt("Ingrese el tipo de préstamo (personal, hipotecario, automotriz, estudiantil):");
    const capital = parseFloat(prompt("Ingrese el capital inicial:"));
    const meses = parseInt(prompt("Ingrese el número de meses:"));
    const tipoTasa = prompt("Ingrese el tipo de tasa de interés (fija, variable):");

    if (isNaN(capital) || isNaN(meses) || capital <= 0 || meses <= 0 || !tasasDeInteres[tipoPrestamo] || !tasasDeInteres[tipoPrestamo][tipoTasa]) {
        alert("Por favor, ingrese valores válidos.");
        return;
    }

    const tasaInteresAnual = tasasDeInteres[tipoPrestamo][tipoTasa];
    const cuotaMensual = calcularCuotaMensual(capital, tasaInteresAnual, meses);

    alert(`La cuota mensual es: $${cuotaMensual}`);

    if (tasaInteresAnual > 8) {
        alert("Advertencia: La tasa de interés es muy alta.");
    }

    const { balances, labels } = calcularBalance(capital, tasaInteresAnual, meses, cuotaMensual);
    const balanceTexto = balances.map((balance, index) => `Mes ${index + 1}: $${balance}`).join('\n');
    alert(`Balances Restantes:\n${balanceTexto}`);

    const amortizacion = balances.map((balance, index) => `Mes ${index + 1}: $${balance}`).join('\n');
    alert(`Resumen del Plan de Pagos:\n${amortizacion}`);

    mostrarPorcentajes(tipoPrestamo, tipoTasa);
    agregarHistorial(tipoPrestamo, capital, meses, tipoTasa, cuotaMensual, balances);
    mostrarHistorial();
    actualizarGrafico(labels, balances);
}
