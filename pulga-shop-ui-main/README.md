# Pulga Shop UI

Paquete con Tema y Componentes de MaterialUI para Pulga Shop.

## Instalar

Para instalar el paquete:

```bash
npm install pulga-shop-ui
```

## Tema

Para usar el tema:

```ts
// main.tsx

import { getPulgaTheme } from "pulga-shop-ui";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={getPulgaTheme()}>
    <CssBaseline />
    <App />
  </ThemeProvider>
);
```

## Recomendaciones

La plantilla para Pulga Shop contenía una mezcla de CSS, Tailwind y MUI. Se recomienda aplicar la mayoría de los estilos con MUI para garantizar un diseño consistente y facilitar el mantenimiento.

## Contribuir

El proyecto está abierto a contribuciones. Si se repiten componentes a través de los distintos clientes de Pulga Shop, entonces es buena idea incluirlos aquí.

## Para añadir

- [ ] Sobrescribir estilos pasando un tema: `getPulgaTheme(customTheme)`.
- [ ] Incluir logo en formato SVG.

### Build

```bash
npm run build
```
