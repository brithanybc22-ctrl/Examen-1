<?php

use App\Models\Categoria;
use App\Models\Equipo;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user, "sanctum");
    $this->categoria = Categoria::factory()->create();
});

test("crea un equipo exitosamente y retorna 201 con el encabezado Location", function () {
    $datos = [
        "codigo" => "EQ-9999",
        "nombre" => "Laptop de Prueba",
        "categoria_id" => $this->categoria->id,
        "estado" => "disponible",
        "fecha_adquisicion" => "2026-01-01",
        "costo_interno" => 500,
    ];

    $response = $this->postJson("/api/equipos", $datos);

    $response->assertStatus(201)
        ->assertHeader("Location")
        ->assertJsonPath("data.codigo", "EQ-9999");

    $this->assertDatabaseHas("equipos", ["codigo" => "EQ-9999"]);
});

test("retorna 422 cuando los datos de entrada son invalidos", function () {
    $datos = [
        "codigo" => "CODIGO_INVALIDO",
        "nombre" => "AB",
        "categoria_id" => 99999,
        "fecha_adquisicion" => "2099-01-01",
        "costo_interno" => -10,
    ];

    $response = $this->postJson("/api/equipos", $datos);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(["codigo", "nombre", "categoria_id", "fecha_adquisicion", "costo_interno"]);
});

test("retorna 409 al intentar eliminar un equipo con estado prestado", function () {
    $equipoPrestado = Equipo::factory()->create([
        "categoria_id" => $this->categoria->id,
        "estado" => "prestado",
    ]);

    $response = $this->deleteJson("/api/equipos/{$equipoPrestado->id}");

    $response->assertStatus(409)
        ->assertJson([
            "mensaje" => "No se puede eliminar un equipo prestado.",
            "codigo" => "REGLA_NEGOCIO",
        ]);

    $this->assertDatabaseHas("equipos", ["id" => $equipoPrestado->id]);
});
