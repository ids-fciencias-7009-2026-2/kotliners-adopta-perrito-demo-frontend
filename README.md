## Adopta perrito - Frontend

Este es un proyecto frontend desarrollado con [Next.js](https://nextjs.org), inicializado usando [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). Forma parte de una arquitectura separada donde el frontend consume una API REST del backend.

## Tecnología utilizada

- Next.js 
- React
- Node (Para ejecutar el proyecto y manejar dependencias)
- Next/font (de vercel y maneja fuentes de forma optimizada)

## Requisitos previos
- Node.js >= 18
- npm, yarn, pnpm o bun
- PostgreSQL

## Instalación de dependencias y ejecución 

1. Clonar el repositorio:
   ```bash
    git clone 
    cd 
    ```
2. Instalar dependencias:
   Con npm
    ```bash
    npm install
    ```
    Con yarn
   ```bash
    yarn install
   ```
    Con pnpm
   ```bash
    pnpm install
   ```
    Con bun
   ```bash
    bun install
    ```

    Instalación de PostgreSQL:
   Para Linux:
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```
   Para MacOs:
   ```bash
    brew install postgresql
    brew services start postgresql
   ```
   Para Windows:
   1) Descargar instalador en: [PostgreSQL](https://www.postgresql.org/download/windows/)
   2) Descargar el instalador de EnterpriseDB
   3) Ejecutar instalación

3. Ejecutar el servidor de desarrollo:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Abrir en el navegador: 

```bash
http://localhost:3000
```

Se puede editar la aplicación modificando el archivo `app/page.tsx`, la página se actualizará automáticamente conforme se hagan cambios.

Para ejecutar el script de SQL: 

```bash
psql -U <usuario> -d postgres -f database/schema.sql
```
