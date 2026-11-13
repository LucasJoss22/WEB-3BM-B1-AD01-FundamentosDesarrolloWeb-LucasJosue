// Al presionar el boton muestra el texto del horario

const boton = document.getElementById("btnVer");
const mensaje = document.getElementById("mensaje");

boton.addEventListener("click", function() {
    mensaje.innerHTML = "Atendemos de Lunes a Sabado de 8:00 AM a 6:00 PM.";
});
