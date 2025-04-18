document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('plannerForm');
    const resultBox = document.getElementById('resultBox');
    const planResult = document.getElementById('planResult');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Show loading state
        planResult.innerHTML = '<p>Generating your travel plan...</p>';
        resultBox.style.display = 'block';

        // Get form data
        const formData = {
            start: document.getElementById('start').value,
            destination: document.getElementById('destination').value,
            num_days: document.getElementById('num_days').value,
            travel_mode: document.getElementById('travel_mode').value,
            trip_type: document.getElementById('trip_type').value,
            accommodation: document.getElementById('accommodation').value,
            budget: document.getElementById('budget').value,
            language: document.getElementById('language').value,
            must_include: document.getElementById('must_include').value,
            must_avoid: document.getElementById('must_avoid').value,
            accessibility: document.getElementById('accessibility').value,
            food: Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
                .map(checkbox => checkbox.value)
        };

        try {
            const response = await fetch('http://127.0.0.1:5000/api/plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            // Format and display the plan
            const formattedPlan = data.response
                .split('\n')
                .map(line => {
                    if (line.startsWith('Day')) {
                        return `<h3>${line}</h3>`;
                    } else if (line.trim() === '') {
                        return '<br>';
                    } else {
                        return `<p>${line}</p>`;
                    }
                })
                .join('');

            planResult.innerHTML = formattedPlan;
        } catch (error) {
            planResult.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        }
    });
});
  