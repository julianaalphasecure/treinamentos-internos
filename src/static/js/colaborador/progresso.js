document.addEventListener("DOMContentLoaded", () => {

    const modulos = document.querySelectorAll('.modulo');
    modulos.forEach(modulo => {
        const preenchimento = modulo.querySelector('.preenchimento');
        const percent = modulo.dataset.percent;
        setTimeout(() => {
            preenchimento.style.width = percent + '%';
        }, 300);
    });

   
    const verMaisBtn = document.getElementById('verMaisBtn');
    verMaisBtn.addEventListener('click', () => {
        const maisModulos = [
            {nome: 'Módulo 05 - Comolatti', percent: 0, nota: 0},
            {nome: 'Módulo 06 - Procedimento Operacional Padrão', percent: 0, nota: 0},
            {nome: 'Módulo 07 - Portaria Remota', percent: 0, nota: 0},
            {nome: 'Módulo 08 - BASA (Banco Amazônia', percent: 0, nota: 0},
        ];

        maisModulos.forEach(m => {
            const div = document.createElement('div');
            div.className = 'modulo';
            div.dataset.percent = m.percent;

            div.innerHTML = `
                <span>${m.nome}</span>
                <div class="barra">
                    <div class="preenchimento" style="width:0%"></div>
                </div>
                <span class="nota">${m.nota}%</span>
            `;

            document.querySelector('.progresso-modulos').insertBefore(div, verMaisBtn);

            setTimeout(() => {
                div.querySelector('.preenchimento').style.width = m.percent + '%';
            }, 300);
        });

        verMaisBtn.style.display = 'none';
    });
});
