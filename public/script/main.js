document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('https://probable-stellar-balance.glitch.me/api/agendamentos', {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Accept': 'application/json' 
            }
        });

        if (response.headers.get('content-type')?.includes('application/json')) {
            const agendamentos = await response.json();

            const tableBody = document.querySelector('#agendamentos-table tbody');
            tableBody.innerHTML = '';

            agendamentos.forEach(agendamento => {
                const row = document.createElement('tr');
                const data = new Date(agendamento.data_agendamento);
                
                // Use UTC para garantir que a data não seja alterada pelo fuso horário local
                const options = { day: 'numeric', month: 'long', timeZone: 'UTC' };
                const dataFormatada = data.toLocaleDateString('pt-BR', options);
            
                row.innerHTML = `
                    <td>${agendamento.nome}</td>
                    <td>${dataFormatada}</td>
                    <td>${agendamento.hora_agendamento}</td>
                    <td>${agendamento.descricao}</td>
                `;
                tableBody.appendChild(row);
            });            
        } else {
            const text = await response.text();
            console.error('Resposta não é JSON:', text);
        }
    } catch (err) {
        console.error('Erro ao buscar agendamentos:', err);
    }
});