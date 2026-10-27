import "./styles/base.css";
import "./styles/layout.css";

import { haySesion, iniciarSesion, cerrarSesion, nombreUsuario } from "./modules/auth.js";
import { iniciarListado, cargarPagina } from "./components/listado.js";
import { iniciarFormulario } from "./components/formulario.js";
import { mostrarMensaje } from "./components/mensajes.js";

const $vistaLogin = document.querySelector("#vista-login");
const $vistaApp = document.querySelector("#vista-app");
const $sesion = document.querySelector("#sesion");
const $formLogin = document.querySelector("#form-login");

let appInicializada = false;

const mostrarApp = () => {
  if ($vistaLogin) $vistaLogin.hidden = true;
  if ($vistaApp) $vistaApp.hidden = false;
  if ($sesion) $sesion.hidden = false;
  
  const $usuarioNombre = document.querySelector("#usuario-nombre");
  if ($usuarioNombre) $usuarioNombre.textContent = nombreUsuario() || 'Usuario';

  if (!appInicializada) {
    appInicializada = true;
    iniciarFormulario({ alGuardar: () => cargarPagina(1) });
    iniciarListado(); // Activado para cargar los registros al entrar
  }
};

const mostrarLogin = () => {
  appInicializada = false;
  if ($vistaApp) $vistaApp.hidden = true;
  if ($sesion) $sesion.hidden = true;
  if ($vistaLogin) $vistaLogin.hidden = false;
  const inputEmail = $vistaLogin?.querySelector("input");
  if (inputEmail) inputEmail.focus();
};

if ($formLogin) {
  $formLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    $formLogin.querySelectorAll("[data-error]").forEach(($p) => ($p.textContent = ""));

    const datos = new FormData($formLogin);
    try {
      await iniciarSesion(datos.get("email"), datos.get("password"));
      mostrarApp();
    } catch (error) {
      if (error.status === 422) {
        for (const [campo, [mensaje]] of Object.entries(error.datos?.errors ?? {})) {
          const $error = $formLogin.querySelector(`[data-error="${campo}"]`);
          if ($error) $error.textContent = mensaje;
        }
      } else {
        mostrarMensaje("error", "No fue posible conectar con la API. ¿Está en ejecución?");
      }
    }
  });
}

const $btnSalir = document.querySelector("#btn-salir");
if ($btnSalir) {
  $btnSalir.addEventListener("click", async () => {
    await cerrarSesion();
    window.location.reload();
  });
}

haySesion() ? mostrarApp() : mostrarLogin();