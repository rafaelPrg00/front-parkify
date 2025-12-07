"use strict";

const API_BASE = "http://localhost:3000";

const invertido = { "Parking Principal": 1, "Parking Sur": 2, "Parking Norte": 3 };
const parkings = { 0: "Parking Principal", 1: "Parking Sur", 2: "Parking Norte" };
const zonasNombres = { 1: "Parking Principal", 2: "Parking Sur", 3: "Parking Norte", 4: "Parking Principal", 5: "Parking Sur", 6: "Parking Norte" };

const contenedor = document.getElementById('contenedor-botones');
const modal = document.getElementById('mi-modal');
const alertas = document.getElementById('alertas');
const caja = document.getElementById("caja");
const punto = document.getElementById("punto");

const inputMatricula = document.getElementById("matricula-input");
const fechaInput = document.getElementById("fecha-input");
const horaEntradaInput = document.getElementById("hora-inicio-input");
const horaSalidaInput = document.getElementById("hora-fin-input");

const textoFecha = document.getElementById('textoFecha');
const textoEntrada = document.getElementById('textoEntrada');
const textoSalida = document.getElementById('textoSalida');
const textoZona = document.getElementById("textoZona");
const porcentajeInput = document.getElementById("porcentaje-parking");

const boton_confirmar = document.getElementById("btn-confirmar");

window.addEventListener('load', function () {
    getCoche();
    consultarReservas();
    const hoy = new Date();
    fechaInput.value = hoy.toLocaleDateString('en-CA');
    
    hoy.setHours(hoy.getHours() + 1);
    const horas = String(hoy.getHours()).padStart(2, '0');
    const minutos = String(hoy.getMinutes()).padStart(2, '0');
    horaEntradaInput.value = `${horas}:${minutos}`;
    
    hoy.setHours(hoy.getHours() + 2);
    const horasS = String(hoy.getHours()).padStart(2, '0');
    const minutosS = String(hoy.getMinutes()).padStart(2, '0');
    horaSalidaInput.value = `${horasS}:${minutosS}`;

    if(typeof textoPrecio !== 'undefined') textoPrecio.textContent = precio();
    
    textoEntrada.textContent = horaEntradaInput.value;
    textoSalida.textContent = horaSalidaInput.value;
    textoFecha.textContent = fechaInput.value;
    validacion();
});

function salir() {
    window.localStorage.removeItem("UserId");
    window.location.href = "index.html";
}

async function consultaDisponibilidad(event) {
    let i = 0;
    const listaDisponibilidad = [
        { nombre: "Parking Principal", val: 0, color: "#2ecc71" },
        { nombre: "Parking Sur", val: 0, color: "#f1c40f" },
        { nombre: "Parking Norte", val: 0, color: "#3498db" }
    ];
    contenedor.innerHTML = '';

    const params = new URLSearchParams(window.location.search);
    const id_parking = params.get("id");
    const fecha = fechaInput.value;
    const hora_inicio = horaEntradaInput.value;
    const hora_fin = horaSalidaInput.value;
    event.preventDefault();

    try {
        const response = await fetch(`${API_BASE}/api/zonas-disponibles?parking_id=${id_parking}&fecha=${fecha}&inicio=${hora_inicio}&fin=${hora_fin}`, {
            method: "GET"
        });
        let data = {};
        try {
            data = await response.json();
        } catch (_) { }

        if (!response.ok) {
            alert(data.error || "Error al obtener disponibilidad");
            return;
        }

        let plazasParkingTotal = 65;
        let plazasDisponiblesTotal = 0;

        for (let zona of data.zonas) {
            listaDisponibilidad[i].val = zona.libres;
            i += 1;
            plazasDisponiblesTotal += Number(zona.libres);
        }

        let porcentajeDisponibilidad = plazasDisponiblesTotal * 100 / plazasParkingTotal;
        if(porcentajeInput) porcentajeInput.textContent = `${porcentajeDisponibilidad.toFixed(1)}% disponible`;

        const cajaElem = document.getElementById("caja"); 
        const puntoElem = document.getElementById("punto");

        if(cajaElem && puntoElem) {
            cajaElem.classList.remove(
                "bg-green-50", "border-green-200",
                "bg-yellow-50", "border-yellow-200",
                "bg-red-50", "border-red-200");
            puntoElem.classList.remove("bg-green-500", "bg-yellow-500", "bg-red-500");

            if (porcentajeDisponibilidad <= 30) {
                cajaElem.classList.add("bg-red-50", "border-red-200");
                puntoElem.classList.add("bg-red-500");
            } else if (porcentajeDisponibilidad <= 60) {
                cajaElem.classList.add("bg-yellow-50", "border-yellow-200");
                puntoElem.classList.add("bg-yellow-500");
            } else {
                cajaElem.classList.add("bg-green-50", "border-green-200");
                puntoElem.classList.add("bg-green-500");
            }
        }

        let htmlGenerado = '';

        listaDisponibilidad.forEach((item, i) => {
            htmlGenerado += `
                    <button class="btn-parking" id="btn-${i}" onclick="seleccionar(${i}); validacion()">
                        <span class="grupo-izq">
                            <span style="background:${item.color}; width:8px; height:8px; border-radius:50%;"></span>
                            ${item.nombre}
                        </span>
                        <span>${item.val} plazas</span>
                    </button>
                `;
        });

        contenedor.innerHTML = htmlGenerado;

        listaDisponibilidad.forEach((item, i) => {
            if (Number(item.val) === 0) {
                document.getElementById(`btn-${i}`).disabled = true;
            }
        });

    } catch (err) {
        console.error("Error conectando con el backend:", err);
        alert("No se pudo conectar con el servidor. ¿Está el backend arrancado?");
    }
}

async function putCoche() {
    const matricula_input = inputMatricula.value;
    const modelo_input = document.getElementById("modelo-input").value;
    const user = window.localStorage.getItem("UserId");

    if (!inputMatricula.checkValidity()) {
        inputMatricula.reportValidity();
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/usuarios/${user}/coche`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                matricula: matricula_input,
                modelo: modelo_input
            })
        });
        let data = {};
        try {
            data = await response.json();
        } catch (_) { }

        if (!response.ok) {
            alert(data.error || "Error al cambiar el coche");
            return;
        }
        document.getElementById("matricula-input").textContent = matricula_input;
        document.getElementById("modelo-input").textContent = modelo_input;

    } catch (err) {
        console.error("Error conectando con el backend:", err);
        alert("No se pudo conectar con el servidor. ¿Está el backend arrancado?");
    }
}

async function getCoche() {
    const user = window.localStorage.getItem("UserId");

    try {
        const response = await fetch(`${API_BASE}/api/usuarios/${user}/consultar`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        let data = {};
        try {
            data = await response.json();
        } catch (_) { }

        if (!response.ok) {
            alert(data.error || "Error al cargar el coche");
            return;
        }
        for (let coche of data.coche) {
            document.getElementById("matricula-text").textContent = coche.matricula;
            document.getElementById("modelo-text").textContent = coche.modelo;
            inputMatricula.value = coche.matricula;
            document.getElementById("modelo-input").value = coche.modelo;
        }

    } catch (err) {
        console.error("Error conectando con el backend:", err);
        alert("No se pudo conectar con el servidor. ¿Está el backend arrancado?");
    }
}

function seleccionar(indice) {
    textoZona.textContent = parkings[indice];

    document.querySelectorAll('.btn-parking').forEach(btn => {
        btn.classList.remove('activo');
    });

    const botonElegido = document.getElementById(`btn-${indice}`);
    if (botonElegido) {
        botonElegido.classList.add('activo');
    }
}

function openVehicleModal() {
    modal.classList.add('mostrar');
}

function cerrar() {
    if (!inputMatricula.checkValidity()) {
        inputMatricula.reportValidity();
        return;
    }
    modal.classList.remove('mostrar');
    location.reload();
}

function precio() {
    const hora_inicio = horaEntradaInput.value;
    const hora_fin = horaSalidaInput.value;

    const [h1, m1] = hora_inicio.split(":").map(Number);
    const [h2, m2] = hora_fin.split(":").map(Number);

    const inicioMin = h1 * 60 + m1;
    const finMin = h2 * 60 + m2;

    const diferenciaMin = finMin - inicioMin;

    const precioBruto = (diferenciaMin * 2.5) / 60;
    const precioRedondeado = Math.round(precioBruto * 100) / 100;

    if (Number.isNaN(precioRedondeado) || precioRedondeado < 0) {
        boton_confirmar.disabled = true;
        return 0;
    }
    return precioRedondeado;
}

fechaInput.addEventListener('input', function () {
    textoFecha.textContent = fechaInput.value;
});

horaEntradaInput.addEventListener('input', function () {
    textoEntrada.textContent = horaEntradaInput.value;
});

horaSalidaInput.addEventListener('input', function () {
    textoSalida.textContent = horaSalidaInput.value;
    if(typeof textoPrecio !== 'undefined') textoPrecio.textContent = precio();
});

document.addEventListener('input', function (e) {
    if (e.target.tagName === 'INPUT') {
        validacion();
    }
});

function validacion() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaUsuario = new Date(fechaInput.value + "T00:00:00");

    boton_confirmar.disabled = true;

    if (fechaInput.value.trim() === "") {
        alertas.innerText = 'Debes introducir una fecha';
        alertas.classList.remove('hidden');
        return;
    }
    if (fechaUsuario < hoy) {
        alertas.innerText = 'La fecha no puede ser anterior a hoy';
        alertas.classList.remove('hidden');
        return;
    }
    if (horaEntradaInput.value.trim() === "") {
        alertas.innerText = 'Debes introducir una hora de entrada';
        alertas.classList.remove('hidden');
        return;
    }
    const fechaHoraUsuario = new Date(fechaInput.value + 'T' + horaEntradaInput.value);
    const dia = new Date();

    if (fechaHoraUsuario < dia) {
        alertas.innerHTML = 'Seleccione una hora valida';
        alertas.classList.remove('hidden');
        return;
    }
    if (horaSalidaInput.value.trim() === "") {
        alertas.innerText = 'Debes introducir una hora de salida';
        alertas.classList.remove('hidden');
        return;
    }

    if (textoZona.textContent === "") {
        alertas.innerText = 'Debes seleccionar una zona';
        alertas.classList.remove('hidden');
        return;
    }

    if (inputMatricula.value === 'ABC-1234') {
        alertas.innerText = 'Debes introducir la matrícula de tu coche';
        alertas.classList.remove('hidden');
        boton_confirmar.disabled = true;
        return;
    }

    const valorPrecio = precio();
    if (valorPrecio <= 0) {
        alertas.innerText = 'La hora de salida tiene que ser posterior a la de entrada';
        alertas.classList.remove('hidden');
        return;
    }
    if (valorPrecio < 1.25) {
        alertas.innerText = 'El mínimo de tiempo de reserva es 30 min';
        alertas.classList.remove('hidden');
        boton_confirmar.disabled = true;
        return;
    }
    if (valorPrecio > 0) {
        boton_confirmar.disabled = false;
        alertas.classList.add('hidden');
        return;
    }
}

async function mandarReserva() {
    const user = window.localStorage.getItem("UserId");
    
    const zonaActualTexto = textoZona.textContent; 
    
    const params = new URLSearchParams(window.location.search);
    const id_parking = params.get("id");
    
    let zona = invertido[zonaActualTexto]; 

    if (Number(id_parking) === 2) {
        zona += 3;
    }

    const costeFinal = precio();
    const coche = inputMatricula.value;

    try {
        const response = await fetch(`${API_BASE}/api/reserva`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                usuario_id: user,
                zona_id: zona,
                fecha: fechaInput.value,
                hora_inicio: horaEntradaInput.value,
                hora_fin: horaSalidaInput.value,
                coste: costeFinal,
                matricula: coche
            })
        });
        let data = {};
        try { data = await response.json(); } catch (_) { }

        if (!response.ok) {
            alert(data.error || "Error al crear la reserva");
            return;
        }
        location.reload();

    } catch (err) {
        console.error("Error conectando con el backend:", err);
        alert("No se pudo conectar con el servidor. ¿Está el backend arrancado?");
    }
}

async function consultarReservas() {
    const user = window.localStorage.getItem("UserId");
    try {
        const response = await fetch(`${API_BASE}/api/usuarios/${user}/reservas`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        let data = {};
        try { data = await response.json(); } catch (_) { }

        if (!response.ok) {
            alert(data.error || "Error");
            return;
        }
        renderizarReservas(data.reserva);

    } catch (err) {
        console.error("Error conectando con el backend:", err);
        alert("No se pudo conectar con el servidor. ¿Está el backend arrancado?");
    }
}

function renderizarReservas(lista) {
    const contenedorReservas = document.getElementById("contenedor-reservas");
    const contador = document.getElementById("contador-reservas");

    if (contador) contador.textContent = lista.length;

    if (lista.length === 0) {
        contenedorReservas.innerHTML = `
            <div class="text-center py-6">
                <p class="text-sm text-neutral-400">No tienes reservas activas</p>
            </div>`;
        return;
    }

    let html = '';

    lista.forEach((reserva) => {
        let parking = "";
        if (reserva.zona_id <= 3) {
            parking = "Parking ETSII";
        } else {
            parking = "Parking Psicología";
        }
        
        const nombreZona = zonasNombres[reserva.zona_id];

        html += `
        <div class="bg-neutral-50 border border-neutral-200 rounded-lg p-3 border-l-4 border-l-green-500 hover:shadow-sm transition">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h4 class="font-bold text-sm text-neutral-800">${parking}</h4>
                    <h5 class="font-bold text-sm text-neutral-800">${nombreZona}</h5>
                </div>
                <div class="text-right">
                    <span class="block font-bold text-neutral-800">${reserva.coste} €</span>
                    <span class="text-[10px] text-neutral-500 uppercase tracking-wide">${reserva.matricula}</span>
                </div>
            </div>
            <div class="flex items-center gap-2 text-xs text-neutral-600 border-t border-neutral-200 pt-2 mt-2">
                 <span>${reserva.fecha.split('T')[0]}</span>
                 <span class="text-neutral-300">|</span>
                 <span>${reserva.hora_inicio.slice(0, 5)} - ${reserva.hora_fin.slice(0, 5)}</span>
                 <button onclick="borrarReserva(${reserva.reserva_id})" class="ml-auto p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition duration-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                 </button>
            </div>
        </div>`;
    });
    contenedorReservas.innerHTML = html;
}

async function borrarReserva(reserva_id) {
    try {
        const response = await fetch(`${API_BASE}/api/reservas/${reserva_id}/borrar`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });
        let data = {};
        try { data = await response.json(); } catch (_) { }

        if (!response.ok) {
            alert(data.error || "Error");
            return;
        }
        location.reload();

    } catch (err) {
        console.error("Error conectando con el backend:", err);
        alert("No se pudo conectar con el servidor. ¿Está el backend arrancado?");
    }
}