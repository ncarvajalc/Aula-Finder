# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

## [No publicado]

### Añadido
- Metadatos OpenGraph completos (og:image, og:title, og:description, og:url, og:type)
- Metadatos de Twitter Cards para mejor compartición en redes sociales
- Archivo robots.txt para mejor indexación por motores de búsqueda
- Página 404 personalizada
- Imágenes de la mascota Seneca descargadas localmente en public/
- Favicon basado en la mascota Seneca
- CODE_OF_CONDUCT.md para establecer estándares de comunidad
- Plantillas de issues (.github/ISSUE_TEMPLATE/) para bug reports, feature requests, documentación y preguntas
- Plantilla de pull request (.github/PULL_REQUEST_TEMPLATE.md)
- Keywords SEO incluyendo "Sobrecupo" (nombre antiguo de la aplicación)
- Metadata mejorada en layout.tsx incluyendo información del creador y editor

## [1.0.0] - 2024-01-XX

### Añadido
- Primera versión pública de Aula-Finder
- Vista de edificios con disponibilidad en tiempo real
- Vista detallada de salones por edificio y piso
- Calendario semanal para visualizar horarios de salones
- Filtros por día, hora y ciclo (8A/8B)
- Diseño responsive para móvil, tablet y desktop
- Integración con API de cursos de Universidad de los Andes
- Pipeline de actualización automática de datos con GitHub Actions
- Soporte para ciclos 8A y 8B
- Clasificación de salones (disponible, ocupado, en cambio de clase, restringido)
- Visualización de amenidades por edificio
- Integración con Leaflet para mapas interactivos

[No publicado]: https://github.com/Open-Source-Uniandes/Aula-Finder/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Open-Source-Uniandes/Aula-Finder/releases/tag/v1.0.0
