document.addEventListener('DOMContentLoaded', function() {
    loadReadings();
    setupChart();

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
            loadReadings();
            document.getElementById('glucoseForm').reset();
        });
    });
});

function loadReadings() {
    fetch('/api/readings')
        .then(response => response.json())
        .then(readings => {
            // تحديث الجدول
            const tableBody = document.getElementById('readingsTable');
            tableBody.innerHTML = readings.map(reading => `
                <tr>
                    <td>${reading.value}</td>
                    <td>${reading.date}</td>
                    <td>${reading.notes || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteReading(${reading.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

            // تحديث الرسم البياني
            updateChart(readings);
        });
}

function setupChart() {
    const ctx = document.getElementById('glucoseChart').getContext('2d');
    window.glucoseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'قراءات السكر',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 1,
                barPercentage: 1.0,
                categoryPercentage: 1.0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'سجل قياسات السكر في الدم',
                    font: {
                        family: 'Cairo',
                        size: 16
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'مستوى السكر',
                        font: {
                            family: 'Cairo'
                        }
                    },
                    grid: {
                        display: true
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'التاريخ',
                        font: {
                            family: 'Cairo'
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function updateChart(readings) {
    // ترتيب القراءات حسب التاريخ
    readings.sort((a, b) => new Date(a.date) - new Date(b.date));

    // تحديث البيانات في الرسم البياني
    window.glucoseChart.data.labels = readings.map(r => r.date);
    window.glucoseChart.data.datasets[0].data = readings.map(r => r.value);

    // إضافة خطوط مرجعية للقيم الطبيعية
    window.glucoseChart.options.plugins.annotation = {
        annotations: {
            normalRangeHigh: {
                type: 'line',
                yMin: 140,
                yMax: 140,
                borderColor: 'rgba(255, 99, 132, 0.5)',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                    enabled: true,
                    content: 'الحد الأعلى الطبيعي',
                    position: 'end'
                }
            },
            normalRangeLow: {
                type: 'line',
                yMin: 70,
                yMax: 70,
                borderColor: 'rgba(255, 99, 132, 0.5)',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                    enabled: true,
                    content: 'الحد الأدنى الطبيعي',
                    position: 'end'
                }
            }
        }
    };

    window.glucoseChart.update();
}

function deleteReading(readingId) {
    if (confirm('هل أنت متأكد من حذف هذه القراءة؟')) {
        fetch(`/api/readings/${readingId}`, {
            method: 'DELETE'
        })
        .then(() => {
            loadReadings();
        });
    }
}
