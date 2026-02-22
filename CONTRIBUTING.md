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

Esto garantiza que tu nueva rama partirá del estado más reciente del repositorio remoto.

> [!TIP]
> Si los comandos fallan porque ya habías hecho cambios localmente:
>
> ### Caso A: Aún no has hecho commit
>
> Puedes guardar temporalmente los cambios con `git stash`, actualizar `main` y luego recuperarlos:
>
> ```bash
> git stash
> git pull origin main
>
> # <aquí el comando solo del paso 2>
>
> git stash pop
> ```
>
> - `git stash` guarda los cambios en una pila temporal.
> - `git stash pop` los vuelve a aplicar sobre la rama actual.
>
> ### Caso B: Hiciste un commit directamente en `main` (y aún no lo has subido)
>
> Si hiciste un commit en `main` por error y quieres moverlo a una nueva rama:
>
> 1. Sigue solo el paso 2 para crear una nueva branch.
> 2. Vuelve a `main`:
>
> ```bash
> git checkout main
> ```
>
> 3. Quita el commit de `main` (asumiendo que es el último commit y no ha sido publicado):
>
> ```bash
> git reset --hard HEAD~1
> ```
>
> Con esto la nueva rama conserva el commit y `main` vuelve al estado anterior. No uses `--hard` si ya hiciste `git push`, ese caso necesitaría otra solución.

2. Crea una rama desde `main`, usando un prefijo de acuerdo al tipo de cambio. Por ejemplo:

- `feat/mas-secciones`
- `fix/error-subir-imagen`

```bash
git checkout -b feat/mi-nueva-funcionalidad
```

3. Realiza tus cambios y haz el commit:

```bash
git commit -am "feat: agrega nuevas secciones al dashboard"
git push --set-upstream origin feat/mi-nueva-funcionalidad
```

4. Abre un PR desde esa branch hacia `main`. Para esto, abre el repo en GitHub y te aparecerá una opción para abrir PR (pull request):
   > <img width="924" height="151" alt="imagen" src="https://github.com/user-attachments/assets/773d9eab-7542-425b-9f14-8673a14ab2c6" />

Al darle click, puedes ponerle una descripción o título describiendo los cambios. Luego "Create pull request".

> <img width="1068" height="657" alt="imagen" src="https://github.com/user-attachments/assets/da6ad280-c2f1-40b8-a36c-38bc7266cf40" />

5. Una vez que tu PR sea aprobado, borra la rama desde la UI de GitHub.
