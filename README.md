# Nexbu Check

**Auditoría automatizada para sitios WordPress.**

Analiza seguridad, SEO, rendimiento y contenido de cualquier sitio WordPress desde una URL. Con el plugin companion instalado, el análisis alcanza el 100% incluyendo datos internos del servidor.

---

## Demo

> **check.nexbu.com** ← _próximamente_

---

## Cómo funciona

```
Usuario ingresa URL en check.nexbu.com
        │
        ▼
Express server (Node.js)
        ├── Checks externos (23 verificaciones automáticas)
        │       ├── SSL y redirecciones
        │       ├── Seguridad WordPress (xmlrpc, wp-login, versión, headers)
        │       ├── SEO (meta tags, H1, sitemap, robots.txt, schema, OG)
        │       └── Contenido (favicon, 404, compresión, páginas legales)
        │
        └── [Opcional] Plugin Nexbu Check instalado en el sitio
                        └── Datos internos (child theme, plugins, debug mode,
                            caché, backups, usuario admin, BD)
```

---

## Estructura del proyecto

```
check-nexbu/
├── webapp/              # Web app (check.nexbu.com)
│   ├── src/             # React 18 + Vite + Tailwind
│   └── server/          # Express — proxy de checks + API
│
└── plugin/              # Plugin companion para WordPress
    ├── nexbu-check.php
    └── includes/
```

---

## Checks implementados

### 🔒 Seguridad (6)
| Check | Qué verifica |
|-------|-------------|
| SSL activo y forzado | Redirección HTTP→HTTPS, código 301 vs 302 |
| Versión WP oculta | Meta generator, readme.html, /wp-json |
| XML-RPC deshabilitado | Bloqueo del vector de fuerza bruta más común |
| wp-login.php protegido | Acceso directo o URL personalizada |
| readme.html no accesible | Evita exposición de la versión exacta |
| Headers de seguridad | HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy |

### 🔍 SEO (12)
| Check | Qué verifica |
|-------|-------------|
| Meta título | Presente, entre 10–65 caracteres |
| Meta descripción | Presente, entre 50–160 caracteres |
| Canonical tag | Evita contenido duplicado |
| Estructura H1/H2 | Exactamente 1 H1, entre 1–6 H2 |
| Open Graph | og:title, og:description, og:image |
| Schema.org | JSON-LD o microdata presente |
| Alt en imágenes | Todas las imágenes con atributo alt |
| Analytics | GA4, GTM, o Meta Pixel |
| Indexación | Sin meta robots noindex |
| robots.txt | Existe, no bloquea todo, referencia al sitemap |
| Sitemap XML | sitemap.xml o sitemap_index.xml presente |
| llms.txt | Estándar emergente para modelos de lenguaje |

### ⚡ Contenido y Rendimiento (6)
| Check | Qué verifica |
|-------|-------------|
| Favicon | Configurado en el sitio |
| Página 404 personalizada | Respuesta correcta y contenido custom |
| Compresión | GZIP o Brotli activo en el servidor |
| HTTPS consistente | URL final en HTTPS |
| Páginas legales | Privacidad, términos y condiciones, cookies |
| Páginas WooCommerce | Carrito, checkout, mi cuenta (si se detecta WC) |

### 🔌 Plugin Nexbu Check (8) — requiere plugin instalado
| Check | Qué verifica |
|-------|-------------|
| Child theme | El sitio usa un child theme |
| Usuario "admin" | No existe un usuario con ese nombre |
| WP_DEBUG deshabilitado | No expone errores en producción |
| Indexación en WP | "Desalentar buscadores" desactivado |
| Plugin de caché | WP Rocket, W3TC, LiteSpeed, etc. |
| Plugin de backups | UpdraftPlus, BackupBuddy, etc. |
| Plugins actualizados | Sin actualizaciones pendientes |
| Base de datos | Menos de 500 revisiones acumuladas |

---

## Instalación local

### Requisitos
- Node.js 20+
- npm 10+
- PHP 8.0+ (para el plugin)

### Web app

```bash
git clone https://github.com/chichorivera/check-nexbu.git
cd check-nexbu/webapp
npm install
npm run dev
```

Abre **http://localhost:5173**

### Plugin companion

1. Copia la carpeta `plugin/nexbu-check/` a `wp-content/plugins/` de tu WordPress.
2. Actívalo desde WP Admin → Plugins.
3. Ve a **Ajustes → Nexbu Check** y genera una API Key.
4. Pega la API Key en check.nexbu.com al analizar tu sitio.

---

## Deploy en producción (Linux)

### Requisitos del servidor
- Node.js 20+ con PM2
- Nginx
- SSL con Certbot

```bash
# Instalar y compilar
cd check-nexbu/webapp
npm install
npm run build

# Iniciar con PM2
PORT=3001 NODE_ENV=production pm2 start server/index.js --name nexbu-check
pm2 save && pm2 startup
```

**Nginx:**
```nginx
server {
    listen 80;
    server_name check.nexbu.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
certbot --nginx -d check.nexbu.com
```

---

## Seguridad del plugin

- La API Key se genera con `wp_generate_password(40)` — 40 chars aleatorios.
- Se guarda como hash (`wp_hash`) en la base de datos, **nunca en texto plano**.
- Solo se muestra una vez al generarse.
- El endpoint valida con `hash_equals()` para prevenir timing attacks.
- CORS restringido a `check.nexbu.com`.
- El navegador nunca habla directamente con el plugin — todo pasa por el servidor Express.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite |
| Estilos | Tailwind CSS (diseño Notion-like) |
| Iconos | Lucide React |
| Backend | Node.js + Express |
| Parsing HTML | Cheerio |
| HTTP requests | Axios |
| Plugin WP | PHP 8.0+ |

---

## Documentación técnica

Ver [DEVELOPMENT.md](./DEVELOPMENT.md) para arquitectura detallada, spec del API del plugin y decisiones de diseño.

---

## Roadmap

- [ ] Análisis de performance con Lighthouse API
- [ ] Historial de análisis por dominio
- [ ] Exportar reporte en PDF
- [ ] Publicar plugin en WordPress.org
- [ ] Notificaciones por email cuando un check falla tras relanzamiento

---

## Créditos

Creado por **[Javier Rivera](https://jjrc.dev)** con asistencia de Claude (Anthropic).

Basado en el checklist interno documentado en [Checklist de Desarrollo Web con WordPress](https://jjrc.dev).
