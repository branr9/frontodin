// Equivale a loguin/loguin.ts + loguin.html de Angular.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../services/authService.js'
import './Login.css'

export default function Login() {
  // En Angular esto era un FormGroup con FormControls.
  // En React cada campo es un estado (formulario "controlado").
  const [username, setUsername] = useState('vigilante')
  const [password, setPassword] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // useNavigate equivale a inyectar Router y usar router.navigate()
  const navigate = useNavigate()

  async function onSubmit(event) {
    // Evita que el navegador recargue la página (Angular lo hacía solo con ngSubmit)
    event.preventDefault()

    // Validators.required: ambos campos son obligatorios.
    // También evita enviar dos veces si ya hay una solicitud en curso.
    const formularioInvalido = username.trim() === '' || password === ''
    if (formularioInvalido || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      await login(username, password)
      setIsSubmitting(false)
      navigate('/menu')
    } catch (error) {
      setIsSubmitting(false)
      setErrorMessage(
        error.status === 401 || error.status === 403
          ? 'Credenciales inválidas o usuario inactivo. Verifique correo, identificación o nombre y contraseña.'
          : 'No fue posible iniciar sesión. Intente nuevamente.',
      )
    }
  }

  return (
    <main className="login-page">
      {/* DECORACIÓN DEL FONDO */}
      <div className="background-grid" aria-hidden="true"></div>
      <div className="background-glow" aria-hidden="true"></div>

      {/* BARRA SUPERIOR */}
      <header className="topbar">
        <div className="topbar-brand">
          <span className="topbar-icon">◆</span>
          <span>ODIN</span>
          <span className="brand-divider"></span>
          <span className="topbar-subtitle">GESTOR DOCUMENTAL</span>
        </div>

        <span className="topbar-status">
          <span className="status-dot"></span>
          SISTEMA INSTITUCIONAL
        </span>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <div className="login-layout">
        {/* COLUMNA IZQUIERDA */}
        <section className="login-panel" aria-labelledby="login-title">
          <div className="login-content">
            <div className="welcome-label">
              <span className="welcome-line"></span>
              ACCESO AL SISTEMA
            </div>

            <div className="brand">
              <h1 id="login-title">
                Bienvenido<span className="gold-dot">.</span>
              </h1>

              <p className="brand-description">
                Ingresa tus credenciales para acceder a la plataforma de gestión documental.
              </p>
            </div>

            {/* MENSAJES DE ERROR (en Angular: @if (errorMessage) { ... }) */}
            {errorMessage && (
              <div className="login-alert" role="alert">
                <span className="alert-icon">!</span>
                <p>{errorMessage}</p>
              </div>
            )}

            {/* FORMULARIO (en Angular: [formGroup] y (ngSubmit)) */}
            <form className="login-form" onSubmit={onSubmit}>
              {/* USUARIO */}
              <div className="form-field">
                <label htmlFor="username">USUARIO</label>

                <div className="input-wrapper">
                  <span className="input-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4"></circle>
                      <path d="M4 21v-2a8 8 0 0 1 16 0v2"></path>
                    </svg>
                  </span>

                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Correo, identificación o usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* CONTRASEÑA */}
              <div className="form-field">
                <label htmlFor="password">CONTRASEÑA</label>

                <div className="input-wrapper">
                  <span className="input-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <rect x="4" y="10" width="16" height="11" rx="2"></rect>
                      <path d="M8 10V7a4 4 0 0 1 8 0v3"></path>
                    </svg>
                  </span>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* BOTÓN DE INGRESO */}
              <button className="submit-button" type="submit" disabled={isSubmitting}>
                <span>{isSubmitting ? 'INICIANDO SESIÓN...' : 'INICIAR SESIÓN'}</span>
                <span className="button-arrow" aria-hidden="true">→</span>
              </button>
            </form>

            {/* OPCIONES */}
            <div className="login-options">
              <button type="button" className="forgot-password">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div className="login-footer">
              <div className="footer-line"></div>
              <p>ODIN · Sistema de Gestión Documental</p>
              <span>Servicio Nacional de Aprendizaje</span>
            </div>
          </div>
        </section>

        {/* COLUMNA DERECHA: MODELO 3D */}
        <section className="visual-panel" aria-label="Visualización 3D de ODIN">
          {/* LUCES DECORATIVAS */}
          <div className="visual-glow visual-glow-one"></div>
          <div className="visual-glow visual-glow-two"></div>

          {/* ARCO SUPERIOR FUTURISTA */}
          <div className="neon-arc" aria-hidden="true"></div>

          <div className="visual-content">
            <div className="model-heading">
              <span className="model-heading-line"></span>
              IDENTIDAD DIGITAL
              <span className="model-heading-line"></span>
            </div>

            {/* LOGO 3D REAL (web component de Google; en Angular necesitaba CUSTOM_ELEMENTS_SCHEMA) */}
            <div className="model-container">
              <model-viewer
                src="/models/base_basic_pbr.glb"
                alt="Modelo tridimensional de ODIN"
                auto-rotate=""
                rotation-per-second="8deg"
                camera-controls=""
                interaction-prompt="none"
                environment-image="neutral"
                shadow-intensity="0.3"
                exposure="1.4"
                camera-orbit="0deg 90deg auto"
                camera-target="auto auto auto"
                field-of-view="30deg"
                loading="eager"
              ></model-viewer>
            </div>

            <div className="model-text">
              <h2>ODIN</h2>
              <p>CONTROL · SEGURIDAD · GESTIÓN</p>
            </div>
          </div>

          {/* PIE DECORATIVO */}
          <div className="visual-bottom">
            <span>PLATAFORMA DIGITAL</span>
            <span className="bottom-line"></span>
            <span>GESTIÓN DOCUMENTAL</span>
          </div>
        </section>
      </div>
    </main>
  )
}
