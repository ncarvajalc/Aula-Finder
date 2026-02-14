# API de Oferta de Cursos — Universidad de los Andes

Esta documentación describe la API pública utilizada por Aula-Finder para obtener datos de las secciones de cursos ofrecidos en la Universidad de los Andes.

**Base URL:** `https://ofertadecursos.uniandes.edu.co`

---

## Endpoints

### 1. Listado de cursos

```
GET /api/courses
```

Retorna las secciones de cursos ofrecidas para un período académico. Todos los parámetros son opcionales.

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `term` | string | Período académico (ej: `202610`) |
| `ptrm` | string | Parte del período (`1`, `8A`, `8B`) |
| `prefix` | string | Prefijo del departamento (ej: `MATE`, `ISIS`) |
| `attr` | string | Atributo del curso (ej: `EPSI` para cursos Epsilon) |
| `nameInput` | string | Búsqueda por nombre del curso |
| `campus` | string | Campus (ej: `CAMPUS PRINCIPAL`) |
| `attrs` | string | Atributos adicionales |
| `timeStart` | string | Hora de inicio del filtro |
| `offset` | number | Desplazamiento para paginación (default: `0`) |
| `limit` | number | Máximo de resultados (default: `25`) |
| `courseQuotas` | string | Filtro de cupos |
| `days` | string | Filtro por días |
| `courseRestrictions` | string | Filtro de restricciones |
| `programNew` | string | Filtro por programa |
| `profesorName` | string | Filtro por nombre del profesor |

**Ejemplo sin filtros (todos los cursos):**
```
GET /api/courses
```

**Ejemplo con filtros:**
```
GET /api/courses?term=202610&prefix=MATE&limit=25&offset=0
```

#### Estructura de una sección de curso

```json
{
  "nrc": "39342",
  "llave": "39342202610",
  "term": "202610",
  "ptrm": "1",
  "ptrmdesc": "16 semanas",
  "class": "MATE",
  "course": "1203",
  "title": "Cálculo Diferencial",
  "enrolled": 35,
  "maxenrol": 40,
  "seatsavail": 5,
  "projenrl": 38,
  "campus": "CAMPUS PRINCIPAL",
  "levele": "PRE",
  "comments": "",
  "schedules": [
    {
      "time_ini": "0700",
      "time_fin": "0820",
      "date_ini": "2026-01-20 00:00:00",
      "date_fin": "2026-05-16 00:00:00",
      "building": ".Edif. Mario Laserna (ML)",
      "classroom": ".ML_003",
      "l": "L",
      "m": null,
      "i": "I",
      "j": null,
      "v": null,
      "s": null,
      "d": null,
      "patron": "A"
    }
  ],
  "professors": [
    {
      "name": "Nombre del Profesor",
      "ind": "Y"
    }
  ],
  "attr": [
    {
      "code": "EPSI"
    }
  ]
}
```

#### Campos clave

| Campo | Descripción |
|-------|-------------|
| `nrc` | Número de Referencia del Curso — identificador de 5 dígitos único por sección y período |
| `llave` | Concatenación de NRC + término (ej: `39342202610`) |
| `term` | Período académico: `YYYY10` (1er semestre), `YYYY20` (2do semestre), `YYYY19` (intersemestral) |
| `ptrm` | Parte del período: `1` (16 semanas), `8A` (primera mitad), `8B` (segunda mitad) |
| `ptrmdesc` | Descripción legible del ciclo |
| `class` | Código del departamento/programa (ej: `MATE`, `ISIS`) |
| `course` | Código numérico del curso (ej: `1203`) |
| `title` | Nombre de la sección (puede variar por sección, ej: si se dicta en inglés) |
| `enrolled` | Estudiantes inscritos actualmente |
| `maxenrol` | Cupo máximo (puede excederse por decisión administrativa) |
| `seatsavail` | Cupos disponibles |
| `projenrl` | Proyección de inscritos |
| `campus` | Sede (casi siempre `CAMPUS PRINCIPAL`) |
| `levele` | Nivel: `PRE` (pregrado) o `POS` (posgrado) |
| `comments` | Comentarios adicionales de la sección |

#### Horarios (schedules)

| Campo | Formato | Descripción |
|-------|---------|-------------|
| `time_ini` | `hhmm` | Hora de inicio (ej: `0700` para 7:00 AM) |
| `time_fin` | `hhmm` | Hora de fin (ej: `0820` para 8:20 AM) |
| `date_ini` | timestamp | Fecha de inicio del período |
| `date_fin` | timestamp | Fecha de fin del período |
| `building` | string | Nombre del edificio (ej: `.Edif. Mario Laserna (ML)`) |
| `classroom` | string | Código del salón (ej: `.ML_003`) o `.NOREQ` si no requiere aula |
| `l` | `"L"` o `null` | Lunes |
| `m` | `"M"` o `null` | Martes |
| `i` | `"I"` o `null` | Miércoles |
| `j` | `"J"` o `null` | Jueves |
| `v` | `"V"` o `null` | Viernes |
| `s` | `"S"` o `null` | Sábado |
| `d` | `"D"` o `null` | Domingo |
| `patron` | string | Patrón del horario |

> **Nota sobre días:** Cada día tiene valor `null` cuando no aplica, o la letra en mayúscula cuando sí aplica. Miércoles usa `"I"` (no `"X"` ni `"W"`) por convención del sistema Banner de Uniandes.

> **Nota sobre salones:** Algunos cursos no requieren aula física (`classroom: ".NOREQ"`, `building: ".No Requiere"`). Estos se excluyen del análisis de disponibilidad de salones.

#### Profesores

| Campo | Descripción |
|-------|-------------|
| `name` | Nombre completo del profesor |
| `ind` | `"Y"` si es el instructor principal, `null` en caso contrario |

#### Atributos (attr)

| Campo | Descripción |
|-------|-------------|
| `code` | Código del atributo (ej: `EPSI` para cursos Tipo Epsilon de ética) |

---

### 2. Detalles de curso (prerrequisitos, correquisitos)

```
GET /api/courseDetails?term={term}&ptrm={ptrm}&nrc={nrc}
```

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `term` | string | Período académico (ej: `202610`) |
| `ptrm` | string | Parte del período (ej: `1`) |
| `nrc` | string | NRC del curso (ej: `10703`) |

**Ejemplo:**
```
GET /api/courseDetails?term=202610&ptrm=1&nrc=10703
```

Retorna información detallada incluyendo prerrequisitos y correquisitos de la sección.

---

### 3. Cupos por programa (reservas)

```
GET /api/reservations-quotas/{llave}
```

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `llave` | string (path) | Llave del curso: NRC + término (ej: `79608202610`) |

**Ejemplo:**
```
GET /api/reservations-quotas/79608202610
```

Retorna las reservas de cupos por programa académico para una sección específica.

---

## Glosario

| Término | Descripción |
|---------|-------------|
| **NRC** | Número de Referencia del Curso. Código de 5 dígitos que identifica una sección específica |
| **Llave** | Concatenación del NRC y el período (ej: `39342202610`) |
| **Term** | Período académico: `YYYY10` (1er semestre), `YYYY20` (2do semestre), `YYYY19` (intersemestral) |
| **PTRM** | Part-of-term / ciclo: `1` (16 semanas), `8A` (primeras 8 semanas), `8B` (últimas 8 semanas) |
| **Class** | Código del departamento (ej: `MATE`, `ISIS`, `ADMI`) |
| **Course** | Código numérico del curso (ej: `1203` para Cálculo Diferencial) |

## Notas de uso

- La API no requiere autenticación.
- Para obtener todos los cursos de un período, no pasar filtros o usar un `limit` alto (ej: `10000`).
- Los datos se actualizan cada semestre desde el pipeline de GitHub Actions.
- Los nombres de edificios vienen con prefijo punto (ej: `.Edif. Mario Laserna (ML)`). El script `fetch-courses.py` extrae el código de edificio del paréntesis.
- Los códigos de salón vienen con prefijo punto y guion bajo (ej: `.ML_003`). El script extrae el número de salón después del `_`.
