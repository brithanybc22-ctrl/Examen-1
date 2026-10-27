<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GuardarEquipoRequest;
use App\Http\Resources\EquipoResource;
use App\Models\Equipo;
use App\Services\EquipoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EquipoController extends Controller
{
    public function __construct(protected EquipoService $equipoService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $porPagina = (int) $request->query('per_page', 10);
        $equipos = $this->equipoService->listar(
            $request->query('q'),
            $request->query('estado'),
            $porPagina
        );

        return EquipoResource::collection($equipos);
    }

    public function show(Equipo $equipo): EquipoResource
    {
        return new EquipoResource($equipo->load('categoria'));
    }

    public function store(GuardarEquipoRequest $request): JsonResponse
    {
        $equipo = $this->equipoService->crear($request->validated());

        return (new EquipoResource($equipo))
            ->response()
            ->setStatusCode(201)
            ->header('Location', route('equipos.show', ['equipo' => $equipo->id]));
    }

    public function update(GuardarEquipoRequest $request, Equipo $equipo): EquipoResource
    {
        $equipoActualizado = $this->equipoService->actualizar($equipo, $request->validated());
        return new EquipoResource($equipoActualizado);
    }

    public function destroy(Equipo $equipo): JsonResponse
    {
        $this->equipoService->eliminar($equipo);
        return response()->json(null, 204);
    }

    public function prestar(Equipo $equipo): EquipoResource
    {
        $equipoPrestado = $this->equipoService->prestar($equipo);
        return new EquipoResource($equipoPrestado);
    }
}