# Croquetería · Toledo

Web del **Bar Restaurante Croquetería**, en el P.º Federico García Lorca, 10 (Santa María de Benquerencia, 45007 Toledo).

Web estática en HTML, CSS y JavaScript, sin dependencias: no hace falta `npm install`.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Sirve el código fuente en http://127.0.0.1:5173 sin caché, ideal mientras editas |
| `npm run build` | Genera `dist/` con CSS/JS versionados por hash, lista para publicar |
| `npm run preview` | Sirve `dist/` en http://127.0.0.1:4173 (ejecuta antes `npm run build`) |
| `npm start` | `build` + `preview` de una vez |

Si el puerto está ocupado, se usa el siguiente libre. Para verla desde el móvil en la misma red: `HOST=0.0.0.0 npm run dev`.

## Secciones

- **Inicio**: título animado, croquetas flotantes con parallax (se pueden "comer" con un clic) y estado en directo.
- **Cifras**: contadores animados (unas 30 variedades, 4,1★, 184 reseñas, 96 h abiertos a la semana).
- **¿Abierto?**: reloj analógico, cuenta atrás hasta el cierre o la apertura y barra del día, todo con la hora de Toledo (`Europe/Madrid`).
- **Horario**: la semana completa, con el día de hoy marcado y el martes como cerrado.
- **Carta**: pestañas, buscador, filtros, "ración mixta" para ir añadiendo croquetas y una ruleta que elige por ti.
- **Galería**: fotos con visor ampliado y créditos.
- **Reseñas**: reparto de estrellas animado y carrusel (se puede deslizar en móvil).
- **Reservas**: formulario con validación, sin martes ni horas pasadas. Genera un resumen para confirmar por teléfono.
- **Cómo llegar**: mapa de Google, Plus Code, referencias cercanas y botón de ruta.

## Editar contenidos

Los textos y datos están en **`js/data.js`**: horario, teléfono, reseñas, croquetas, carta y servicios. Al cambiar el horario, el bloque de abierto/cerrado, la cuenta atrás y las horas de reserva se recalculan solos.

> La lista de croquetas y la carta son **orientativas**. Antes de publicar, revisa variedades y platos con el bar. Los datos de contacto, horario, dirección y valoraciones vienen de su ficha de Google Maps (octubre de 2026).

### Fotos

Las fotos de `assets/img/` son **fotos reales con licencia libre de Wikimedia Commons**, usadas como ilustración: **no son del local**. Cada foto lleva su autor y su licencia (CC BY / CC BY-SA) en `js/data.js` → `fotos`, y la web los muestra en "Créditos de las fotos". Mientras se usen, hay que mantener esos créditos.

Para poner fotos propias del bar, sustituye `assets/img/<nombre>.jpg` y `.webp`, manteniendo el nombre, y borra o cambia su entrada en `fotos`. Las fotos de Google Maps son de sus autores, así que no se pueden copiar sin su permiso.

## Publicar en GitHub Pages

Repositorio: https://github.com/m4r10-tech/croqueteria

Para activar GitHub Pages, sirviendo la rama `main` desde la raíz:

```bash
gh api -X POST repos/m4r10-tech/croqueteria/pages -f "source[branch]=main" -f "source[path]=/"
```

La web quedará en `https://m4r10-tech.github.io/croqueteria/`.
