import { obtenerToken } from "./auth.js";
import { BASE_URL, TIEMPO_MAXIMO_MS } from "./config.js";
import { ErrorApi } from "./errores.js";

export async function request(endpoint, options = {}) {
    const token = obtenerToken();
    
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const config = {
        ...options,
        headers,
    };

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIEMPO_MAXIMO_MS);
    config.signal = controller.signal;

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        clearTimeout(timeoutId);

        if (response.status === 204) {
            return null;
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401) {
                const vistaLoginVisible = document.querySelector('#vista-login')?.hidden === false;
                if (!vistaLoginVisible) {
                    window.location.reload();
                }
            }
            throw new ErrorApi(response.status, data);
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new ErrorApi(408, { mensaje: 'La petición tardó demasiado tiempo.' });
        }
        throw error;
    }
}