document.addEventListener('DOMContentLoaded', function() {
    loadMedicationLogs();
});

function loadMedicationLogs() {
    fetch('/api/medication_logs')
        .then(response => response.json())
        .then(logs => {
            const tableBody = document.getElementById('medicationLogsTable');
            tableBody.innerHTML = logs.map(log => `
                <tr>
                    <td>${log.medication_name}</td>
                    <td>${log.dosage}</td>
                    <td>${log.time}</td>
                    <td>${log.date_taken}</td>
                    <td>
                        <span class="badge ${log.taken ? 'bg-success' : 'bg-warning'}">
                            ${log.taken ? 'تم التناول' : 'لم يتم التناول'}
                        </span>
                    </td>
                </tr>
            `).join('');
        });
}
