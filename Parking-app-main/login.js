"use strict";
const API_BASE = "http://localhost:3000";

async function login(event) {
    event.preventDefault(); 

    const params = new URLSearchParams(window.location.search);
    const destino = params.get("dest") || "index.html"; // Se redirige a index si no hay dest

    // Obtener inputs
    const email = document.getElementById("email-input").value.trim();
    const passwd = document.getElementById("password-input").value;
    
    try {
        const response = await fetch(`${API_BASE}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: passwd
            })
        });
        let data = {};
            try {
                data = await response.json();
            } catch (_) {
            }

            if (!response.ok) {
                alert(data.error || "Usuario o contraseña incorrectos");
                return;
            }

        localStorage.setItem("UserId", data.usuario_id);
        window.location.href = destino;

    } catch (err) {
        console.error("Error conectando con el backend:", err);
        alert("No se pudo conectar con el servidor. ¿Está el backend arrancado?");
    }
}



function registrarse(){
    const params = new URLSearchParams(window.location.search);
    const destino = params.get("dest") || "index.html"; 
    const reg = "register.html?dest=" + destino;
    window.location.href = reg
    
}
