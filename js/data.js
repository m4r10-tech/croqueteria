/* ==========================================================
   Datos del local — edita aquí para actualizar la web.
   Fuente: ficha de Google Maps (octubre 2026).
   ========================================================== */
window.BAR = {
  nombre: "Bar Restaurante Croquetería",
  tipo: "Bar restaurante",
  direccion: "P.º Federico García Lorca, 10",
  cp: "45007",
  ciudad: "Toledo",
  barrio: "Santa María de Benquerencia (Polígono)",
  telefono: "925 97 37 47",
  telefonoLink: "+34925973747",
  plusCode: "V384+J3 Toledo",
  coords: { lat: 39.8665473, lng: -3.9448724 },
  zonaHoraria: "Europe/Madrid",

  // 0 = domingo … 6 = sábado. null = cerrado. Horas en formato "HH:MM" (24:00 = medianoche).
  horario: {
    0: ["08:00", "24:00"],
    1: ["08:00", "24:00"],
    2: null,
    3: ["08:00", "24:00"],
    4: ["08:00", "24:00"],
    5: ["08:00", "24:00"],
    6: ["08:00", "24:00"]
  },

  valoracion: {
    media: 4.1,
    total: 184,
    estrellas: { 5: 92, 4: 50, 3: 24, 2: 4, 1: 14 }
  },

  // Fragmentos destacados de reseñas públicas en Google.
  resenas: [
    { texto: "Muy buen servicio, buena cocina, las cervezas muy fresquitas.", autor: "Reseña en Google" },
    { texto: "Croquetas de variados sabores muy ricas.", autor: "Reseña en Google" },
    { texto: "Buen sitio para desayunar, tapear y un trato excelente.", autor: "Reseña en Google" },
    { texto: "Terraza amplia y techada. Los dueños son majísimos y muy detallistas.", autor: "Local Guide en Google" },
    { texto: "El wok de secreto ibérico y las croquetas de boletus están espectaculares.", autor: "Local Guide en Google" },
    { texto: "Una lista enorme de croquetas, unas 30 variedades. Una grata sorpresa.", autor: "Local Guide en Google" }
  ],

  /* ---------- CARTA ----------
     Variedades orientativas: la pizarra del día manda.
     Las marcadas con "destacada" aparecen en reseñas (boletus, secreto ibérico). */
  croquetas: [
    { nombre: "Jamón ibérico", foto: "jamon", desc: "La clásica de la abuela, con bechamel cremosa y jamón de bellota.", tags: ["clásica"], destacada: true },
    { nombre: "Boletus", foto: "boletus", desc: "Setas boletus con un toque de trufa. Las que más piden.", tags: ["vegetariana"], destacada: true },
    { nombre: "Cocido", foto: "cocido", desc: "Aprovechamiento del cocido: garbanzo, carne y tocino.", tags: ["clásica"] },
    { nombre: "Pollo asado", desc: "Pollo de corral desmigado con su jugo.", tags: ["clásica"] },
    { nombre: "Queso azul", desc: "Cabrales cremoso con nuez tostada.", tags: ["vegetariana", "intensa"] },
    { nombre: "Chipirón en su tinta", desc: "Negra, marinera y muy melosa.", tags: ["mar"] },
    { nombre: "Gambas al ajillo", desc: "Con un punto de guindilla.", tags: ["mar", "picante"] },
    { nombre: "Bacalao", desc: "Bacalao desalado y perejil fresco.", tags: ["mar"] },
    { nombre: "Cabrales con manzana", desc: "Contraste dulce y potente.", tags: ["vegetariana", "intensa"] },
    { nombre: "Queso de cabra y cebolla caramelizada", desc: "Suave, dulce y cremosa.", tags: ["vegetariana"] },
    { nombre: "Chorizo picante", desc: "Chorizo de la tierra con pimentón de la Vera.", tags: ["picante"] },
    { nombre: "Morcilla con piñones", desc: "Morcilla de Burgos y piñones tostados.", tags: ["intensa"] },
    { nombre: "Rabo de toro", desc: "Guiso de rabo deshuesado a fuego lento.", tags: ["intensa"] },
    { nombre: "Espinacas y piñones", desc: "Verde, ligera y crujiente.", tags: ["vegetariana"] },
    { nombre: "Atún con tomate", desc: "Sabor de merienda de toda la vida.", tags: ["mar"] },
    { nombre: "Jalapeño y queso", desc: "Para valientes.", tags: ["picante", "vegetariana"] },
    { nombre: "Carabinero", desc: "Bechamel de fumet de marisco.", tags: ["mar"] },
    { nombre: "Perdiz escabechada", desc: "Un guiño a la caza de Toledo.", tags: ["intensa"] },
    { nombre: "Queso manchego", desc: "Curado, de la tierra.", tags: ["vegetariana", "clásica"] },
    { nombre: "Calamares", desc: "Como un bocata de calamares, en croqueta.", tags: ["mar"] },
    { nombre: "Pisto manchego", desc: "Verduras de la huerta pochadas.", tags: ["vegetariana"] },
    { nombre: "Secreto ibérico", desc: "Inspirada en nuestro wok de secreto.", tags: ["intensa"], destacada: true },
    { nombre: "Carbonara", desc: "Panceta, yema y pimienta negra.", tags: ["clásica"] },
    { nombre: "Nutella", desc: "De postre. Sí, de postre.", tags: ["dulce", "vegetariana"] },
    { nombre: "Torrija", desc: "Leche, canela y azúcar. Postre en bocado.", tags: ["dulce", "vegetariana"] },
    { nombre: "Txangurro", desc: "Centollo a la donostiarra.", tags: ["mar"] },
    { nombre: "Puerros y gambas", desc: "Suave y marinera.", tags: ["mar"] },
    { nombre: "Calabaza y queso", desc: "Otoñal y cremosa.", tags: ["vegetariana"] },
    { nombre: "Sobrasada y miel", desc: "Dulce y salada a la vez.", tags: ["picante"] },
    { nombre: "Pulpo a feira", desc: "Pimentón y aceite de oliva.", tags: ["mar"] }
  ],

  carta: {
    "Raciones": [
      { nombre: "Wok de secreto ibérico", desc: "Salteado de secreto con verduras. De lo más comentado.", destacada: true },
      { nombre: "Ración de croquetas variadas", desc: "Elige sabores de la pizarra y mézclalos." },
      { nombre: "Patatas bravas", desc: "Con salsa brava de la casa y alioli." },
      { nombre: "Calamares a la andaluza", desc: "Rebozado fino y limón." },
      { nombre: "Oreja a la plancha", desc: "Crujiente, con pimentón." },
      { nombre: "Huevos rotos", desc: "Con jamón o con chistorra." },
      { nombre: "Tabla de ibéricos y queso", desc: "Para compartir en la terraza." },
      { nombre: "Ensalada de la casa", desc: "Fresca y completa." }
    ],
    "Bocadillos": [
      { nombre: "Bocadillo de calamares", desc: "El de siempre, con pan crujiente." },
      { nombre: "Bocadillo de lomo con queso", desc: "Lomo a la plancha y queso fundido." },
      { nombre: "Pepito de ternera", desc: "Con pimientos o a pelo." },
      { nombre: "Bocadillo de tortilla", desc: "Tortilla de patata recién hecha." },
      { nombre: "Serranito", desc: "Lomo, jamón y pimiento frito." },
      { nombre: "Montaditos variados", desc: "Para picar entre horas." }
    ],
    "Desayunos": [
      { nombre: "Tostada con tomate y aceite", desc: "Desde las 8:00 de la mañana." },
      { nombre: "Pincho de tortilla", desc: "Con el café, como debe ser." },
      { nombre: "Churros / porras", desc: "Según disponibilidad del día." },
      { nombre: "Café, cacao o infusión", desc: "Con leche de tu elección." },
      { nombre: "Zumo de naranja natural", desc: "Exprimido al momento." }
    ],
    "Bebidas": [
      { nombre: "Caña bien fresquita", desc: "Lo dicen las reseñas, no nosotros." },
      { nombre: "Vermú de grifo", desc: "Con su aceituna y su naranja." },
      { nombre: "Vinos de la tierra", desc: "D.O. La Mancha y Méntrida." },
      { nombre: "Refrescos y agua", desc: "Fríos de verdad." },
      { nombre: "Tinto de verano", desc: "Para las tardes de terraza." }
    ]
  },

  servicios: [
    { icono: "terrace", titulo: "Terraza amplia y techada", texto: "Al aire libre todo el año, con sombra en verano y cubierta cuando llueve." },
    { icono: "coffee", titulo: "Desayunos desde las 8:00", texto: "Café, tostadas y pincho de tortilla antes de ir al trabajo." },
    { icono: "croqueta", titulo: "Unas 30 variedades", texto: "Una de las listas de croquetas más largas de Toledo, hechas en casa." },
    { icono: "heart", titulo: "Trato familiar", texto: "Los dueños están detrás de la barra y se nota en cada detalle." }
  ],

  /* ---------- FOTOS ----------
     Fotos reales con licencia libre de Wikimedia Commons (ilustrativas, no son del local).
     Redimensionadas y, en el caso de la terraza, recortadas. Sustitúyelas por fotos
     propias del bar dejando el archivo en assets/img/ con el mismo nombre. */
  fotos: {
    croquetas: { alt: "Dos croquetas caseras en un plato blanco", autor: "Juan Emilio Prades Bel", licencia: "CC BY 4.0", licenciaUrl: "https://creativecommons.org/licenses/by/4.0/", fuente: "https://commons.wikimedia.org/wiki/File:Croquetas.jpg" },
    boletus: { alt: "Croquetas de boletus con patatas", autor: "Eduardo Milla", licencia: "CC BY-SA 4.0", licenciaUrl: "https://creativecommons.org/licenses/by-sa/4.0/", fuente: "https://commons.wikimedia.org/wiki/File:Croquetas_de_boletus.jpg" },
    surtido: { alt: "Plato con un surtido de croquetas", autor: "Tamorlan", licencia: "CC BY 3.0", licenciaUrl: "https://creativecommons.org/licenses/by/3.0/", fuente: "https://commons.wikimedia.org/wiki/File:Surtido_de_Croquetas.jpg" },
    jamon: { alt: "Croquetas de jamón pinchadas con un palillo", autor: "Tamorlan", licencia: "CC BY 3.0", licenciaUrl: "https://creativecommons.org/licenses/by/3.0/", fuente: "https://commons.wikimedia.org/wiki/File:Croquetas-Jam%C3%B3n-Riofr%C3%ADo.jpg" },
    cocido: { alt: "Croquetas de cocido con alioli en cazuela de barro", autor: "Juan Emilio Prades Bel", licencia: "CC BY-SA 4.0", licenciaUrl: "https://creativecommons.org/licenses/by-sa/4.0/", fuente: "https://commons.wikimedia.org/wiki/File:Croquetas_caseras_de_carne_de_cocido_con_allioli.jpg" },
    bocadillo: { alt: "Bocadillo de calamares", autor: "Tamorlan", licencia: "CC BY 3.0", licenciaUrl: "https://creativecommons.org/licenses/by/3.0/", fuente: "https://commons.wikimedia.org/wiki/File:Bocadillo_de_calamares-2009.jpg" },
    desayuno: { alt: "Café con leche y tostadas", autor: "Jorge Gonzalez", licencia: "CC BY-SA 2.0", licenciaUrl: "https://creativecommons.org/licenses/by-sa/2.0/", fuente: "https://commons.wikimedia.org/wiki/File:Caf%C3%A9_con_leche_and_tostadas.jpg" },
    cana: { alt: "Caña de cerveza con una tapa de sardina en la barra", autor: "Tamorlan", licencia: "CC BY 3.0", licenciaUrl: "https://creativecommons.org/licenses/by/3.0/", fuente: "https://commons.wikimedia.org/wiki/File:Sardina_y_Ca%C3%B1a_097.jpg" },
    terraza: { alt: "Terraza con mesas altas y taburetes", autor: "MottaW", licencia: "CC BY 4.0", licenciaUrl: "https://creativecommons.org/licenses/by/4.0/", fuente: "https://commons.wikimedia.org/wiki/File:M-terraza-la-rinconada-wamba-junio-2024-a.jpg" }
  },

  cercanos: [
    "Plaza Poeta Federico García Lorca",
    "Centro de Salud Benquerencia",
    "Avenida del Río Boladiez",
    "Recinto Ferial del Polígono"
  ]
};
