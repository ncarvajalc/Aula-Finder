# Datos de Aula-Finder

Esta carpeta contiene los archivos JSON que alimentan la aplicación. **No necesitas saber programar** para contribuir: solo edita los archivos JSON siguiendo las instrucciones de esta guía.

## 📁 Archivos editables

Estos son los archivos que puedes modificar directamente para contribuir datos al proyecto:

### `buildings-metadata.json` — Metadatos de edificios

Define la lista de edificios del campus con su información básica.

```json
{
  "code": "ML",
  "name": "Mario Laserna",
  "campus": "Campus Principal",
  "order": 1,
  "imageUrl": "/images/buildings/ml.jpg",
  "coordinates": {
    "latitude": 4.60186,
    "longitude": -74.06472
  }
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `code` | string | ✅ | Código del edificio (ej: `ML`, `SD`, `AU`). Debe coincidir con los códigos que vienen de la API de cursos. |
| `name` | string | ✅ | Nombre legible del edificio |
| `campus` | string | ✅ | Campus al que pertenece (casi siempre `"Campus Principal"`) |
| `order` | number | ❌ | Orden de aparición en la página principal. Solo los edificios con `order` aparecen por defecto; los demás se pueden activar desde el menú de configuración. |
| `imageUrl` | string | ❌ | Ruta a la imagen del edificio (ej: `/images/buildings/ml.jpg`). Si no se provee, se usa la imagen por defecto del campus. La imagen debe existir en `public/images/buildings/`. |
| `coordinates` | object | ❌ | Coordenadas geográficas (`latitude`, `longitude`). Para encontrarlas: clic derecho en [Google Maps](https://maps.google.com) sobre el edificio y copiar las coordenadas. |

**Imagen por defecto:** `defaultImage` define la imagen que se usa cuando un edificio no tiene `imageUrl`. Se ubica en `public/images/buildings/default.jpg`.

---

### `buildings-amenities.json` — Amenidades de edificios

Define las facilidades disponibles en cada edificio (cafeterías, ascensores, laboratorios, etc.).

```json
{
  "code": "ML",
  "amenities": [
    {
      "type": "coffee_shop",
      "name": "Juan Valdez Café",
      "location": "Primer piso",
      "icon": "☕"
    }
  ]
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `code` | string | ✅ | Código del edificio (debe coincidir con `buildings-metadata.json`) |
| `amenities[].type` | string | ✅ | Tipo de amenidad (ver tabla abajo) |
| `amenities[].name` | string | ✅ | Nombre descriptivo |
| `amenities[].icon` | string | ❌ | Emoji que se muestra en la UI |
| `amenities[].location` | string | ❌ | Ubicación dentro del edificio |
| `amenities[].description` | string | ❌ | Información adicional |
| `amenities[].count` | number | ❌ | Cantidad (ej: número de ascensores) |
| `amenities[].floors` | number[] | ❌ | Pisos donde está disponible |

**Tipos de amenidades soportados:**

| Tipo | Descripción | Emoji sugerido |
|------|-------------|----------------|
| `coffee_shop` | Cafetería o punto de venta de café | ☕ |
| `elevator` | Ascensores | 🛗 |
| `accessible_restroom` | Baños accesibles | ♿ |
| `study_area` | Áreas de estudio | 📚 |
| `printer` | Impresoras | 🖨️ |
| `wifi` | Conectividad Wi-Fi | 📶 |
| `lab` | Laboratorios | 🔬 |
| `vending_machine` | Máquinas expendedoras | 🥤 |
| `parking` | Estacionamiento | 🅿️ |

---

### `room-restrictions.json` — Restricciones de salones

Define qué salones están restringidos (laboratorios, oficinas, espacios de acceso limitado). Estos salones aparecen con un ícono de candado 🔒 y se excluyen del conteo de disponibilidad.

```json
{
  "building": "B",
  "room": "3*",
  "isRestricted": true,
  "restrictionType": "lab",
  "note": "Laboratorios de física - Acceso restringido"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `building` | string | ✅ | Código del edificio |
| `room` | string | ✅ | Código del salón. Soporta **wildcards**: `3*` aplica a todos los salones que empiezan con `3` (ej: `301`, `302`, `310`) |
| `isRestricted` | boolean | ✅ | Siempre `true` para restricciones |
| `restrictionType` | string | ❌ | Tipo: `lab`, `office`, `restricted`, `maintenance` |
| `note` | string | ❌ | Descripción que se muestra al usuario |

---

### `ciclos.json` — Fechas de los ciclos del semestre

Define las fechas de inicio y fin de cada ciclo (semestre completo, 8A, 8B) por período académico. Esto permite que la app detecte automáticamente el ciclo activo.

```json
{
  "202610": {
    "year": 2026,
    "semester": 1,
    "startDate": "2026-01-15",
    "endDate": "2026-05-15",
    "midpoint": "2026-03-15",
    "ciclos": {
      "1": { "startDate": "2026-01-15", "endDate": "2026-05-15" },
      "8A": { "startDate": "2026-01-15", "endDate": "2026-03-15" },
      "8B": { "startDate": "2026-03-15", "endDate": "2026-05-15" }
    }
  }
}
```

> **Nota:** Las fechas son aproximadas. Actualízalas cada semestre cuando se publique el calendario oficial de Uniandes.

---

## 📂 Archivos autogenerados (no editar manualmente)

| Archivo | Descripción |
|---------|-------------|
| `courses/courses-{term}.json` | Datos de cursos descargados de la API. Se actualizan automáticamente con `scripts/fetch-courses.py`. |
| `courses/manifest.json` | Metadatos del último fetch (período, timestamp, conteos). |
| `enums/*.json` | Valores únicos extraídos de los cursos (edificios, departamentos, etc.). Se generan con `scripts/analyze-enums.py`. |

---

## 🔄 ¿Cómo actualizar los datos de cursos?

Los datos se actualizan automáticamente via GitHub Actions al inicio de cada semestre. Para actualización manual:

```bash
# Descargar datos del semestre actual
python scripts/fetch-courses.py

# Descargar un semestre específico
python scripts/fetch-courses.py 202610

# Regenerar valores únicos (enums)
python scripts/analyze-enums.py
```
