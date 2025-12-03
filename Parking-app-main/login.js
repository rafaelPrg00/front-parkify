"use strict";

function login() {
    // Obtener email y contraseña
    const email = document.getElementById("email-input").value;
    const pass = document.getElementById("password-input").value;

    // Obtener dest de la URL
    const params = new URLSearchParams(window.location.search);
    const destino = params.get("dest") || "index.html"; // Se redirige a index si no hay dest

    // Usuario provisional
    if (email == "usuario" && pass == "usuario") {
        window.location.href = destino;  // Redirigir al parking correcto
        window.localStorage.setItem("logueado", "true");
    } else {
        alert("Usuario y contraseña provisional: usuario/usuario");
    }
}

function registrarse(){
    const params = new URLSearchParams(window.location.search);
    const destino = params.get("dest") || "index.html"; 
    const reg = "register.html?dest=" + destino;
    window.location.href = reg
    
}
