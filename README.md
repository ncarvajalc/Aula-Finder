# Aula-Finder

> 🏫 Encuentra salones disponibles en la Universidad de los Andes

[![Deploy to GitHub Pages](https://github.com/Open-Source-Uniandes/Aula-Finder/actions/workflows/deploy.yml/badge.svg)](https://github.com/Open-Source-Uniandes/Aula-Finder/actions/workflows/deploy.yml)
[![Built with Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[🌐 Visita la app → open-source-uniandes.github.io/Aula-Finder](https://open-source-uniandes.github.io/Aula-Finder/)**

**[📊 Dashboard de OpenPanel](https://dashboard.openpanel.dev/share/overview/hQ9bOd)**

---

¡Bienvenido! Aula-Finder es una aplicación web que se nutre de la [API de cursos](https://ofertadecursos.uniandes.edu.co) de la Universidad de los Andes para ayudarte a encontrar salones libres en el campus. Para más detalles técnicos de la API, consulta la [Documentación de la API](docs/API.md).

## ✨ ¿Qué puede hacer?

- 🏢 **Explorar edificios** — Ve todos los edificios del campus con cuántos salones están libres en tiempo real
- 🗂️ **Ver salones por piso** — Navega los salones de cada edificio organizados por piso, con su estado actual (disponible, ocupado, en cambio de clase)
- 📅 **Calendario semanal** — Visualiza el horario completo de cualquier salón en una vista de calendario
- ⏱️ **Filtros de día, hora y ciclo** — Busca disponibilidad para cualquier momento de la semana, incluyendo soporte para ciclos 8A/8B
- 📱 **Diseño responsive** — Funciona en celular, tablet y computador
- 🔄 **Datos actualizados automáticamente** — Un pipeline de GitHub Actions actualiza los datos de cursos cada semestre

## 🚀 Cómo usar la app

1. **Selecciona el día y la hora** que te interesa (o presiona "Ahora" para el momento actual)
2. **Haz clic en un edificio** para ver sus salones organizados por piso
3. **Los salones muestran su estado:**
   - 🟢 **Disponible** — El salón está libre
   - 🔴 **Ocupado** — Hay una clase en curso
   - ⏳ **En cambio de clase** — Hay un cambio de clase de menos de 10 minutos
   - 🔒 **Restringido** — Laboratorio o espacio de acceso restringido
4. **Haz clic en un salón** para ver su calendario semanal completo

## 🛠 Desarrollo local

### Requisitos previos

- [Node.js](https://nodejs.org/) 18+
- [Python](https://www.python.org/) 3.11+ (solo para actualizar datos de cursos)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Open-Source-Uniandes/Aula-Finder.git
cd Aula-Finder

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000/Aula-Finder](http://localhost:3000/Aula-Finder) en tu navegador.

### Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Construye el sitio estático (directorio `out/`) |
| `npm run lint` | Ejecuta ESLint |
| `npm test` | Ejecuta los tests con Vitest |
| `npm run test:watch` | Ejecuta los tests en modo watch |

## 📁 Estructura del proyecto

```
Aula-Finder/
├── app/                        # Next.js App Router (páginas)
│   ├── page.tsx               # Página principal (vista de edificios)
│   ├── building/[code]/       # Detalle de un edificio
│   └── classroom/[building]/[room]/  # Calendario de un salón
├── components/                 # Componentes React
│   ├── ui/                    # Componentes reutilizables (Button, Card, Modal)
│   └── WeekCalendar.tsx       # Componente de calendario semanal
├── lib/                        # Lógica de negocio
│   ├── parse-courses.ts       # Parser de cursos y lógica de disponibilidad
│   ├── data-loader.ts         # Carga de metadatos
│   └── utils.ts               # Utilidades
├── types/                      # Definiciones TypeScript
│   └── index.ts
├── data/                       # Datos editables (ver data/README.md)
│   ├── courses/               # Datos de cursos por semestre
│   ├── buildings-metadata.json
│   ├── buildings-amenities.json
│   ├── room-restrictions.json
│   └── ciclos.json            # Definiciones de ciclos (8A/8B)
├── scripts/                    # Pipeline de datos (Python)
│   ├── fetch-courses.py       # Descarga datos de la API
│   └── analyze-enums.py       # Extrae valores únicos (genera artefactos de CI, no se versionan)
├── docs/                       # Documentación adicional
│   └── API.md                 # Documentación de la API de cursos
├── __tests__/                  # Tests
└── .github/workflows/          # GitHub Actions
    ├── deploy.yml             # Deploy a GitHub Pages
    └── fetch-courses.yml      # Actualización automática de datos
```

## 📖 Conceptos clave

### Códigos de día

Los días de la semana se abrevian con un código de una letra:

| Código | Día |
|--------|-----|
| **L** | Lunes |
| **M** | Martes |
| **I** | Miércoles |
| **J** | Jueves |
| **V** | Viernes |
| **S** | Sábado |
| **D** | Domingo |

> **¿Por qué "I" para miércoles?** Porque "M" ya se usa para Martes. Esta es la convención usada por el sistema Banner de la Universidad de los Andes.

### Sistema de ciclos (ptrm)

Los cursos en Uniandes pueden tener diferentes duraciones dentro del semestre:

| Ciclo | Código | Descripción |
|-------|--------|-------------|
| **Semestre completo** | `1` | 16 semanas (enero–mayo o agosto–noviembre) |
| **Primera mitad** | `8A` | Primeras 8 semanas del semestre |
| **Segunda mitad** | `8B` | Últimas 8 semanas del semestre |

> **Nota:** En la API de cursos también existen otros valores de `ptrm` (como `2`, `3`, `D`) que corresponden a variantes menos comunes. Aula-Finder filtra principalmente por los ciclos `1`, `8A` y `8B`.

Aula-Finder detecta automáticamente el ciclo actual y filtra los resultados.

### Regla de los 10 minutos

Para reflejar la realidad del campus, los salones no se muestran como "disponibles" si hay menos de 10 minutos entre el fin de una clase y el inicio de la siguiente. Este tiempo de transición es necesario para que los estudiantes se desplacen entre edificios.

### Salones compuestos

Algunos salones tienen notación compuesta como "AU 103-4", lo que significa que incluye los salones 103 y 104. Aula-Finder los descompone automáticamente.

## 🔄 Pipeline de datos

### Actualización automática

El workflow de GitHub Actions (`.github/workflows/fetch-courses.yml`) se ejecuta automáticamente 2 veces al año:
- **Enero (3ª semana)** — Semestre XXXX10
- **Agosto (1ª semana)** — Semestre XXXX20

También se puede ejecutar manualmente desde la pestaña Actions del repositorio.

### Actualización manual

```bash
# Descargar datos del semestre actual
python scripts/fetch-courses.py

# Descargar un semestre específico
python scripts/fetch-courses.py 202610

# Extraer valores únicos (solo para depuración local, los archivos resultantes no se versionan)
python scripts/analyze-enums.py
```

## 🤝 Contribuir

¡Todas las contribuciones son bienvenidas! Este es un proyecto de la comunidad Uniandina para la comunidad Uniandina. El software lo construimos entre todos 💛

Consulta la **[Guía de Contribución](CONTRIBUTING.md)** para información detallada.

### 💬 ¿Tienes una pregunta o idea?

Antes de abrir un issue, revisa las **[Discusiones](https://github.com/Open-Source-Uniandes/Aula-Finder/discussions)** donde la comunidad comparte:

- 💡 Ideas para nuevas funcionalidades
- ❓ Preguntas sobre cómo usar la app
- 🎓 Temas de discusión sobre el proyecto
- 📢 Anuncios y novedades

### Formas rápidas de contribuir

- **🐛 Reportar un error** — Abre un [issue](https://github.com/Open-Source-Uniandes/Aula-Finder/issues)
- **💡 Proponer una idea** — Abre una [discusión](https://github.com/Open-Source-Uniandes/Aula-Finder/discussions) o un [issue](https://github.com/Open-Source-Uniandes/Aula-Finder/issues) con la etiqueta "enhancement"
- **📝 Actualizar metadatos** — Edita los archivos JSON en `data/` (consulta `data/README.md` para instrucciones detalladas)
- **🧑‍💻 Contribuir código** — Haz un fork, crea un branch, y abre un Pull Request

## 👥 Contribuidores

Gracias a todas las personas que han hecho posible este proyecto:

<!-- ALL-CONTRIBUTORS-LIST:START -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://github.com/t-montes"><img src="https://avatars.githubusercontent.com/u/59377362?v=4" width="80px;" alt="Tony Montes"/><br /><sub><b>Tony Montes</b></sub></a></td>
      <td align="center"><a href="https://github.com/luccasrojas"><img src="https://avatars.githubusercontent.com/u/83490741?v=4" width="80px;" alt="Luccas Rojas"/><br /><sub><b>Luccas Rojas</b></sub></a></td>
      <td align="center"><a href="https://github.com/SnowArtz"><img src="https://avatars.githubusercontent.com/u/93491002?v=4" width="80px;" alt="David Santiago Ortiz"/><br /><sub><b>David Santiago Ortiz</b></sub></a></td>
      <td align="center"><a href="https://github.com/ddi4z"><img src="https://avatars.githubusercontent.com/u/110594320?v=4" width="80px;" alt="Daniel Diaz"/><br /><sub><b>Daniel Diaz</b></sub></a></td>
      <td align="center"><a href="https://github.com/jsurrea"><img src="https://avatars.githubusercontent.com/u/68788933?v=4" width="80px;" alt="Sebastian Urrea"/><br /><sub><b>Sebastian Urrea</b></sub></a></td>
    </tr>
    <tr>
      <td align="center"><a href="https://github.com/FranklinSRomero"><img src="https://avatars.githubusercontent.com/u/105438748?v=4" width="80px;" alt="Franklin Romero"/><br /><sub><b>Franklin Romero</b></sub></a></td>
      <td align="center"><a href="https://github.com/ikbakkk"><img src="https://avatars.githubusercontent.com/u/80040032?v=4" width="80px;" alt="ikbakkk"/><br /><sub><b>ikbakkk</b></sub></a></td>
    </tr>
  </tbody>
</table>
<!-- ALL-CONTRIBUTORS-LIST:END -->

¿Quieres aparecer en esta lista? Consulta la [Guía de Contribución](CONTRIBUTING.md#añadirse-a-la-lista-de-contribuidores) para instrucciones.

## 📄 Licencia

Este proyecto está licenciado bajo la [Licencia MIT](LICENSE).

## 📊 Analítica

Analytics powered by [OpenPanel](https://openpanel.dev/) — ¡Gracias por apoyar el software open source con tu visita! 🙌

## 🏛 Open Source Uniandes

Este proyecto es desarrollado y mantenido por [Open Source Uniandes](https://github.com/Open-Source-Uniandes), una comunidad estudiantil que promueve la cultura open source y el desarrollo colaborativo de software en la Universidad de los Andes.

Hecho con 💛 en Uniandes