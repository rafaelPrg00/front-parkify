/*const imgPsico = document.querySelector('a[href = "index_psicologia.html"]');
const imgEtsii = document.querySelector('a[href = "index_etsii.html"]');

imgPsico.addEventListener('click',function(event){
    alert("Bienvenido al parking de Psicologia")
});

imgEtsii.addEventListener('click',function(event){
    alert("Bienvenido al parking de la ETSII")
});
*/


function acceso(dest){
    if(window.localStorage.getItem("logueado") === "true"){
        window.location.href = dest;
    }
    else{
        window.location.href = "login.html?dest="+ dest;
    }
}