var labs = []
var filtro = ''

function $(id) {
  return document.getElementById(id)
}

function saveLabs() {
  localStorage.setItem('laboratorios', JSON.stringify(labs))
}

function loadLabs() {
  var data = localStorage.getItem('laboratorios')
  if (!data) return
  try {
    labs = JSON.parse(data)
  } catch (e) {
    labs = []
  }
}

function parseComponentes(text) {
  var parts = text.split(',')
  var result = []
  for (var i = 0; i < parts.length; i++) {
    var item = parts[i].trim()
    if (item) result.push(item)
  }
  return result
}

function findLab(nombre) {
  for (var i = 0; i < labs.length; i++) {
    if (labs[i].nombre === nombre) return labs[i]
  }
  return null
}

function refresh() {
  saveLabs()
  renderLabs()
}

function createLab(nombre, descripcion, ubicacion) {
  labs.push({ nombre: nombre, descripcion: descripcion, ubicacion: ubicacion, equipos: [] })
  refresh()
}

function updateLab(originalName, nombre, descripcion, ubicacion) {
  var lab = findLab(originalName)
  if (!lab) return
  lab.nombre = nombre
  lab.descripcion = descripcion
  lab.ubicacion = ubicacion
  refresh()
}

function deleteLab(nombre) {
  for (var i = 0; i < labs.length; i++) {
    if (labs[i].nombre === nombre) {
      labs.splice(i, 1)
      refresh()
      return
    }
  }
}

function addEquipo(labNombre, nombre, componentes, estado) {
  var lab = findLab(labNombre)
  if (!lab) return
  lab.equipos.push({ nombre: nombre, componentes: parseComponentes(componentes), estado: estado })
  refresh()
}

function updateEquipo(labNombre, index, nombre, componentes, estado) {
  var lab = findLab(labNombre)
  if (!lab || !lab.equipos[index]) return
  lab.equipos[index].nombre = nombre
  lab.equipos[index].componentes = parseComponentes(componentes)
  lab.equipos[index].estado = estado
  refresh()
}

function deleteEquipo(labNombre, index) {
  var lab = findLab(labNombre)
  if (!lab || !lab.equipos[index]) return
  lab.equipos.splice(index, 1)
  refresh()
}

function showModal(id) {
  var modal = $(id)
  if (modal) modal.classList.add('visible')
}

function hideModal(id) {
  var modal = $(id)
  if (modal) modal.classList.remove('visible')
}

function openLabModal(editMode, nombreLab) {
  var title = $('lab-modal-title')
  var form = $('lab-form')
  if (editMode) {
    var lab = findLab(nombreLab)
    if (!lab) return
    title.textContent = 'Editar laboratorio ' + lab.nombre
    $('lab-nombre').value = lab.nombre
    $('lab-descripcion').value = lab.descripcion
    $('lab-ubicacion').value = lab.ubicacion
    form.dataset.mode = 'edit'
    form.dataset.originalName = nombreLab
  } else {
    title.textContent = 'Crear laboratorio'
    form.dataset.mode = 'create'
    form.dataset.originalName = ''
    form.reset()
  }
  showModal('lab-modal')
}

function openEquipoModal(nombreLab, mode, index) {
  var title = $('equipo-modal-title')
  var form = $('equipo-form')
  form.dataset.lab = nombreLab
  if (mode === 'edit') {
    var lab = findLab(nombreLab)
    if (!lab) return
    var equipo = lab.equipos[index]
    if (!equipo) return
    title.textContent = 'Editar equipo en ' + nombreLab
    $('equipo-nombre').value = equipo.nombre
    $('equipo-componentes').value = equipo.componentes.join(', ')
    $('equipo-estado').value = equipo.estado
    form.dataset.mode = 'edit'
    form.dataset.index = index
  } else {
    title.textContent = 'Agregar equipo a ' + nombreLab
    form.dataset.mode = 'create'
    form.dataset.index = ''
    form.reset()
  }
  showModal('equipo-modal')
}

function renderLabs() {
  var list = $('lab-list')
  var text = filtro.trim().toLowerCase()
  var visibleLabs = []
  for (var i = 0; i < labs.length; i++) {
    if (!text || labs[i].nombre.toLowerCase().indexOf(text) !== -1) {
      visibleLabs.push(labs[i])
    }
  }
  if (visibleLabs.length === 0) {
    list.innerHTML = '<p>' + (labs.length ? 'No se encontró ningún laboratorio.' : 'No hay laboratorios.') + '</p>'
    return
  }
  var html = ''
  for (var i = 0; i < visibleLabs.length; i++) {
    var lab = visibleLabs[i]
    html += '<div class="laboratorio">'
    html += '<h3>' + lab.nombre + '</h3>'
    html += '<p>Descripción: ' + lab.descripcion + '</p>'
    html += '<p>Ubicación: ' + lab.ubicacion + '</p>'
    html += '<p>Equipos:</p>'
    if (lab.equipos.length === 0) {
      html += '<p>No hay equipos en este laboratorio.</p>'
    } else {
      for (var j = 0; j < lab.equipos.length; j++) {
        var eq = lab.equipos[j]
        html += '<div class="equipo">'
        html += '<strong>' + eq.nombre + '</strong> (' + eq.estado + ')<br>'
        html += 'Componentes: ' + eq.componentes.join(', ') + '<br>'
        html += '<button type="button" data-action="edit-equipo" data-lab="' + lab.nombre + '" data-index="' + j + '">Editar equipo</button>'
        html += '<button type="button" data-action="delete-equipo" data-lab="' + lab.nombre + '" data-index="' + j + '">Eliminar equipo</button>'
        html += '</div>'
      }
    }
    html += '<button type="button" data-action="add-equipo" data-lab="' + lab.nombre + '">Agregar equipo</button>'
    html += '<button type="button" data-action="edit-lab" data-lab="' + lab.nombre + '">Editar laboratorio</button>'
    html += '<button type="button" data-action="delete-lab" data-lab="' + lab.nombre + '">Eliminar laboratorio</button>'
    html += '</div>'
  }
  list.innerHTML = html
}

function handleButtons(event) {
  var target = event.target
  if (target.tagName !== 'BUTTON') return
  var action = target.getAttribute('data-action')
  var lab = target.getAttribute('data-lab')
  var index = target.getAttribute('data-index')
  if (action === 'add-equipo') openEquipoModal(lab, 'create')
  if (action === 'edit-lab') openLabModal(true, lab)
  if (action === 'delete-lab') deleteLab(lab)
  if (action === 'edit-equipo') openEquipoModal(lab, 'edit', Number(index))
  if (action === 'delete-equipo') deleteEquipo(lab, Number(index))
}

function init() {
  loadLabs()
  renderLabs()
  $('open-lab-modal').addEventListener('click', function () { openLabModal(false, '') })
  $('open-report-button').addEventListener('click', function () {
    $('report-content').innerHTML = generateReport()
    showModal('report-modal')
  })
  $('open-stats-button').addEventListener('click', function () {
    $('stats-content').innerHTML = generateStatsHtml()
    showModal('stats-modal')
  })
  $('search-lab-input').addEventListener('input', function (event) {
    filtro = event.target.value
    renderLabs()
  })
  $('download-report-button').addEventListener('click', downloadReport)
  $('close-lab-modal').addEventListener('click', function () { hideModal('lab-modal') })
  $('close-equipo-modal').addEventListener('click', function () { hideModal('equipo-modal') })
  $('close-report-modal').addEventListener('click', function () { hideModal('report-modal') })
  $('close-stats-modal').addEventListener('click', function () { hideModal('stats-modal') })
  $('lab-modal').addEventListener('click', function (event) { if (event.target === this) hideModal('lab-modal') })
  $('equipo-modal').addEventListener('click', function (event) { if (event.target === this) hideModal('equipo-modal') })
  $('report-modal').addEventListener('click', function (event) { if (event.target === this) hideModal('report-modal') })
  $('stats-modal').addEventListener('click', function (event) { if (event.target === this) hideModal('stats-modal') })
  $('lab-form').addEventListener('submit', function (event) {
    event.preventDefault()
    var nombre = $('lab-nombre').value
    var descripcion = $('lab-descripcion').value
    var ubicacion = $('lab-ubicacion').value
    if (this.dataset.mode === 'edit') updateLab(this.dataset.originalName, nombre, descripcion, ubicacion)
    else createLab(nombre, descripcion, ubicacion)
    this.reset()
    hideModal('lab-modal')
  })
  $('equipo-form').addEventListener('submit', function (event) {
    event.preventDefault()
    var nombre = $('equipo-nombre').value
    var componentes = $('equipo-componentes').value
    var estado = $('equipo-estado').value
    var form = $('equipo-form')
    if (form.dataset.mode === 'edit') updateEquipo(form.dataset.lab, Number(form.dataset.index), nombre, componentes, estado)
    else addEquipo(form.dataset.lab, nombre, componentes, estado)
    form.reset()
    hideModal('equipo-modal')
  })
  $('lab-list').addEventListener('click', handleButtons)
}

function generateReport() {
  if (labs.length === 0) return '<p>No hay datos para generar un reporte.</p>'
  var html = '<div>'
  html += '<p>Reporte generado el: <strong>' + new Date().toLocaleString() + '</strong></p>'
  for (var i = 0; i < labs.length; i++) {
    var lab = labs[i]
    html += '<div class="report-lab">'
    html += '<h3>' + lab.nombre + '</h3>'
    html += '<p>Descripción: ' + lab.descripcion + '</p>'
    html += '<p>Ubicación: ' + lab.ubicacion + '</p>'
    html += '<p>Equipos: ' + lab.equipos.length + '</p>'
    if (lab.equipos.length > 0) {
      html += '<ul>'
      for (var j = 0; j < lab.equipos.length; j++) {
        var eq = lab.equipos[j]
        html += '<li><strong>' + eq.nombre + '</strong> - ' + eq.estado + ' - Componentes: ' + (eq.componentes.join(', ') || 'Ninguno') + '</li>'
      }
      html += '</ul>'
    }
    html += '</div>'
  }
  html += '</div>'
  return html
}

function generateStatsHtml() {
  var totalLabs = labs.length
  var totalEquipos = 0
  var estadoCounts = { Bueno: 0, Regular: 0, Malo: 0 }
  var mas = null
  var sin = 0
  for (var i = 0; i < labs.length; i++) {
    var lab = labs[i]
    totalEquipos += lab.equipos.length
    if (lab.equipos.length === 0) sin++
    if (!mas || lab.equipos.length > mas.equipos.length) mas = lab
    for (var j = 0; j < lab.equipos.length; j++) {
      var estado = lab.equipos[j].estado
      if (estadoCounts[estado] !== undefined) estadoCounts[estado]++
    }
  }
  var html = ''
  html += '<p>Total de laboratorios: <strong>' + totalLabs + '</strong></p>'
  html += '<p>Total de equipos: <strong>' + totalEquipos + '</strong></p>'
  html += '<p>Equipos en buen estado: <strong>' + estadoCounts.Bueno + '</strong></p>'
  html += '<p>Equipos en estado regular: <strong>' + estadoCounts.Regular + '</strong></p>'
  html += '<p>Equipos en mal estado: <strong>' + estadoCounts.Malo + '</strong></p>'
  html += '<p>Laboratorios sin equipos: <strong>' + sin + '</strong></p>'
  if (mas) html += '<p>Laboratorio con más equipos: <strong>' + mas.nombre + '</strong> (' + mas.equipos.length + ')</p>'
  return html
}

function downloadReport() {
  var text = generateReportText()
  var blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  var url = URL.createObjectURL(blob)
  var link = document.createElement('a')
  link.href = url
  link.download = 'reporte_laboratorios.txt'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function generateReportText() {
  if (labs.length === 0) return 'No hay datos para generar un reporte.'
  var text = 'Reporte de laboratorios\n'
  text += 'Generado el: ' + new Date().toLocaleString() + '\n\n'
  for (var i = 0; i < labs.length; i++) {
    var lab = labs[i]
    text += 'Laboratorio: ' + lab.nombre + '\n'
    text += 'Descripción: ' + lab.descripcion + '\n'
    text += 'Ubicación: ' + lab.ubicacion + '\n'
    text += 'Equipos: ' + lab.equipos.length + '\n'
    for (var j = 0; j < lab.equipos.length; j++) {
      var eq = lab.equipos[j]
      text += '  - ' + eq.nombre + ' (' + eq.estado + ') | Componentes: ' + (eq.componentes.join(', ') || 'Ninguno') + '\n'
    }
    text += '\n'
  }
  return text
}

document.addEventListener('DOMContentLoaded', init)
