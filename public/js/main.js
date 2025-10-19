// --- ЛОГИКА ДЛЯ ФОРМЫ КОНТАКТОВ ---

const form = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (form) {
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        formStatus.textContent = 'Sending...';
        formStatus.className = 'mt-4 text-sm text-blue-600';
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                formStatus.textContent = 'Thank you! Your message has been sent.';
                formStatus.className = 'mt-4 text-sm text-green-600';
                form.reset();
            } else {
                throw new Error('Server responded with an error');
            }
        } catch (error) {
            console.error('Submission error:', error);
            formStatus.textContent = 'Sorry, there was an error. Please try again.';
            formStatus.className = 'mt-4 text-sm text-red-600';
        }
    });
}


