import { useState, useEffect, useMemo } from 'react'
import './ConsultaSeguimiento.css'

export default function ConsultaSeguimiento() {
  const [radicados, setRadicados] = useState([])
  const [estados, setEstados] = useState([])
  const [dependencias, setDependencias] = useState([])
  const [tramites, setTramites] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filtros
  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroDependencia, setFiltroDependencia] = useState('')
  const [filtroTramite, setFiltroTramite] = useState('')
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const porPagina = 10

  // Modal de Detalle
  const [radicadoSeleccionado, setRadicadoSeleccionado] = useState(null)
  const [documentosRadicado, setDocumentosRadicado] = useState([])
  const [cargandoDetalle, setCargandoDetalle] = useState(false)

  // Carga inicial de datos
  useEffect(() => {
    cargarCatalogosYRadicados()
  }, [])

  async function cargarCatalogosYRadicados() {
    setLoading(true)
    setError(null)
    try {
      const [resRadicados, resEstados, resDeps, resTramites] = await Promise.all([
        fetch('/api/radicados', { credentials: 'include' }),
        fetch('/api/estados', { credentials: 'include' }),
        fetch('/api/dependencias', { credentials: 'include' }),
        fetch('/api/tramites', { credentials: 'include' }),
      ])

      if (resRadicados.ok) {
        const dataR = await resRadicados.json()
        setRadicados(Array.isArray(dataR) ? dataR : [])
      }
      if (resEstados.ok) {
        const dataE = await resEstados.json()
        setEstados(Array.isArray(dataE) ? dataE : [])
      }
      if (resDeps.ok) {
        const dataD = await resDeps.json()
        setDependencias(Array.isArray(dataD) ? dataD : [])
      }
      if (resTramites.ok) {
        const dataT = await resTramites.json()
        setTramites(Array.isArray(dataT) ? dataT : [])
      }
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setError('No se pudo conectar con el servidor para obtener los datos.')
    } finally {
      setLoading(false)
    }
  }

  // Mapas rápidos para resolución de nombres
  const mapEstados = useMemo(() => {
    const map = {}
    estados.forEach((e) => {
      const id = e.id_estado ?? e.id
      if (id != null) map[id] = e.nombre
    })
    return map
  }, [estados])

  const mapDependencias = useMemo(() => {
    const map = {}
    dependencias.forEach((d) => {
      const id = d.id_dependencia ?? d.id
      if (id != null) map[id] = d.nombre || d.dependencia
    })
    return map
  }, [dependencias])

  const mapTramites = useMemo(() => {
    const map = {}
    tramites.forEach((t) => {
      const id = t.idTramite ?? t.id_tramite ?? t.id
      if (id != null) map[id] = t.nombre
    })
    return map
  }, [tramites])

  // Cálculo de días restantes
  function calcularDiasRestantes(fechaVencimiento) {
    if (!fechaVencimiento) return null
    try {
      const fechaVenc = new Date(fechaVencimiento.substring(0, 10) + 'T00:00:00')
      if (isNaN(fechaVenc.getTime())) return null
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      const diffTime = fechaVenc.getTime() - hoy.getTime()
      return Math.round(diffTime / (1000 * 60 * 60 * 24))
    } catch {
      return null
    }
  }

  // Filtrado reactivo en el cliente
  const radicadosFiltrados = useMemo(() => {
    return radicados.filter((r) => {
      // Filtro de Texto (radicado, asunto, remitente)
      if (filtroTexto.trim()) {
        const search = filtroTexto.toLowerCase()
        const num = (r.numero_radicado || '').toLowerCase()
        const asunto = (r.asunto || '').toLowerCase()
        const remitente = (r.remitente || '').toLowerCase()
        if (!num.includes(search) && !asunto.includes(search) && !remitente.includes(search)) {
          return false
        }
      }

      // Filtro Estado
      if (filtroEstado) {
        const idEstado = String(r.id_estado || '')
        if (idEstado !== String(filtroEstado)) return false
      }

      // Filtro Dependencia
      if (filtroDependencia) {
        const idDep = String(r.id_dependencia || '')
        if (idDep !== String(filtroDependencia)) return false
      }

      // Filtro Trámite
      if (filtroTramite) {
        const idTr = String(r.id_tramite || '')
        if (idTr !== String(filtroTramite)) return false
      }

      // Filtro Rango de Fechas (fecha_radicado)
      if (filtroFechaDesde && r.fecha_radicado) {
        const fRad = r.fecha_radicado.substring(0, 10)
        if (fRad < filtroFechaDesde) return false
      }
      if (filtroFechaHasta && r.fecha_radicado) {
        const fRad = r.fecha_radicado.substring(0, 10)
        if (fRad > filtroFechaHasta) return false
      }

      return true
    })
  }, [radicados, filtroTexto, filtroEstado, filtroDependencia, filtroTramite, filtroFechaDesde, filtroFechaHasta])

  // KPIs
  const kpis = useMemo(() => {
    let pendientes = 0
    let vencidos = 0
    let proximos = 0

    radicadosFiltrados.forEach((r) => {
      const dias = calcularDiasRestantes(r.fecha_vencimiento)
      const nombreEst = (mapEstados[r.id_estado] || '').toLowerCase()
      const esFinalizado = nombreEst.includes('finaliz') || nombreEst.includes('cerrad') || nombreEst.includes('archiv')

      if (!esFinalizado) {
        pendientes++
        if (dias !== null) {
          if (dias < 0) {
            vencidos++
          } else if (dias <= 3) {
            proximos++
          }
        }
      }
    })

    return {
      total: radicadosFiltrados.length,
      pendientes,
      vencidos,
      proximos,
    }
  }, [radicadosFiltrados, mapEstados])

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(radicadosFiltrados.length / porPagina))
  const radicadosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * porPagina
    return radicadosFiltrados.slice(inicio, inicio + porPagina)
  }, [radicadosFiltrados, paginaActual])

  function limpiarFiltros() {
    setFiltroTexto('')
    setFiltroEstado('')
    setFiltroDependencia('')
    setFiltroTramite('')
    setFiltroFechaDesde('')
    setFiltroFechaHasta('')
    setPaginaActual(1)
  }

  // Abrir modal de detalles
  async function abrirDetalle(radicado) {
    setRadicadoSeleccionado(radicado)
    setDocumentosRadicado([])
    setCargandoDetalle(true)
    try {
      const res = await fetch(`/api/documentos/radicado/${radicado.id_radicado}`, {
        credentials: 'include',
      })
      if (res.ok) {
        const docs = await res.json()
        setDocumentosRadicado(Array.isArray(docs) ? docs : [])
      }
    } catch (e) {
      console.error('Error al obtener documentos del radicado:', e)
    } finally {
      setCargandoDetalle(false)
    }
  }

  function cerrarDetalle() {
    setRadicadoSeleccionado(null)
    setDocumentosRadicado([])
  }

  return (
    <div className="consulta-container">
      {/* Encabezado */}
      <div className="consulta-header">
        <div>
          <h2>Consulta y Seguimiento</h2>
          <p>Búsqueda avanzada, filtros y trazabilidad de radicados documentales</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem' }}>
          {error}
        </div>
      )}

      {/* Tarjetas KPI */}
      <div className="kpis-grid">
        <div className="kpi-card kpi-total">
          <div className="lbl">Resultados</div>
          <div className="val">{kpis.total}</div>
        </div>
        <div className="kpi-card kpi-pendientes">
          <div className="lbl">Pendientes</div>
          <div className="val">{kpis.pendientes}</div>
        </div>
        <div className="kpi-card kpi-vencidos">
          <div className="lbl">Vencidos</div>
          <div className="val">{kpis.vencidos}</div>
        </div>
        <div className="kpi-card kpi-proximos">
          <div className="lbl">Próximos (≤ 3 días)</div>
          <div className="val">{kpis.proximos}</div>
        </div>
      </div>

      {/* Formulario de Filtros */}
      <div className="filter-card">
        <div className="filter-grid">
          <div className="filter-field">
            <label>Texto (radicado, asunto, remitente)</label>
            <input
              type="text"
              placeholder="Buscar término..."
              value={filtroTexto}
              onChange={(e) => {
                setFiltroTexto(e.target.value)
                setPaginaActual(1)
              }}
            />
          </div>

          <div className="filter-field">
            <label>Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value)
                setPaginaActual(1)
              }}
            >
              <option value="">Todos</option>
              {estados.map((e) => (
                <option key={e.id_estado ?? e.id} value={e.id_estado ?? e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Dependencia</label>
            <select
              value={filtroDependencia}
              onChange={(e) => {
                setFiltroDependencia(e.target.value)
                setPaginaActual(1)
              }}
            >
              <option value="">Todas</option>
              {dependencias.map((d) => (
                <option key={d.id_dependencia ?? d.id} value={d.id_dependencia ?? d.id}>
                  {d.nombre || d.dependencia}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Trámite</label>
            <select
              value={filtroTramite}
              onChange={(e) => {
                setFiltroTramite(e.target.value)
                setPaginaActual(1)
              }}
            >
              <option value="">Todos</option>
              {tramites.map((t) => (
                <option key={t.idTramite ?? t.id_tramite ?? t.id} value={t.idTramite ?? t.id_tramite ?? t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Fecha Desde</label>
            <input
              type="date"
              value={filtroFechaDesde}
              onChange={(e) => {
                setFiltroFechaDesde(e.target.value)
                setPaginaActual(1)
              }}
            />
          </div>

          <div className="filter-field">
            <label>Fecha Hasta</label>
            <input
              type="date"
              value={filtroFechaHasta}
              onChange={(e) => {
                setFiltroFechaHasta(e.target.value)
                setPaginaActual(1)
              }}
            />
          </div>

          <div className="filter-actions">
            <button
              className="btn-limpiar"
              type="button"
              onClick={limpiarFiltros}
              title="Restablecer filtros"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="table-wrap">
        <table className="table-odin">
          <thead>
            <tr>
              <th>Radicado</th>
              <th>Asunto</th>
              <th>Trámite</th>
              <th>Estado</th>
              <th>Dependencia</th>
              <th>Responsable</th>
              <th>Vencimiento</th>
              <th>Días Restantes</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="empty-state">
                  <div className="empty-icon">⏳</div>
                  <p>Cargando radicados del sistema...</p>
                </td>
              </tr>
            ) : radicadosPaginados.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-state">
                  <div className="empty-icon">📂</div>
                  <p>No se encontraron radicados con los filtros aplicados.</p>
                </td>
              </tr>
            ) : (
              radicadosPaginados.map((r) => {
                const dias = calcularDiasRestantes(r.fecha_vencimiento)
                const nombreEstado = r.estado?.nombre || mapEstados[r.id_estado] || 'Sin estado'
                const nombreTramite = r.tramite?.nombre || mapTramites[r.id_tramite] || 'General'
                const nombreDep = r.dependencias?.nombre || mapDependencias[r.id_dependencia] || 'Sin dependencia'
                const nombreResp = r.usuario?.nombre || 'No asignado'

                let estadoClase = 'estado-radicado'
                const estLower = nombreEstado.toLowerCase()
                if (estLower.includes('tramite')) estadoClase = 'estado-tramite'
                if (estLower.includes('finaliz') || estLower.includes('cerrad')) estadoClase = 'estado-finalizado'

                return (
                  <tr key={r.id_radicado}>
                    <td>
                      <span className="badge-radicado">{r.numero_radicado}</span>
                    </td>
                    <td style={{ maxWidth: '280px', fontWeight: 500 }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.asunto || 'Sin asunto'}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                        Remitente: {r.remitente || 'Anónimo'}
                      </div>
                    </td>
                    <td>{nombreTramite}</td>
                    <td>
                      <span className={`badge-estado ${estadoClase}`}>
                        {nombreEstado}
                      </span>
                    </td>
                    <td>{nombreDep}</td>
                    <td>{nombreResp}</td>
                    <td>{r.fecha_vencimiento ? r.fecha_vencimiento.substring(0, 10) : 'Sin fecha'}</td>
                    <td>
                      {dias === null ? (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      ) : dias > 3 ? (
                        <span className="dias-badge dias-ok">{dias} días</span>
                      ) : dias >= 0 ? (
                        <span className="dias-badge dias-warn">{dias} días</span>
                      ) : (
                        <span className="dias-badge dias-vencido">
                          Vencido ({Math.abs(dias)}d)
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn-accion-ver"
                        type="button"
                        onClick={() => abrirDetalle(r)}
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Paginación */}
        {!loading && radicadosFiltrados.length > 0 && (
          <div className="pagination-wrap">
            <div>
              Mostrando página <strong>{paginaActual}</strong> de <strong>{totalPaginas}</strong> ({radicadosFiltrados.length} registros)
            </div>
            <div className="pagination-buttons">
              <button
                className="pagination-btn"
                disabled={paginaActual <= 1}
                onClick={() => setPaginaActual((p) => p - 1)}
              >
                ◀ Anterior
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                .slice(Math.max(0, paginaActual - 3), Math.min(totalPaginas, paginaActual + 2))
                .map((pag) => (
                  <button
                    key={pag}
                    className={`pagination-btn ${paginaActual === pag ? 'active' : ''}`}
                    onClick={() => setPaginaActual(pag)}
                  >
                    {pag}
                  </button>
                ))}
              <button
                className="pagination-btn"
                disabled={paginaActual >= totalPaginas}
                onClick={() => setPaginaActual((p) => p + 1)}
              >
                Siguiente ▶
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalle de Radicado */}
      {radicadoSeleccionado && (
        <div className="modal-overlay" onClick={cerrarDetalle}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalle del Radicado: {radicadoSeleccionado.numero_radicado}</h3>
              <button className="modal-close" onClick={cerrarDetalle} aria-label="Cerrar modal">
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div>
                <div className="modal-section-title">Información Básica</div>
                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="lbl">Número Radicado</div>
                    <div className="val">{radicadoSeleccionado.numero_radicado}</div>
                  </div>
                  <div className="detail-item">
                    <div className="lbl">Fecha de Radicación</div>
                    <div className="val">{radicadoSeleccionado.fecha_radicado || '—'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="lbl">Tipo de Radicado</div>
                    <div className="val">{radicadoSeleccionado.tipo_radicado || 'INTERNO'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="lbl">Medio de Recepción</div>
                    <div className="val">{radicadoSeleccionado.medio_recepcion || 'PLATAFORMA_WEB'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="lbl">Prioridad</div>
                    <div className="val">{radicadoSeleccionado.prioridad || 'MEDIA'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="lbl">Confidencialidad</div>
                    <div className="val">{radicadoSeleccionado.confidencialidad || 'PUBLICO'}</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="modal-section-title">Datos del Asunto y Remitente</div>
                <div className="detail-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="detail-item">
                    <div className="lbl">Remitente</div>
                    <div className="val">{radicadoSeleccionado.remitente || 'Anónimo'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="lbl">Asunto</div>
                    <div className="val">{radicadoSeleccionado.asunto}</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="modal-section-title">Asignación y Estado</div>
                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="lbl">Trámite</div>
                    <div className="val">
                      {radicadoSeleccionado.tramite?.nombre || mapTramites[radicadoSeleccionado.id_tramite] || '—'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="lbl">Estado</div>
                    <div className="val">
                      {radicadoSeleccionado.estado?.nombre || mapEstados[radicadoSeleccionado.id_estado] || '—'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="lbl">Dependencia Responsable</div>
                    <div className="val">
                      {radicadoSeleccionado.dependencias?.nombre || mapDependencias[radicadoSeleccionado.id_dependencia] || '—'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="lbl">Usuario Asignado</div>
                    <div className="val">
                      {radicadoSeleccionado.usuario?.nombre || 'No asignado'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="lbl">Fecha Límite / Vencimiento</div>
                    <div className="val">{radicadoSeleccionado.fecha_vencimiento || 'Sin fecha'}</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="modal-section-title">Documentos Adjuntos</div>
                {cargandoDetalle ? (
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Cargando documentos...</p>
                ) : documentosRadicado.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No hay documentos adjuntos a este radicado.</p>
                ) : (
                  <ul className="doc-list">
                    {documentosRadicado.map((doc) => (
                      <li key={doc.id_documento} className="doc-item">
                        <div>
                          <div className="doc-name">{doc.nombre || doc.nombre_archivo}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {doc.tamano ? (doc.tamano / 1024).toFixed(1) + ' KB' : ''} • Subido el: {doc.fecha_subida || '—'}
                          </div>
                        </div>
                        {doc.ruta_archivo && (
                          <a
                            href={`/api/documentos/${doc.id_documento}/descargar`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-accion-ver"
                          >
                            Descargar
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <a
                href={`/api/radicados/${radicadoSeleccionado.id_radicado}/comprobante`}
                target="_blank"
                rel="noreferrer"
                className="btn-buscar"
                style={{ textDecoration: 'none' }}
              >
                Imprimir Comprobante PDF
              </a>
              <button className="btn-limpiar" onClick={cerrarDetalle}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
