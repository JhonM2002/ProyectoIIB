let asientosSeleccionados = [];
let asientosReservados = [];

document.addEventListener("DOMContentLoaded", () => {
  const ruta = document.getElementById("ruta");
  const busSelect = document.getElementById("bus");

  ruta.addEventListener("change", () => cargarBuses(ruta.value, busSelect));
  cargarBuses(ruta.value, busSelect);
  generarPlanoAsientos();
  actualizarFechaHoraEnHeader();
  setInterval(actualizarFechaHoraEnHeader, 1000);

const radios = document.querySelectorAll('input[name="pago"]');
const pagoTarjeta = document.getElementById("pagoTarjeta");
const comprobante = document.getElementById("comprobanteTransferencia");

  radios.forEach((radio) => {
  radio.addEventListener("change", () => {
    if (radio.value === "tarjeta") {
      pagoTarjeta.style.display = "block";
      comprobante.style.display = "none";
    } else {
      pagoTarjeta.style.display = "none";
      comprobante.style.display = "block";
    }
  });
});

  const formulario = document.getElementById("formulario");
  formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validarCamposPasajero() && validarRuta() && validarFechaHora() && validarAsientos() && validarPago()) {
      mostrarFactura();
    }
  });

  configurarValidacionesTiempoReal();
});

function bloquearLetras(input) {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, ""); // Solo números
  });
}
function bloquearNumeros(input) {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^a-zA-ZÁÉÍÓÚÑáéíóúñ\s]/g, ""); // Solo letras y espacios
  });
}

function configurarValidacionesTiempoReal() {
  const cedula = document.getElementById("cedula");
  const nombre = document.getElementById("nombre");
  const direccion = document.getElementById("direccion");
  const telefono = document.getElementById("telefono");
  const email = document.getElementById("email");

  bloquearLetras(cedula);
  bloquearLetras(telefono);
  bloquearNumeros(nombre);

  cedula.addEventListener("input", () => {
    cedula.value = cedula.value.replace(/[^\d]/g, "");
    cedula.setCustomValidity(cedula.value.length !== 10 ? "Cédula debe tener 10 dígitos." : "");
  });

  // Nombre (solo letras)
  nombre.addEventListener("input", () => {
    nombre.value = nombre.value.replace(/[^a-zA-ZÁÉÍÓÚÑáéíóúñ\s]/g, "");
    nombre.setCustomValidity(nombre.value.trim() === "" ? "Nombre requerido." : "");
  });

  // Dirección (texto libre)
  direccion.addEventListener("input", () => {
    direccion.setCustomValidity(direccion.value.trim() === "" ? "Dirección requerida." : "");
  });

  // Teléfono (solo números)
  telefono.addEventListener("input", () => {
    telefono.value = telefono.value.replace(/[^\d]/g, "");
    telefono.setCustomValidity(telefono.value.length < 7 ? "Teléfono inválido." : "");
  });

  // Email
  email.addEventListener("input", () => {
    email.setCustomValidity(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) ? "" : "Correo inválido."
    );
  });
}

function validarCamposPasajero() {
  const cedula = document.getElementById("cedula").value.trim();
  const nombre = document.getElementById("nombre").value.trim();
  const direccion = document.getElementById("direccion").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!/^\d{10}$/.test(cedula)) {
    alert("Cédula debe tener 10 dígitos númericos.");
    return false;
  }

  if (!/^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/.test(nombre)) {
    alert("Nombre inválido.");
    return false;
  }

  if (direccion === "") {
    alert("Ingrese dirección.");
    return false;
  }

  if (!/^\d{7,}$/.test(telefono)) {
    alert("Teléfono inválido.");
    return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert("Correo inválido.");
    return false;
  }

  return true;
}

function validarRuta() {
  const ruta = document.getElementById("ruta").value;
  if (!ruta) {
    alert("Seleccione una ruta válida.");
    return false;
  }
  return true;
}

function validarFechaHora() {
  const fecha = document.getElementById("fechaSalida").value;
  const hora = document.getElementById("horaSalida").value;

  if (!fecha || !hora) {
    alert("Seleccione fecha y hora de salida.");
    return false;
  }

  const fechaHoraSeleccionada = new Date(`${fecha}T${hora}`);
  const ahora = new Date();

  if (fechaHoraSeleccionada < ahora) {
    alert("La salida no puede ser anterior al momento actual.");
    return false;
  }

  return true;
}

function validarAsientos() {
  if (asientosSeleccionados.length === 0) {
    alert("Seleccione al menos un asiento.");
    return false;
  }
  return true;
}
// Validación de pago
function validarPago() {
  const metodoPago = document.querySelector('input[name="pago"]:checked');
  if (!metodoPago) {
    alert("Seleccione un método de pago.");
    return false;
  }

  let valido = true;

  if (metodoPago.value === "tarjeta") {
    const num = document.getElementById("numTarjeta");
    const titular = document.getElementById("nombreTitular");
    const venc = document.getElementById("vencimiento");
    const cvv = document.getElementById("cvv");

    if (!/^\d{16}$/.test(num.value.trim())) {
      num.setCustomValidity("Número de tarjeta inválido.");
      valido = false;
    } else {
      num.setCustomValidity("");
    }

    if (!/^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/.test(titular.value.trim())) {
      titular.setCustomValidity("Nombre del titular inválido.");
      valido = false;
    } else {
      titular.setCustomValidity("");
    }

    if (venc.value.trim() === "") {
      venc.setCustomValidity("Ingrese vencimiento.");
      valido = false;
    } else {
      venc.setCustomValidity("");
    }

    if (!/^\d{3,4}$/.test(cvv.value.trim())) {
      cvv.setCustomValidity("CVV inválido.");
      valido = false;
    } else {
      cvv.setCustomValidity("");
    }

    // Mostrar los errores si hay alguno
    [num, titular, venc, cvv].forEach(input => input.reportValidity());

  } else if (metodoPago.value === "transferencia") {
    const inputArchivo = document.getElementById("comprobanteTransferencia");
    const archivo = inputArchivo.files[0];

    if (!archivo) {
      inputArchivo.setCustomValidity("Debe subir un comprobante de transferencia.");
      valido = false;
    } else {
      inputArchivo.setCustomValidity("");
    }
  }

  return valido;
}

// Asientos y funciones auxiliares

function cargarBuses(ruta, select) {
  select.innerHTML = "";
  const cantidad = ruta === "Quito-Guayaquil" ? 8 : 4;
  for (let i = 1; i <= cantidad; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `Bus ${i}`;
    select.appendChild(opt);
  }
}

function generarPlanoAsientos() {
  const contenedor = document.getElementById("plano-asientos");
  contenedor.innerHTML = "";
  let n = 1;
  for (let fila = 0; fila < 10; fila++) {
    for (let col = 0; col < 5; col++) {
      if (col === 2) {
        const espacio = document.createElement("div");
        espacio.style.width = "30px";
        contenedor.appendChild(espacio);
      } else {
        const btn = document.createElement("button");
        btn.className = "asiento-btn";
        btn.textContent = n;
        btn.dataset.numero = n;
        btn.addEventListener("click", () => toggleAsiento(btn));
        contenedor.appendChild(btn);
        n++;
      }
    }
  }
  actualizarPlano();
}

function toggleAsiento(boton) {
  const num = parseInt(boton.dataset.numero);
  if (asientosReservados.includes(num)) return;

  const idx = asientosSeleccionados.indexOf(num);
  if (idx > -1) {
    asientosSeleccionados.splice(idx, 1);
    boton.classList.remove("selected");
  } else if (asientosSeleccionados.length < 40) {
    asientosSeleccionados.push(num);
    boton.classList.add("selected");
  }

  document.getElementById("contador-asientos").textContent =
    `Asientos seleccionados: ${asientosSeleccionados.length} / 40`;
}

function actualizarPlano() {
  document.querySelectorAll(".asiento-btn").forEach(btn => {
    const num = parseInt(btn.dataset.numero);
    if (asientosReservados.includes(num)) {
      btn.classList.add("reserved");
      btn.disabled = true;
    }
  });
}

function mostrarFactura() {
  const fechaHora = new Date().toLocaleString('es-EC');
  const div = document.getElementById("factura-contenido");
  const nombre = document.getElementById("nombre").value;
  const cedula = document.getElementById("cedula").value;
  const direccion = document.getElementById("direccion").value;
  const telefono = document.getElementById("telefono").value;
  const email = document.getElementById("email").value;
  const ruta = document.getElementById("ruta").value;
  const fechaSalida = document.getElementById("fechaSalida").value;
  const horaSalida = document.getElementById("horaSalida").value;
  const bus = document.getElementById("bus").value;


  div.innerHTML = `
       <h4 style="color:#003366;">👤 Información del Pasajero</h4>
      <ul style="list-style:none; padding-left:0;">
        <li><strong>Nombre:</strong> ${nombre}</li>
        <li><strong>Cédula:</strong> ${cedula}</li>
        <li><strong>Dirección:</strong> ${direccion}</li>
        <li><strong>Teléfono:</strong> ${telefono}</li>
        <li><strong>Email:</strong> ${email}</li>
      </ul>

      <h4 style="color:#003366;">🚌 Información del Viaje</h4>
      <ul style="list-style:none; padding-left:0;">
        <li><strong>Ruta:</strong> ${ruta}</li>
        <li><strong>Fecha de salida:</strong> ${fechaSalida}</li>
        <li><strong>Hora de salida:</strong> ${horaSalida}</li>
        <li><strong>Bus asignado:</strong> ${bus}</li>
      </ul>

    <p>Asientos reservados: ${asientosSeleccionados.join(", ")}</p>
  `;
  asientosReservados.push(...asientosSeleccionados);
  asientosSeleccionados = [];
  generarPlanoAsientos();
}

function nuevaReservacion() {
  document.getElementById("formulario").reset();
  asientosSeleccionados = [];
  asientosReservados = [];
  generarPlanoAsientos();
  document.getElementById("pagoTarjeta").style.display = "none";
  document.getElementById("comprobanteTransferencia").style.display = "none";
  document.getElementById("factura-contenido").innerHTML = "";
}

function actualizarFechaHoraEnHeader() {
  const now = new Date();
  const fecha = now.toLocaleDateString('es-EC');
  const hora = now.toLocaleTimeString('es-EC');
  document.getElementById("fecha-hora").textContent = `${fecha} ${hora}`;
}
