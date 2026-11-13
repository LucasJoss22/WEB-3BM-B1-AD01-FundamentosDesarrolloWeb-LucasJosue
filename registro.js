// Registro de clientes con SweetAlert2 y validaciones completas

const formRegistro = document.getElementById("formRegistro");

formRegistro.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const nombre = document.getElementById("regNombre").value.trim();
    const usuario = document.getElementById("regUsuario").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value.trim();
    const correo = document.getElementById("regCorreo").value.trim();
    const telefono = document.getElementById("regTelefono").value.trim();
    const placa = document.getElementById("regPlaca").value.trim().toUpperCase();
    const marca = document.getElementById("regMarca").value.trim();
    const modelo = document.getElementById("regModelo").value.trim();
    const anio = parseInt(document.getElementById("regAnio").value);
    const kilometraje = parseInt(document.getElementById("regKm").value);

    // 1. Validar usuario reservado
    if (usuario === "admin") {
        Swal.fire({
            icon: "error",
            title: "Usuario Reservado",
            text: "El usuario 'admin' está reservado para la administración del taller."
        });
        return;
    }

    // 2. Validar formato de placa
    if (!validarFormatoPlaca(placa)) {
        Swal.fire({
            icon: "error",
            title: "Placa Inválida",
            text: "El formato de placa debe tener 3 letras y 3-4 números (Ej: ABC-1234)."
        });
        return;
    }

    // 3. Validar usuario existente
    const clientes = obtenerClientes();
    const usuarioExiste = clientes.some(c => c.usuario.toLowerCase() === usuario);
    if (usuarioExiste) {
        Swal.fire({
            icon: "warning",
            title: "Usuario No Disponible",
            text: "El nombre de usuario '" + usuario + "' ya existe. Por favor elige otro."
        });
        return;
    }

    // Crear nuevo cliente
    const nuevoId = clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1;
    const nuevoCliente = {
        id: nuevoId,
        nombre: nombre,
        usuario: usuario,
        password: password,
        correo: correo,
        telefono: telefono,
        placa: placa,
        marca: marca,
        modelo: modelo,
        anio: anio,
        kilometraje: kilometraje,
        estadoCuenta: "activa"
    };

    clientes.push(nuevoCliente);
    guardarClientes(clientes);

    Swal.fire({
        icon: "success",
        title: "¡Cuenta Creada con Éxito!",
        text: "Bienvenido a DriveFix, " + nombre + ". Ahora puedes iniciar sesión.",
        timer: 1800,
        showConfirmButton: false
    }).then(() => {
        window.location.href = "login.html";
    });
});
