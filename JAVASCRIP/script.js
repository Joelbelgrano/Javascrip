//tasas de interés según el tipo de préstamo y la tasa fija o variable
const tasasDeInteres = {
    personal: { fija: 12, variable: 15 },
    hipotecario: { fija: 8, variable: 10 },
    automotriz: { fija: 9, variable: 12 },
    estudiantil: { fija: 5, variable: 7 }
};

//gráfico
let ctx = document.getElementById('grafico').getContext('2d');
let grafico = new Chart(ctx, {
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
    let value = parseFloat(element.value);
    if (isNaN(value) || value <= 0) {
        element.style.borderColor = 'red';
        element.classList.add('invalid');
    } else {
        element.style.borderColor = '';
        element.classList.remove('invalid');
    }
}

// Función para calcular la cuota mensual
function calcularCuotaMensual(capital, tasaInteresAnual, meses) {
    let tasaInteresMensual = tasaInteresAnual / 12 / 100;
    let cuotaMensual = (capital * tasaInteresMensual) / (1 - Math.pow(1 + tasaInteresMensual, -meses));
    return cuotaMensual.toFixed(2); 
}

// Función para calcular el balance restante después de cada pago
function calcularBalance(capital, tasaInteresAnual, meses, cuotaMensual) {
    let balance = capital;
    let tasaInteresMensual = tasaInteresAnual / 12 / 100;
    let balances = [];
    let labels = [];

    for (let i = 0; i < meses; i++) {
        let interes = balance * tasaInteresMensual;
        let principal = cuotaMensual - interes;
        balance -= principal;
        balances.push(balance.toFixed(2));
        labels.push(`Mes ${i + 1}`);
    }

    return { balances, labels };
}

// Función para calcular y mostrar los porcentajes de cada tipo de crédito y variante
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

// Función principal del simulador
function simuladorDeCredito() {
    // Obtener los valores de los campos de entrada
    let tipoPrestamo = document.getElementById("tipoPrestamo").value;
    let capital = parseFloat(document.getElementById("capital").value);
    let meses = parseInt(document.getElementById("meses").value);
    let tipoTasa = document.getElementById("tipoTasa").value;

    // tasa de interés según el tipo de préstamo y el tipo de tasa
    let tasaInteresAnual = tasasDeInteres[tipoPrestamo][tipoTasa];

    // Validar los datos ingresados
    if (isNaN(capital) || isNaN(meses) || capital <= 0 || meses <= 0) {
        document.getElementById("resultado").innerText = "Por favor, ingrese valores válidos.";
        document.getElementById("advertencia").innerText = "";
        document.getElementById("balance").innerText = "";
        document.getElementById("amortizacion").innerText = "";
        document.getElementById("porcentajes").innerText = "";
        return;
    }

    // Calcular la cuota mensual
    let cuotaMensual = calcularCuotaMensual(capital, tasaInteresAnual, meses);

    // Mostrar la cuota mensual
    document.getElementById("resultado").innerText = `La cuota mensual es: $${cuotaMensual}`;

    //advertencia si la tasa de interés es muy alta
    if (tasaInteresAnual > 8) {
        document.getElementById("advertencia").innerText = "Advertencia: La tasa de interés es muy alta.";
    } else {
        document.getElementById("advertencia").innerText = "";
    }

    // Calcular y mostrar el balance restante después de cada pago
    let { balances, labels } = calcularBalance(capital, tasaInteresAnual, meses, parseFloat(cuotaMensual));
    document.getElementById("balance").innerHTML = balances.map((balance, index) => `Mes ${index + 1}: $${balance}`).join('<br>');

    // resumen detallado del plan de pagos (amortización)
    let amortizacion = balances.map((balance, index) => `Mes ${index + 1}: $${balance}`).join('<br>');
    document.getElementById("amortizacion").innerHTML = `<h3>Resumen del Plan de Pagos:</h3>${amortizacion}`;

    //porcentajes del crédito seleccionado
    mostrarPorcentajes(tipoPrestamo, tipoTasa);

    // Actualizar el gráfico
    actualizarGrafico(labels, balances);
}
