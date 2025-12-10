# Documento de Requerimientos de Software (SRS)
**Proyecto:** Sistema de Gestión de Inventario y Solicitudes - CETPRO
**Versión:** 1.0 (Estado Actual)
**Fecha:** 10 de Diciembre, 2025

## 1. Introducción
### 1.1 Propósito
El propósito de este sistema es digitalizar y optimizar el control de inventario, la gestión de usuarios y el flujo de solicitudes de materiales dentro del CETPRO. El sistema busca eliminar registros manuales, asegurar la integridad del stock y agilizar la atención de pedidos docentes.

### 1.2 Alcance
El sistema abarca:
*   Gestión de Usuarios y Roles (Administrador).
*   Control de Inventario: Entradas (Abastecimiento) y Salidas (Despacho).
*   Gestión de Solicitudes de Bienes por parte de Docentes.
*   Flujo de Aprobación/Rechazo por parte de la Dirección.
*   Notificaciones en tiempo real.

## 2. Actores del Sistema
Los siguientes roles han sido implementados con permisos específicos mediante Row Level Security (RLS) en Supabase:

1.  **Administrador**: Encargado de la gestión de usuarios y configuración del sistema.
2.  **Director**: Responsable del inventario y aprobación de solicitudes.
3.  **Docente**: Usuario final que requiere materiales para sus actividades.

## 3. Requerimientos Funcionales

### 3.1 Módulo de Administración (Admin)
*   **Gestión de Usuarios**:
    *   **RF-001**: El sistema debe permitir visualizar una lista de todos los usuarios registrados con su rol actual.
    *   **RF-002**: El Adminsitrador debe poder crear, editar (cambiar roles) y eliminar usuarios (lógicamente).
    *   **RF-003**: El sistema debe mostrar estadísticas generales en el Dashboard (Resumen de usuarios).

### 3.2 Módulo de Dirección (Director)
*   **Gestión de Inventario (Entradas)**:
    *   **RF-004**: Registrar el ingreso de bienes (Código, Descripción, Cantidad, Proveedor, Fuente de Ingreso).
    *   **RF-005**: Visualizar el historial de todas las entradas.
*   **Gestión de Inventario (Salidas)**:
    *   **RF-006**: Registrar salidas manuales de bienes.
    *   **RF-007**: Las salidas aprobadas desde solicitudes deben generar automáticamente un registro de salida.
*   **Gestión de Solicitudes**:
    *   **RF-008**: Visualizar todas las solicitudes de los docentes.
    *   **RF-009**: Filtrar solicitudes por estado (Todas vs. Pendientes).
    *   **RF-010**: Procesar solicitudes ítem por ítem:
        *   *Aprobar*: Descuenta stock automáticamente si es un bien existente.
        *   *Rechazar*: Marca el ítem como denegado sin afectar stock.
*   **Notificaciones**:
    *   **RF-011**: El sistema debe notificar en tiempo real (Icono de Campana) cuando ingresa una nueva solicitud.
    *   **RF-012**: El contador de notificaciones debe reflejar solo las solicitudes con estado `PENDIENTE`.

### 3.3 Módulo Docente
*   **Solicitud de Bienes**:
    *   **RF-013**: El docente puede visualizar el catálogo de bienes disponibles (Stock actual).
    *   **RF-014**: Crear solicitudes agregando múltiples ítems (existentes o nuevos productos no listados).
    *   **RF-015**: El sistema debe generar un código único correlativo para cada solicitud (ej. `JUA-SOL-0001`) basado en el nombre del docente.
    *   **RF-016**: Visualizar el estado de sus solicitudes previas.

## 4. Requerimientos no Funcionales
*   **RNF-001 (Seguridad)**: El acceso a los datos debe estar restringido por políticas RLS (Row Level Security) en la base de datos. Un docente no puede ver datos de otros docentes; un Director puede ver todo el inventario.
*   **RNF-002 (Tiempo Real)**: Las actualizaciones de inventario y notificaciones deben reflejarse sin necesidad de recargar la página (uso de WebSockets/Supabase Realtime).
*   **RNF-003 (Interfaz)**: La interfaz debe ser responsiva y amigable, con feedback visual de acciones (cargando, éxito, error).

## 5. Stack Tecnológico
*   **Frontend**: Angular v19 (Standalone Components, Signals).
*   **Backend / Base de Datos**: Supabase (PostgreSQL).
*   **Autenticación**: Supabase Auth.
*   **Estilos**: CSS Nativo (Diseño limpio y profesional).

## 6. Modelo de Datos (Simplificado)
*   **profiles**: Usuarios y roles (Admin, Director, Docente).
*   **inventory_entries**: Registro histórico de ingresos.
*   **inventory_exits**: Registro histórico de salidas.
*   **product_requests**: Cabecera de solicitud (Usuario, Fecha, Código).
*   **product_request_items**: Detalle de solicitud (Producto, Cantidad, Estado[PENDING/APPROVED/REJECTED]).
*   **view_inventory_stock**: Vista SQL calculada (Entradas - Salidas) para el stock actual.
