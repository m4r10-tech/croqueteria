/* ==========================================================
   Croquetería · Toledo — interacciones
   ========================================================== */
(() => {
  "use strict";

  const BAR = window.BAR;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const pad = (n) => String(n).padStart(2, "0");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
  const fmtHour = (hhmm) => (hhmm === "24:00" ? "24:00" : hhmm.replace(/^0/, ""));

  const store = {
    get(key, fallback) { try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* sin almacenamiento */ } }
  };

  /* ---------- Fotos ---------- */
  function pic(key, { eager = false, sizes = "100vw" } = {}) {
    const f = BAR.fotos[key];
    if (!f) return "";
    return `<picture><source type="image/webp" srcset="assets/img/${key}.webp" sizes="${sizes}" />` +
      `<img src="assets/img/${key}.jpg" alt="${f.alt}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" /></picture>`;
  }

  /* ---------- Toast ---------- */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2800);
  }

  /* ==========================================================
     HORA DE TOLEDO Y ESTADO ABIERTO / CERRADO
     ========================================================== */
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: BAR.zonaHoraria, weekday: "short", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
  });
  const WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function madridNow() {
    const p = Object.fromEntries(dtf.formatToParts(new Date()).map((x) => [x.type, x.value]));
    const h = Number(p.hour) % 24, m = Number(p.minute), s = Number(p.second);
    return {
      day: WD[p.weekday], h, m, s,
      secOfDay: h * 3600 + m * 60 + s,
      iso: `${p.year}-${p.month}-${p.day}`
    };
  }

  function getStatus(now = madridNow()) {
    const today = BAR.horario[now.day];
    const sec = now.secOfDay;
    if (today) {
      const o = toMin(today[0]) * 60, c = toMin(today[1]) * 60;
      if (sec >= o && sec < c) {
        const left = c - sec;
        return { open: true, soon: left <= 3600, seconds: left, closeAt: today[1] };
      }
      if (sec < o) {
        return { open: false, soon: o - sec <= 3600, seconds: o - sec, openDay: now.day, openAt: today[0], offset: 0 };
      }
    }
    for (let d = 1; d <= 7; d++) {
      const day = (now.day + d) % 7;
      const sch = BAR.horario[day];
      if (sch) {
        const secs = d * 86400 + toMin(sch[0]) * 60 - sec;
        return { open: false, soon: secs <= 3600, seconds: secs, openDay: day, openAt: sch[0], offset: d };
      }
    }
    return { open: false, soon: false, seconds: 0 };
  }

  function whenText(st) {
    if (st.offset === 0) return `hoy a las ${fmtHour(st.openAt)}`;
    if (st.offset === 1) return `mañana a las ${fmtHour(st.openAt)}`;
    return `el ${DAYS[st.openDay]} a las ${fmtHour(st.openAt)}`;
  }

  const pills = ["#navStatus", "#heroStatus", "#footStatus"].map((s) => $(s));
  const live = $("#estado");
  const liveTitle = $("#liveTitle"), liveSub = $("#liveSub"), cdLabel = $("#cdLabel");
  const cd = { h: $("#cdH"), m: $("#cdM"), s: $("#cdS") };
  let lastStateKey = "";

  function setCd(el, val) {
    if (el.textContent !== val) {
      el.textContent = val;
      if (!reduceMotion) { el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); }
    }
  }

  function updateStatus() {
    const now = madridNow();
    const st = getStatus(now);
    const cls = st.open ? (st.soon ? "is-soon" : "is-open") : (st.soon ? "is-soon" : "is-closed");
    const short = st.open
      ? (st.soon ? "Cierra pronto" : "Abierto ahora")
      : (st.soon ? "Abre pronto" : "Cerrado ahora");

    pills.forEach((p, i) => {
      p.className = `status-pill${i === 1 ? " status-pill--lg" : ""} ${cls}`;
      const label = i === 1
        ? (st.open ? `${short} · hasta las ${fmtHour(st.closeAt)}` : `${short} · abre ${whenText(st)}`)
        : short;
      $("b", p).textContent = label;
    });

    const key = `${st.open}-${st.soon}-${st.openDay}`;
    if (key !== lastStateKey) {
      lastStateKey = key;
      live.classList.toggle("is-closed", !st.open);
      if (st.open) {
        liveTitle.innerHTML = st.soon ? `Sí, pero <em class="soon">date prisa</em>` : `Sí, estamos <em class="ok">abiertos</em>`;
        liveSub.textContent = `Hoy servimos hasta las ${fmtHour(st.closeAt)}. Acércate, que las croquetas no se comen solas.`;
        cdLabel.textContent = "para el cierre de hoy";
      } else {
        liveTitle.innerHTML = st.soon ? `Casi, <em class="soon">abrimos ya</em>` : `Ahora mismo <em class="ko">cerrado</em>`;
        liveSub.textContent = now.day === 2 && BAR.horario[2] === null
          ? `Los martes descansamos. Volvemos ${whenText(st)}.`
          : `Volvemos ${whenText(st)}. Mientras tanto, echa un ojo a la carta.`;
        cdLabel.textContent = "para que volvamos a abrir";
      }
    }

    const t = st.seconds;
    setCd(cd.h, pad(Math.floor(t / 3600)));
    setCd(cd.m, pad(Math.floor((t % 3600) / 60)));
    setCd(cd.s, pad(t % 60));

    updateClock(now);
    updateDaybar(now);
  }

  /* Reloj analógico */
  const ticks = $("#clockTicks");
  for (let i = 0; i < 60; i++) {
    const big = i % 5 === 0;
    const a = (i / 60) * Math.PI * 2;
    const r1 = big ? 74 : 79, r2 = 84;
    const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
    l.setAttribute("x1", 100 + r1 * Math.sin(a)); l.setAttribute("y1", 100 - r1 * Math.cos(a));
    l.setAttribute("x2", 100 + r2 * Math.sin(a)); l.setAttribute("y2", 100 - r2 * Math.cos(a));
    l.setAttribute("class", `clock__tick${big ? " clock__tick--big" : ""}`);
    ticks.appendChild(l);
  }
  const hands = { h: $("#clockH"), m: $("#clockM"), s: $("#clockS") };
  const arc = $("#clockArc");
  function updateClock(now) {
    const sDeg = now.s * 6;
    const mDeg = now.m * 6 + now.s * 0.1;
    const hDeg = (now.h % 12) * 30 + now.m * 0.5;
    hands.h.setAttribute("transform", `rotate(${hDeg} 100 100)`);
    hands.m.setAttribute("transform", `rotate(${mDeg} 100 100)`);
    hands.s.setAttribute("transform", `rotate(${sDeg} 100 100)`);
    // Arco exterior: parte del día transcurrida (24 h).
    const frac = Math.min(now.secOfDay / 86400, 0.9999);
    const ang = frac * Math.PI * 2, r = 95;
    const x = 100 + r * Math.sin(ang), y = 100 - r * Math.cos(ang);
    arc.setAttribute("d", `M 100 ${100 - r} A ${r} ${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  /* Barra del día */
  const dayOpen = $("#daybarOpen"), dayNow = $("#daybarNow");
  function updateDaybar(now) {
    const sch = BAR.horario[now.day];
    if (sch) {
      const o = toMin(sch[0]), c = toMin(sch[1]);
      dayOpen.style.left = `${(o / 1440) * 100}%`;
      dayOpen.style.width = `${((c - o) / 1440) * 100}%`;
    } else {
      dayOpen.style.width = "0";
    }
    dayNow.style.left = `${(now.secOfDay / 86400) * 100}%`;
  }

  /* ==========================================================
     HORARIO SEMANAL
     ========================================================== */
  function renderSchedule() {
    const today = madridNow().day;
    $("#schedule").innerHTML = WEEK_ORDER.map((d) => {
      const sch = BAR.horario[d];
      const top = sch ? (toMin(sch[0]) / 1440) * 100 : 0;
      const h = sch ? ((toMin(sch[1]) - toMin(sch[0])) / 1440) * 100 : 0;
      return `<div class="day reveal${sch ? "" : " day--closed"}${d === today ? " day--today" : ""}">
        <span class="day__name">${DAYS[d]}</span>
        <span class="day__hours">${sch ? `${fmtHour(sch[0])} – ${fmtHour(sch[1])}` : "Cerrado"}</span>
        <div class="day__bar"><i style="top:${top}%;height:${h}%"></i></div>
      </div>`;
    }).join("");
  }

  /* ==========================================================
     HERO: título, croquetas flotantes, parallax
     ========================================================== */
  function splitTitle() {
    const title = $("#heroTitle");
    const frag = document.createDocumentFragment();
    let i = 0;
    const wrap = (node) => {
      const w = document.createElement("span"); w.className = "word";
      const inner = document.createElement("span");
      inner.style.transitionDelay = `${0.15 + i++ * 0.09}s`;
      inner.appendChild(node); w.appendChild(inner);
      return w;
    };
    [...title.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(" "));
          else frag.appendChild(wrap(document.createTextNode(part)));
        });
      } else {
        frag.appendChild(wrap(n.cloneNode(true)));
      }
    });
    title.textContent = "";
    title.appendChild(frag);
  }

  const floating = $("#floating");
  let eaten = store.get("croq-eaten", 0);
  const eatenEl = $("#eaten");
  eatenEl.textContent = eaten;
  const EAT_MSGS = ["¡Ñam! 😋", "Otra más…", "Crujiente por fuera, cremosa por dentro", "¿Te pedimos una ración?", "Esta era de boletus", "¡Glotón/a!"];

  function spawnCroquetas() {
    const wide = window.matchMedia("(min-width: 1081px)").matches;
    const spots = wide
      ? [[48, 14, 0.8], [52, 97, 1.1], [94, 88, 0.9], [47, 88, 0.7], [62, 6, 0.6], [97, 8, 0.6], [52, 40, 0.5], [86, 96, 0.5]]
      : [[72, 18, 1.2], [86, 42, 0.9], [64, 62, 1.5], [90, 78, 0.8], [52, 85, 1], [78, 6, 0.7], [40, 12, 0.6], [95, 22, 0.6]];
    floating.innerHTML = "";
    spots.forEach(([x, y, s], i) => {
      const c = document.createElement("span");
      c.className = "croq";
      c.dataset.depth = s;
      c.style.cssText = `left:${x}%;top:${y}%;width:${80 * s}px;height:${42 * s}px;--rot:${-30 + Math.random() * 60}deg;`;
      c.style.transform = `rotate(var(--rot))`;
      c.title = "Cómeme";
      if (!reduceMotion) c.animate(
        [{ translate: "0 0" }, { translate: `0 ${-12 - i * 2}px` }, { translate: "0 0" }],
        { duration: 4000 + i * 600, iterations: Infinity, easing: "ease-in-out" }
      );
      c.addEventListener("click", () => {
        c.classList.add("is-eaten");
        eaten++; store.set("croq-eaten", eaten);
        eatenEl.textContent = eaten;
        toast(`${EAT_MSGS[(eaten - 1) % EAT_MSGS.length]} (${eaten} comida${eaten === 1 ? "" : "s"})`);
        setTimeout(() => { c.classList.remove("is-eaten"); }, 4000);
      });
      floating.appendChild(c);
    });
  }

  const heroPhotos = $("#heroPhotos");
  function parallax() {
    if (reduceMotion || !finePointer) return;
    let mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
    (function loop() {
      cx += (mx - cx) * 0.06; cy += (my - cy) * 0.06;
      if (window.scrollY < window.innerHeight) {
        if (heroPhotos) heroPhotos.style.translate = `${cx * -24}px ${cy * -18 + window.scrollY * -0.12}px`;
        $$(".croq", floating).forEach((c) => {
          const d = Number(c.dataset.depth);
          c.style.transform = `translate(${cx * 60 * d}px, ${cy * 60 * d + window.scrollY * 0.25 * d}px) rotate(var(--rot))`;
        });
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Marquee ---------- */
  function renderMarquee() {
    const names = BAR.croquetas.map((c) => c.nombre);
    const html = names.map((n) => `<span>${n}</span>`).join("");
    $("#marquee").innerHTML = html + html;
  }

  /* ==========================================================
     CONTADORES ANIMADOS
     ========================================================== */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const dec = Number(el.dataset.decimals || 0);
    const prefix = el.dataset.prefix || "";
    const dur = 2000;
    const fmt = (v) => prefix + v.toLocaleString("es-ES", { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (reduceMotion) { el.textContent = fmt(target); return; }
    const start = performance.now();
    (function step(t) {
      const p = Math.min((t - start) / dur, 1);
      const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = fmt(target * e);
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  /* ==========================================================
     REVEAL ON SCROLL
     ========================================================== */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add("is-in");
      if (el.dataset.count) animateCount(el);
      if (el.id === "bars") fillBars();
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

  function observeAll() {
    $$(".reveal:not(.is-in)").forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 0.08}s`;
      io.observe(el);
    });
    $$("[data-count]").forEach((el) => io.observe(el));
    io.observe($("#schedule"));
    io.observe($("#bars"));
  }

  /* ==========================================================
     SERVICIOS + TILT
     ========================================================== */
  const ICONS = {
    terrace: '<svg viewBox="0 0 24 24"><path d="M3 9 12 4l9 5"/><path d="M5 9v11M19 9v11M3 20h18"/><path d="M9 20v-5h6v5"/></svg>',
    coffee: '<svg viewBox="0 0 24 24"><path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>',
    croqueta: '<span class="croq"></span>'
  };
  function renderServices() {
    $("#services").innerHTML = BAR.servicios.map((s) => `
      <article class="card reveal">
        <div class="card__icon">${ICONS[s.icono]}</div>
        <h3>${s.titulo}</h3>
        <p>${s.texto}</p>
      </article>`).join("");
    if (!finePointer || reduceMotion) return;
    $$(".card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(700px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ==========================================================
     CARTA
     ========================================================== */
  const FILTERS = ["todas", "destacadas", "clásica", "vegetariana", "mar", "picante", "intensa", "dulce"];
  let activeFilter = "todas";
  let query = "";
  const plate = new Map();

  function renderTabs() {
    const names = ["Croquetas", ...Object.keys(BAR.carta)];
    $("#menuTabs").innerHTML = names.map((n, i) =>
      `<button class="tab" role="tab" type="button" aria-selected="${i === 0}" data-tab="${n}">${n}</button>`).join("");
    $("#menuTabs").addEventListener("click", (e) => {
      const btn = e.target.closest(".tab");
      if (!btn) return;
      $$(".tab").forEach((t) => t.setAttribute("aria-selected", String(t === btn)));
      const tab = btn.dataset.tab;
      const isCroq = tab === "Croquetas";
      $("#panelCroquetas").hidden = !isCroq;
      $("#panelOtros").hidden = isCroq;
      if (isCroq) renderCroquetas();
      else renderDishes(tab);
    });
  }

  function renderFilters() {
    $("#croqFilters").innerHTML = FILTERS.map((f) =>
      `<button class="chip${f === activeFilter ? " is-active" : ""}" type="button" data-filter="${f}">${f[0].toUpperCase() + f.slice(1)}</button>`).join("");
  }

  function renderCroquetas() {
    const q = norm(query.trim());
    const list = BAR.croquetas.filter((c) => {
      const okFilter = activeFilter === "todas" || (activeFilter === "destacadas" ? c.destacada : c.tags.includes(activeFilter));
      const okQuery = !q || norm(`${c.nombre} ${c.desc} ${c.tags.join(" ")}`).includes(q);
      return okFilter && okQuery;
    });
    $("#croqGrid").innerHTML = list.map((c, i) => {
      const n = plate.get(c.nombre) || 0;
      return `<article class="croq-card" style="animation-delay:${Math.min(i, 12) * 35}ms" data-name="${c.nombre}">
        ${c.foto ? `<span class="croq-photo">${pic(c.foto, { sizes: "64px" })}</span>` : '<span class="croq" aria-hidden="true"></span>'}
        ${c.destacada ? '<span class="badge">★ Top</span>' : ""}
        <h3>${c.nombre}</h3>
        <p>${c.desc}</p>
        <div class="tags">${c.tags.map((t) => `<span class="tag tag--${norm(t)}">${t}</span>`).join("")}</div>
        <button class="add" type="button" aria-label="Añadir ${c.nombre} a la ración">+</button>
        ${n ? `<span class="add-count">${n}</span>` : ""}
      </article>`;
    }).join("");
    $("#croqEmpty").hidden = list.length > 0;
  }

  function renderDishes(cat) {
    $("#dishList").innerHTML = BAR.carta[cat].map((d, i) => `
      <div class="dish" style="animation-delay:${i * 50}ms">
        <h3>${d.nombre}${d.destacada ? ' <span class="badge">★ Top</span>' : ""}</h3>
        <p>${d.desc}</p>
      </div>`).join("");
  }

  function renderPlate() {
    const total = [...plate.values()].reduce((a, b) => a + b, 0);
    $("#plate").classList.toggle("is-visible", total > 0);
    requestAnimationFrame(() => window.dispatchEvent(new Event("scroll")));
    const vis = $("#plateVisual");
    const want = Math.min(total, 10);
    while (vis.children.length > want) vis.lastChild.remove();
    while (vis.children.length < want) {
      const k = vis.children.length;
      const it = document.createElement("span");
      it.className = "plate__item";
      const ang = k * 2.4, rad = 4 + (k % 4) * 3.5;
      it.style.left = `${25 + Math.cos(ang) * rad * 1.4}px`;
      it.style.top = `${16 + Math.sin(ang) * rad * 0.7}px`;
      it.style.setProperty("--r", `${(k * 47) % 180}deg`);
      it.style.transform = "rotate(var(--r))";
      vis.appendChild(it);
    }
    $("#plateText").textContent = total
      ? `${total} croqueta${total === 1 ? "" : "s"}: ` + [...plate].map(([k, v]) => `${k}${v > 1 ? ` ×${v}` : ""}`).join(", ")
      : "Toca el + de las croquetas para añadirlas.";
  }

  function setupMenu() {
    renderTabs();
    renderFilters();
    renderCroquetas();

    $("#croqFilters").addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      activeFilter = chip.dataset.filter;
      renderFilters();
      renderCroquetas();
    });
    $("#croqSearch").addEventListener("input", (e) => { query = e.target.value; renderCroquetas(); });

    $("#croqGrid").addEventListener("click", (e) => {
      const btn = e.target.closest(".add");
      if (!btn) return;
      const card = btn.closest(".croq-card");
      const name = card.dataset.name;
      const total = [...plate.values()].reduce((a, b) => a + b, 0);
      if (total >= 24) { toast("¡Ración completa! 24 croquetas es mucha croqueta 😅"); return; }
      plate.set(name, (plate.get(name) || 0) + 1);
      let badge = $(".add-count", card);
      if (!badge) { badge = document.createElement("span"); badge.className = "add-count"; card.appendChild(badge); }
      badge.textContent = plate.get(name);
      btn.classList.remove("is-bump"); void btn.offsetWidth; btn.classList.add("is-bump");
      renderPlate();
    });
    $("#plateClear").addEventListener("click", () => {
      plate.clear(); renderPlate(); renderCroquetas(); toast("Ración vaciada");
    });

    // Ruleta
    const rBtn = $("#rouletteBtn"), rWin = $(".roulette__window"), rText = $("#rouletteText");
    rBtn.addEventListener("click", () => {
      if (rBtn.disabled) return;
      rBtn.disabled = true;
      const names = BAR.croquetas.map((c) => c.nombre);
      const final = names[Math.floor(Math.random() * names.length)];
      const finish = () => {
        rWin.classList.remove("is-spinning");
        rText.textContent = final;
        rBtn.disabled = false;
        rBtn.textContent = "Otra vez";
        toast(`Hoy toca: ${final}`);
        burst(window.innerWidth / 2, rWin.getBoundingClientRect().top + 30, 40);
      };
      if (reduceMotion) { finish(); return; }
      rWin.classList.add("is-spinning");
      let delay = 50, elapsed = 0;
      (function spin() {
        rText.textContent = names[Math.floor(Math.random() * names.length)];
        elapsed += delay;
        if (elapsed > 2200) return finish();
        delay *= 1.08;
        setTimeout(spin, delay);
      })();
    });
  }

  /* ==========================================================
     GALERÍA (ilustraciones SVG; cambia por fotos en data.js)
     ========================================================== */
  const ART = {
    plato: `<svg class="art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="gp" cx=".5" cy=".5"><stop offset="0" stop-color="#fffaf0"/><stop offset=".8" stop-color="#efe2c9"/><stop offset="1" stop-color="#d9c6a4"/></radialGradient><radialGradient id="gc" cx=".35" cy=".3"><stop offset="0" stop-color="#f5bd60"/><stop offset=".6" stop-color="#d5852a"/><stop offset="1" stop-color="#9b5016"/></radialGradient></defs><rect width="400" height="300" fill="#5a3520"/><circle cx="60" cy="40" r="90" fill="#6b4128"/><ellipse cx="200" cy="160" rx="150" ry="110" fill="url(#gp)"/><g fill="url(#gc)"><rect x="110" y="110" width="90" height="46" rx="23" transform="rotate(-20 155 133)"/><rect x="200" y="100" width="90" height="46" rx="23" transform="rotate(15 245 123)"/><rect x="130" y="170" width="90" height="46" rx="23" transform="rotate(8 175 193)"/><rect x="215" y="165" width="90" height="46" rx="23" transform="rotate(-12 260 188)"/><rect x="165" y="135" width="80" height="42" rx="21" transform="rotate(30 205 156)"/></g><g fill="#f7d690" opacity=".8"><circle cx="140" cy="125" r="3"/><circle cx="250" cy="115" r="3"/><circle cx="175" cy="195" r="3"/><circle cx="270" cy="185" r="3"/><circle cx="205" cy="150" r="2.5"/></g><path d="M300 90c20-10 40 0 40 0" stroke="#7dbf6e" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`,
    terraza: `<svg class="art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><rect width="400" height="300" fill="#a7d8d4"/><circle cx="330" cy="60" r="34" fill="#f5c46b"/><rect y="200" width="400" height="100" fill="#d8c3a0"/><path d="M20 110h360l-20-40H40z" fill="#1f8a8f"/><path d="M20 110h360v10H20z" fill="#156a6e"/><g fill="#fff" opacity=".35"><path d="M60 70h30l-6 40H50zM150 70h30l-3 40h-30zM240 70h30l3 40h-30zM330 70h20l10 40h-30z"/></g><rect x="40" y="110" width="8" height="100" fill="#5a3520"/><rect x="352" y="110" width="8" height="100" fill="#5a3520"/><g fill="#5a3520"><ellipse cx="130" cy="200" rx="45" ry="8"/><rect x="127" y="200" width="6" height="45"/><ellipse cx="270" cy="200" rx="45" ry="8"/><rect x="267" y="200" width="6" height="45"/></g><g fill="#2b1a10"><rect x="80" y="205" width="22" height="40" rx="4"/><rect x="160" y="205" width="22" height="40" rx="4"/><rect x="220" y="205" width="22" height="40" rx="4"/><rect x="300" y="205" width="22" height="40" rx="4"/></g><rect x="115" y="180" width="12" height="20" rx="2" fill="#f5c46b"/><rect x="280" y="182" width="12" height="18" rx="2" fill="#f5c46b"/></svg>`,
    cana: `<svg class="art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><rect width="400" height="300" fill="#2b1a10"/><circle cx="200" cy="150" r="130" fill="#3a2517"/><path d="M150 70h100l-10 190h-80z" fill="#f2b33d"/><path d="M150 70h100l-2 40h-96z" fill="#fff8e7"/><circle cx="165" cy="70" r="16" fill="#fff8e7"/><circle cx="195" cy="64" r="20" fill="#fff8e7"/><circle cx="228" cy="68" r="17" fill="#fff8e7"/><g fill="#fff" opacity=".6"><circle cx="185" cy="180" r="3"/><circle cx="205" cy="210" r="2"/><circle cx="215" cy="160" r="2.5"/><circle cx="190" cy="235" r="2"/></g><path d="M165 120l8 130" stroke="#fff" stroke-width="5" opacity=".35" stroke-linecap="round"/></svg>`,
    desayuno: `<svg class="art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><rect width="400" height="300" fill="#f3d9a8"/><ellipse cx="160" cy="200" rx="110" ry="30" fill="#fffaf0"/><path d="M100 120h120v60a40 40 0 0 1-40 40h-40a40 40 0 0 1-40-40z" fill="#fffaf0"/><path d="M220 140h14a20 20 0 0 1 0 40h-14" stroke="#fffaf0" stroke-width="10" fill="none"/><ellipse cx="160" cy="122" rx="58" ry="10" fill="#7a4a2a"/><path d="M135 100c0-12 12-12 12-24M165 100c0-12 12-12 12-24" stroke="#fffaf0" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/><rect x="250" y="170" width="120" height="70" rx="14" fill="#e3a24a" transform="rotate(-8 310 205)"/><rect x="258" y="160" width="104" height="30" rx="10" fill="#d64545" opacity=".8" transform="rotate(-8 310 175)"/><g fill="#2e9e5b"><circle cx="290" cy="170" r="4"/><circle cx="330" cy="164" r="4"/></g></svg>`,
    bocadillo: `<svg class="art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><rect width="400" height="300" fill="#1f8a8f"/><circle cx="320" cy="250" r="140" fill="#22979c"/><g transform="rotate(-10 200 150)"><path d="M60 150c0-35 60-50 140-50s140 15 140 50z" fill="#e0a548"/><g fill="#f6d690"><ellipse cx="120" cy="120" rx="12" ry="4"/><ellipse cx="180" cy="110" rx="12" ry="4"/><ellipse cx="240" cy="112" rx="12" ry="4"/></g><path d="M58 150h284v12H58z" fill="#7dbf6e"/><path d="M62 162h276l-6 14H68z" fill="#c76b4a"/><path d="M60 176h280c0 26-60 34-140 34S60 202 60 176z" fill="#d18f38"/></g></svg>`,
    fachada: `<svg class="art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><rect width="400" height="300" fill="#cfe6ea"/><rect x="30" y="70" width="340" height="200" fill="#1f8a8f"/><rect x="30" y="70" width="340" height="40" fill="#2b1a10"/><text x="200" y="98" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#f5c46b">CROQUETERÍA</text><g fill="#bfe3e6" opacity=".9"><rect x="55" y="130" width="90" height="90" rx="6"/><rect x="255" y="130" width="90" height="90" rx="6"/></g><rect x="170" y="130" width="60" height="140" rx="4" fill="#2b1a10"/><circle cx="220" cy="200" r="3" fill="#f5c46b"/><rect y="270" width="400" height="30" fill="#b8a98f"/><g fill="#e2a23b"><rect x="70" y="170" width="30" height="16" rx="8" transform="rotate(-15 85 178)"/><rect x="290" y="180" width="30" height="16" rx="8" transform="rotate(12 305 188)"/></g></svg>`
  };
  const GALLERY = [
    { foto: "surtido", art: "plato", t: "La especialidad", s: "Unas 30 variedades de croqueta" },
    { foto: "terraza", art: "terraza", t: "Tardes de terraza", s: "Amplia y a cubierto" },
    { foto: "cana", art: "cana", t: "Cañas fresquitas", s: "Con su tapa" },
    { foto: "boletus", art: "plato", t: "Croquetas de boletus", s: "De las más pedidas" },
    { foto: "desayuno", art: "desayuno", t: "Desayunos", s: "Desde las 8:00" },
    { foto: "bocadillo", art: "bocadillo", t: "Bocadillos", s: "Como el de calamares" }
  ];
  function tileArt(g, big = false) { return g.foto && BAR.fotos[g.foto] ? pic(g.foto, { sizes: big ? "100vw" : "(max-width: 600px) 100vw, 50vw" }) : ART[g.art]; }
  function renderGallery() {
    $("#gallery").innerHTML = GALLERY.map((g, i) => `
      <button class="tile reveal" type="button" data-i="${i}" aria-label="Ampliar: ${g.t}">
        <div class="tile__art">${tileArt(g)}</div>
        <div class="tile__caption"><strong>${g.t}</strong><small>${g.s}</small></div>
      </button>`).join("");
    $("#gallery").addEventListener("click", (e) => {
      const tile = e.target.closest(".tile");
      if (!tile) return;
      const g = GALLERY[tile.dataset.i];
      openModal(`<div class="lightbox"><div class="tile__art">${tileArt(g, true)}</div></div>
        <div class="lightbox__caption"><strong>${g.t}</strong><span>${g.s}</span>${g.foto ? `<small>Foto: ${BAR.fotos[g.foto].autor} · ${BAR.fotos[g.foto].licencia}</small>` : ""}</div>`, true);
    });
  }

  function setupCredits() {
    $$("[data-credits]").forEach((b) => b.addEventListener("click", () => {
      const rows = Object.entries(BAR.fotos).map(([k, f]) => `
        <li>
          <span class="credit__thumb">${pic(k, { sizes: "56px" })}</span>
          <span><strong>${f.alt}</strong><br />
          <a href="${f.fuente}" target="_blank" rel="noopener">${f.autor}</a> ·
          <a href="${f.licenciaUrl}" target="_blank" rel="noopener">${f.licencia}</a></span>
        </li>`).join("");
      openModal(`<div class="credits">
        <p class="eyebrow">Créditos</p>
        <h3 id="modalTitle">Fotos de la web</h3>
        <p>Fotos reales de Wikimedia Commons con licencia libre, usadas como ilustración (no son del local). Han sido redimensionadas y, en algún caso, recortadas.</p>
        <ul class="credit-list">${rows}</ul>
      </div>`);
    }));
  }

  /* ==========================================================
     RESEÑAS
     ========================================================== */
  function renderBars() {
    const { estrellas, total } = BAR.valoracion;
    $("#bars").innerHTML = [5, 4, 3, 2, 1].map((s) => `
      <div class="bar"><span>${s}★</span><div class="bar__track"><div class="bar__fill" data-w="${(estrellas[s] / total) * 100}"></div></div><span>${estrellas[s]}</span></div>`).join("");
  }
  function fillBars() {
    $$(".bar__fill").forEach((b, i) => setTimeout(() => { b.style.width = `${b.dataset.w}%`; }, i * 120));
  }

  function setupSlider() {
    const slider = $("#slider"), dots = $("#dots");
    slider.innerHTML = BAR.resenas.map((r, i) => `
      <figure class="quote${i === 0 ? " is-active" : ""}" aria-hidden="${i !== 0}">
        <blockquote>${r.texto}</blockquote>
        <cite>— ${r.autor} · <span class="stars" style="--rating:5"></span></cite>
      </figure>`).join("");
    dots.innerHTML = BAR.resenas.map((_, i) => `<button type="button" aria-label="Reseña ${i + 1}"${i === 0 ? ' class="is-active"' : ""}></button>`).join("");
    const quotes = $$(".quote", slider), dotBtns = $$("button", dots);
    let cur = 0, timer;
    function go(n) {
      const next = (n + quotes.length) % quotes.length;
      if (next === cur) return;
      const prev = quotes[cur];
      prev.classList.remove("is-active"); prev.classList.add("is-leaving"); prev.setAttribute("aria-hidden", "true");
      setTimeout(() => prev.classList.remove("is-leaving"), 600);
      quotes[next].classList.add("is-active"); quotes[next].setAttribute("aria-hidden", "false");
      dotBtns[cur].classList.remove("is-active"); dotBtns[next].classList.add("is-active");
      cur = next;
    }
    const auto = () => { clearInterval(timer); if (!reduceMotion) timer = setInterval(() => go(cur + 1), 6000); };
    $("#nextReview").addEventListener("click", () => { go(cur + 1); auto(); });
    $("#prevReview").addEventListener("click", () => { go(cur - 1); auto(); });
    dotBtns.forEach((b, i) => b.addEventListener("click", () => { go(i); auto(); }));
    slider.addEventListener("mouseenter", () => clearInterval(timer));
    slider.addEventListener("mouseleave", auto);
    let sx = null;
    slider.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener("touchend", (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) { go(cur + (dx < 0 ? 1 : -1)); auto(); }
      sx = null;
    });
    auto();
  }

  /* ==========================================================
     RESERVAS
     ========================================================== */
  function setupBooking() {
    const form = $("#bookingForm");
    const fDate = $("#fDate"), fTime = $("#fTime");
    let people = 2;
    const pplOut = $("#pplOut"), pplIcons = $("#pplIcons");

    const todayIso = madridNow().iso;
    fDate.min = todayIso;
    // Primer día abierto a partir de hoy
    // Primer día con horas libres (hoy, si aún queda margen antes del cierre)
    const n0 = madridNow();
    const lateToday = BAR.horario[n0.day] && n0.h * 60 + n0.m + 30 > toMin(BAR.horario[n0.day][1]) - 60;
    let d = new Date(`${todayIso}T12:00:00`);
    if (lateToday) d.setDate(d.getDate() + 1);
    for (let i = 0; i < 7 && !BAR.horario[d.getDay()]; i++) d.setDate(d.getDate() + 1);
    fDate.value = isoOf(d);
    const maxD = new Date(`${todayIso}T12:00:00`); maxD.setDate(maxD.getDate() + 90);
    fDate.max = isoOf(maxD);

    function isoOf(date) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`; }
    function dayOf(iso) { return new Date(`${iso}T12:00:00`).getDay(); }

    function fillTimes() {
      const prev = fTime.value;
      const sch = fDate.value ? BAR.horario[dayOf(fDate.value)] : null;
      if (!sch) { fTime.innerHTML = '<option value="">Cerrado ese día</option>'; return; }
      const now = madridNow();
      const isToday = fDate.value === now.iso;
      const nowMin = now.h * 60 + now.m + 30; // al menos 30 min de margen
      const opts = [];
      for (let m = toMin(sch[0]); m <= toMin(sch[1]) - 60; m += 30) {
        if (isToday && m < nowMin) continue;
        const v = `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
        opts.push(`<option value="${v}"${v === prev ? " selected" : ""}>${v}</option>`);
      }
      fTime.innerHTML = opts.length ? '<option value="">Elige hora</option>' + opts.join("") : '<option value="">Sin horas libres hoy</option>';
      if (prev && opts.some((o) => o.includes(`"${prev}"`))) fTime.value = prev;
    }

    function setPeople(n) {
      people = Math.max(1, Math.min(20, n));
      pplOut.textContent = people;
      while (pplIcons.children.length > people) pplIcons.lastChild.remove();
      while (pplIcons.children.length < people) pplIcons.appendChild(document.createElement("span"));
    }

    fDate.addEventListener("change", () => {
      if (fDate.value && !BAR.horario[dayOf(fDate.value)]) toast(`Los ${DAYS[dayOf(fDate.value)]} cerramos. Elige otro día 🙏`);
      clearError(fDate);
      fillTimes();
    });
    $("#pplMinus").addEventListener("click", () => setPeople(people - 1));
    $("#pplPlus").addEventListener("click", () => {
      if (people === 20) toast("Para más de 20 personas, llámanos directamente");
      setPeople(people + 1);
    });
    $$("input, select", form).forEach((el) => el.addEventListener("input", () => clearError(el)));

    function setError(el, msg) { const f = el.closest(".field"); f.classList.add("has-error"); $(".field__error", f).textContent = msg; }
    function clearError(el) { const f = el.closest(".field"); if (!f) return; f.classList.remove("has-error"); const e = $(".field__error", f); if (e) e.textContent = ""; }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#fName"), phone = $("#fPhone");
      let ok = true;
      [name, phone, fDate, fTime].forEach(clearError);
      if (name.value.trim().length < 2) { setError(name, "Dinos tu nombre"); ok = false; }
      const digits = phone.value.replace(/\D/g, "").replace(/^34(?=\d{9}$)/, "");
      if (!/^[6789]\d{8}$/.test(digits)) { setError(phone, "Teléfono de 9 cifras"); ok = false; }
      if (!fDate.value) { setError(fDate, "Elige un día"); ok = false; }
      else if (fDate.value < fDate.min || fDate.value > fDate.max) { setError(fDate, "Fecha fuera de rango"); ok = false; }
      else if (!BAR.horario[dayOf(fDate.value)]) { setError(fDate, "Ese día cerramos"); ok = false; }
      if (!fTime.value) { setError(fTime, "Elige una hora"); ok = false; }
      if (!ok) { toast("Revisa los campos marcados"); $(".has-error input, .has-error select", form)?.focus(); return; }

      const zone = $("input[name=zone]:checked", form).value;
      const notes = $("#fNotes").value.trim();
      const dateTxt = new Date(`${fDate.value}T12:00:00`).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
      const summary = `Reserva en Croquetería\nNombre: ${name.value.trim()}\nTeléfono: ${phone.value.trim()}\nDía: ${dateTxt}\nHora: ${fTime.value}\nPersonas: ${people}\nZona: ${zone}${notes ? `\nComentarios: ${notes}` : ""}`;
      const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

      openModal(`<div class="confirm">
        <p class="eyebrow">Casi listo</p>
        <h3 id="modalTitle">¡Te esperamos, ${esc(name.value.trim().split(" ")[0])}!</h3>
        <p>Llámanos para confirmar la mesa. Este es el resumen:</p>
        <div class="confirm__ticket">
          <div><span>Día</span><strong>${esc(dateTxt)}</strong></div>
          <div><span>Hora</span><strong>${fTime.value}</strong></div>
          <div><span>Personas</span><strong>${people}</strong></div>
          <div><span>Zona</span><strong>${esc(zone)}</strong></div>
          ${notes ? `<div><span>Notas</span><strong>${esc(notes)}</strong></div>` : ""}
        </div>
        <div class="confirm__actions">
          <a class="btn btn--primary" href="tel:${BAR.telefonoLink}">Llamar al ${BAR.telefono}</a>
          <button class="btn btn--ghost" type="button" id="copySummary">Copiar resumen</button>
        </div>
        <p class="confirm__note">La reserva no es firme hasta que el bar la confirme por teléfono.</p>
      </div>`);
      $("#copySummary").addEventListener("click", () => copy(summary, "Resumen copiado"));
      burst(window.innerWidth / 2, window.innerHeight / 2, 120);
    });

    fillTimes();
    setPeople(2);
    setInterval(fillTimes, 60000);
  }

  /* ==========================================================
     UBICACIÓN
     ========================================================== */
  async function copy(text, msg) {
    try {
      await navigator.clipboard.writeText(text);
      toast(msg);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); toast(msg); } catch { toast("No se pudo copiar"); }
      ta.remove();
    }
  }
  function setupLocation() {
    $("#near").innerHTML = BAR.cercanos.map((n) => `<li>${n}</li>`).join("");
    $("#copyAddress").addEventListener("click", () =>
      copy(`${BAR.direccion}, ${BAR.cp} ${BAR.ciudad}`, "Dirección copiada 📍"));
  }

  /* ==========================================================
     MODAL
     ========================================================== */
  const modal = $("#modal"), modalBody = $("#modalBody"), modalBox = $(".modal__box");
  let lastFocus = null;
  function openModal(html, wide = false) {
    lastFocus = document.activeElement;
    modalBody.innerHTML = html;
    modalBox.classList.toggle("modal__box--wide", wide);
    if (!modalBody.querySelector("#modalTitle")) modal.removeAttribute("aria-labelledby");
    else modal.setAttribute("aria-labelledby", "modalTitle");
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    $(".modal__close", modal).focus();
  }
  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    modalBody.innerHTML = "";
    document.body.style.overflow = "";
    lastFocus?.focus();
  }
  modal.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeModal(); closeMenu(); }
    if (e.key === "Tab" && !modal.hidden) {
      const f = $$("a[href], button, input, select, textarea", modal).filter((x) => !x.disabled);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ==========================================================
     CONFETI
     ========================================================== */
  const cv = $("#confetti"), ctx = cv.getContext("2d");
  let parts = [], running = false;
  function resizeCv() { cv.width = window.innerWidth * devicePixelRatio; cv.height = window.innerHeight * devicePixelRatio; }
  resizeCv();
  window.addEventListener("resize", resizeCv);
  function burst(x, y, n) {
    if (reduceMotion) return;
    const colors = ["#e2a23b", "#b8651f", "#1f8a8f", "#2e9e5b", "#f6d48c", "#d64545"];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 8;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 5, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        w: 6 + Math.random() * 8, h: 4 + Math.random() * 4, c: colors[i % colors.length], life: 1, round: i % 3 === 0 });
    }
    if (!running) { running = true; requestAnimationFrame(drawConfetti); }
  }
  function drawConfetti() {
    const dpr = devicePixelRatio;
    ctx.clearRect(0, 0, cv.width, cv.height);
    parts.forEach((p) => {
      p.vy += 0.25; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= 0.008;
      ctx.save();
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.translate(p.x * dpr, p.y * dpr); ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      if (p.round) { ctx.beginPath(); ctx.ellipse(0, 0, p.w * dpr * 0.8, p.h * dpr * 0.8, 0, 0, Math.PI * 2); ctx.fill(); }
      else ctx.fillRect(-p.w * dpr / 2, -p.h * dpr / 2, p.w * dpr, p.h * dpr);
      ctx.restore();
    });
    parts = parts.filter((p) => p.life > 0 && p.y < window.innerHeight + 50);
    if (parts.length) requestAnimationFrame(drawConfetti);
    else { running = false; ctx.clearRect(0, 0, cv.width, cv.height); }
  }

  /* ==========================================================
     NAV, PROGRESO, SCROLL
     ========================================================== */
  const nav = $("#nav"), burger = $("#burger"), links = $("#navLinks");
  function closeMenu() { links.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Abrir menú"); }
  burger.addEventListener("click", () => {
    const open = !links.classList.contains("is-open");
    links.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });
  links.addEventListener("click", (e) => { if (e.target.closest("a")) closeMenu(); });
  document.addEventListener("click", (e) => { if (!nav.contains(e.target)) closeMenu(); });

  const progress = $("#progress"), toTop = $("#toTop"), plateEl = $("#plate");
  let lastY = window.scrollY, ticking = false;
  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle("is-scrolled", y > 30);
    const hide = y > lastY && y > 400 && !links.classList.contains("is-open");
    nav.classList.toggle("is-hidden", hide);
    toTop.classList.toggle("is-visible", y > 700);
    const pr = plateEl.classList.contains("is-visible") && !$("#panelCroquetas").hidden ? plateEl.getBoundingClientRect() : null;
    toTop.classList.toggle("is-raised", !!pr && pr.bottom > window.innerHeight - 90 && pr.top < window.innerHeight);
    lastY = y;
    ticking = false;
  }
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  const sectionIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      $$(".nav__links a").forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${en.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach((s) => sectionIO.observe(s));

  /* ---------- Cursor y botones magnéticos ---------- */
  function setupCursor() {
    if (!finePointer || reduceMotion) return;
    const cur = $("#cursor"), dot = $("#cursorDot");
    let x = -100, y = -100, cx = -100, cy = -100;
    window.addEventListener("mousemove", (e) => {
      x = e.clientX; y = e.clientY;
      document.body.classList.add("cursor-on");
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    }, { passive: true });
    document.addEventListener("mouseleave", () => document.body.classList.remove("cursor-on"));
    document.addEventListener("mouseover", (e) => {
      cur.classList.toggle("is-hover", !!e.target.closest("a, button, .croq, input, select, textarea, label"));
    });
    (function loop() {
      cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
      cur.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();

    $$(".magnetic").forEach((b) => {
      b.addEventListener("mousemove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      b.addEventListener("mouseleave", () => { b.style.transform = ""; });
    });
  }

  /* ==========================================================
     ARRANQUE
     ========================================================== */
  $("#year").textContent = new Date().getFullYear();
  splitTitle();
  renderMarquee();
  renderServices();
  renderSchedule();
  setupMenu();
  renderGallery();
  setupCredits();
  renderBars();
  setupSlider();
  setupBooking();
  setupLocation();
  spawnCroquetas();
  parallax();
  setupCursor();
  updateStatus();
  setInterval(updateStatus, 1000);
  onScroll();
  observeAll();

  // Cambio de día: re-pintar el horario para marcar "hoy"
  let lastDay = madridNow().day;
  setInterval(() => {
    const d = madridNow().day;
    if (d !== lastDay) { lastDay = d; renderSchedule(); $$("#schedule .reveal").forEach((el) => el.classList.add("is-in")); $("#schedule").classList.add("is-in"); }
  }, 30000);

  // Loader
  document.body.classList.add("is-loading");
  const hideLoader = () => {
    const l = $("#loader");
    if (!l || l.classList.contains("is-done")) return;
    l.classList.add("is-done");
    setTimeout(() => l.remove(), 800);
    document.body.classList.remove("is-loading");
    setTimeout(() => { $("#heroTitle").classList.add("is-in"); $("#inicio").classList.add("is-ready"); }, 150);
    // El bloqueo de scroll del loader anula el salto al ancla: lo repetimos
    let target = null;
    try { target = location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null; } catch { target = null; }
    if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: "instant" });
  };
  if (document.readyState === "complete") setTimeout(hideLoader, 600);
  else window.addEventListener("load", () => setTimeout(hideLoader, 600));
  setTimeout(hideLoader, 3000);
})();
