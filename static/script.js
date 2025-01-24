document.addEventListener('DOMContentLoaded', function() {
    // تحميل البيانات عند بدء التطبيق
    loadLatestReading();
    loadMedications();
    loadActivities();

    // إنشاء الرسم البياني
    const ctx = document.getElementById('glucoseChart').getContext('2d');
    const glucoseChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'مستوى السكر في الدم',
                data: [],
                borderColor: '#007bff',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'تطبيق سكري - سجل قياسات السكر في الدم',
                    font: {
                        size: 16,
                        family: 'Cairo'
                    }
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 400,
                    ticks: {
                        stepSize: 50,
                        font: {
                            family: 'Cairo'
                        }
                    },
                    grid: {
                        color: '#e0e0e0'
                    },
                    title: {
                        display: true,
                        text: 'مستوى السكر (mg/dL)',
                        font: {
                            family: 'Cairo',
                            weight: 600
                        }
                    }
                },
                x: {
                    grid: {
                        color: '#e0e0e0'
                    },
                    title: {
                        display: true,
                        text: 'التاريخ والوقت'
                    }
                }
            }
        }
    });

    // نموذج قراءات السكر
    if (document.getElementById('glucoseForm')) {
        document.getElementById('glucoseForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const value = document.getElementById('glucoseValue').value;
            const notes = document.getElementById('notes').value;

            fetch('/api/readings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ value, notes })
            })
            .then(response => response.json())
            .then(() => {
                loadLatestReading();
                document.getElementById('glucoseForm').reset();
            });
        });
    }

    // نموذج الأدوية
    document.getElementById('medicationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('medName').value;
        const dosage = document.getElementById('medDosage').value;
        const time = document.getElementById('medTime').value;

        fetch('/api/medications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, dosage, time })
        })
        .then(response => response.json())
        .then(() => {
            loadMedications();
            document.getElementById('medicationForm').reset();
        });
    });

    // نموذج النشاط البدني
    if (document.getElementById('activityForm')) {
        document.getElementById('activityForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const type = document.getElementById('activityType').value;
            const duration = document.getElementById('activityDuration').value;

            fetch('/api/activities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type, duration })
            })
            .then(response => response.json())
            .then(() => {
                loadActivities();
                document.getElementById('activityForm').reset();
            });
        });
    }
});

function loadLatestReading() {
    fetch('/api/latest_reading')
        .then(response => response.json())
        .then(reading => {
            if (reading.value) {
                document.getElementById('latestValue').textContent = reading.value;
                document.getElementById('latestDate').textContent = reading.date;
                document.getElementById('latestNotes').textContent = reading.notes || '';
            }
        });
}

function loadMedications() {
    fetch('/api/medications')
        .then(response => response.json())
        .then(medications => {
            const container = document.getElementById('medicationList');
            if (container) {
                container.innerHTML = medications.map(med => `
                    <div class="medication-item">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>${med.name}</strong>
                                <br>
                                الجرعة: ${med.dosage}
                                <br>
                                الوقت: ${med.time}
                            </div>
                            <button class="btn btn-primary btn-sm" onclick="takeMedication(${med.id})">
                                تم التناول
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        });
}

function loadActivities() {
    fetch('/api/activities')
        .then(response => response.json())
        .then(activities => {
            const container = document.getElementById('activityList');
            if (container) {
                container.innerHTML = activities.map(activity => `
                    <div class="activity-item">
                        <strong>${activity.type}</strong>
                        <br>
                        المدة: ${activity.duration} دقيقة
                        <br>
                        <small>${activity.date}</small>
                    </div>
                `).join('');
            }
        });
}
