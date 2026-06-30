# Nexbu Check — Documentación de Desarrollo

## ¿Qué es?

Nexbu Check es una herramienta de auditoría automatizada para sitios WordPress compuesta de dos partes:

1. **Web App** (`/webapp/`) — Analiza cualquier sitio WordPress desde afuera (público). Alojada en `check.nexbu.com`.
2. **Plugin companion** (`/plugin-nexbu-check/`) — Se instala en el sitio WordPress a auditar. Expone el endpoint `tusitio.com/nexbu-check/` con datos internos que no son accesibles desde afuera.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite 5 |
| Estilos | Tailwind CSS (diseño Notion-like) |
| Iconos | Lucide React |
| Backend / proxy | Node.js + Express |
| HTTP checks | Axios + Cheerio |
| Plugin WP | PHP 8.0+ |

---

## Arquitectura

```
Usuario
  └─ check.nexbu.com (React)
       └─ POST /api/check
            └─ Express server
                 ├─ Checks externos (HTTP requests directos al sitio)
                 └─ [Opcional] GET tusitio.com/nexbu-check/
                                    Authorization: Bearer <api_key>
                                    └─ Plugin nexbu-check (PHP)
                                         └─ JSON con datos internos
```

El navegador nunca habla directamente con el plugin — todo pasa por el Express server. Esto mantiene la API Key en el servidor (nunca expuesta al cliente) y evita problemas de CORS.

---

## Estructura de archivos

```
check-nexbu/
├── .gitignore
├── DEVELOPMENT.md              ← este archivo
│
├── webapp/                     ← Web app (check.nexbu.com)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   │
│   ├── server/                 ← Express (Node.js)
│   │   ├── index.js            ← servidor principal, puerto 3001
│   │   └── checks/
│   │       ├── index.js        ← orquesta todos los checks, normaliza URL
│   │       ├── security.js     ← SSL, WP version, xmlrpc, wp-login, headers
│   │       ├── seo.js          ← robots.txt, sitemap, llms.txt, meta tags, H1, OG, schema
│   │       └── content.js      ← favicon, 404, compresión, páginas legales, WooCommerce
│   │
│   └── src/                    ← React (Vite)
│       ├── main.jsx
│       ├── App.jsx             ← estado global: idle | checking | done
│       ├── index.css           ← Tailwind + variables CSS Notion-like
│       ├── lib/utils.js        ← helper cn() para clsx + tailwind-merge
│       └── components/
│           ├── Header.jsx      ← logo y tagline
│           ├── CheckForm.jsx   ← input URL + toggle plugin + API Key
│           ├── CheckProgress.jsx ← barra de progreso animada mientras analiza
│           ├── CheckResults.jsx  ← resumen score + categorías
│           ├── CategoryCard.jsx  ← card colapsable por categoría
│           └── CheckItem.jsx     ← item individual con icono de estado
│
└── plugin-nexbu-check/         ← Plugin WordPress companion
    ├── nexbu-check.php         ← main plugin file + página de admin
    └── includes/
        ├── class-auth.php      ← generación y validación de API Key (hashed)
        ├── class-scanner.php   ← recopila datos internos de WordPress
        └── class-api.php       ← registra endpoint /nexbu-check/ + maneja requests
```

---

## Cómo correr localmente (macOS con MAMP)

### Web app

```bash
cd webapp
npm install
npm run dev
```

- Frontend React: http://localhost:5173
- Express server: http://localhost:3001
- El Vite dev server proxea `/api/*` al Express automáticamente.

### Plugin

Copia la carpeta `plugin-nexbu-check/` a:
```
/Applications/MAMP/htdocs/tu-sitio/wp-content/plugins/
```
Actívalo en WordPress → Plugins. Luego ve a Ajustes → Nexbu Check para generar la API Key.

---

## Variables de entorno

Crea un archivo `.env` en `/webapp/` para producción:

```env
PORT=3001
NODE_ENV=production
```

---

## Deploy en Linux

### Requisitos del servidor
- Node.js 20+ (recomendado con nvm)
- PM2 (`npm install -g pm2`)
- Nginx como reverse proxy

### Pasos

```bash
# 1. Clonar repo
git clone https://github.com/JuanJavierCL/check-nexbu.git
cd check-nexbu/webapp

# 2. Instalar dependencias y compilar
npm install
npm run build

# 3. Iniciar con PM2
PORT=3001 NODE_ENV=production pm2 start server/index.js --name nexbu-check
pm2 save
pm2 startup
```

### Configuración Nginx

```nginx
server {
    listen 80;
    server_name check.nexbu.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Luego configura SSL con Certbot:
```bash
certbot --nginx -d check.nexbu.com
```

---

## API del servidor Express

### `POST /api/check`

Cuerpo JSON:
```json
{
  "url": "https://ejemplo.com",
  "apiKey": "opcional_api_key_del_plugin"
}
```

Respuesta:
```json
{
  "url": "https://ejemplo.com",
  "checkedAt": "2026-06-30T14:00:00.000Z",
  "score": 78,
  "hasPlugin": false,
  "categories": [
    {
      "id": "security",
      "label": "Seguridad",
      "icon": "🔒",
      "score": 83,
      "checks": [
        {
          "id": "ssl",
          "title": "SSL activo y forzado",
          "status": "pass",
          "message": "SSL activo. HTTP redirige a HTTPS con 301 permanente.",
          "category": "security"
        }
      ]
    }
  ]
}
```

Valores de `status`: `pass` | `fail` | `warning` | `manual`

---

## Spec del plugin — Endpoint `/nexbu-check/`

### Request
```
GET https://tusitio.com/nexbu-check/
Authorization: Bearer <api_key>
```

### Response 200 OK
```json
{
  "success": true,
  "version": "1.0.0",
  "data": {
    "theme": {
      "name": "Storefront Child",
      "version": "1.0.0",
      "is_child": true,
      "parent": "Storefront"
    },
    "security": {
      "admin_user_exists": false,
      "debug_mode": false,
      "debug_log": false
    },
    "settings": {
      "search_discouraged": false,
      "ssl_in_siteurl": true,
      "blogname": "Mi Tienda"
    },
    "performance": {
      "cache_plugin": "WP Rocket",
      "backup_plugin": "UpdraftPlus"
    },
    "plugins": {
      "active_count": 12,
      "total_count": 15,
      "updates_available": ["Contact Form 7"]
    },
    "database": {
      "revisions_count": 45,
      "trashed_count": 3
    },
    "wordpress": {
      "version": "6.5.4"
    }
  }
}
```

### Errores
| Código | Motivo |
|--------|--------|
| 401 | API Key inválida o no enviada |
| 503 | Plugin sin API Key configurada |

---

## Checks implementados

### Seguridad (6 checks)
| ID | Qué verifica |
|----|-------------|
| `ssl` | SSL activo, redirección HTTP→HTTPS (301 vs 302) |
| `wp_version` | Versión WP oculta (meta generator, readme.html, wp-json) |
| `xmlrpc` | XML-RPC deshabilitado |
| `wp_login` | wp-login.php protegido o con URL personalizada |
| `readme_html` | readme.html no accesible públicamente |
| `security_headers` | X-Content-Type-Options, X-Frame-Options, HSTS, Referrer-Policy |

### SEO (12 checks)
| ID | Qué verifica |
|----|-------------|
| `meta_title` | `<title>` presente y con longitud correcta (10–65 chars) |
| `meta_description` | Meta description presente (50–160 chars) |
| `canonical` | `<link rel="canonical">` presente |
| `h1_structure` | Exactamente 1 H1, entre 1–6 H2 |
| `og_tags` | og:title, og:description, og:image |
| `schema` | JSON-LD o microdata presente |
| `images_alt` | Imágenes con atributo alt |
| `analytics` | GA4, GTM o Universal Analytics |
| `indexing` | Sin meta robots noindex |
| `robots_txt` | robots.txt existe, no bloquea todo, incluye Sitemap |
| `sitemap` | sitemap.xml o sitemap_index.xml presente |
| `llms_txt` | llms.txt presente (estándar emergente para LLMs) |

### Contenido y Rendimiento (5 checks)
| ID | Qué verifica |
|----|-------------|
| `favicon` | Favicon configurado |
| `custom_404` | Página 404 personalizada |
| `compression` | GZIP o Brotli activo |
| `https_consistency` | URL final en HTTPS |
| `legal_pages` | Privacidad, términos, cookies |
| `woocommerce_pages` | Carrito, checkout, mi-cuenta (solo si WC detectado) |

### Plugin Nexbu Check (8 checks — requiere plugin instalado)
| ID | Qué verifica |
|----|-------------|
| `child_theme` | Usa child theme |
| `admin_user` | No existe usuario con login "admin" |
| `debug_mode` | WP_DEBUG deshabilitado en producción |
| `search_discouraged` | Indexación no bloqueada desde WP settings |
| `cache_plugin` | Plugin de caché activo |
| `backup_plugin` | Plugin de backups activo |
| `plugin_updates` | Todos los plugins actualizados |
| `db_revisions` | Menos de 500 revisiones en la BD |

---

## Autenticación del plugin

1. El usuario genera una API Key en WP Admin → Ajustes → Nexbu Check.
2. WordPress guarda el hash SHA-256 de la key en `wp_options` (nunca el texto plano).
3. La key se muestra una sola vez al usuario para que la copie.
4. El usuario la pega en check.nexbu.com al momento de analizar.
5. El Express server la envía al endpoint del plugin como `Authorization: Bearer <key>`.
6. El plugin valida comparando `wp_hash(provided_key) === stored_hash` con `hash_equals()`.
7. CORS restringido a `check.nexbu.com` + localhost para desarrollo.

---

## Decisiones de diseño

- **Sin CORS browser→plugin**: el browser habla solo con el Express server (mismo origen en prod). El Express llama al plugin server-side. La API Key nunca sale al cliente.
- **`Promise.allSettled`** en todos los checks: si uno falla (timeout, error de red), los demás continúan.
- **Cheerio** para parsear HTML en el servidor: más eficiente que un headless browser para esta tarea.
- **Diseño Notion-like**: fondo `#f7f7f5`, Inter font, cards con borde sutil, sin sombras pesadas. Colores de estado basados en los tonos Notion.
- **Score**: `(checks_pasados / checks_no_manuales) × 100`. Los checks manuales no afectan el score.

---

*Creado por Javier Rivera (jjrc.dev) con asistencia de Claude (Anthropic)*
