"use strict";

function main() {
    const form = document.getElementById("register");
    form.onsubmit = handleRegister;
}

function handleRegister(event) {
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

    window.location.href = destino;
}

function login(){
    const params = new URLSearchParams(window.location.search);
    const destino = params.get("dest") || "index.html"; 
    const reg = "login.html?dest=" + destino;
    window.location.href = reg
}

document.addEventListener("DOMContentLoaded", main);
