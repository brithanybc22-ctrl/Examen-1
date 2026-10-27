import { request } from './api.js';

export async function listarEquipos(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await request(`/equipos${query ? `?${query}` : ''}`);
}

export async function crearEquipo(datos) {
    return await request('/equipos', {
        method: 'POST',
        body: datos,
    });
}

export async function eliminarEquipo(id) {
    return await request(`/equipos/${id}`, {
        method: 'DELETE',
    });
}