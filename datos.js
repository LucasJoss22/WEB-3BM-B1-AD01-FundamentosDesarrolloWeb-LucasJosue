// Sistema de almacenamiento de DriveFix para la Practica AD01

// 1. Inicializar datos con al menos 3 usuarios (1 Admin y 2 Clientes) segun la guia
function iniciarDatos() {
    if (!localStorage.getItem("clientesDriveFix")) {
        const clientesIniciales = [
            {
                id: 1,
                nombre: "Juan Pérez",
                usuario: "cliente1",
                password: "123",
                correo: "juan.perez@correo.com",
                telefono: "0991234567",
                placa: "PBX-1234",
                marca: "Chevrolet",
                modelo: "Sail",
                anio: 2018,
                kilometraje: 75000,
                estadoCuenta: "activa"
            },
            {
                id: 2,
                nombre: "María López",
                usuario: "cliente2",
                password: "123",
                correo: "maria.lopez@correo.com",
                telefono: "0987654321",
                placa: "ABC-5678",
                marca: "Toyota",
                modelo: "Yaris",
                anio: 2021,
                kilometraje: 32000,
                estadoCuenta: "activa"
            }
        ];
        localStorage.setItem("clientesDriveFix", JSON.stringify(clientesIniciales));
    }

    if (!localStorage.getItem("mantenimientosDriveFix")) {
        const mantenimientosIniciales = [
            {
                id: 1,
                clienteId: 1,
                clienteNombre: "Juan Pérez",
                correo: "juan.perez@correo.com",
                telefono: "0991234567",
                placa: "PBX-1234",
                marca: "Chevrolet",
                modelo: "Sail",
                anio: 2018,
                kilometraje: 75000,
                servicio: "Cambio de Aceite y Filtros",
                tipoAtencion: "Normal", // Radio button
                serviciosAdicionales: ["Lavado de cortesía"], // Checkbox
                fecha: "2026-11-10",
                hora: "09:00",
                costo: 40.00,
                estado: "Finalizado", // Pendiente, En revisión, En proceso, Finalizado, Cancelado
                observaciones: "Mantenimiento preventivo de los 75.000 km."
            },
            {
                id: 2,
                clienteId: 2,
                clienteNombre: "María López",
                correo: "maria.lopez@correo.com",
                telefono: "0987654321",
                placa: "ABC-5678",
                marca: "Toyota",
                modelo: "Yaris",
                anio: 2021,
                kilometraje: 32000,
                servicio: "Revisión de Frenos",
                tipoAtencion: "Express",
                serviciosAdicionales: ["Revisión de niveles", "Lavado de cortesía"],
                fecha: "2026-11-12",
                hora: "10:30",
                costo: 35.00,
                estado: "En proceso",
                observaciones: "Cambio de pastillas delanteras."
            }
        ];
        localStorage.setItem("mantenimientosDriveFix", JSON.stringify(mantenimientosIniciales));
    }

    if (!localStorage.getItem("mensajesContactoDriveFix")) {
        localStorage.setItem("mensajesContactoDriveFix", JSON.stringify([]));
    }
}

// Funciones de obtencion y guardado
function obtenerClientes() {
    return JSON.parse(localStorage.getItem("clientesDriveFix")) || [];
}

function guardarClientes(clientes) {
    localStorage.setItem("clientesDriveFix", JSON.stringify(clientes));
}

function obtenerMantenimientos() {
    return JSON.parse(localStorage.getItem("mantenimientosDriveFix")) || [];
}

function guardarMantenimientos(mantenimientos) {
    localStorage.setItem("mantenimientosDriveFix", JSON.stringify(mantenimientos));
}

function obtenerMensajesContacto() {
    return JSON.parse(localStorage.getItem("mensajesContactoDriveFix")) || [];
}

function guardarMensajesContacto(mensajes) {
    localStorage.setItem("mensajesContactoDriveFix", JSON.stringify(mensajes));
}

// Sesion
function obtenerUsuarioActual() {
    return JSON.parse(localStorage.getItem("usuarioActualDriveFix"));
}

function cerrarSesion() {
    Swal.fire({
        title: "¿Cerrar Sesión?",
        text: "Vas a salir del sistema.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#0d6efd",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, salir",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem("usuarioActualDriveFix");
            window.location.href = "login.html";
        }
    });
}

// Validacion de Placa ecuatoriana (3 letras, guion o espacio opcional, 3 o 4 numeros)
function validarFormatoPlaca(placa) {
    const patron = /^[A-Z]{3}-?\d{3,4}$/i;
    return patron.test(placa.trim());
}

iniciarDatos();
