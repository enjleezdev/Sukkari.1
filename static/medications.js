document.addEventListener('DOMContentLoaded', function() {
    loadMedications();
    loadMedicationLogs();

    document.getElementById('medicationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('medName').value;
        const time = document.getElementById('medTime').value;

        fetch('/api/medications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, time })
        })
        .then(response => response.json())
        .then(() => {
            loadMedications();
            document.getElementById('medicationForm').reset();
        });
    });
});

function loadMedications() {
    fetch('/api/medications')
        .then(response => response.json())
        .then(medications => {
            const container = document.getElementById('medicationList');
            container.innerHTML = medications.map(med => `
                <div class="medication-item mb-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${med.name}</strong>
                            <br>
                            <small class="text-muted">وقت التناول: ${med.time}</small>
                        </div>
                        <div>
                            <button class="btn btn-primary btn-sm" onclick="takeMedication(${med.id})">
                                تم التناول
                            </button>
                            <button class="btn btn-danger btn-sm ms-2" onclick="deleteMedication(${med.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        });
}

function loadMedicationLogs() {
    fetch('/api/medication_logs')
        .then(response => response.json())
        .then(logs => {
            const tableBody = document.getElementById('medicationLogsTable');
            tableBody.innerHTML = logs.map(log => `
                <tr>
                    <td>${log.medication_name}</td>
                    <td>${log.time}</td>
                    <td>${log.date_taken}</td>
                    <td>
                        <span class="badge ${log.taken ? 'bg-success' : 'bg-warning'}">
                            ${log.taken ? 'تم التناول' : 'لم يتم التناول'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteMedicationLog(${log.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        });
}

function takeMedication(medicationId) {
    fetch('/api/medication_logs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ medication_id: medicationId })
    })
    .then(response => response.json())
    .then(() => {
        loadMedicationLogs();
    });
}

function deleteMedication(medicationId) {
    if (confirm('هل أنت متأكد من حذف هذا الدواء؟')) {
        fetch(`/api/medications/${medicationId}`, {
            method: 'DELETE'
        })
        .then(() => {
            loadMedications();
        });
    }
}

function deleteMedicationLog(logId) {
    if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
        fetch(`/api/medication_logs/${logId}`, {
            method: 'DELETE'
        })
        .then(() => {
            loadMedicationLogs();
        });
    }
}
