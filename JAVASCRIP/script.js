// Tasas de interés según el tipo de préstamo y la tasa fija o variable
const tasasDeInteres = {
    personal: { fija: 12, variable: 15 },
    hipotecario: { fija: 8, variable: 10 },
    automotriz: { fija: 9, variable: 12 },
    estudiantil: { fija: 5, variable: 7 }
};

// Cargar historial de simulaciones desde el localStorage
let historialSimulaciones = JSON.parse(localStorage.getItem('historialSimulaciones')) || [];

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
    const invalid = isNaN(value) || value <= 0;
    element.classList.toggle('invalid', invalid);
    element.style.borderColor = invalid ? 'red' : '';
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

// Función para agregar o reemplazar la simulación en el historial y guardarlo en localStorage
function agregarHistorial(tipoPrestamo, capital, meses, tipoTasa, cuotaMensual, balances) {
    const simulacion = { 
        tipoPrestamo,
        capital,
        meses,
        tipoTasa,
        cuotaMensual,
        balances
    };

    // nueva simulación para historial y limitar a un máximo de 5 simulaciones
    if (historialSimulaciones.length >= 5) {
        historialSimulaciones.shift(); 
    }
    historialSimulaciones.push(simulacion);

    // Guardar historial en localStorage
    localStorage.setItem('historialSimulaciones', JSON.stringify(historialSimulaciones));
}

// Función para mostrar el historial de simulaciones en la página
function mostrarHistorial() {
    const historialDiv = document.getElementById("historialContent");
    let historialTexto = "<h3>Historial de Simulaciones:</h3>";

    if (historialSimulaciones.length === 0) {
        historialTexto += "<p>No hay simulaciones en el historial.</p>";
    } else {
        historialSimulaciones.forEach((simulacion, index) => {
            const balancesTexto = simulacion.balances.map((balance, i) => `Mes ${i + 1}: $${balance}`).join('<br>');
            historialTexto += `
                <h4>Simulación ${index + 1}</h4>
                Tipo de Préstamo: ${simulacion.tipoPrestamo}<br>
                Capital Inicial: $${simulacion.capital}<br>
                Número de Meses: ${simulacion.meses}<br>
                Tipo de Tasa: ${simulacion.tipoTasa}<br>
                Cuota Mensual: $${simulacion.cuotaMensual}<br>
                Balance Restante:<br>${balancesTexto}<br><br>
            `;
        });
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

    // Validar la entrada del usuario
    if (isNaN(capital) || isNaN(meses) || capital <= 0 || meses <= 0) {
        actualizarElemento('resultado', 'Por favor, ingrese valores válidos.');
        actualizarElemento('advertencia', '');
        actualizarElemento('balance', '');
        actualizarElemento('amortizacion', '');
        actualizarElemento('porcentajes', '');
        return;
    }

    const tasaInteresAnual = tasasDeInteres[tipoPrestamo][tipoTasa];
    const cuotaMensual = calcularCuotaMensual(capital, tasaInteresAnual, meses);

    // Mostrar advertencia si la tasa de interés es alta
    if (tasaInteresAnual > 15) {     
        actualizarElemento('advertencia', 'Advertencia: La tasa de interés es muy alta.');
    } else {
        actualizarElemento('advertencia', '');
    }

    // Calcular balances y actualizar el DOM
    const { balances, labels } = calcularBalance(capital, tasaInteresAnual, meses, cuotaMensual);
    const balanceTexto = balances.map((balance, index) => `Mes ${index + 1}: $${balance}`).join('<br>');
    
    actualizarElemento('balance', `<h3>Balances Restantes:</h3><p>${balanceTexto}</p>`);
    actualizarElemento('amortizacion', `<h3>Resumen del Plan de Pagos:</h3><p>${balanceTexto}</p>`);
    mostrarPorcentajes(tipoPrestamo, tipoTasa);
    agregarHistorial(tipoPrestamo, capital, meses, tipoTasa, cuotaMensual, balances);
    mostrarHistorial();
    actualizarGrafico(labels, balances);
}

// Simulación mediante prompt
function simularConPrompt() {
    const tipoPrestamo = prompt("Ingrese el tipo de préstamo (personal, hipotecario, automotriz, estudiantil):");
    const capital = parseFloat(prompt("Ingrese el capital inicial:"));
    const meses = parseInt(prompt("Ingrese el número de meses:"));
    const tipoTasa = prompt("Ingrese el tipo de tasa (fija, variable):");

    // Validar la entrada del usuario
    if (isNaN(capital) || isNaN(meses) || capital <= 0 || meses <= 0) {
        alert('Por favor, ingrese valores válidos.');
        return;
    }

    const tasaInteresAnual = tasasDeInteres[tipoPrestamo][tipoTasa];
    const cuotaMensual = calcularCuotaMensual(capital, tasaInteresAnual, meses);

    // Mostrar advertencia si la tasa de interés es alta
    if (tasaInteresAnual > 15) {
        alert("Advertencia: La tasa de interés es muy alta.");
    }

    // Calcular balances y mostrar resultados
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

// Función para actualizar el contenido de un elemento por su id
function actualizarElemento(id, contenido) {
    document.getElementById(id).innerHTML = contenido;
}

// Función para alternar la visibilidad del historial
function toggleHistorial() {
    const historialContent = document.getElementById("historialContent");
    if (historialContent.classList.contains('show')) {
        historialContent.classList.remove('show');
    } else {
        historialContent.classList.add('show');
    }
}

// Función para alternar la visibilidad de datos externos
function toggleDatosExternos() {
    const datosExternosContent = document.getElementById("datosExternosContent");
    if (datosExternosContent.classList.contains('show')) {
        datosExternosContent.classList.remove('show');
    } else {
        datosExternosContent.classList.add('show');
    }
}

// Función para cargar datos externos mediante AJAX
function cargarDatosExternos() {
    fetch('https://www.alphavantage.co/query?function=FEDERAL_FUNDS_RATE&apikey=TU_CLAVE_API') // Cambiar la URL por una API real
        .then(response => response.json())
        .then(data => {
            const datosExternosDiv = document.getElementById("datosExternosContent");
            let datosTexto = "<h3>Datos Externos:</h3>";
            data.forEach(item => {
                datosTexto += `<p>Tipo: ${item.tipo} | Tasa: ${item.tasa}%</p>`;
            });
            datosExternosDiv.innerHTML = datosTexto;
        })
        .catch(error => console.error('Error al cargar datos externos:', error));
}

// Inicialización de eventos
document.getElementById('calcularBtn').addEventListener('click', simuladorDeCredito);
document.getElementById('simularPromptBtn').addEventListener('click', simularConPrompt);
document.getElementById('toggleHistorialBtn').addEventListener('click', toggleHistorial);
document.getElementById('toggleDatosBtn').addEventListener('click', () => {
    toggleDatosExternos();
    cargarDatosExternos();
});
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => validarEntrada(input));
});

// Mostrar historial al cargar la página
window.addEventListener('load', mostrarHistorial);

// Función para alternar el modo nocturno
function toggleModoNocturno() {
    document.body.classList.toggle('modo-nocturno');
    const esModoNocturno = document.body.classList.contains('modo-nocturno');
    document.getElementById('modoNocturnoBtn').textContent = esModoNocturno ? '🌞' : '🌙';
}

// Inicializar el botón de modo nocturno
document.getElementById('modoNocturnoBtn').addEventListener('click', toggleModoNocturno);
