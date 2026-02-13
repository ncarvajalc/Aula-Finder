# Guía de Contribución

¡Gracias por tu interés en contribuir a AulaFinder! 💛

Este es un proyecto de [Open Source Uniandes](https://github.com/Open-Source-Uniandes), y toda contribución de la comunidad Uniandina es bienvenida.

## 📋 Tabla de contenidos

- [Código de conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Configuración del entorno de desarrollo](#configuración-del-entorno-de-desarrollo)
- [Flujo de trabajo con Git](#flujo-de-trabajo-con-git)
- [Contribuir metadatos (sin código)](#contribuir-metadatos-sin-código)
- [Guía de estilo](#guía-de-estilo)
- [Tests](#tests)
- [Preguntas frecuentes](#preguntas-frecuentes)

## Código de conducta

Este proyecto sigue un código de conducta basado en el respeto y la inclusión. Esperamos que todos los contribuidores:

- Sean respetuosos con otros contribuidores
- Acepten críticas constructivas con apertura
- Se enfoquen en lo mejor para la comunidad
- Muestren empatía hacia otros miembros

## ¿Cómo puedo contribuir?

### 🐛 Reportar errores

Si encontraste un error:

1. Revisa que no exista un [issue abierto](https://github.com/Open-Source-Uniandes/AulaFinder/issues) sobre el mismo tema
2. Si no existe, [crea un nuevo issue](https://github.com/Open-Source-Uniandes/AulaFinder/issues/new) con:
   - **Título claro y descriptivo**
   - **Pasos para reproducir el error**
   - **Comportamiento esperado vs. actual**
   - **Capturas de pantalla** si aplica
   - **Navegador y dispositivo** que estás usando

### 💡 Proponer mejoras

¿Tienes una idea increíble? Abre un [issue](https://github.com/Open-Source-Uniandes/AulaFinder/issues/new) con:

- Descripción clara de la propuesta
- Justificación de por qué sería útil
- Mockups o bocetos si los tienes

### 📸 Agregar fotos de edificios

Las imágenes de los edificios se almacenan en `public/images/buildings/`. Para agregar o actualizar una foto:

1. La imagen debe ser en formato `.jpg` o `.webp`
2. Nombre del archivo: `{código-en-minúscula}.jpg` (ejemplo: `ml.jpg`)
3. Resolución recomendada: al menos 800x600px
4. La imagen debe ser propia o de dominio público

### 📝 Actualizar metadatos

No necesitas saber programar para contribuir datos. Ver la sección [Contribuir metadatos](#contribuir-metadatos-sin-código).

### 🧑‍💻 Contribuir código

Para contribuciones de código, sigue el [flujo de trabajo con Git](#flujo-de-trabajo-con-git).

## Configuración del entorno de desarrollo

### Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior
- [Git](https://git-scm.com/)
- Un editor de código (recomendamos [VS Code](https://code.visualstudio.com/))

### Instalación

```bash
# 1. Fork del repositorio en GitHub

# 2. Clonar tu fork
git clone https://github.com/TU-USUARIO/AulaFinder.git
cd AulaFinder

# 3. Instalar dependencias
npm install

# 4. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000/AulaFinder`.

### Scripts útiles

```bash
npm run dev        # Servidor de desarrollo con hot reload
npm run build      # Construir el sitio para producción
npm run lint       # Verificar estilo de código
npm test           # Ejecutar tests
npm run test:watch # Tests en modo watch (para desarrollo)
```

## Flujo de trabajo con Git

1. **Fork** el repositorio en GitHub
2. **Clonar** tu fork localmente
3. **Crear un branch** para tu cambio:
   ```bash
   git checkout -b feature/mi-nueva-funcionalidad
   ```
4. **Hacer tus cambios** y confirmar que funcionan:
   ```bash
   npm run lint    # Verificar estilo
   npm test        # Verificar que los tests pasen
   npm run build   # Verificar que la app compila
   ```
5. **Commit** tus cambios:
   ```bash
   git commit -m "Agregar nueva funcionalidad X"
   ```
6. **Push** a tu fork:
   ```bash
   git push origin feature/mi-nueva-funcionalidad
   ```
7. **Crear un Pull Request** en GitHub con:
   - Descripción clara de los cambios
   - Referencia al issue relacionado (si existe)
   - Capturas de pantalla para cambios visuales

### Convenciones de commits

Usamos mensajes de commit descriptivos en español o inglés:

```
Agregar vista de mapa del campus
Corregir cálculo de disponibilidad para ciclo 8B
Actualizar metadatos del edificio ML
```

## Contribuir metadatos (sin código)

AulaFinder usa archivos JSON para almacenar datos de edificios y salones. ¡Cualquiera puede editarlos directamente en GitHub!

### Metadatos de edificios (`data/buildings-metadata.json`)

Puedes agregar o actualizar información de un edificio:

```json
{
  "code": "ML",
  "name": "Mario Laserna",
  "campus": "Principal",
  "order": 1,
  "imageUrl": "/images/buildings/ml.jpg",
  "coordinates": {
    "latitude": 4.601861,
    "longitude": -74.064722
  }
}
```

Para encontrar las coordenadas:
1. Abre [Google Maps](https://maps.google.com)
2. Haz clic derecho sobre el edificio
3. Copia las coordenadas
4. Incluye el enlace de Google Maps en tu PR

### Amenidades de edificios (`data/buildings-amenities.json`)

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

Tipos soportados: `coffee_shop`, `elevator`, `accessible_restroom`, `study_area`, `printer`, `wifi`, `lab`, `vending_machine`, `parking`.

### Restricciones de salones (`data/room-restrictions.json`)

```json
{
  "building": "B",
  "room": "301",
  "isRestricted": true,
  "restrictionType": "lab",
  "note": "Laboratorio de ingeniería"
}
```

> **Tip:** Usa `"room": "B3*"` como wildcard para aplicar la restricción a todos los salones que empiezan con "B3".

### Ciclos del semestre (`data/ciclos.json`)

Si conoces las fechas exactas de los ciclos 8A y 8B, puedes actualizarlas aquí.

## Guía de estilo

### Código TypeScript/React

- Usamos **TypeScript** para todos los archivos
- Estilos con **Tailwind CSS** (no CSS modules ni styled-components)
- Componentes **pequeños y enfocados** (una responsabilidad)
- **Nombres descriptivos** en inglés para variables y funciones
- **Comentarios** en español o inglés cuando sea necesario

### Estructura de archivos

- Páginas en `app/` siguiendo las convenciones de Next.js App Router
- Componentes reutilizables en `components/ui/`
- Lógica de negocio en `lib/`
- Tipos en `types/index.ts`
- Tests en `__tests__/`

## Tests

Usamos [Vitest](https://vitest.dev/) para testing. Los tests están en `__tests__/`.

### Ejecutar tests

```bash
npm test           # Ejecutar todos los tests una vez
npm run test:watch # Ejecutar en modo watch
```

### Escribir tests

Al agregar nueva funcionalidad, por favor incluye tests. Ejemplo:

```typescript
import { describe, it, expect } from "vitest";
import { miFuncion } from "@/lib/mi-modulo";

describe("miFuncion", () => {
  it("debería hacer X cuando recibe Y", () => {
    const resultado = miFuncion(entrada);
    expect(resultado).toBe(esperado);
  });
});
```

## Preguntas frecuentes

### ¿Qué significa el código "I" para miércoles?

En el sistema Banner de la Universidad de los Andes, "M" ya se usa para Martes, así que Miércoles se abrevia como "I" (por la "i" de mIércoles).

### ¿Por qué algunos salones aparecen como "restringidos"?

Algunos salones son laboratorios, oficinas o espacios que requieren reserva previa. Se marcan como restringidos para no dar la impresión de que están disponibles para uso libre.

### ¿De dónde vienen los datos de cursos?

Los datos se obtienen de la [API pública de oferta de cursos](https://ofertadecursos.uniandes.edu.co) de la Universidad de los Andes. Se actualizan automáticamente al inicio de cada semestre mediante GitHub Actions.

### ¿Puedo contribuir si no sé programar?

¡Sí! Puedes contribuir actualizando los archivos JSON de metadatos, reportando errores, proponiendo ideas, o agregando fotos de edificios. Consulta la sección [Contribuir metadatos](#contribuir-metadatos-sin-código).

---

¿Tienes más preguntas? Abre un [issue](https://github.com/Open-Source-Uniandes/AulaFinder/issues) o contacta a [Open Source Uniandes](https://github.com/Open-Source-Uniandes). 👈
