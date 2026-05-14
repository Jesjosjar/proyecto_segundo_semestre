let labs = JSON.parse(localStorage.getItem('labs_data')) || [];
let idGen = JSON.parse(localStorage.getItem('id_gen')) || 0;

function guardarLab() {
    const title = document.getElementById('labTitulo').value;
    const desc = document.getElementById('labDesc').value;
    const ubica = document.getElementById('labUbic').value;

    if (title.trim() != '' || desc.trim() != '' || ubica.trim() != '') {
        labs.push({
            'id': idGen,
            'title': title,
            'desc': desc,
            'ubica': ubica,
            'items': []
        })
        idGen++
        localStorage.setItem('labs_data', JSON.stringify(labs))
        localStorage.setItem('id_gen', JSON.stringify(idGen))
        update()
    } else {
        alert("Por favor, complete todos los campos.");
    }
}

function deleteLab(id) {
    labs = labs.filter((lab) => {
        return lab.id !== id
    });
    localStorage.setItem('labs_data', JSON.stringify(labs));
    update();
}

function editLab(id) {
    let lab = labs.find(labo => labo.id == id);
    lab.title = prompt("Nuevo título:", lab.title);
    lab.desc = prompt("Nueva descripción:", lab.desc);
    lab.ubica = prompt("Nueva ubicación:", lab.ubica);
    localStorage.setItem('labs_data', JSON.stringify(labs));
    update();
}

function addItem(labId) {
    const title = prompt("Título del equipo:");
    const comp = prompt("Componentes:");
    const status = prompt("Estado (Funcional/Mantenimiento):");

    const lab = labs.find(l => l.id === labId);

    lab.items.push({
        'id': idGen,
        'title': title,
        'status': status,
        'comp': comp
    });
    idGen++;
    localStorage.setItem('id_gen', JSON.stringify(idGen));
    localStorage.setItem('labs_data', JSON.stringify(labs));
    update();
}

function deleteItem(labId, itemId) {
    const lab = labs.find(l => l.id == labId);
    lab.items = lab.items.filter(i => i.id != itemId);
    localStorage.setItem('labs_data', JSON.stringify(labs));
    update();
}

function update() {
    const container = document.getElementById('labsContainer');

    container.innerHTML = '<h2>Laboratorios</h2>'
    for (let e of labs) {
        let ul_laboratorios = document.getElementById('ul_laboratorios');

        let containerLab = document.createElement('div');
        let tituloLab = document.createElement('h3');
        let descripcionLab = document.createElement('p');
        let botonEditar = document.createElement('button');
        let botonBorrar = document.createElement('button');
        let botonAgregar = document.createElement('button');
        let ulEquipos = document.createElement('ul');
        tituloLab.textContent = "titulo: " + e.title + " - Ubicacion: " + e.ubica + ")"
        descripcionLab.textContent = "Descripcion: " + e.desc;
        botonEditar.textContent = 'Editar';
        botonBorrar.textContent = 'Borrar Lab';
        botonAgregar.textContent = 'Agregar Equipo';

        //funciones de los botones
        botonEditar.onclick = () => editLab(e.id);
        botonBorrar.onclick = () => deleteLab(e.id);
        botonAgregar.onclick = () => addItem(e.id);

        e.items.forEach(i => {
            let liEquipo = document.createElement('li');
            liEquipo.textContent = "titulo: " + i.title + " - Estado: " + i.status;
            let botonBorrarEquipo = document.createElement('button');
            botonBorrarEquipo.textContent = 'x';
            botonBorrarEquipo.classList.add('btn-del');
            botonBorrarEquipo.onclick = () => {
                deleteItem(e.id, i.id);
            }
            liEquipo.appendChild(botonBorrarEquipo);
            ulEquipos.appendChild(liEquipo);
        });

        //hacer append de los elementos
        containerLab.classList.add('lab-card');
        containerLab.appendChild(tituloLab);
        containerLab.appendChild(descripcionLab);
        containerLab.appendChild(botonEditar);
        containerLab.appendChild(botonBorrar);
        containerLab.appendChild(botonAgregar);
        containerLab.appendChild(ulEquipos);
        container.appendChild(containerLab);
    }

    renderReport()
}

function renderReport() {
    let tbody_reporte = document.getElementById('tbody_reporte')    
    tbody_reporte.innerHTML = ''
    
    //mostrar el OverView (resumen)
    let span_TotalLaboratoriosReporte = document.getElementById('span_TotalLaboratoriosReporte')
    let span_TotalEquiposReporte = document.getElementById('span_TotalEquiposReporte')
    let totalEquipos = 0

    for(lab of labs){
        totalEquipos += lab.items.length
    }

    span_TotalEquiposReporte.textContent = totalEquipos
    span_TotalLaboratoriosReporte.textContent = labs.length

    //mostrar la tabla
    

    for(e of labs){
        let trLab = document.createElement('tr')
        let tdLab = document.createElement('td')

        tdLab.textContent = e.title
        trLab.appendChild(tdLab)
        trLab.appendChild(document.createElement('td'))
        trLab.appendChild(document.createElement('td'))
        trLab.appendChild(document.createElement('td'))
        
        tbody_reporte.appendChild(trLab)

        e.items.forEach(eq => {
            let trEq = document.createElement('tr')
            let tdEq = document.createElement('td')
            let tdComp = document.createElement('td')
            let tdStatus = document.createElement('td')

            tdLab.textContent = e.title
            tdEq.textContent = eq.title
            tdComp.textContent = eq.comp
            tdStatus.textContent = eq.status

            trEq.appendChild(document.createElement('td'))
            trEq.appendChild(tdEq)
            trEq.appendChild(tdComp)
            trEq.appendChild(tdStatus)

            tbody_reporte.appendChild(trEq)
        })
    }


}
function downloadReport() {
    let csv = "Laboratorio,Equipo,Componentes,Estado\n";
    labs.forEach(lab => {
        lab.items.forEach(i => {
            csv += lab.title +',' + i.title + ',' + i.comp + ',' + i.status + "\n"
        });
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    console.log(url)
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'reporte_laboratorios.csv');
    a.click();
}

// Iniciar vista
window.onload = () => {
    update();
}