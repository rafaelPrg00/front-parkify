"use strict";

const API_BASE = "http://localhost:3000";

const params = new URLSearchParams(window.location.search);
const id_parking = params.get("id");
const fecha = document.getElementById("fecha-input").value;
const hora_inicio = document.getElementById("hora-inicio-input").value;
const hora_fin = document.getElementById("hora-fin-input").value;

function salir(){
      window.localStorage.removeItem("UserId")
      window.location.href = "index.html"
    }

async function consultaDisponibilidad(event) {
    event.preventDefault();
    try{
        const response = await fetch (`${API_BASE}/api/zonas-disponibles?parking_id=${id_parking}&fecha=${fecha}&inicio=${hora_inicio}&fin=${hora_fin}`,{
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
    }catch (err) {
        console.error("Error conectando con el backend:", err);
        alert("No se pudo conectar con el servidor. ¿Está el backend arrancado?");
    }

}
