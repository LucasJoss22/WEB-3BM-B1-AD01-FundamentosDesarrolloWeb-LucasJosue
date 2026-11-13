// Logica para guardar los mensajes de contacto en localStorage con SweetAlert2

const formContacto = document.getElementById("formContacto");

formContacto.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombreContacto").value.trim();
    const correo = document.getElementById("correoContacto").value.trim();
    const motivo = document.getElementById("motivo").value;
    const mensajeTexto = document.getElementById("mensajeTexto").value.trim();

    const fechaActual = new Date().toISOString().split("T")[0];

    const listaMensajes = obtenerMensajesContacto();
    const nuevoId = listaMensajes.length > 0 ? Math.max(...listaMensajes.map(m => m.id)) + 1 : 1;

    const nuevoMensaje = {
        id: nuevoId,
        nombre: nombre,
        correo: correo,
        motivo: motivo,
        mensaje: mensajeTexto,
        fecha: fechaActual
    };

    listaMensajes.push(nuevoMensaje);
    guardarMensajesContacto(listaMensajes);

    Swal.fire({
        icon: "success",
        title: "¡Mensaje Enviado!",
        text: "Gracias " + nombre + ", tu mensaje fue recibido y lo responderemos a la brevedad.",
        confirmButtonColor: "#0d6efd"
    });

    formContacto.reset();
});
