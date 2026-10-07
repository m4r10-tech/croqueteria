# Croquetería · Toledo

Web del **Bar Restaurante Croquetería**, en el P.º Federico García Lorca, 10 (Santa María de Benquerencia, 45007 Toledo).

Web estática en HTML, CSS y JavaScript, sin dependencias ni compilación. Se puede abrir tal cual o publicar en GitHub Pages.

## Secciones

- **Inicio**: título animado, croquetas flotantes con parallax (se pueden "comer" con un clic) y estado en directo.
- **Cifras**: contadores animados (unas 30 variedades, 4,1★, 184 reseñas, 96 h abiertos a la semana).
- **¿Abierto?**: reloj analógico, cuenta atrás hasta el cierre o la apertura y barra del día, todo con la hora de Toledo (`Europe/Madrid`).
- **Horario**: la semana completa, con el día de hoy marcado y el martes como cerrado.
- **Carta**: pestañas, buscador, filtros, "ración mixta" para ir añadiendo croquetas y una ruleta que elige por ti.
- **Galería**: ilustraciones con visor ampliado.
- **Reseñas**: reparto de estrellas animado y carrusel (se puede deslizar en móvil).
- **Reservas**: formulario con validación, sin martes ni horas pasadas. Genera un resumen para confirmar por teléfono.
- **Cómo llegar**: mapa de Google, Plus Code, referencias cercanas y botón de ruta.

## Editar contenidos

Los textos y datos están en **`js/data.js`**: horario, teléfono, reseñas, croquetas, carta y servicios. Al cambiar el horario, el bloque de abierto/cerrado, la cuenta atrás y las horas de reserva se recalculan solos.

> La lista de croquetas y la carta son **orientativas**. Antes de publicar, revisa variedades y platos con el bar. Los datos de contacto, horario, dirección y valoraciones vienen de su ficha de Google Maps (octubre de 2026).

### Poner fotos reales

En `js/main.js`, cada elemento de `GALLERY` acepta una propiedad `img`:

```js
{ art: "terraza", img: "assets/img/terraza.jpg", t: "Terraza techada", s: "Amplia y a cubierto" }
```

Si hay `img`, se muestra la foto; si no, se muestra la ilustración.

## Probar en local

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

## Publicar en GitHub Pages

```bash
gh repo create croqueteria --public --source=. --push
gh api -X POST repos/{owner}/croqueteria/pages -f "source[branch]=main" -f "source[path]=/"
```

La web quedará en `https://<tu-usuario>.github.io/croqueteria/`.
