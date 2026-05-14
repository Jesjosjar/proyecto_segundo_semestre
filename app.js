let labs = JSON.parse(localStorage.getItem('labs')) || [];

        function guardarLab() {
            const id = document.getElementById('labId').value;
            const title = document.getElementById('labTitulo').value;
            const desc = document.getElementById('labDesc').value;
            const loc = document.getElementById('labUbic').value;

            if (id) {
                const index = labs.findIndex(l => l.id == id);
                labs[index] = { ...labs[index], title, desc, loc };
            } else {
                labs.push({ id: Date.now(), title, desc, loc, items: [] });
            }
            update();
        }

        function deleteLab(id) {
            labs = labs.filter(l => l.id !== id);
            update();
        }

        function editLab(id) {
            const lab = labs.find(l => l.id === id);
            document.getElementById('labId').value = lab.id;
            document.getElementById('labTitle').value = lab.title;
            document.getElementById('labDesc').value = lab.desc;
            document.getElementById('labLoc').value = lab.loc;
        }

        function addItem(labId) {
            const title = prompt("Título del equipo:");
            const comp = prompt("Componentes:");
            const status = prompt("Estado (Funcional/Mantenimiento):");
            if (title) {
                const lab = labs.find(l => l.id === labId);
                lab.items.push({ id: Date.now(), title, comp, status });
                update();
            }
        }

        function deleteItem(labId, itemId) {
            const lab = labs.find(l => l.id === labId);
            lab.items = lab.items.filter(i => i.id !== itemId);
            update();
        }

        function update() {
            localStorage.setItem('labs', JSON.stringify(labs));
            renderLabs();
            renderReport();
        }

        function renderLabs() {
            const container = document.getElementById('labsContainer');
            container.innerHTML = '<h2>Laboratorios</h2>';
            labs.forEach(lab => {
                let itemsHtml = lab.items.map(i => `
                    <li>${i.title} (${i.status}) 
                        <button class="btn-del" onclick="deleteItem(${lab.id}, ${i.id})">x</button>
                    </li>`).join('');

                container.innerHTML += `
                    <div class="lab-card">
                        <h3>${lab.title} (${lab.loc})</h3>
                        <p>${lab.desc}</p>
                        <button onclick="editLab(${lab.id})">Editar</button>
                        <button class="btn-del" onclick="deleteLab(${lab.id})">Borrar Lab</button>
                        <button onclick="addItem(${lab.id})">+ Agregar Equipo</button>
                        <ul>${itemsHtml}</ul>
                    </div>`;
            });
        }

        function renderReport() {
            const tbody = document.querySelector('#reportTable tbody');
            const statsDiv = document.getElementById('stats');
            tbody.innerHTML = '';
            let totalEquipos = 0;

            labs.forEach(lab => {
                lab.items.forEach(i => {
                    totalEquipos++;
                    tbody.innerHTML += `<tr><td>${lab.title}</td><td>${i.title}</td><td>${i.comp}</td><td>${i.status}</td></tr>`;
                });
            });
            statsDiv.innerHTML = `<strong>Total de laboratorios:</strong> ${labs.length} | <strong>Total de equipos:</strong> ${totalEquipos}`;
        }

        function downloadReport() {
            let csv = "Laboratorio,Equipo,Componentes,Estado\n";
            labs.forEach(lab => {
                lab.items.forEach(i => {
                    csv += `${lab.title},${i.title},${i.comp},${i.status}\n`;
                });
            });
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('href', url);
            a.setAttribute('download', 'reporte_laboratorios.csv');
            a.click();
        }

        // Iniciar vista
        update();