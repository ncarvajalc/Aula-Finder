# Datos de Aula-Finder

Esta carpeta contiene los archivos JSON que alimentan la aplicación. **No necesitas saber programar** para contribuir: solo edita los archivos JSON siguiendo las instrucciones de esta guía.

> **⚠️ Importante:** La información de la app se basa únicamente en la oferta de cursos actualizada a la fecha del último fetch. Si conoces de algún evento que ocupe salones del campus o si algún curso cambió de salón después de esa fecha, por favor [crea un issue](https://github.com/Open-Source-Uniandes/Aula-Finder/issues). Para información oficial del calendario académico, visita [Registro de la Universidad de los Andes](https://registro.uniandes.edu.co/).

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
| `coordinates` | object | ❌ | Coordenadas geográficas (`latitude`, `longitude`). Se usan en la vista de mapa. Para encontrarlas: clic derecho en [Google Maps](https://maps.google.com) sobre el edificio y copiar las coordenadas. |

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
      "icon": "☕",
      "description": "Cafetería Juan Valdez en el lobby principal"
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
| `amenities[].description` | string | ❌ | Información adicional (se muestra como tooltip) |
| `amenities[].count` | number | ❌ | Cantidad (ej: número de ascensores) |
| `amenities[].floors` | number[] | ❌ | Pisos donde está disponible |

**Tipos de amenidades soportados** (definidos en `amenityTypes` dentro del JSON):

| Tipo | Descripción | Emoji |
|------|-------------|-------|
| `coffee_shop` | Cafetería o punto de café | ☕ |
| `food` | Comida / Plaza de comidas | 🍽️ |
| `elevator` | Ascensores | 🛗 |
| `restroom` | Baños | 🚻 |
| `study_area` | Salas de estudio | 📚 |
| `printer` | Impresoras | 🖨️ |
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

### `university-closures.json` — Cierres y horarios de la universidad

Define horarios de operación, días festivos de Colombia, y eventos especiales que afectan la disponibilidad del campus. La app muestra un banner de "Universidad cerrada" cuando corresponde.

```json
{
  "operatingHours": {
    "weekdays": { "openTime": "05:30", "closeTime": "22:00" },
    "saturday": { "openTime": "06:00", "closeTime": "18:00" },
    "sunday": { "openTime": null, "closeTime": null }
  },
  "holidays": {
    "2026": [
      { "date": "2026-01-01", "name": "Año Nuevo", "comment": "Festivo nacional" }
    ]
  },
  "specialEvents": {
    "events": [
      {
        "name": "MoneyCon 2026",
        "startDate": "2026-01-17",
        "endDate": "2026-01-18",
        "comment": "Evento MoneyCon - Universidad cerrada",
        "scope": "campus"
      }
    ]
  }
}
```

**Tipos de scope para eventos especiales:**

| Scope | Descripción | Campos adicionales |
|-------|-------------|-------------------|
| `campus` | Toda la universidad cerrada | — |
| `building` | Edificios específicos cerrados | `buildings: ["ML", "SD"]` |
| `room` | Salones específicos cerrados | `rooms: ["ML_510", "SD_201"]` |

---

### `ciclos.json` — Fechas de los ciclos del semestre

Define las fechas de inicio y fin de cada ciclo (semestre completo, 8A, 8B) por período académico. Esto permite que la app detecte automáticamente el ciclo activo.

```json
{
  "202610": {
    "year": 2026,
    "semester": 1,
    "startDate": "2026-01-20",
    "endDate": "2026-05-30",
    "ciclos": {
      "1": { "startDate": "2026-01-20", "endDate": "2026-05-30" },
      "8A": { "startDate": "2026-01-20", "endDate": "2026-03-14" },
      "8B": { "startDate": "2026-03-24", "endDate": "2026-05-23" }
    }
  }
}
```

> **Nota:** Las fechas del semestre 2026-1 fueron inferidas automáticamente a partir de los campos `dateIni`/`dateFin` del archivo de cursos. Pueden modificarse si no corresponden a la realidad. Para información oficial, visita [Registro Uniandes](https://registro.uniandes.edu.co/).

---

## 📂 Archivos autogenerados (no editar manualmente)

| Archivo | Descripción |
|---------|-------------|
| `courses/courses-{term}.json` | Datos de cursos descargados de la API. Se actualizan automáticamente con `scripts/fetch-courses.py`. |
| `courses/manifest.json` | Metadatos del último fetch (período, timestamp, conteos). |
| `enums/*.json` | Artefactos de análisis: valores únicos extraídos de los cursos (edificios, departamentos, profesores, salones por edificio, estadísticas). Se generan con `scripts/analyze-enums.py`. **No se usan en el código de la app**; son útiles como referencia y documentación. |

---

## 🔄 ¿Cómo actualizar los datos de cursos?

Los datos se actualizan automáticamente via GitHub Actions al inicio de cada semestre. Para actualización manual:

```bash
# Descargar datos del semestre actual
python scripts/fetch-courses.py

# Descargar un semestre específico
python scripts/fetch-courses.py 202610

# Regenerar valores únicos y estadísticas
python scripts/analyze-enums.py
```

## 🗺️ Vista de Mapa

La vista de mapa (`/map`) muestra los edificios del campus en un mapa interactivo usando OpenStreetMap. Las coordenadas de cada edificio se definen en `buildings-metadata.json`. Los marcadores muestran:

- Código del edificio
- Nombre completo y amenidades (en el popup)
- Enlace al detalle del edificio

También soporta geolocalización del usuario para mostrar su posición en el mapa.

## 🌐 Idioma de cursos

Los cursos en la app se muestran en español por defecto. Los cursos que incluyen "INGLÉS" o "INGLES" en el título se marcan automáticamente con un tag de idioma (🇬🇧 EN). Los atributos adicionales del curso (como EPSI) se muestran en el detalle del calendario semanal.
