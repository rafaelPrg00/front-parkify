"use strict";

const API_BASE = "http://localhost:3000";

function main() {
    const form = document.getElementById("register");
    form.onsubmit = handleRegister;
}

async function handleRegister(event) {
    event.preventDefault(); 

    const params = new URLSearchParams(window.location.search);
    const destino = params.get("dest") || "index.html"; // Se redirige a index si no hay dest

    // Obtener inputs
    const name = document.getElementById("name-input").value.trim();
    const email = document.getElementById("email-input").value.trim();
    const phone = document.getElementById("phone-input").value.trim();
    const passwd = document.getElementById("password-input").value;
    const passwd2 = document.getElementById("confirm-password-input").value;
    

    // La contraseña debe tener al menos 6 caracteres
    if (passwd.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    // La contraseña y la confirmación deben coincidir
    if (passwd !== passwd2) {
        alert("Las contraseñas no coinciden.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                nombre: name,
                password: passwd
            })
        });
    let data = {};
        try {
            data = await response.json();
        } catch (_) {
        }

        if (!response.ok) {
            alert(data.error || "No se ha podido crear la cuenta.");
            return;
        }
    
    window.location.href = destino;
    } catch (err) {
        console.error("Error conectando con el backend:", err);
        alert("No se pudo conectar con el servidor. ¿Está el backend arrancado?");
    }
}

function login(){
    const params = new URLSearchParams(window.location.search);
    const destino = params.get("dest") || "index.html"; 
    const reg = "login.html?dest=" + destino;
    window.location.href = reg
}

document.addEventListener("DOMContentLoaded", main);
