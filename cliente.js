// Logica del Portal de Clientes con SweetAlert2 y Validaciones

// 1. Control de acceso: Impedir que personas no logueadas o admin entren aqui
const usuarioActual = obtenerUsuarioActual();
if (!usuarioActual || usuarioActual.rol !== "cliente") {
    Swal.fire({
        icon: "warning",
        title: "Acceso Denegado",
        text: "Debes iniciar sesión con una cuenta de Cliente para ver este panel."
    }).then(() => {
        window.location.href = "login.html";
    });
}

document.addEventListener("DOMContentLoaded", function() {
    cargarPerfilCliente();
    cargarHistorialCliente();

    // Fecha actual y hora por defecto
    const fechaInput = document.getElementById("solFecha");
    const hoy = new Date().toISOString().split("T")[0];
    fechaInput.min = hoy; // No permitir fechas pasadas
    fechaInput.value = hoy;
    document.getElementById("solHora").value = "09:00";
});

// Cargar datos del perfil del cliente actual y precargar su vehiculo en el formulario
function cargarPerfilCliente() {
    const clientes = obtenerClientes();
    const cliente = clientes.find(c => c.id === usuarioActual.clienteId);

    if (cliente) {
        document.getElementById("txtNombreCliente").innerText = cliente.nombre || "Sin nombre";
        document.getElementById("txtUsuarioCliente").innerText = cliente.usuario;
        document.getElementById("txtCorreoCliente").innerText = cliente.correo || "No registrado";
        document.getElementById("txtTelefonoCliente").innerText = cliente.telefono || "No registrado";

        document.getElementById("txtPlacaCliente").innerText = cliente.placa || "Sin placa";
        document.getElementById("txtMarcaModeloCliente").innerText = (cliente.marca || "Vehículo") + " " + (cliente.modelo || "");
        document.getElementById("txtAnioCliente").innerText = cliente.anio || "-";
        document.getElementById("txtKmCliente").innerText = cliente.kilometraje ? Number(cliente.kilometraje).toLocaleString() : "0";

        // Precargar en el formulario para agilizarle al cliente
        document.getElementById("solPlaca").value = cliente.placa || "";
        document.getElementById("solMarca").value = cliente.marca || "";
        document.getElementById("solModelo").value = cliente.modelo || "";
        document.getElementById("solAnio").value = cliente.anio || "";
        document.getElementById("solKilometraje").value = cliente.kilometraje || "";
        document.getElementById("solCorreo").value = cliente.correo || "";
        document.getElementById("solTelefono").value = cliente.telefono || "";
    }
}

// Eventos para Editar Perfil del Cliente
const btnEditarPerfil = document.getElementById("btnEditarPerfil");
const contenedorEditarPerfil = document.getElementById("contenedorEditarPerfil");
const btnCancelarEditarPerfil = document.getElementById("btnCancelarEditarPerfil");
const formEditarPerfil = document.getElementById("formEditarPerfil");

btnEditarPerfil.addEventListener("click", function() {
    const clientes = obtenerClientes();
    const cliente = clientes.find(c => c.id === usuarioActual.clienteId);

    if (cliente) {
        document.getElementById("editNombre").value = cliente.nombre || "";
        document.getElementById("editCorreo").value = cliente.correo || "";
        document.getElementById("editTelefono").value = cliente.telefono || "";
        document.getElementById("editPlaca").value = cliente.placa || "";
        document.getElementById("editMarca").value = cliente.marca || "";
        document.getElementById("editModelo").value = cliente.modelo || "";
        document.getElementById("editAnio").value = cliente.anio || "";
        document.getElementById("editKm").value = cliente.kilometraje || "";

        contenedorEditarPerfil.style.display = "block";
        contenedorEditarPerfil.scrollIntoView({ behavior: "smooth" });
    }
});

btnCancelarEditarPerfil.addEventListener("click", function() {
    contenedorEditarPerfil.style.display = "none";
});

formEditarPerfil.addEventListener("submit", function(e) {
    e.preventDefault();

    const nombre = document.getElementById("editNombre").value.trim();
    const correo = document.getElementById("editCorreo").value.trim();
    const telefono = document.getElementById("editTelefono").value.trim();
    const placa = document.getElementById("editPlaca").value.trim().toUpperCase();
    const marca = document.getElementById("editMarca").value.trim();
    const modelo = document.getElementById("editModelo").value.trim();
    const anio = parseInt(document.getElementById("editAnio").value);
    const km = parseInt(document.getElementById("editKm").value);

    // Validar placa
    if (!validarFormatoPlaca(placa)) {
        Swal.fire({
            icon: "error",
            title: "Placa Inválida",
            text: "El formato de placa debe tener 3 letras y 3-4 números (Ej: ABC-1234)."
        });
        return;
    }

    let clientes = obtenerClientes();
    const idx = clientes.findIndex(c => c.id === usuarioActual.clienteId);

    if (idx !== -1) {
        clientes[idx].nombre = nombre;
        clientes[idx].correo = correo;
        clientes[idx].telefono = telefono;
        clientes[idx].placa = placa;
        clientes[idx].marca = marca;
        clientes[idx].modelo = modelo;
        clientes[idx].anio = anio;
        clientes[idx].kilometraje = km;

        guardarClientes(clientes);

        // Actualizar datos de sesion
        usuarioActual.nombre = nombre;
        localStorage.setItem("usuarioActualDriveFix", JSON.stringify(usuarioActual));

        Swal.fire({
            icon: "success",
            title: "¡Perfil Actualizado!",
            text: "Tus datos personales y de tu vehículo fueron guardados correctamente.",
            timer: 1500,
            showConfirmButton: false
        });

        contenedorEditarPerfil.style.display = "none";
        cargarPerfilCliente();
    }
});

// Cargar tabla con las solicitudes exclusivas del cliente (Practica filter)
function cargarHistorialCliente() {
    const mantenimientos = obtenerMantenimientos();
    // Filtro estricto por clienteId
    const misMantenimientos = mantenimientos.filter(m => m.clienteId === usuarioActual.clienteId);
    const tbody = document.getElementById("tablaHistorialCliente");
    tbody.innerHTML = "";

    if (misMantenimientos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center;" class="text-muted py-3">No tienes solicitudes registradas aún. Registra una con el formulario arriba.</td></tr>`;
        return;
    }

    // Recorrer con forEach (Requerimiento de practicas JS de la guia)
    misMantenimientos.forEach(m => {
        // Colores segun estados oficiales: Pendiente, En revisión, En proceso, Finalizado, Cancelado
        let colorEstado = "#d39e00"; // Pendiente
        if (m.estado === "En revisión") colorEstado = "#6f42c1"; // Morado
        if (m.estado === "En proceso") colorEstado = "#0d6efd"; // Azul
        if (m.estado === "Finalizado") colorEstado = "#198754"; // Verde
        if (m.estado === "Cancelado") colorEstado = "#dc3545"; // Rojo

        const fila = `
            <tr>
                <td><strong>#${m.id}</strong></td>
                <td>${m.marca} ${m.modelo} <br><small class="text-muted">${m.placa}</small></td>
                <td>${m.servicio}</td>
                <td><span class="badge bg-secondary">${m.tipoAtencion || "Normal"}</span></td>
                <td>${m.fecha} <br><small class="text-muted">${m.hora || "09:00"}</small></td>
                <td>$${Number(m.costo).toFixed(2)}</td>
                <td><strong style="color: ${colorEstado};">${m.estado}</strong></td>
                <td>${m.observaciones || "Sin observaciones"}</td>
            </tr>
        `;
        tbody.innerHTML += fila;
    });
}

// Registro de la solicitud con validaciones tecnicas (Caso de prueba 3 y 4 de la rubrica)
const formSolicitud = document.getElementById("formSolicitudCliente");
formSolicitud.addEventListener("submit", function(e) {
    e.preventDefault();

    // Captura de campos
    const placa = document.getElementById("solPlaca").value.trim().toUpperCase();
    const marca = document.getElementById("solMarca").value.trim();
    const modelo = document.getElementById("solModelo").value.trim();
    const anio = parseInt(document.getElementById("solAnio").value);
    const kilometraje = parseInt(document.getElementById("solKilometraje").value);
    const correo = document.getElementById("solCorreo").value.trim();
    const telefono = document.getElementById("solTelefono").value.trim();
    const servicio = document.getElementById("solServicio").value;
    const fecha = document.getElementById("solFecha").value;
    const hora = document.getElementById("solHora").value;
    const observaciones = document.getElementById("solObservaciones").value.trim();

    // Radio button seleccionado
    const tipoAtencion = document.querySelector('input[name="tipoAtencion"]:checked').value;

    // Checkboxes seleccionados
    const adicionales = [];
    if (document.getElementById("checkLavado").checked) adicionales.push("Lavado de cortesía");
    if (document.getElementById("checkNiveles").checked) adicionales.push("Revisión de niveles");
    if (document.getElementById("checkPresion").checked) adicionales.push("Calibración de llantas");

    // VALIDACION 1: Formato de Placa (Caso de prueba 3)
    if (!validarFormatoPlaca(placa)) {
        Swal.fire({
            icon: "error",
            title: "Placa Inválida",
            text: "El formato de placa debe ser de 3 letras seguidas de 3 o 4 números (Ej: ABC-1234 o PBX-567)."
        });
        return;
    }

    // VALIDACION 2: Año y Kilometraje válidos (Caso de prueba 3)
    const anioActual = new Date().getFullYear() + 1;
    if (isNaN(anio) || anio < 1980 || anio > anioActual) {
        Swal.fire({
            icon: "error",
            title: "Año Inválido",
            text: "El año del vehículo debe estar comprendido entre 1980 y " + anioActual + "."
        });
        return;
    }

    if (isNaN(kilometraje) || kilometraje < 0 || kilometraje > 1000000) {
        Swal.fire({
            icon: "error",
            title: "Kilometraje Inválido",
            text: "Por favor ingresa un kilometraje coherente (mayor o igual a 0)."
        });
        return;
    }

    // VALIDACION 3: Horario del taller (08:00 a 18:00)
    if (hora < "08:00" || hora > "18:00") {
        Swal.fire({
            icon: "error",
            title: "Horario Fuera de Rango",
            text: "El taller atiende únicamente de 08:00 a 18:00 horas."
        });
        return;
    }

    // Costo base
    let costo = 35.00;
    if (servicio === "Mecánica General") costo = 50.00;
    if (servicio === "Cambio de Aceite y Filtros") costo = 40.00;
    if (servicio === "Revisión de Frenos") costo = 35.00;
    if (servicio === "Alineación y Balanceo") costo = 30.00;
    if (servicio === "Diagnóstico Electrónico") costo = 25.00;
    if (servicio === "Sistema Eléctrico y Batería") costo = 20.00;

    if (tipoAtencion === "Express") costo += 10.00; // Recargo por express

    // Crear objeto solicitud
    const mantenimientos = obtenerMantenimientos();
    const nuevoId = mantenimientos.length > 0 ? Math.max(...mantenimientos.map(m => m.id)) + 1 : 1;

    const nuevaSolicitud = {
        id: nuevoId,
        clienteId: usuarioActual.clienteId,
        clienteNombre: usuarioActual.nombre,
        correo: correo,
        telefono: telefono,
        placa: placa,
        marca: marca,
        modelo: modelo,
        anio: anio,
        kilometraje: kilometraje,
        servicio: servicio,
        tipoAtencion: tipoAtencion,
        serviciosAdicionales: adicionales,
        fecha: fecha,
        hora: hora,
        costo: costo,
        estado: "Pendiente", // Estado inicial segun rubrica
        observaciones: observaciones || "Solicitud de mantenimiento ingresada por el cliente."
    };

    // Guardar en array y localStorage
    mantenimientos.push(nuevaSolicitud);
    guardarMantenimientos(mantenimientos);

    // Actualizar datos del vehiculo en el cliente por si cambiaron
    const clientes = obtenerClientes();
    const idx = clientes.findIndex(c => c.id === usuarioActual.clienteId);
    if (idx !== -1) {
        clientes[idx].placa = placa;
        clientes[idx].marca = marca;
        clientes[idx].modelo = modelo;
        clientes[idx].anio = anio;
        clientes[idx].kilometraje = kilometraje;
        clientes[idx].telefono = telefono;
        guardarClientes(clientes);
    }

    // Mensaje de exito con SweetAlert2 (Caso de prueba 4)
    Swal.fire({
        icon: "success",
        title: "¡Solicitud Registrada con Éxito!",
        text: "Tu orden #" + nuevoId + " fue agregada a la lista y se encuentra en estado 'Pendiente'.",
        confirmButtonColor: "#0d6efd"
    });

    cargarHistorialCliente();
    cargarPerfilCliente();
});
