// ==================================================================
//               SCRIPT.JS CORREGIDO - VALIDACIÓN POR PASOS
// ==================================================================

let asientosSeleccionados = [];
let asientosReservados = [];
let currentStep = 0;

// --- INICIALIZACIÓN GENERAL ---
document.addEventListener("DOMContentLoaded", () => {
  emailjs.init('tRq8XXGfnFewdFNyU');

  const formulario = document.getElementById("formulario");
  const nextBtns = document.querySelectorAll(".btn-next");
  const prevBtns = document.querySelectorAll(".btn-prev");
  
  formulario.addEventListener("submit", enviarFormulario);
  nextBtns.forEach(btn => btn.addEventListener("click", () => cambiarPaso(1)));
  prevBtns.forEach(btn => btn.addEventListener("click", () => cambiarPaso(-1)));
  
  const ruta = document.getElementById("ruta");
  const busSelect = document.getElementById("bus");
  ruta.addEventListener("change", () => cargarBuses(ruta.value, busSelect));
  cargarBuses(ruta.value, busSelect);
  generarPlanoAsientos();
  actualizarFechaHoraEnHeader();
  setInterval(actualizarFechaHoraEnHeader, 1000);
  document.querySelectorAll('input[name="pago"]').forEach(radio => radio.addEventListener("change", toggleMetodoPago));
  configurarValidacionesTiempoReal();
  
  mostrarPaso(currentStep);
});

// --- LÓGICA DE NAVEGACIÓN POR PASOS ---
function cambiarPaso(direccion) {
    // Si vamos hacia adelante, validar el paso actual primero
    if (direccion > 0 && !validarPasoActual()) {
        return; // Detiene si la validación del paso actual falla
    }
    currentStep += direccion;
    mostrarPaso(currentStep);
}

function mostrarPaso(numeroPaso) {
    const sections = document.querySelectorAll("form section");
    const steps = document.querySelectorAll(".progress-bar .step");

    sections.forEach(section => section.classList.remove('active'));
    if (sections[numeroPaso]) {
        sections[numeroPaso].classList.add('active');
    }

    steps.forEach((step, index) => {
        step.classList.toggle('active', index === numeroPaso);
        step.classList.toggle('completed', index < numeroPaso);
    });
}

// --- FUNCIÓN DE VALIDACIÓN POR PASO (AJUSTADA) ---
function validarPasoActual() {
    switch(currentStep) {
        case 0: return validarCamposPasajero();
        case 1: return validarRuta() && validarFechaHora() && validarAsientos();
        // El paso de pago se valida por separado al hacer submit
        default: return true; 
    }
}

// --- FUNCIÓN DE ENVÍO ---
function enviarFormulario(event) {
  event.preventDefault();
  
  // ¡LA VALIDACIÓN DE PAGO SUCEDE AQUÍ, Y SOLO AQUÍ!
  if (!validarPago()) return; 
  
  const btn = event.target.querySelector('.btn-confirmar');
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  document.getElementById('asientos_hidden').value = asientosSeleccionados.join(', ');

  emailjs.sendForm('service_09xi3xh', 'template_c9xapgf', event.target)
    .then(() => {
        alert('¡Reserva confirmada! Hemos enviado la factura a tu correo.');
        mostrarFacturaEnPagina();
        mostrarPasoFactura();
    }, (error) => {
        alert('Hubo un error al enviar el correo.');
        console.log('ERROR DE EMAILJS:', error);
    }).finally(() => {
        btn.disabled = false;
        btn.textContent = 'Confirmar y Pagar';
    });
}

// --- FUNCIÓN PARA CAMBIAR LA VISTA AL PASO DE LA FACTURA ---
function mostrarPasoFactura() {
    const pagoSection = document.getElementById('pago');
    const facturaSection = document.getElementById('factura');
    const nuevaReservacionSection = document.querySelector("#factura").nextElementSibling;

    pagoSection.classList.remove('active');
    facturaSection.classList.add('active');
    nuevaReservacionSection.style.display = 'flex';
}

// --- TUS FUNCIONES ORIGINALES (SIN CAMBIOS) ---
// (He dejado todas tus funciones intactas aquí abajo)
function mostrarFacturaEnPagina() {
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
        <li><strong>Nombre:</strong> ${nombre}</li><li><strong>Cédula:</strong> ${cedula}</li><li><strong>Dirección:</strong> ${direccion}</li><li><strong>Teléfono:</strong> ${telefono}</li><li><strong>Email:</strong> ${email}</li>
    </ul>
    <h4 style="color:#003366;">🚌 Información del Viaje</h4>
    <ul style="list-style:none; padding-left:0;">
        <li><strong>Ruta:</strong> ${ruta}</li><li><strong>Fecha de salida:</strong> ${fechaSalida}</li><li><strong>Hora de salida:</strong> ${horaSalida}</li><li><strong>Bus asignado:</strong> ${bus}</li><li><strong>Asientos reservados:</strong> ${asientosSeleccionados.join(", ")}</li>
    </ul>
  `;
  asientosReservados.push(...asientosSeleccionados);
  asientosSeleccionados = [];
  generarPlanoAsientos();
}

function validarCamposPasajero() {
  const cedula = document.getElementById("cedula").value.trim();
  const nombre = document.getElementById("nombre").value.trim();
  const direccion = document.getElementById("direccion").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const email = document.getElementById("email").value.trim();
  if (!/^\d{10}$/.test(cedula)) { alert("Cédula debe tener 10 dígitos numéricos."); return false; }
  if (!/^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/.test(nombre)) { alert("Nombre inválido."); return false; }
  if (direccion === "") { alert("Ingrese dirección."); return false; }
  if (!/^\d{7,10}$/.test(telefono)) { alert("Teléfono inválido."); return false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert("Correo inválido."); return false; }
  return true;
}

function validarRuta() {
  if (!document.getElementById("ruta").value) { alert("Seleccione una ruta."); return false; }
  return true;
}

function validarFechaHora() {
  const fecha = document.getElementById("fechaSalida").value;
  const hora = document.getElementById("horaSalida").value;
  if (!fecha || !hora) { alert("Seleccione fecha y hora."); return false; }
  if (new Date(`${fecha}T${hora}`) < new Date()) { alert("La fecha no puede ser anterior."); return false; }
  return true;
}

function validarAsientos() {
  if (asientosSeleccionados.length === 0) { alert("Seleccione al menos un asiento."); return false; }
  return true;
}

function validarPago() {
  const metodoPago = document.querySelector('input[name="pago"]:checked');
  
  // 1. Validar que se haya seleccionado un método de pago
  if (!metodoPago) {
    alert("Por favor, seleccione un método de pago.");
    return false;
  }

  // 2. Si el método es transferencia, validar el archivo
  if (metodoPago.value === "transferencia") {
    if (document.getElementById("comprobanteTransferencia").files.length === 0) {
      alert("Por favor, debe subir un comprobante de transferencia.");
      return false;
    }
  } 
  // 3. Si el método es tarjeta, validar todos sus campos
  else if (metodoPago.value === "tarjeta") {
    const tipoTarjeta = document.getElementById("tipoTarjeta").value;
    const numTarjeta = document.getElementById("numTarjeta").value.trim();
    const nombreTitular = document.getElementById("nombreTitular").value.trim();
    const vencimiento = document.getElementById("vencimiento").value.trim();
    const cvv = document.getElementById("cvv").value.trim();

    if (tipoTarjeta === "") {
      alert("Por favor, seleccione el tipo de tarjeta (débito o crédito).");
      return false;
    }

    // Expresión regular para 16 dígitos (Visa, Mastercard, etc.)
    if (!/^\d{16}$/.test(numTarjeta)) {
      alert("El número de tarjeta debe contener 16 dígitos.");
      return false;
    }
    
    // El nombre del titular no puede estar vacío y solo debe contener letras y espacios
    if (nombreTitular === "" || !/^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/.test(nombreTitular)) {
      alert("Por favor, ingrese un nombre válido para el titular de la tarjeta.");
      return false;
    }
    
    // Validación de fecha de vencimiento (formato MM/AA)
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(vencimiento)) {
      alert("El formato de la fecha de vencimiento debe ser MM/AA (ej. 08/25).");
      return false;
    }
    
    // Validación de CVV (3 o 4 dígitos)
    if (!/^\d{3,4}$/.test(cvv)) {
      alert("El CVV debe contener 3 o 4 dígitos.");
      return false;
    }
  }

  // Si todas las validaciones pasan, la función devuelve true
  return true;
}

function toggleMetodoPago() {
    const pagoTarjeta = document.getElementById("pagoTarjeta");
    const pagoCard = document.querySelector("#pagoTransferencia").closest(".pago-card");
    if (document.getElementById('pagoTarjetaRadio').checked) {
        pagoTarjeta.style.display = "block";
        pagoCard.style.opacity = '0.6';
    } else {
        pagoTarjeta.style.display = "none";
        pagoCard.style.opacity = '1';
    }
}

function bloquearLetras(input) {
  input.addEventListener("input", () => { input.value = input.value.replace(/\D/g, ""); });
}

function bloquearNumeros(input) {
  input.addEventListener("input", () => { input.value = input.value.replace(/[^a-zA-ZÁÉÍÓÚÑáéíóúñ\s]/g, ""); });
}

function configurarValidacionesTiempoReal() {
  bloquearLetras(document.getElementById("cedula"));
  bloquearLetras(document.getElementById("telefono"));
  bloquearNumeros(document.getElementById("nombre"));
}

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
      if (col === 2) { contenedor.appendChild(document.createElement("div")); } else {
        const btn = document.createElement("button");
        btn.type = "button";
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
  } else {
    asientosSeleccionados.push(num);
    boton.classList.add("selected");
  }
  document.getElementById("contador-asientos").textContent = `Asientos seleccionados: ${asientosSeleccionados.length} / 40`;
}

function actualizarPlano() {
  document.querySelectorAll(".asiento-btn").forEach(btn => {
    const num = parseInt(btn.dataset.numero);
    btn.classList.remove("reserved", "selected");
    btn.disabled = false;
    if (asientosReservados.includes(num)) {
      btn.classList.add("reserved");
      btn.disabled = true;
    }
  });
}

function nuevaReservacion() {
  document.getElementById("formulario").reset();
  asientosSeleccionados = [];
  generarPlanoAsientos();
  
  const facturaSection = document.getElementById('factura');
  const nuevaReservacionSection = facturaSection.nextElementSibling;

  facturaSection.classList.remove('active');
  nuevaReservacionSection.style.display = 'none';
  
  currentStep = 0;
  mostrarPaso(currentStep);
  toggleMetodoPago();
}

function actualizarFechaHoraEnHeader() {
  const now = new Date();
  document.getElementById("fecha-hora").textContent = `${now.toLocaleDateString('es-EC')} ${now.toLocaleTimeString('es-EC')}`;
}