# Documentación técnica actual - ODIN

## 1. Propósito

ODIN es un sistema para controlar el ingreso y la salida de personas en el SENA. El proyecto contiene:

- Un backend PHP MVC para autenticación, usuarios, control de ingreso, permisos, llaves, acceso externo y reportes.
- Un frontend Angular llamado `frontOdin` con la interfaz de login y módulos de operación.
- Scripts SQL y utilidades de diagnóstico para diferentes estados de la base de datos.

Esta documentación describe el estado observado en el repositorio y separa lo que está implementado de lo que todavía requiere integración.

## 2. Estructura del proyecto

```text
senaingresodespliegue/
├── app/
│   ├── controllers/      Controladores PHP MVC
│   ├── helpers/          Funciones auxiliares y validadores
│   ├── middleware/       Autenticación y autorización
│   ├── models/           Acceso a datos y lógica de dominio
│   └── views/            Vistas PHP del backend
├── config/               Configuración de aplicación y base de datos
├── database/             Esquemas, migraciones y datos de prueba
├── public/               Punto de entrada del backend PHP
├── storage/              Sesiones y logs
└── frontodin/frontOdin/  Aplicación Angular
```

## 3. Backend PHP

### 3.1 Arquitectura

El backend utiliza MVC:

- `public/index.php` funciona como front controller y enruta las solicitudes.
- `app/controllers/` contiene los controladores.
- `app/models/` contiene la conexión y las consultas.
- `app/views/` contiene las vistas HTML/PHP.
- `app/middleware/Auth.php` protege las rutas y valida roles.

El acceso a datos se centraliza en `app/models/Database.php`, que implementa un singleton PDO y consultas preparadas.

### 3.2 Módulos principales

| Módulo | Controlador | Funcionalidad |
|---|---|---|
| Autenticación | `AuthController` | Login, logout, creación de sesión y auditoría |
| Usuarios | `UsersController` | Listado, creación, edición, activación, eliminación e importación |
| Control de ingreso | `AccessControlController` | Kiosco, procesamiento de huella, estadísticas y registros recientes |
| Llaves | `KeysController` | Catálogo, préstamo, devolución e historial |
| Permisos | `PermisosController` | Creación, consulta, cancelación y validación de salidas |
| Acceso externo | `ExternalAccessController` | Registro de entradas, salidas, personas dentro y detalle |
| Reportes | `ReportsController` | Datos y exportación a Excel/PDF |

### 3.3 Autenticación del backend PHP

El flujo PHP tradicional es:

1. El usuario envía `credential` y `password` al endpoint `/login`.
2. `AuthController` valida el token CSRF.
3. `User::findByCredential()` busca por nombre de usuario o correo.
4. `password_verify()` compara la contraseña con el hash almacenado.
5. Se validan estado y bloqueo por intentos fallidos.
6. Se regenera el ID de sesión y se guardan los datos del usuario.
7. Se registra el evento en `auditoria_accesos`.
8. El usuario es redirigido a `/dashboard`.

La sesión guarda, entre otros datos:

- Identificador del usuario.
- Nombre y correo.
- Rol.
- Hora de login y última actividad.
- Dirección IP y agente del navegador.

El middleware también invalida la sesión si supera el tiempo configurado o cambia la IP/agente del navegador.

### 3.4 Autorización

El middleware `Auth` proporciona:

- `requireAuth()`: exige una sesión válida.
- `requireRole()`: permite únicamente roles específicos.
- `hasRole()`: consulta el rol actual.

Los roles utilizados por el backend son principalmente:

- `admin`
- `instructor`
- `vigilante`

Ejemplos de permisos:

- Administración de usuarios: `admin`.
- Control de ingreso y acceso externo: `admin` y `vigilante`.
- Llaves y permisos de salida: `admin` e `instructor`, con validación de salida también para `vigilante`.
- Reportes: `admin`.

## 4. Frontend Angular

### 4.1 Tecnologías

El frontend está en `frontodin/frontOdin` y utiliza:

- Angular `21.2.x`.
- TypeScript `5.9.x`.
- RxJS `7.8.x`.
- Bootstrap `5.3.x`.
- Angular Reactive Forms.
- Angular Router.
- `HttpClient`.

Los scripts principales de `package.json` son:

```text
npm start   -> ng serve
npm run build
npm test
```

### 4.2 Rutas actuales

Las rutas están definidas en `src/app/app.routes.ts`:

| Ruta | Componente | Propósito |
|---|---|---|
| `/login` | `Loguin` | Formulario de autenticación |
| `/menu` | `Menu` | Contenedor principal después del login |
| `/menu/radicacion` | `Radicaion` | Radicación |
| `/menu/gestionusuarios` | `GestionUsuarios` | Gestión de usuarios |
| `/menu/gestiontramites` | `GestionTramites` | Gestión de trámites |
| `/menu/consultaseguimiento` | `ConsultaSeguimiento` | Consulta y seguimiento |

La ruta raíz redirige a `/login` y `/menu` redirige a `/menu/radicacion`.

### 4.3 Login Angular

El componente `Loguin`:

1. Inicializa el usuario con el valor visual predeterminado `vigilante`.
2. Exige usuario y contraseña.
3. Evita solicitudes duplicadas mientras hay un login en curso.
4. Envía los datos mediante `AuthService`.
5. Navega a `/menu` cuando la respuesta es exitosa.
6. Muestra un mensaje específico para HTTP 401/403.

`AuthService` envía:

```text
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded
withCredentials: true

username=<usuario>&password=<contraseña>
```

Para cerrar sesión envía:

```text
POST /api/auth/logout
withCredentials: true
```

### 4.4 Estado de sesión en Angular

El frontend conserva la sesión mediante cookies HTTP, porque las solicitudes usan `withCredentials: true`. El logout invalida la sesión en el servidor y vuelve a `/login`.

Actualmente las rutas Angular no muestran un `AuthGuard`; por tanto, la protección real debe estar en el backend/API. El frontend puede navegar a una ruta protegida aunque el backend luego rechace sus solicitudes.

## 5. Base de datos: diferencia importante

En el repositorio existen dos modelos de base de datos que no deben mezclarse.

### 5.1 Esquema PHP documentado originalmente

`database/schema.sql` define una base MySQL con:

- `usuarios`
- `sesiones`
- `auditoria_accesos`

El archivo `.env.example` también está preparado para MySQL:

```text
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sistema_ingreso
DB_USER=root
DB_PASS=
```

Sin embargo, el modelo migrado `app/models/User.php` consulta:

- `usuarios_sistema`
- `personas`
- `cat_roles`

Por eso no se debe asumir que `database/schema.sql` y `User.php` corresponden exactamente al mismo estado de instalación.

### 5.2 Base de datos que se verificó durante esta sesión

La base utilizada para localizar el usuario de pruebas es PostgreSQL y contiene:

```text
public.usuarios
```

Sus columnas observadas son:

```text
id_usuario
id_rol
nombre
password
estado
fecha_creacion
correo
id_dependencia
```

La cuenta comprobada usa el correo:

```text
admin.pruebas@odin.local
```

La columna `password` contiene un hash bcrypt de 60 caracteres. La contraseña no se recupera desde el hash; únicamente se puede validar o restablecer mediante otro hash compatible.

La extensión de PostgreSQL utilizada para restablecer la contraseña fue:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE public.usuarios
SET password = crypt('NUEVA_CONTRASENA', gen_salt('bf'))
WHERE correo = 'admin.pruebas@odin.local';
```

No se deben copiar contraseñas reales ni hashes completos en documentación, repositorio o capturas.

## 6. Relación actual entre frontend y backend

El frontend Angular consume:

```text
/api/auth/login
/api/auth/logout
```

El front controller PHP observado expone el flujo tradicional:

```text
/login
/logout
/dashboard
```

En el código PHP revisado no aparece una implementación explícita de `/api/auth/login`. Esto significa que actualmente hay una diferencia de integración que debe aclararse:

1. Puede existir otro backend/API ejecutándose fuera de este directorio.
2. Puede existir un proxy que redirige `/api` hacia otro servicio.
3. La migración a Angular puede estar incompleta.
4. El backend PHP tradicional y el backend que usa PostgreSQL pueden ser aplicaciones o versiones diferentes.

El hecho de que el login Angular funcione confirma que en el entorno actual existe un servicio que atiende esa ruta, pero no permite concluir que sea el mismo flujo PHP descrito en `public/index.php`.

## 7. Ejecución local

### 7.1 Frontend Angular

Desde la carpeta del frontend:

```powershell
cd frontodin\frontOdin
npm install
npm start
```

La aplicación queda normalmente disponible en:

```text
http://localhost:4200
```

### 7.2 Backend PHP tradicional

Desde la raíz del proyecto:

```powershell
php -S localhost:8000 -t public
```

La aplicación PHP queda normalmente disponible en:

```text
http://localhost:8000
```

### 7.3 Verificación recomendada

Antes de probar el login:

1. Confirmar que la base de datos correcta está encendida.
2. Confirmar el puerto y el motor configurados.
3. Confirmar que la API que atiende `/api/auth/login` está ejecutándose.
4. Abrir las herramientas de desarrollador del navegador.
5. Revisar la pestaña Network y confirmar el código HTTP de `/api/auth/login`.
6. Confirmar que la cookie de sesión se establece correctamente.

## 8. Seguridad actual

Aspectos implementados en el backend PHP:

- Hash de contraseñas mediante `password_hash()`.
- Verificación mediante `password_verify()`.
- Consultas preparadas con PDO.
- Protección CSRF en el login PHP tradicional.
- Regeneración del ID de sesión.
- Cookies HTTP-only, SameSite y modo estricto configurables.
- Bloqueo temporal después de varios intentos fallidos.
- Auditoría de login exitoso, login fallido, logout y expiración.

Aspectos que deben revisarse antes de producción:

- No usar `APP_DEBUG=true`.
- No dejar contraseñas de prueba activas.
- No guardar credenciales en documentación o `.env` versionado.
- Confirmar que el frontend y el backend comparten el mismo mecanismo de sesión.
- Añadir guards Angular si se requiere protección visual de rutas.
- Definir CORS y cookies correctamente si frontend y backend usan puertos distintos.
- Unificar el motor y el esquema de base de datos soportados.

## 9. Estado funcional conocido

Actualmente está comprobado:

- El frontend Angular tiene pantalla de login y navegación hacia el menú.
- La cuenta `admin.pruebas@odin.local` existe en `public.usuarios` de PostgreSQL.
- La contraseña de esa cuenta fue restablecida mediante bcrypt y el login funciona.
- El frontend usa `/api/auth/login` y `/api/auth/logout`.
- El backend PHP tradicional contiene módulos MVC funcionales y otro esquema de autenticación.

Todavía debe quedar definido para la siguiente etapa:

- Qué servicio es la implementación oficial de `/api/auth/login`.
- Si PostgreSQL reemplaza definitivamente a MySQL.
- Si el backend oficial será la API nueva, el MVC PHP tradicional o una integración de ambos.
- Cómo se mapean `id_rol` y `estado` de PostgreSQL a los permisos del frontend.
- Qué endpoints implementarán los módulos Angular de radicación, usuarios, trámites y seguimiento.

## 10. Regla de mantenimiento

Cada cambio de autenticación, tabla o ruta debe actualizar conjuntamente:

1. El servicio Angular que consume la API.
2. El controlador o endpoint backend.
3. El modelo y la migración SQL.
4. La configuración `.env.example`.
5. Esta documentación.

