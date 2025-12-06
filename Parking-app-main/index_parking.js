"use strict";

const API_BASE = "http://localhost:3000";

const contenedor = document.getElementById('contenedor-botones');
const modal = document.getElementById('mi-modal');
const inputMatricula = document.getElementById("matricula-input");
const fechaInput = document.getElementById("fecha-input");
const textoFecha = document.getElementById('textoFecha');

const horaEntradaInput = document.getElementById("hora-inicio-input");
const horaSalidaInput = document.getElementById("hora-fin-input");
const textoEntrada = document.getElementById('textoEntrada');
const textoSalida = document.getElementById('textoSalida');

window.addEventListener('load', function() {
  getCoche();
  consultarReservas();
});

function salir() {
    window.localStorage.removeItem("UserId")
    window.location.href = "index.html"
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
    const fecha = document.getElementById("fecha-input").value;
    const hora_inicio = document.getElementById("hora-inicio-input").value;
    const hora_fin = document.getElementById("hora-fin-input").value;
    event.preventDefault();

    try {
        const response = await fetch(`${API_BASE}/api/zonas-disponibles?parking_id=${id_parking}&fecha=${fecha}&inicio=${hora_inicio}&fin=${hora_fin}`, {
            method: "GET"
        })
        let data = {};
        try {
            data = await response.json();
        } catch (_) {
        }

        if (!response.ok) {
            alert(data.error || "Error al obtener disponibilidad");
            return;
        }

        for (let zona of data.zonas) {
            listaDisponibilidad[i].val = zona.libres;
            i += 1;
        }

        let htmlGenerado = '';

        listaDisponibilidad.forEach((item, i) => {
            
            htmlGenerado += `
                    <button class="btn-parking" id="btn-${i}" onclick="seleccionar(${i})">
                        <span class="grupo-izq">
                            <span style="background:${item.color}; width:8px; height:8px; border-radius:50%;"></span>
                            ${item.nombre}
                        </span>
                        <span>${item.val} plazas</span>
                    </button>
                `;
            
            contenedor.innerHTML = htmlGenerado;
        });

    } catch (err) {
        console.error("Error conectando con el backend:", err);
        alert("No se pudo conectar con el servidor. ¿Está el backend arrancado?");
    }

}

async function putCoche() {

    const matricula_input = document.getElementById("matricula-input").value;
    const modelo_input = document.getElementById("modelo-input").value;
    const user = window.localStorage.getItem("UserId")

    if (!inputMatricula.checkValidity()) {
        
        inputMatricula.reportValidity();
        
        return; 
    }

    try {
        const response = await fetch(`${API_BASE}/api/usuarios/${user}/coche`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                matricula: matricula_input,
                modelo: modelo_input
            })
        });
        let data = {};
        try {
            data = await response.json();
        } catch (_) {
        }

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

    const user = window.localStorage.getItem("UserId")

    try {
        const response = await fetch(`${API_BASE}/api/usuarios/${user}/consultar`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        let data = {};
        try {
            data = await response.json();
        } catch (_) {
        }

        if (!response.ok) {
            alert(data.error || "Error al cargar el coche");
            return;
        }
        for(let coche of data.coche){
            document.getElementById("matricula-text").textContent = coche.matricula;
            document.getElementById("modelo-text").textContent = coche.modelo;
            document.getElementById("matricula-input").value = coche.matricula;
            document.getElementById("modelo-input").value = coche.modelo;
        }
       
    } catch (err) {
        console.error("Error conectando con el backend:", err);
        alert("No se pudo conectar con el servidor. ¿Está el backend arrancado?");
    }
}

function seleccionar(indice) {
            const parkings = {0:"Parking Principal", 1:"Paking Sur", 2:"Parking Norte"} 
            const textoZona = document.getElementById("textoZona");
            textoZona.textContent = parkings[indice];

            
            document.querySelectorAll('.btn-parking').forEach(btn => {
                btn.classList.remove('activo');
            });

            
            const botonElegido = document.getElementById(`btn-${indice}`);
            if (botonElegido) {
                botonElegido.classList.add('activo');
            }

            
        }

function openVehicleModal(){
    
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

function precio(){
    
    const hora_inicio = document.getElementById("hora-inicio-input").value;
    const hora_fin = document.getElementById("hora-fin-input").value;
    const boton_confirmar = document.getElementById("btn-confirmar")

    const [h1, m1] = hora_inicio.split(":").map(Number);  
    const [h2, m2] = hora_fin.split(":").map(Number);

    const inicioMin = h1 * 60 + m1; 
    const finMin    = h2 * 60 + m2;  

    const diferenciaMin = finMin - inicioMin; 

    const diferenciaHoras = diferenciaMin / 60;  

    const precio = diferenciaHoras * 2.5;

    if(precio < 0){
        boton_confirmar.disabled = true;
        console.log(boton_confirmar);
        return 0
    }
    boton_confirmar.disabled = false;
    return precio
}


fechaInput.addEventListener('input', function() {
    textoFecha.textContent = fechaInput.value;
});


horaEntradaInput.addEventListener('input', function() {
    textoEntrada.textContent = horaEntradaInput.value;
});

horaSalidaInput.addEventListener('input', function() {
    textoSalida.textContent = horaSalidaInput.value;
    textoPrecio.textContent = precio();
});

async function mandarReserva(){
    const user = window.localStorage.getItem("UserId");

    const zonaTexto = document.getElementById("textoZona").textContent;
    const invertido = {"Parking Principal": 1,"Parking Sur": 2,"Parking Norte": 3};
    const zona = invertido[zonaTexto];

    const fechaInput = document.getElementById("fecha-input").value;
    const horaEntradaInput = document.getElementById("hora-inicio-input").value;
    const horaSalidaInput = document.getElementById("hora-fin-input").value;
    const costeFinal = precio();
    const coche = document.getElementById("matricula-input").value;
    console.log(zonaTexto);
   console.log(user,zona,fechaInput,horaEntradaInput,horaSalidaInput,costeFinal,coche);
    try {
        const response = await fetch(`${API_BASE}/api/reserva`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usuario_id:user,
                zona_id:zona,
                fecha:fechaInput,
                hora_inicio:horaEntradaInput,
                hora_fin:horaSalidaInput,
                coste:costeFinal,
                matricula:coche
            })
        });
        let data = {};
            try {
                data = await response.json();
            } catch (_) {
            }

            if (!response.ok) {
                alert(data.error || "Error al crear la reserva");
                return;
            }

    } catch (err) {
        console.error("Error conectando con el backend:", err);
        alert("No se pudo conectar con el servidor. ¿Está el backend arrancado?");
    }
}

async function consultarReservas(){
    const user = window.localStorage.getItem("UserId");
    try {
        const response = await fetch(`${API_BASE}/api/usuarios/${user}/reservas`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        });
        let data = {};
            try {
                data = await response.json();
            } catch (_) {
            }

            if (!response.ok) {
                alert(data.error || "Error");
                return;
            }
        renderizarReservas(data.reserva);
        console.log(data);
    } catch (err) {
        console.error("Error conectando con el backend:", err);
        alert("No se pudo conectar con el servidor. ¿Está el backend arrancado?");
    }
}

// Función para pintar la lista
function renderizarReservas(lista) {
    const contenedor = document.getElementById("contenedor-reservas");
    const contador = document.getElementById("contador-reservas");
    
    // 1. Actualizar contador
    if(contador) contador.textContent = lista.length;

    // 2. Si no hay reservas
    if (lista.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center py-6">
                <p class="text-sm text-neutral-400">No tienes reservas activas</p>
            </div>`;
        return;
    }

    // 3. Generar HTML
    let html = '';
    
    lista.forEach(reserva => {
        // Determinamos color según si está activa o no (opcional)
       
        const zonas = {0:"Parking Principal", 1:"Paking Sur", 2:"Parking Norte"}
        let parking = "";
        if(reserva.zona_id <= 3){
            parking = "Parking ETSII"
        }
        else{
            parking = "Parking psicología"
        }

        html += `
        <div class="bg-neutral-50 border border-neutral-200 rounded-lg p-3 border-l-4 border-l-green-500 hover:shadow-sm transition">
            
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h4 class="font-bold text-sm text-neutral-800">${parking}</h4>
                    <h5 class="font-bold text-sm text-neutral-800">${zonas[reserva.zona_id]}</h5>
                    
                </div>
                <div class="text-right">
                    <span class="block font-bold text-neutral-800">${reserva.coste} €</span>
                    <span class="text-[10px] text-neutral-500 uppercase tracking-wide">${reserva.matricula}</span>
                </div>
            </div>

            <div class="flex items-center gap-2 text-xs text-neutral-600 border-t border-neutral-200 pt-2 mt-2">
                <svg class="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span>${reserva.fecha.split('T')[0]}</span>
                
                <span class="text-neutral-300">|</span>
                
                <svg class="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>${reserva.hora_inicio.slice(0,5)} - ${reserva.hora_fin.slice(0,5)}</span>
            </div>
        </div>
        `;
    });

    contenedor.innerHTML = html;
}

