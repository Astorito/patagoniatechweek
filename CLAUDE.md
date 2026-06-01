@AGENTS.md

# Patagonia Tech Week — Landing Page

## Proyecto
Evento tecnológico en San Martín de los Andes, Argentina (Agosto 2026).  
Landing page dark-themed con animaciones cinematográficas.

## Repositorio y deploy
- **Git:** `https://github.com/Astorito/patagoniatechweek.git` · branch `main`
- **Vercel:** `https://patagoniatechweek.vercel.app/index.html`
- **Archivo principal:** `C:\Users\Jchi\patagonia-tech-week\index.html`
- **Siempre sincronizar** con `public/index.html` después de cada edición

## Workflow obligatorio
```powershell
# 1. Editar index.html
# 2. Sincronizar
Copy-Item "C:\Users\Jchi\patagonia-tech-week\index.html" "C:\Users\Jchi\patagonia-tech-week\public\index.html" -Force
# 3. Commit y push
cd C:\Users\Jchi\patagonia-tech-week
git add index.html public/index.html
git commit -m "descripcion"
git push origin main
```
**SIEMPRE usar PowerShell** (no Bash) para operaciones de archivo en Windows.  
**Videos NO están en git** (`.gitignore` tiene `*.mp4`).

## Servidor local
```powershell
python -m http.server 8888 --directory C:\Users\Jchi\patagonia-tech-week
# Abrir: http://localhost:8888/index.html
```

## Stack
- Static HTML servido desde `/public/index.html` por Next.js
- `app/page.tsx` hace redirect a `/index.html`
- Tailwind CSS (CDN) · GSAP 3.12.5 (CDN) · Google Fonts
- Fuentes: **Hanken Grotesk** (títulos), **Open Sans** (subtítulos), **Noto Serif** (secciones)

## Estructura de la página (en orden)

### 1. Preloader GSAP (automático, ~3.3s)
- Fondo gris claro `#ebebeb`
- "PATAGONIA" blanco 13vw centrado detrás de la imagen (solo bordes visibles en márgenes)
- Imagen centrada (38vw × 52vh): 2 filas (top: `slidesma3.jpg`, bottom: `slidesma4.jpg`)
- Crossfade a `san-martin.jpg` (imagen única)
- Imagen se expande a fullscreen con GSAP
- Preloader sube (`yPercent: -100`) → hero revelado

### 2. Hero estático (100vh)
- Imagen: `sma-nevada.png` (foto aérea nevado SMA)
- Overlay gradiente oscuro
- Título **PATAGONIA / TECH / WEEK** — bold, 11.5vw, bottom-left, fades in post-preloader
- Coordenadas centradas abajo: `40.1500° S · 71.3566° W · Ago 2026`
- Film grain noise `.hero-noise`

### 3. Text reveal (380vh, sticky scroll)
Texto: *"Patagonia Tech Week será el evento más importante de tecnología de Latinoamerica, donde confluirá talento tecnologico regional, generando un foco de innovación único. — El futuro se diseña desde el sur."*  
- Chunks en JS: palabras aparecen una por una al hacer scroll
- `nosotros` subrayado (marcado con `§` en el array)
- `hyphens:none; word-break:normal` para no cortar palabras

### 4. Glass container (secciones 3–8)
- `background: rgba(5,7,12,0.15)` · `backdrop-filter: blur(48px)`
- `border-radius: 3rem` · `width: 95%`

#### Secciones:
- **Foco/Temáticas** — grid de 4 videos
- **Cifras** — contadores animados: 50+ speakers, 300+ asistentes, 4 hacker houses, 7 días, Ago '26
- **Sede** — 2 col: texto SMA izquierda, click-to-dismiss card stack derecha (4 tarjetas)
- **Actividades** — 5 strips expansibles hover
- **Partners** — logos placeholder
- **Registro** — formulario email

## Assets

### Locales (en git)
| Archivo | Uso |
|---|---|
| `san-martin.jpg` | Preloader imagen principal |
| `sma-nevada.png` | Hero estático (foto nevado) |
| `logo.png` | Header logo + favicon |
| `bg-waves.png` | Background body |

### Vercel Blob (`rmgezixtjpt7ieit.public.blob.vercel-storage.com`)
| Archivo | Sección |
|---|---|
| `ai_aplicada.mp4` | Temáticas — IA Aplicada |
| `sost_tecnologica.mp4` | Temáticas — Sostenibilidad |
| `biotech_salud.mp4` | Temáticas — Biotech |
| `infra_digital.mp4` | Temáticas — Infraestructura |
| `Fondo%20PTW.jpg` | Sede slide 1 + Actividades Night Pitch |
| `slidesma2.jpg` | Sede slide 2 |
| `slidesma3.jpg` | Sede slide 3 + Preloader top row |
| `slidesma4.jpg` | Sede slide 4 + Preloader bottom row |
| `charlas.jpg` | Actividades Workshops + Charlas |
| `hackaton.jpg` | Actividades Hackatón |
| `actividadmonta%C3%B1a.jpg` | Actividades Montaña |

## Header
- Fixed, siempre visible (`.visible` clase en JS al inicio)
- **Logo pill** izquierda: `logo.png` 34px, fondo `rgba(255,255,255,0.18)` blur
- **Nav pill** derecha: El Evento · Contacto · Aplicar — texto blanco, fondo `rgba(255,255,255,0.22)` blur
- Posición: `top:14px; left:16px; right:16px`

## Imágenes del usuario (carpeta local)
```
C:\Users\Jchi\OneDrive\VídeosPúblico\Documentos\Proyectos\Patagonia Tech Week\
├── Gemini_Generated_Image_85a75685a75685a7.png  ← logo actual
├── Fondo Nevado.png                              ← = sma-nevada.png
├── San Martin 2.jpg                              ← SMA primavera
├── Patagonia_Tech_Monteserrat_Blanca_202605052101.jpeg
└── (otras variantes del logo)
```

## CSS clave

```css
/* Body background */
body {
  background-color: #050608;
  background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('bg-waves.png');
  background-attachment: fixed;
}

/* Glass panel */
.glass-panel {
  background: rgba(5,7,12,0.15);
  backdrop-filter: blur(48px);
}

/* Film grain */
@keyframes noise-animation { /* 10 steps de translate random */ }
.hero-noise { opacity: 0.055; animation: noise-animation 0.18s steps(1) infinite; }

/* Text reveal words */
.reveal-word { display: inline; color: white; opacity: 0.1; transition: opacity 0.05s linear; }

/* Click-to-dismiss cards */
.click-card { position: absolute; width: 360px; height: 270px; border-radius: 14px; }
```

## Último commit
`8dbd0c0` — "Add static hero with snowy SMA image, bold title bottom-left, coords, updated logo"
