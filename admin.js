// Logica del Panel Administrador con CRUD completo y SweetAlert2

// 1. Control de acceso: Caso de prueba 5 (Cliente intenta entrar a administracion -> Acceso denegado)
const usuarioActual = obtenerUsuarioActual();
if (!usuarioActual || usuarioActual.rol !== "admin") {
    // Si intenta entrar alguien no autorizado o un cliente
    Swal.fire({
        icon: "error",
        title: "Acceso Denegado (403)",
        text: "No tienes permisos de Administrador para acceder a esta área.",
        confirmButtonColor: "#dc3545"
    }).then(() => {
        window.location.href = "login.html";
    });
}

document.addEventListener("DOMContentLoaded", function() {
    cargarClientesEnTabla();
    cargarClientesEnSelect();
    cargarMantenimientosEnTabla();
    cargarMensajesContactoEnTabla();

    const hoy = new Date().toISOString().split("T")[0];
    document.getElementById("fechaMantenimiento").min = hoy;
    document.getElementById("fechaMantenimiento").value = hoy;

    // Evento al seleccionar cliente en el select para autorellenar su auto y placa
    const select = document.getElementById("selectCliente");
    select.addEventListener("change", function() {
        const clienteId = parseInt(this.value);
        const clientes = obtenerClientes();
        const cliente = clientes.find(c => c.id === clienteId);
        if (cliente) {
            document.getElementById("adminPlaca").value = cliente.placa;
            document.getElementById("adminVehiculo").value = cliente.marca + " " + cliente.modelo;
        }
    });
});

// 1. Mostrar clientes en la tabla
function cargarClientesEnTabla() {
    const clientes = obtenerClientes();
    const tbody = document.getElementById("tablaClientes");
    tbody.innerHTML = "";

    clientes.forEach(c => {
        const fila = `
            <tr>
                <td>${c.id}</td>
                <td><strong>${c.nombre}</strong></td>
                <td><code>${c.usuario}</code></td>
                <td>${c.correo || "N/A"}</td>
                <td>${c.telefono}</td>
                <td>${c.marca} ${c.modelo}</td>
                <td><span class="badge bg-dark">${c.placa}</span></td>
                <td><span class="badge bg-success">${c.estadoCuenta || "activa"}</span></td>
            </tr>
        `;
        tbody.innerHTML += fila;
    });
}

// 2. Llenar <select> de clientes
function cargarClientesEnSelect() {
    const clientes = obtenerClientes();
    const select = document.getElementById("selectCliente");
    select.innerHTML = '<option value="">Selecciona un cliente...</option>';

    clientes.forEach(c => {
        select.innerHTML += `<option value="${c.id}">${c.nombre} - ${c.marca} ${c.modelo} (${c.placa})</option>`;
    });
}

// 3. Mostrar lista de mantenimientos (CRUD - Read general)
function cargarMantenimientosEnTabla() {
    const mantenimientos = obtenerMantenimientos();
    const tbody = document.getElementById("tablaMantenimientos");
    tbody.innerHTML = "";

    if (mantenimientos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center;" class="text-muted py-3">No hay mantenimientos registrados aún.</td></tr>`;
        return;
    }

    mantenimientos.forEach(m => {
        // Colores para estados oficiales de la rubrica: Pendiente, En revisión, En proceso, Finalizado, Cancelado
        let colorEstado = "#d39e00";
        if (m.estado === "En revisión") colorEstado = "#6f42c1";
        if (m.estado === "En proceso") colorEstado = "#0d6efd";
        if (m.estado === "Finalizado") colorEstado = "#198754";
        if (m.estado === "Cancelado") colorEstado = "#dc3545";

        const fila = `
            <tr>
                <td><strong>#${m.id}</strong></td>
                <td><strong>${m.clienteNombre}</strong></td>
                <td>${m.marca || ""} ${m.modelo || ""} <br><small class="text-muted">${m.placa}</small></td>
                <td>${m.servicio} <br><small class="badge bg-secondary">${m.tipoAtencion || "Normal"}</small></td>
                <td>${m.fecha} <br><small class="text-muted">${m.hora || "09:00"}</small></td>
                <td>$${Number(m.costo).toFixed(2)}</td>
                <td><strong style="color: ${colorEstado};">${m.estado}</strong></td>
                <td>${m.observaciones || "-"}</td>
                <td>
                    <button class="btn-accion btn-editar" onclick="editarMantenimiento(${m.id})">Editar</button>
                    <button class="btn-accion btn-eliminar" onclick="eliminarMantenimiento(${m.id})">Eliminar</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += fila;
    });
}

// 4. Guardar o Actualizar Mantenimiento (CRUD - Create & Update)
const formMantenimiento = document.getElementById("formMantenimiento");
formMantenimiento.addEventListener("submit", function(e) {
    e.preventDefault();

    const editandoId = document.getElementById("editandoId").value;
    const clienteId = parseInt(document.getElementById("selectCliente").value);
    const placa = document.getElementById("adminPlaca").value.trim().toUpperCase();
    const vehiculo = document.getElementById("adminVehiculo").value.trim();
    const servicio = document.getElementById("selectServicio").value;
    const fecha = document.getElementById("fechaMantenimiento").value;
    const hora = document.getElementById("horaMantenimiento").value;
    const estado = document.getElementById("estadoMantenimiento").value;
    const costo = parseFloat(document.getElementById("costoMantenimiento").value);
    const tipoAtencion = document.getElementById("tipoAtencionAdmin").value;
    const observaciones = document.getElementById("observacionesMantenimiento").value.trim();

    // Validar placa
    if (!validarFormatoPlaca(placa)) {
        Swal.fire({
            icon: "error",
            title: "Placa Inválida",
            text: "El formato de placa debe tener 3 letras y 3-4 dígitos (ej: ABC-1234)."
        });
        return;
    }

    // Validar que la fecha no sea anterior a hoy al CREAR un nuevo mantenimiento
    const hoyActual = new Date().toISOString().split("T")[0];
    if (!editandoId && fecha < hoyActual) {
        Swal.fire({
            icon: "error",
            title: "Fecha Inválida",
            text: "No puedes registrar un mantenimiento con una fecha anterior al día de hoy (" + hoyActual + ")."
        });
        return;
    }

    const clientes = obtenerClientes();
    const cliente = clientes.find(c => c.id === clienteId) || { nombre: "Cliente General" };
    let mantenimientos = obtenerMantenimientos();

    if (editandoId) {
        // ACTUALIZAR (Caso de prueba 6 de la guia: Admin modifica estado)
        mantenimientos = mantenimientos.map(m => {
            if (m.id === parseInt(editandoId)) {
                return {
                    ...m,
                    clienteId: clienteId,
                    clienteNombre: cliente.nombre,
                    placa: placa,
                    marca: vehiculo,
                    modelo: "",
                    servicio: servicio,
                    fecha: fecha,
                    hora: hora,
                    estado: estado,
                    costo: costo,
                    tipoAtencion: tipoAtencion,
                    observaciones: observaciones
                };
            }
            return m;
        });

        Swal.fire({
            icon: "success",
            title: "Mantenimiento Actualizado",
            text: "Los cambios y el nuevo estado se guardaron exitosamente.",
            timer: 1500,
            showConfirmButton: false
        });
    } else {
        // CREAR NUEVO
        const nuevoId = mantenimientos.length > 0 ? Math.max(...mantenimientos.map(m => m.id)) + 1 : 1;
        const nuevo = {
            id: nuevoId,
            clienteId: clienteId,
            clienteNombre: cliente.nombre,
            correo: cliente.correo || "",
            telefono: cliente.telefono || "",
            placa: placa,
            marca: vehiculo,
            modelo: "",
            anio: 2020,
            kilometraje: 50000,
            servicio: servicio,
            tipoAtencion: tipoAtencion,
            serviciosAdicionales: [],
            fecha: fecha,
            hora: hora,
            costo: costo,
            estado: estado,
            observaciones: observaciones
        };
        mantenimientos.push(nuevo);

        Swal.fire({
            icon: "success",
            title: "Mantenimiento Creado",
            text: "Se generó la orden de trabajo #" + nuevoId,
            timer: 1500,
            showConfirmButton: false
        });
    }

    guardarMantenimientos(mantenimientos);
    cancelarEdicion();
    cargarMantenimientosEnTabla();
});

// 5. Cargar en formulario para editar (CRUD - Edit)
window.editarMantenimiento = function(id) {
    const mantenimientos = obtenerMantenimientos();
    const item = mantenimientos.find(m => m.id === id);
    if (!item) return;

    document.getElementById("editandoId").value = item.id;
    document.getElementById("selectCliente").value = item.clienteId;
    document.getElementById("adminPlaca").value = item.placa;
    document.getElementById("adminVehiculo").value = (item.marca || "") + " " + (item.modelo || "");
    document.getElementById("selectServicio").value = item.servicio;
    document.getElementById("fechaMantenimiento").value = item.fecha;
    document.getElementById("horaMantenimiento").value = item.hora || "09:00";
    document.getElementById("estadoMantenimiento").value = item.estado;
    document.getElementById("costoMantenimiento").value = item.costo;
    document.getElementById("tipoAtencionAdmin").value = item.tipoAtencion || "Normal";
    document.getElementById("observacionesMantenimiento").value = item.observaciones || "";

    document.getElementById("tituloFormMantenimiento").innerText = "2. Editar Solicitud de Mantenimiento (ID #" + item.id + ")";
    document.getElementById("btnGuardarMantenimiento").innerText = "Actualizar Solicitud";
    document.getElementById("btnCancelarEdicion").style.display = "inline-block";

    document.getElementById("formMantenimiento").scrollIntoView({ behavior: "smooth" });
};

// Cancelar edicion
document.getElementById("btnCancelarEdicion").addEventListener("click", cancelarEdicion);

function cancelarEdicion() {
    formMantenimiento.reset();
    document.getElementById("editandoId").value = "";
    const hoy = new Date().toISOString().split("T")[0];
    document.getElementById("fechaMantenimiento").min = hoy;
    document.getElementById("fechaMantenimiento").value = hoy;
    document.getElementById("tituloFormMantenimiento").innerText = "2. Registrar / Modificar Solicitud de Mantenimiento";
    document.getElementById("btnGuardarMantenimiento").innerText = "Guardar Solicitud";
    document.getElementById("btnCancelarEdicion").style.display = "none";
}

// 6. Eliminar con confirmacion SweetAlert2 (Caso de prueba 6 de la guia)
window.eliminarMantenimiento = function(id) {
    Swal.fire({
        title: "¿Eliminar mantenimiento #" + id + "?",
        text: "Esta acción no se puede deshacer. Se borrará del registro del taller.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            let mantenimientos = obtenerMantenimientos();
            mantenimientos = mantenimientos.filter(m => m.id !== id);
            guardarMantenimientos(mantenimientos);
            cargarMantenimientosEnTabla();

            Swal.fire({
                icon: "success",
                title: "Eliminado",
                text: "El mantenimiento fue eliminado con éxito.",
                timer: 1200,
                showConfirmButton: false
            });
        }
    });
};

// 7. Mensajes de contacto
function cargarMensajesContactoEnTabla() {
    const mensajes = obtenerMensajesContacto();
    const tbody = document.getElementById("tablaMensajesContacto");
    tbody.innerHTML = "";

    if (mensajes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;" class="text-muted py-2">No hay mensajes de contacto recibidos aún.</td></tr>`;
        return;
    }

    mensajes.forEach(m => {
        const fila = `
            <tr>
                <td><strong>#${m.id}</strong></td>
                <td>${m.fecha}</td>
                <td><strong>${m.nombre}</strong></td>
                <td><a href="mailto:${m.correo}">${m.correo}</a></td>
                <td>${m.motivo}</td>
                <td>${m.mensaje}</td>
                <td>
                    <button class="btn-accion btn-eliminar" onclick="eliminarMensajeContacto(${m.id})">Eliminar</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += fila;
    });
}

window.eliminarMensajeContacto = function(id) {
    Swal.fire({
        title: "¿Eliminar este mensaje?",
        text: "Se borrará de tu bandeja de consultas.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, borrar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            let mensajes = obtenerMensajesContacto();
            mensajes = mensajes.filter(m => m.id !== id);
            guardarMensajesContacto(mensajes);
            cargarMensajesContactoEnTabla();
        }
    });
};
