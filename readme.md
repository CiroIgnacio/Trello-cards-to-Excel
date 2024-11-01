# Trello Cards to Excel

Exporta tarjetas de Trello a Excel con opciones de filtrado por fecha, etiquetas y estado.

## Requisitos
- Node.js v16 o superior
- npm

## Instalación
1. Clonar el repositorio
2. Ejecutar `npm install`
3. Copiar `.env.example` a `.env` y configurar las credenciales de Trello

## Uso
- Versión interactiva: `run-interactive.bat`
- Versión completa: `run-full.bat`

## Variables de Entorno
```env
TRELLO_API_KEY=your_api_key
TRELLO_API_TOKEN=your_api_token
TRELLO_API_SECRET=your_api_secret
TRELLO_BOARD_IDS={"board1":"board1_id"}