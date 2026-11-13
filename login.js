// Logica de Login con SweetAlert2 para la practica

const formLogin = document.getElementById("formLogin");
const mensajeLogin = document.getElementById("mensajeLogin");

formLogin.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value.trim();

    // 1. Validar Administrador
    if (usuario === "admin" && password === "admin123") {
        Swal.fire({
            icon: "success",
            title: "¡Bienvenido Administrador!",
            text: "Ingresando al panel de gestión general...",
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            localStorage.setItem("usuarioActualDriveFix", JSON.stringify({
                rol: "admin",
                usuario: "admin",
                nombre: "Administrador del Taller"
            }));
            window.location.href = "admin.html";
        });
        return;
    }

    // 2. Validar Cliente (buscar en array de clientes)
    const clientes = obtenerClientes();
    const clienteEncontrado = clientes.find(c => c.usuario.toLowerCase() === usuario.toLowerCase() && c.password === password);

    if (clienteEncontrado) {
        // Validar si la cuenta estuviese deshabilitada (Caso de prueba 2 de la guia)
        if (clienteEncontrado.estadoCuenta === "deshabilitada") {
            Swal.fire({
                icon: "error",
                title: "Cuenta Deshabilitada",
                text: "Tu cuenta de cliente se encuentra inactiva. Comunícate con administración."
            });
            return;
        }

        Swal.fire({
            icon: "success",
            title: "¡Bienvenido " + clienteEncontrado.nombre + "!",
            text: "Cargando tus solicitudes y perfil...",
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            localStorage.setItem("usuarioActualDriveFix", JSON.stringify({
                rol: "cliente",
                usuario: clienteEncontrado.usuario,
                clienteId: clienteEncontrado.id,
                nombre: clienteEncontrado.nombre
            }));
            window.location.href = "cliente.html";
        });
    } else {
        // Acceso invalido (Caso de prueba 2)
        Swal.fire({
            icon: "error",
            title: "Acceso Inválido",
            text: "Usuario o contraseña incorrectos. Verifica tus credenciales."
        });
    }
});
