let laboratorios = []
let laboratorioSeleccionado = ''
let labEditOriginal = ''
let equipoEditIndex = null
let filtroLaboratorio = ''

function guardarEstado() {
    localStorage.setItem('laboratorios', JSON.stringify(laboratorios))
}

function cargarEstado() {
    const datos = localStorage.getItem('laboratorios')
    if (!datos) return
    try {
        laboratorios = JSON.parse(datos)
    } catch (error) {
        console.warn('No se pudo cargar localStorage:', error)
    }
}

function crearLaboratorio(nombre, descripcion, ubicacion) {
    laboratorios.push({
        nombre: nombre,
        descripcion: descripcion,
        ubicacion: ubicacion,
        equipos: []
    })
    guardarEstado()
}

function encontrarLaboratorio(nombre) {
    return laboratorios.find(l => l.nombre === nombre)
}

function editarLaboratorio(originalNombre, nombre, descripcion, ubicacion) {
    const laboratorio = encontrarLaboratorio(originalNombre)
    if (!laboratorio) return
    laboratorio.nombre = nombre
    laboratorio.descripcion = descripcion
    laboratorio.ubicacion = ubicacion
    guardarEstado()
}

function eliminarLaboratorio(nombre) {
    const index = laboratorios.findIndex(l => l.nombre === nombre)
    if (index >= 0) {
        laboratorios.splice(index, 1)
        guardarEstado()
    }
}

function agregarEquipo(nombre, componentes, estado, labNombre) {
    const laboratorio = encontrarLaboratorio(labNombre)
    if (!laboratorio) return
    const listaComponentes = componentes.split(',').map(c => c.trim()).filter(c => c !== '')
    laboratorio.equipos.push({ nombre: nombre, componentes: listaComponentes, estado: estado })
    guardarEstado()
}

function editarEquipo(labNombre, index, nombre, componentes, estado) {
    const laboratorio = encontrarLaboratorio(labNombre)
    if (!laboratorio || !laboratorio.equipos[index]) return
    laboratorio.equipos[index] = {
        nombre: nombre,
        componentes: componentes.split(',').map(c => c.trim()).filter(c => c !== ''),
        estado: estado
    }
    guardarEstado()
}

function eliminarEquipo(labNombre, index) {
    const laboratorio = encontrarLaboratorio(labNombre)
    if (!laboratorio || !laboratorio.equipos[index]) return
    laboratorio.equipos.splice(index, 1)
    guardarEstado()
}

function obtenerEstadisticas() {
    const totalLabs = laboratorios.length
    const totalEquipos = laboratorios.reduce((sum, lab) => sum + lab.equipos.length, 0)
    const estadoCounts = { Bueno: 0, Regular: 0, Malo: 0 }
    laboratorios.forEach(lab => {
        lab.equipos.forEach(eq => {
            if (estadoCounts[eq.estado] !== undefined) {
                estadoCounts[eq.estado]++
            }
        })
    })
    const laboratorioMasEquipos = laboratorios.reduce((best, lab) => {
        if (!best || lab.equipos.length > best.equipos.length) {
            return lab
        }
        return best
    }, null)
    const laboratoriosSinEquipos = laboratorios.filter(lab => lab.equipos.length === 0).length

    return { totalLabs, totalEquipos, estadoCounts, laboratorioMasEquipos, laboratoriosSinEquipos }
}

function generarEstadisticasHtml() {
    const stats = obtenerEstadisticas()
    return `
        <p>Total de laboratorios: <strong>${stats.totalLabs}</strong></p>
        <p>Total de equipos: <strong>${stats.totalEquipos}</strong></p>
        <p>Equipos en buen estado: <strong>${stats.estadoCounts.Bueno}</strong></p>
        <p>Equipos en estado regular: <strong>${stats.estadoCounts.Regular}</strong></p>
        <p>Equipos en mal estado: <strong>${stats.estadoCounts.Malo}</strong></p>
        <p>Laboratorios sin equipos: <strong>${stats.laboratoriosSinEquipos}</strong></p>
        ${stats.laboratorioMasEquipos ? `<p>Laboratorio con más equipos: <strong>${stats.laboratorioMasEquipos.nombre}</strong> (${stats.laboratorioMasEquipos.equipos.length})</p>` : ''}
    `
}

function generarReporte() {
    if (laboratorios.length === 0) {
        return '<p>No hay datos para generar un reporte.</p>'
    }
    let html = '<div>'
    html += '<p>Reporte generado el: <strong>' + new Date().toLocaleString() + '</strong></p>'
    laboratorios.forEach(lab => {
        html += `
            <div class="report-lab">
                <h3>${lab.nombre}</h3>
                <p>Descripción: ${lab.descripcion}</p>
                <p>Ubicación: ${lab.ubicacion}</p>
                <p>Equipos: ${lab.equipos.length}</p>
        `
        if (lab.equipos.length > 0) {
            html += '<ul>'
            lab.equipos.forEach(eq => {
                html += `<li><strong>${eq.nombre}</strong> - ${eq.estado} - Componentes: ${eq.componentes.join(', ') || 'Ninguno'}</li>`
            })
            html += '</ul>'
        }
        html += '</div>'
    })
    html += '</div>'
    return html
}

function generarReporteTexto() {
    if (laboratorios.length === 0) {
        return 'No hay datos para generar un reporte.'
    }

    let texto = 'Reporte de laboratorios\n'
    texto += 'Generado el: ' + new Date().toLocaleString() + '\n\n'

    laboratorios.forEach(lab => {
        texto += `Laboratorio: ${lab.nombre}\n`
        texto += `Descripción: ${lab.descripcion}\n`
        texto += `Ubicación: ${lab.ubicacion}\n`
        texto += `Equipos: ${lab.equipos.length}\n`
        if (lab.equipos.length > 0) {
            lab.equipos.forEach(eq => {
                texto += `  - ${eq.nombre} (${eq.estado}) | Componentes: ${eq.componentes.join(', ') || 'Ninguno'}\n`
            })
        }
        texto += '\n'
    })

    return texto
}

function descargarReporte() {
    const texto = generarReporteTexto()
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'reporte_laboratorios.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

function abrirModal(id) {
    document.getElementById(id).classList.add('visible')
}

function cerrarModal(id) {
    document.getElementById(id).classList.remove('visible')
}

function abrirLabModal(editMode = false, nombreLab = '') {
    const modalTitle = document.getElementById('lab-modal-title')
    const labForm = document.getElementById('lab-form')

    if (editMode) {
        const laboratorio = encontrarLaboratorio(nombreLab)
        if (!laboratorio) return
        modalTitle.textContent = `Editar laboratorio ${laboratorio.nombre}`
        document.getElementById('lab-nombre').value = laboratorio.nombre
        document.getElementById('lab-descripcion').value = laboratorio.descripcion
        document.getElementById('lab-ubicacion').value = laboratorio.ubicacion
        labForm.dataset.mode = 'edit'
        labForm.dataset.originalName = nombreLab
    } else {
        modalTitle.textContent = 'Crear laboratorio'
        labForm.dataset.mode = 'create'
        labForm.dataset.originalName = ''
        labForm.reset()
    }

    abrirModal('lab-modal')
}

function abrirEquipoModal(nombreLab, mode = 'create', index = null) {
    const modalTitle = document.getElementById('equipo-modal-title')
    const equipoForm = document.getElementById('equipo-form')
    const equipoNombre = document.getElementById('equipo-nombre')
    const equipoComponentes = document.getElementById('equipo-componentes')
    const equipoEstado = document.getElementById('equipo-estado')

    laboratorioSeleccionado = nombreLab
    equipoForm.dataset.lab = nombreLab

    if (mode === 'edit') {
        const laboratorio = encontrarLaboratorio(nombreLab)
        if (!laboratorio) return
        const equipo = laboratorio.equipos[index]
        if (!equipo) return

        modalTitle.textContent = `Editar equipo en ${nombreLab}`
        equipoNombre.value = equipo.nombre
        equipoComponentes.value = equipo.componentes.join(', ')
        equipoEstado.value = equipo.estado
        equipoForm.dataset.mode = 'edit'
        equipoForm.dataset.index = index
        equipoEditIndex = index
    } else {
        modalTitle.textContent = `Agregar equipo a ${nombreLab}`
        equipoForm.dataset.mode = 'create'
        equipoForm.dataset.index = ''
        equipoEditIndex = null
        equipoForm.reset()
    }

    abrirModal('equipo-modal')
}

function mostrarLaboratorios() {
    const lista = document.getElementById('lab-list')
    lista.innerHTML = ''

    if (laboratorios.length === 0) {
        lista.innerHTML = '<p>No hay laboratorios.</p>'
        return
    }

    const filtro = filtroLaboratorio.trim().toLowerCase()
    const labsFiltrados = filtro.length === 0
        ? laboratorios
        : laboratorios.filter(lab => lab.nombre.toLowerCase().includes(filtro))

    if (labsFiltrados.length === 0) {
        lista.innerHTML = '<p>No se encontró ningún laboratorio.</p>'
        return
    }

    labsFiltrados.forEach(lab => {
        const div = document.createElement('div')
        div.className = 'laboratorio'
        div.innerHTML = `
            <h3>${lab.nombre}</h3>
            <p>Descripción: ${lab.descripcion}</p>
            <p>Ubicación: ${lab.ubicacion}</p>
            <p>Equipos:</p>
        `

        if (lab.equipos.length === 0) {
            const p = document.createElement('p')
            p.textContent = 'No hay equipos en este laboratorio.'
            div.appendChild(p)
        } else {
            lab.equipos.forEach((eq, index) => {
                const item = document.createElement('div')
                item.className = 'equipo'
                item.innerHTML = `
                    <strong>${eq.nombre}</strong> (${eq.estado})<br>
                    Componentes: ${eq.componentes.join(', ')}
                `

                const editButton = document.createElement('button')
                editButton.type = 'button'
                editButton.textContent = 'Editar equipo'
                editButton.addEventListener('click', () => abrirEquipoModal(lab.nombre, 'edit', index))

                const deleteButton = document.createElement('button')
                deleteButton.type = 'button'
                deleteButton.textContent = 'Eliminar equipo'
                deleteButton.addEventListener('click', () => {
                    eliminarEquipo(lab.nombre, index)
                    mostrarLaboratorios()
                })

                item.appendChild(editButton)
                item.appendChild(deleteButton)
                div.appendChild(item)
            })
        }

        const addButton = document.createElement('button')
        addButton.type = 'button'
        addButton.textContent = 'Agregar equipo'
        addButton.addEventListener('click', () => abrirEquipoModal(lab.nombre, 'create'))

        const editLabButton = document.createElement('button')
        editLabButton.type = 'button'
        editLabButton.textContent = 'Editar laboratorio'
        editLabButton.addEventListener('click', () => abrirLabModal(true, lab.nombre))

        const deleteLabButton = document.createElement('button')
        deleteLabButton.type = 'button'
        deleteLabButton.textContent = 'Eliminar laboratorio'
        deleteLabButton.addEventListener('click', () => {
            eliminarLaboratorio(lab.nombre)
            mostrarLaboratorios()
        })

        div.appendChild(addButton)
        div.appendChild(editLabButton)
        div.appendChild(deleteLabButton)
        lista.appendChild(div)
    })
}

function configurarEventos() {
    const openLabButton = document.getElementById('open-lab-modal')
    const openReportButton = document.getElementById('open-report-button')
    const openStatsButton = document.getElementById('open-stats-button')
    const searchLabInput = document.getElementById('search-lab-input')
    const closeLabModal = document.getElementById('close-lab-modal')
    const closeEquipoModal = document.getElementById('close-equipo-modal')
    const closeReportModal = document.getElementById('close-report-modal')
    const closeStatsModal = document.getElementById('close-stats-modal')
    const labModal = document.getElementById('lab-modal')
    const equipoModal = document.getElementById('equipo-modal')
    const reportModal = document.getElementById('report-modal')
    const statsModal = document.getElementById('stats-modal')
    const reportContent = document.getElementById('report-content')
    const statsContent = document.getElementById('stats-content')
    const downloadReportButton = document.getElementById('download-report-button')
    const labForm = document.getElementById('lab-form')
    const equipoForm = document.getElementById('equipo-form')

    openLabButton.addEventListener('click', () => abrirLabModal(false))
    openReportButton.addEventListener('click', () => {
        reportContent.innerHTML = generarReporte()
        abrirModal('report-modal')
    })
    openStatsButton.addEventListener('click', () => {
        statsContent.innerHTML = generarEstadisticasHtml()
        abrirModal('stats-modal')
    })
    searchLabInput.addEventListener('input', event => {
        filtroLaboratorio = event.target.value
        mostrarLaboratorios()
    })
    downloadReportButton.addEventListener('click', descargarReporte)
    closeLabModal.addEventListener('click', () => cerrarModal('lab-modal'))
    closeEquipoModal.addEventListener('click', () => cerrarModal('equipo-modal'))
    closeReportModal.addEventListener('click', () => cerrarModal('report-modal'))
    closeStatsModal.addEventListener('click', () => cerrarModal('stats-modal'))

    labModal.addEventListener('click', event => {
        if (event.target === labModal) cerrarModal('lab-modal')
    })
    equipoModal.addEventListener('click', event => {
        if (event.target === equipoModal) cerrarModal('equipo-modal')
    })
    reportModal.addEventListener('click', event => {
        if (event.target === reportModal) cerrarModal('report-modal')
    })
    statsModal.addEventListener('click', event => {
        if (event.target === statsModal) cerrarModal('stats-modal')
    })

    labForm.addEventListener('submit', event => {
        event.preventDefault()
        const nombre = document.getElementById('lab-nombre').value
        const descripcion = document.getElementById('lab-descripcion').value
        const ubicacion = document.getElementById('lab-ubicacion').value

        if (labForm.dataset.mode === 'edit') {
            editarLaboratorio(labForm.dataset.originalName, nombre, descripcion, ubicacion)
        } else {
            crearLaboratorio(nombre, descripcion, ubicacion)
        }

        labForm.reset()
        cerrarModal('lab-modal')
        mostrarLaboratorios()
    })

    equipoForm.addEventListener('submit', event => {
        event.preventDefault()
        const nombre = document.getElementById('equipo-nombre').value
        const componentes = document.getElementById('equipo-componentes').value
        const estado = document.getElementById('equipo-estado').value
        const labNombre = equipoForm.dataset.lab

        if (equipoForm.dataset.mode === 'edit') {
            editarEquipo(labNombre, Number(equipoForm.dataset.index), nombre, componentes, estado)
        } else {
            agregarEquipo(nombre, componentes, estado, labNombre)
        }

        equipoForm.reset()
        cerrarModal('equipo-modal')
        mostrarLaboratorios()
    })
}

window.addEventListener('DOMContentLoaded', () => {
    cargarEstado()
    mostrarLaboratorios()
    configurarEventos()
})
