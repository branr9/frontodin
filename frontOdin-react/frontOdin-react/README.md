# FrontOdin en React

Es el mismo frontend de **ODIN · Gestor documental** que está hecho en Angular (`frontOdin`), pero construido con **React + Vite**.
Tiene las mismas pantallas, rutas, estilos y modelo 3D, y se conecta al mismo backend Spring Boot.

Es un **punto de partida**: el login y el menú ya funcionan; los cuatro módulos (Radicación, Consulta y seguimiento, Gestión de trámites y Gestión de usuarios) están vacíos para que ustedes los construyan.

---

## 1. Requisitos

- **Node.js 20.19 o superior** (o 22.12 o superior). Es el mismo que pide Angular 21. Revíselo con `node -v`.
- **El backend Spring Boot de ODIN encendido en el puerto 8080**, con su base de datos.
- VS Code.

## 2. Cómo ejecutarlo

En una terminal de VS Code (PowerShell), dentro de la carpeta `frontOdin-react`:

```powershell
npm install
npm start
```

Abra **http://localhost:5173** en el navegador.

> `npm install` solo se hace la primera vez (o cuando cambie `package.json`).
> Si va a correr la versión Angular al mismo tiempo, no hay problema: Angular usa el puerto 4200 y React el 5173.

## 3. Estructura

```text
frontOdin-react/
├── index.html                  ← equivale a src/index.html (<div id="root"> en vez de <app-root>)
├── vite.config.js              ← equivale a proxy.conf.json (reenvía /api al backend 8080)
├── package.json
├── public/
│   ├── favicon.ico
│   └── models/base_basic_pbr.glb   ← modelo 3D del login
└── src/
    ├── main.jsx                ← equivale a main.ts + app.config.ts
    ├── App.jsx                 ← equivale a app.routes.ts (todas las rutas)
    ├── index.css               ← equivale a styles.css
    ├── services/
    │   └── authService.js      ← equivale a services/authservice.ts
    └── paginas/
        ├── Login/              ← equivale a loguin/
        ├── Menu/               ← equivale a menu/
        ├── Radicacion/         ← equivale a radicaion/
        ├── ConsultaSeguimiento/
        ├── GestionTramites/
        └── GestionUsuarios/
```

En Angular cada componente tiene 3 o 4 archivos (`.ts`, `.html`, `.css`, `.spec.ts`).
En React el HTML y la lógica van juntos en un solo archivo `.jsx`, y el CSS se importa al inicio.

## 4. De Angular a React: equivalencias

| En Angular | En React (este proyecto) |
|---|---|
| `@Component({ templateUrl, styleUrl })` | Una función que devuelve JSX: `export default function Login() { return (...) }` |
| `class="..."` | `className="..."` |
| `for="..."` en un `<label>` | `htmlFor="..."` |
| `{{ errorMessage }}` | `{errorMessage}` |
| `@if (errorMessage) { ... }` | `{errorMessage && ( ... )}` |
| `[disabled]="isSubmitting"` | `disabled={isSubmitting}` |
| `(click)="logout()"` | `onClick={onLogout}` |
| `(ngSubmit)="onSubmit()"` | `<form onSubmit={onSubmit}>` y `event.preventDefault()` |
| Propiedad de la clase (`isSubmitting = false`) | Estado: `const [isSubmitting, setIsSubmitting] = useState(false)` |
| `FormGroup` + `formControlName` | Un estado por campo + `value` y `onChange` (formulario controlado) |
| `Validators.required` | Un `if` antes de enviar |
| `HttpClient` + `subscribe()` | `fetch()` + `async/await` + `try/catch` |
| `withCredentials: true` | `credentials: 'include'` |
| `@Injectable` (servicio) | Un archivo `.js` con funciones exportadas |
| `constructor(private router: Router)` + `router.navigate()` | `const navigate = useNavigate()` + `navigate('/menu')` |
| `app.routes.ts` | `<Routes>` y `<Route>` en `App.jsx` |
| `redirectTo` | `<Navigate to="..." replace />` |
| `children: [...]` | Rutas `<Route>` dentro de otra `<Route>` |
| `<router-outlet>` | `<Outlet />` |
| `routerLink` + `routerLinkActive="is-active"` | `<NavLink to="..." className={({ isActive }) => ...}>` |
| `CUSTOM_ELEMENTS_SCHEMA` para `<model-viewer>` | No hace falta: React acepta etiquetas personalizadas |
| Estilos encapsulados por componente | CSS global: por eso cada regla empieza con `.login-page` o `.app-shell` |

## 5. Cómo funciona el login

```text
Usuario visita /login
        ↓
React muestra el formulario (Login.jsx)
        ↓
Usuario escribe usuario y contraseña y pulsa INICIAR SESIÓN
        ↓
authService.login() hace POST /api/auth/login   (formulario x-www-form-urlencoded)
        ↓
Vite reenvía la petición a http://localhost:8080 (vite.config.js)
        ↓
Spring Security valida y crea la sesión (cookie JSESSIONID)
        ↓
200 → navigate('/menu')         401/403 → mensaje "Credenciales inválidas..."
```

El código relacionado con la autenticación está marcado con el comentario `[AUTH REACT]`
(en Angular era `[AUTH ANGULAR]`), para encontrarlo rápido con Ctrl + Shift + F.

## 6. Rutas

| Ruta | Componente |
|---|---|
| `/` | Redirige a `/login` |
| `/login` | `Login` |
| `/menu` | `Menu` (redirige a `/menu/radicacion`) |
| `/menu/radicacion` | `Radicacion` |
| `/menu/consultaseguimiento` | `ConsultaSeguimiento` |
| `/menu/gestiontramites` | `GestionTramites` |
| `/menu/gestionusuarios` | `GestionUsuarios` |
| Cualquier otra | Redirige a `/login` |

## 7. Cómo agregar un módulo nuevo (ejemplo: Reportes)

1. Cree la carpeta `src/paginas/Reportes/` y dentro el archivo `Reportes.jsx`:

   ```jsx
   export default function Reportes() {
     return <p>reportes works!</p>
   }
   ```

2. En `src/App.jsx`, impórtelo y agregue la ruta **dentro** de la ruta `/menu`:

   ```jsx
   import Reportes from './paginas/Reportes/Reportes.jsx'
   // ...
   <Route path="reportes" element={<Reportes />} />
   ```

3. En `src/paginas/Menu/Menu.jsx`, agregue el enlace en el menú lateral:

   ```jsx
   <NavLink className={claseNav} to="/menu/reportes" aria-label="Reportes">
     <span className="nav-icon" aria-hidden="true">▤</span>
     <span>Reportes</span>
   </NavLink>
   ```

## 8. Cosas para tener en cuenta

- **Cierre de sesión:** el frontend llama a `POST /api/auth/logout`, igual que Angular, pero ese endpoint **todavía no existe en el backend**.
  Por eso responde 404, en consola aparece "No se pudo confirmar el cierre de sesión" y la sesión sigue abierta en el servidor.
  Igual que en Angular, la app vuelve al login de todas formas. Hay que crear ese endpoint en Spring Boot.
- **Solo se reenvía `/api` al backend.** En Angular también se reenviaban `/login` y `/logout`; eso hacía que al
  recargar la página del login apareciera el login antiguo de Thymeleaf. Aquí `/login` es solo de React.
- **Las rutas no están protegidas en el frontend** (en Angular tampoco había `AuthGuard`). Si alguien escribe `/menu`
  sin iniciar sesión, ve el menú; la protección real está en el backend.
- **Advertencias en consola:** "Lit is in dev mode" y los mensajes de WebGL vienen del visor 3D. Son normales.

## 9. Retos para seguir construyendo

1. **Proteger las rutas:** crear un componente `RutaProtegida` que mande a `/login` si no hay sesión.
2. **Mostrar el usuario real:** el backend responde `{ authenticated: true, username: '...' }` al iniciar sesión.
   Guárdelo y muéstrelo en el menú en lugar de "Usuario ODIN".
3. **Mensajes de validación:** mostrar "Este campo es obligatorio" cuando el usuario o la contraseña estén vacíos.
4. **Construir un módulo:** por ejemplo, Radicación consumiendo `/api/radicados` del backend.
