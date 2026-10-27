export class ErrorApi extends Error {
  constructor(status, datos = {}) {
    super(datos.mensaje ?? datos.message ?? `Error HTTP ${status}`);
    this.name = "ErrorApi";
    this.status = status;
    this.datos = datos;
  }
}