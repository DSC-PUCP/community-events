# Guía de contribución

## Setup

1. Clona el repositorio:

   ```bash
   git clone https://github.com/DSC-PUCP/community-events
   ```

2. Copia el `.env.example` a `.env`.

3. Instala las dependencias y crea la BD local:

   ```
   npm i
   npm run db:migrate
   npm run db:seed
   ```

4. Inicia el servidor dev:
   ```
   npm run dev
   ```

## Contribución

### Convención de commits

```bash
<tipo>: <mensaje>

# Ejemplo
feat: nueva sección al admin panel
```

- feat: nueva funcionalidad
- fix: corrección de bugs
- chore: tareas de mantenimiento (incluyendo actualizar dependencias)
- docs: cambios de documentación
- ci: cambios de CI/CD (workflows, scripts)
- test: cambios de tests (incluyendo nuevos tests, o fixes de tests)
- refactor: cambios sin impacto funcional (style, performance, etc)

## Branches

1. Asegúrate de estar en la última versión de `main`:

```bash
git checkout main
git pull origin main
```

2. Crea una rama desde `main`, usando un prefijo de acuerdo al tipo de cambio. Por ejemplo:

- `feat/mas-secciones`
- `fix/error-subir-imagen`

```bash
git checkout -b feat/mi-nueva-funcionalidad
```

3. Realiza tus cambios y haz el commit:

```bash
git add .
git commit -m "feat: agrega nuevas secciones al dashboard"
git push --set-upstream origin feat/mi-nueva-funcionalidad
```

3. Abre un PR desde esa branch hacia `main`.
4. Una vez que tu PR sea aprobado, borra la rama desde la UI de GitHub.
