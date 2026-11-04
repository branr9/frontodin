// Equivale a services/authservice.ts de Angular.
// En React no hace falta @Injectable ni HttpClient: se usan funciones normales y fetch().

// [AUTH REACT] Esta ruta es API; no usa /login ni vistas Thymeleaf.
const LOGIN_URL = '/api/auth/login'
const LOGOUT_URL = '/api/auth/logout'

/**
 * Inicia sesión en Spring Boot.
 * Envía username y password como formulario (x-www-form-urlencoded), igual que Angular.
 * Si el backend responde 200, Spring crea la cookie JSESSIONID.
 * Si responde 401/403 (o cualquier error), lanza un Error con la propiedad "status".
 */
export async function login(username, password) {
  const body = new URLSearchParams()
  body.set('username', username)
  body.set('password', password)

  const response = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    credentials: 'include', // equivale a withCredentials: true
  })

  if (!response.ok) {
    const error = new Error('No fue posible iniciar sesión')
    error.status = response.status
    throw error
  }

  // El backend responde { authenticated: true, username: '...' }
  return response.json().catch(() => null)
}

/**
 * [AUTH REACT] Cierra la sesión HTTP sin usar la vista Thymeleaf /logout.
 */
export async function logout() {
  const response = await fetch(LOGOUT_URL, {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    const error = new Error('No se pudo confirmar el cierre de sesión')
    error.status = response.status
    throw error
  }
}
