import { listarEquipos, eliminarEquipo } from '../modules/equipos.js';

let paginaActual = 1;
let totalPaginas = 1;

export async function cargarPagina(pagina = 1) {
    const contenedor = document.querySelector('#contenedor-equipos');
    const btnAnterior = document.querySelector('#btn-anterior');
    const btnSiguiente = document.querySelector('#btn-siguiente');
    const spanPagina = document.querySelector('#span-pagina');
    const spanResumen = document.querySelector('#span-resumen');
    const inputBusqueda = document.querySelector('#input-busqueda');
    const selectEstado = document.querySelector('#select-estado-filtro');

    if (!contenedor) return;
    contenedor.setAttribute('aria-busy', 'true');
    
    try {
        const params = { page: pagina, per_page: 10 };
        if (inputBusqueda?.value) params.q = inputBusqueda.value;
        if (selectEstado?.value) params.estado = selectEstado.value;

        const resultado = await listarEquipos(params);
        const equipos = resultado.data || [];
        const meta = resultado.meta || {};

        paginaActual = meta.current_page || pagina;
        totalPaginas = meta.last_page || 1;

        contenedor.innerHTML = '';

        if (equipos.length === 0) {
            contenedor.innerHTML = '<p class="estado-vacio">No se encontraron equipos registrados.</p>';
        } else {
            const template = document.querySelector('#tpl-equipo');
            
            equipos.forEach(eq => {
                const clone = template.content.cloneNode(true);
                
                const card = clone.querySelector('.equipo-card');
                if (card) {
                    card.setAttribute('data-id', eq.id);
                    card.setAttribute('data-estado', eq.estado);
                }

                clone.querySelector('[data-field="codigo"]').textContent = eq.codigo;
                clone.querySelector('[data-field="nombre"]').textContent = eq.nombre;
                clone.querySelector('[data-field="estado"]').textContent = eq.estado;
                clone.querySelector('[data-field="categoria"]').textContent = eq.categoria?.nombre || 'Sin categoría';
                clone.querySelector('[data-field="fecha"]').textContent = eq.fecha_adquisicion;

                contenedor.appendChild(clone);
            });
        }

        if (spanResumen) {
            spanResumen.textContent = `Mostrando ${meta.from || 0}-${meta.to || 0} de ${meta.total || 0}`;
        }
        if (spanPagina) {
            spanPagina.textContent = `Página ${paginaActual} de ${totalPaginas}`;
        }
        if (btnAnterior) btnAnterior.disabled = paginaActual <= 1;
        if (btnSiguiente) btnSiguiente.disabled = paginaActual >= totalPaginas;

    } catch (error) {
        console.error('Error al listar equipos:', error);
    } finally {
        contenedor.removeAttribute('aria-busy');
    }
}

export function iniciarListado() {
    const btnAnterior = document.querySelector('#btn-anterior');
    const btnSiguiente = document.querySelector('#btn-siguiente');
    const inputBusqueda = document.querySelector('#input-busqueda');
    const selectEstado = document.querySelector('#select-estado-filtro');
    const contenedor = document.querySelector('#contenedor-equipos');

    btnAnterior?.addEventListener('click', () => {
        if (paginaActual > 1) cargarPagina(paginaActual - 1);
    });

    btnSiguiente?.addEventListener('click', () => {
        if (paginaActual < totalPaginas) cargarPagina(paginaActual + 1);
    });

    inputBusqueda?.addEventListener('input', () => cargarPagina(1));
    selectEstado?.addEventListener('change', () => cargarPagina(1));

    contenedor?.addEventListener('click', async (e) => {
        const btnEliminar = e.target.closest('.btn-eliminar');
        if (!btnEliminar) return;

        const card = btnEliminar.closest('.equipo-card');
        const id = card?.getAttribute('data-id');
        if (!id) return;

        if (confirm('¿Está seguro de eliminar este equipo?')) {
            try {
                await eliminarEquipo(id);
                await cargarPagina(paginaActual);
            } catch (error) {
                alert(error.data?.mensaje || error.message || 'Error al eliminar el equipo.');
            }
        }
    });

    cargarPagina(1);
}