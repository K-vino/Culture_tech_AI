document.addEventListener('DOMContentLoaded', () => {
    // Quick Access Buttons
    const quickAccessButtons = document.querySelectorAll('.ai-quick-access');
    const quickAccessModal = document.createElement('div');
    quickAccessModal.className = 'quick-access-modal';
    
    // Create modal content
    quickAccessModal.innerHTML = `
        <div class="quick-access-content">
            <span class="quick-access-close">&times;</span>
            <div id="quick-access-form"></div>
        </div>
    `;
    
    document.body.appendChild(quickAccessModal);

    // Handle quick access button clicks
    quickAccessButtons.forEach(button => {
        button.addEventListener('click', () => {
            const feature = button.dataset.feature;
            showQuickAccessModal(feature);
        });
    });

    // Close modal
    const closeButton = quickAccessModal.querySelector('.quick-access-close');
    closeButton.addEventListener('click', () => {
        quickAccessModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === quickAccessModal) {
            quickAccessModal.style.display = 'none';
        }
    });

    function showQuickAccessModal(feature) {
        const formContainer = document.getElementById('quick-access-form');
        let formHTML = '';

        switch (feature) {
            case 'planner':
                formHTML = `
                    <h3>Quick Travel Plan</h3>
                    <form id="quick-planner-form">
                        <div class="form-group">
                            <label for="destination">Destination</label>
                            <input type="text" id="destination" required>
                        </div>
                        <div class="form-group">
                            <label for="duration">Duration (days)</label>
                            <input type="number" id="duration" min="1" max="30" required>
                        </div>
                        <div class="form-group">
                            <label for="budget">Budget Range</label>
                            <select id="budget" required>
                                <option value="budget">Budget</option>
                                <option value="mid-range">Mid-range</option>
                                <option value="luxury">Luxury</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary">Generate Plan</button>
                    </form>
                `;
                break;

            case 'assistant':
                formHTML = `
                    <h3>Quick Cultural Query</h3>
                    <form id="quick-assistant-form">
                        <div class="form-group">
                            <label for="question">Your Question</label>
                            <textarea id="question" rows="4" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Get Answer</button>
                    </form>
                `;
                break;

            case 'calendar':
                formHTML = `
                    <h3>Quick Event Search</h3>
                    <form id="quick-calendar-form">
                        <div class="form-group">
                            <label for="event-type">Event Type</label>
                            <select id="event-type" required>
                                <option value="festival">Festival</option>
                                <option value="cultural">Cultural Event</option>
                                <option value="religious">Religious Event</option>
                                <option value="all">All Events</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="date-range">Date Range</label>
                            <select id="date-range" required>
                                <option value="this-month">This Month</option>
                                <option value="next-month">Next Month</option>
                                <option value="next-3-months">Next 3 Months</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary">Search Events</button>
                    </form>
                `;
                break;
        }

        formContainer.innerHTML = formHTML;
        quickAccessModal.style.display = 'block';

        // Add form submission handlers
        const form = document.getElementById(`quick-${feature}-form`);
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                handleQuickAccessSubmit(feature, form);
            });
        }
    }

    function handleQuickAccessSubmit(feature, form) {
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';

        // Simulate API call (replace with actual API calls)
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            
            // Redirect to full feature page with parameters
            const formData = new FormData(form);
            const params = new URLSearchParams(formData).toString();
            window.location.href = `${feature}.html?${params}`;
        }, 1500);
    }
}); 