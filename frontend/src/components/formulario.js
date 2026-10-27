import { request } from '../modules/api.js';
import { crearEquipo } from '../modules/equipos.js';

let categoriasCargadas = false;

export async function iniciarFormulario({ alGuardar } = {}) {
    const form = document.querySelector('#form-equipo');
    const selectCategoria = document.querySelector('#categoria_id');
    const btnGuardar = document.querySelector('#btn-guardar');

    if (!form) return;

    // Cargar categorías solo si el select existe y no se han cargado antes en esta sesión
    if (selectCategoria && !categoriasCargadas) {
        try {
            const categorias = await request('/categorias');
            const listaCategorias = categorias.data || categorias; // Soporta ambos formatos de API
            
            if (Array.isArray(listaCategorias)) {
                selectCategoria.innerHTML = '<option value="">Seleccione una categoría</option>';
                listaCategorias.forEach(cat => {
                    const opt = document.createElement('option');
                    opt.value = cat.id;
                    opt.textContent = cat.nombre;
                    selectCategoria.appendChild(opt);
                });
                categoriasCargadas = true;
            }
        } catch (e) {
            console.error('Error cargando categorías', e);
        }
    }

    // Evitar duplicar el listener si la función se vuelve a invocar
    if (form.dataset.listenerInitialized) return;
    form.dataset.listenerInitialized = 'true';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Limpiar errores previos
        form.querySelectorAll('[data-error]').forEach(el => el.textContent = '');
        form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));

        const formData = new FormData(form);
        const datos = {
            codigo: formData.get('codigo'),
            nombre: formData.get('nombre'),
            categoria_id: formData.get('categoria_id') ? Number(formData.get('categoria_id')) : null,
            estado: formData.get('estado') || undefined,
            fecha_adquisicion: formData.get('fecha_adquisicion'),
            costo_interno: formData.get('costo_interno') !== '' ? Number(formData.get('costo_interno')) : null,
        };

        if (btnGuardar) {
            btnGuardar.disabled = true;
            btnGuardar.textContent = 'Guardando...';
        }

        try {
            await crearEquipo(datos);
            form.reset();
            
            if (typeof alGuardar === 'function') {
                alGuardar();
            } else {
                // En lugar de un window.location.reload() brusco que pueda causar bucles si hay un router mal configurado,
                // puedes recargar datos de forma limpia o mantener la vista actual.
                console.log('Equipo creado con éxito');
            }
        } catch (error) {
            if (error.status === 422 && error.data?.errors) {
                const errores = error.data.errors;
                Object.keys(errores).forEach(campo => {
                    const input = form.querySelector(`[name="${campo}"]`);
                    const errorP = form.querySelector(`[data-error="${campo}"]`);
                    if (input) input.setAttribute('aria-invalid', 'true');
                    if (errorP) errorP.textContent = errores[campo][0];
                });
            } else {
                alert(error.message || 'Ocurrió un error al guardar.');
            }
        } finally {
            if (btnGuardar) {
                btnGuardar.disabled = false;
                btnGuardar.textContent = 'Guardar Equipo';
            }
        }
    });
}