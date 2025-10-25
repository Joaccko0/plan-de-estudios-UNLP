# 🎓 Plan de Estudios Dinámico - Universidad Nacional de La Plata

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19.1.1-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6.svg)
![Zustand](https://img.shields.io/badge/Zustand-5.0.8-orange.svg)

> **Sistema inteligente de seguimiento académico** para carreras de la Facultad de Informática - UNLP

Una aplicación web moderna y reactiva que te permite trackear tu progreso académico, validar correlativas automáticamente, gestionar materias optativas y visualizar estadísticas en tiempo real.

---

## ✨ Características Principales

### 🎯 **Gestión Inteligente de Correlativas**
- ✅ Validación automática de correlativas para cursar
- 🎯 Validación automática de correlativas para rendir finales
- 🚫 Bloqueo inteligente de materias sin requisitos cumplidos
- 📋 Vista detallada de correlativas cumplidas y pendientes por materia

### 📊 **Sistema de Estados de Materias**
Cada materia puede estar en uno de 4 estados:

| Estado | Descripción | Icono |
|--------|-------------|-------|
| **Pendiente** | No iniciada, puede estar bloqueada por correlativas | 🔄 |
| **Cursando** | Actualmente en curso | 📖 |
| **Aprobada** | Cursada aprobada, falta rendir final | 📚 |
| **Final Aprobado** | Materia completamente finalizada con nota | ✅ |

### 🎓 **Gestión de Notas y Promedios**
- 📝 Registro de notas de finales (1-10)
- ✏️ Edición de notas en cualquier momento
- 📊 Cálculo automático de promedio general
- 🎯 Promedio actualizado en tiempo real

### 🔀 **Sistema de Materias Optativas**
- 📚 Catálogo completo de optativas por carrera
- 🎯 Slots configurables según la carrera:
  - **Lic. en Sistemas**: 2 optativas
  - **Lic. en Informática**: 1 optativa
  - **Analista Programador**: 1 optativa
- 🔍 Verificación de correlativas para optativas
- 🔄 Cambio de selección de optativas en cualquier momento
- ⚠️ Prevención de selección duplicada de optativas

### 📈 **Panel de Estadísticas en Tiempo Real**
Visualización instantánea de:
- 🎯 **Materias Finalizadas**: Contador de materias con final aprobado
- 📚 **Total de Materias**: Incluye obligatorias + slots de optativas
- 📊 **Promedio**: Cálculo automático de todas las notas
- 📈 **Progreso**: Porcentaje de avance en la carrera

### 🎨 **Interfaz de Usuario**
- 🌓 **Modo Claro/Oscuro**: Tema adaptable según preferencia
- ⚡ **Performance**: Optimización con React Compiler y memoización
- 🔄 **Actualizaciones en Tiempo Real**: Sin recargas de página

### 💾 **Persistencia de Datos**
- 🔒 **LocalStorage**: Datos guardados automáticamente en el navegador
- 🔄 **Sincronización**: Estado persistente entre sesiones
- 📦 **Portabilidad**: Datos locales, sin servidor necesario

### 🎓 **Carreras Soportadas**
1. **Licenciatura en Sistemas**
   - 34 materias obligatorias
   - 2 optativas
   - 5 años de cursada

2. **Licenciatura en Informática**
   - 35 materias obligatorias
   - 1 optativa
   - 5 años de cursada

3. **Analista Programador Universitario**
   - 23 materias obligatorias
   - 1 optativa
   - 3 años de cursada