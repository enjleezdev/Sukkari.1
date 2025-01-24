document.addEventListener('DOMContentLoaded', function() {
    const settingsForm = document.getElementById('settingsForm');
    
    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(settingsForm);
        const language = formData.get('language');

        fetch('/api/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                language: language
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // إعادة تحميل الصفحة لتطبيق التغييرات
                window.location.reload();
            }
        });
    });
});
