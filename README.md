# February Project: community-events

Plataforma web que permite a organizaciones estudiantiles de la PUCP subir y administrar sus eventos, para proveer a los
estudiantes y al público general una forma fácil y rápida de descubrir actividades futuras de estos.

Hecho con 💖 por DSC PUCP.

## Características generales

Más detalles se pueden ver en el [roadmap](https://github.com/orgs/DSC-PUCP/projects/3).

### Para las organizaciones

- Read/Update de cuenta:
    - Login (contraseña)
    - Descripción
    - Métodos de contacto
- CRUD de eventos:
    - Título y descripción
    - Fecha y hora de inicio/fin
    - Lugar
    - Categorías
    - Imagen de portada
    - Contacto para inscripción o detalles (email, WhatsApp, formulario externo)

### Para el público

- Feed de eventos
- Búsqueda por nombre, descripción, categorías o rango de fecha
- Detalle de cada evento

### Para la cuenta administradora

- CRUD de organizaciones
- CRUD de eventos (de cualquier organización)

## Tech stack

- Next.js 16
- Tailwind CSS
- SQLite con Drizzle
- Better Auth

## Deploy

TODO

### Bootstrap de cuenta admin

Para crear la cuenta admin de forma segura en cada entorno:

1. Define `ADMIN_EMAIL` en tu `.env`.
2. Ejecuta el seed una sola vez:

```bash
npm run db:seed
```

Si no defines contraseña, el seed genera una contraseña aleatoria y la imprime en consola. En ese
caso, se fuerza cambio de contraseña en el primer login.
