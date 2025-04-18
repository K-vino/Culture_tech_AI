// Events Page JavaScript

// DOM Elements
const calendarView = document.querySelector('.calendar-view');
const eventsGrid = document.querySelector('.events-grid');
const loadingSpinner = document.querySelector('.loading-spinner');
const eventDetailsModal = document.querySelector('.event-details-modal');
const closeModalBtn = document.querySelector('.close-modal');
const locationFilter = document.getElementById('location-filter');
const monthFilter = document.getElementById('month-filter');
const yearFilter = document.getElementById('year-filter');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const currentMonthYear = document.getElementById('current-month');

// State variables
let currentDate = new Date();
let events = [];
let filteredEvents = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Load events from API or local storage
    loadEvents();
    
    // Set up event listeners
    setupEventListeners();
    
    // Render calendar and events
    renderCalendar();
    renderEvents();
});

// Load events from API or local storage
function loadEvents() {
    // Show loading spinner
    loadingSpinner.style.display = 'flex';
    
    // Simulate API call with setTimeout
    setTimeout(() => {
        // Sample events data (replace with actual API call)
        events = [
            {
                id: 1,
                title: 'Traditional Dance Festival',
                date: '2023-06-15',
                time: '18:00',
                location: 'Chennai',
                description: 'Experience the rich cultural heritage of Tamil Nadu through traditional dance performances.',
                image: 'https://hinduvism.com/wp-content/uploads/2024/10/Untitled-design-2024-10-16T145405.703-1024x585.jpg',
                category: 'Performance'
            },
            {
                id: 2,
                title: 'Culinary Workshop',
                date: '2023-06-20',
                time: '14:00',
                location: 'Mumbai',
                description: 'Learn authentic recipes from different regions of India in this hands-on cooking workshop.',
                image: 'https://culinarycraft.in/wp-content/uploads/2023/11/Team-building-1024x768.webp',
                category: 'Workshop'
            },
            {
                id: 3,
                title: 'Music Festival',
                date: '2023-07-05',
                time: '19:00',
                location: 'Delhi',
                description: 'A celebration of classical and contemporary Indian music featuring renowned artists.',
                image: 'https://iaac.us/wp-content/uploads/2023/08/music-Aug13.jpg',
                category: 'Performance'
            },
            {
                id: 4,
                title: 'Art Exhibition',
                date: '2023-07-15',
                time: '10:00',
                location: 'Bangalore',
                description: 'Explore contemporary Indian art with works from emerging and established artists.',
                image: 'https://culturizm.com/wp-content/uploads/2024/01/contemporary_indian_artists__1_.png.webp',
                category: 'Exhibition'
            },
            {
                id: 5,
                title: 'Literature Festival',
                date: '2023-08-01',
                time: '11:00',
                location: 'Kolkata',
                description: 'A gathering of authors, poets, and literary enthusiasts celebrating Indian literature.',
                image: 'https://images.cnbctv18.com/wp-content/uploads/2023/07/Literary-festival.jpg',
                category: 'Festival'
            }
        ];
        
        // Hide loading spinner
        loadingSpinner.style.display = 'none';
        
        // Apply initial filters
        applyFilters();
    }, 1000);
}

// Set up event listeners
function setupEventListeners() {
    // Filter change events
    locationFilter.addEventListener('change', applyFilters);
    monthFilter.addEventListener('change', applyFilters);
    yearFilter.addEventListener('change', applyFilters);
    
    // Calendar navigation
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    // Modal close button
    closeModalBtn.addEventListener('click', () => {
        eventDetailsModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === eventDetailsModal) {
            eventDetailsModal.style.display = 'none';
        }
    });
}

// Apply filters to events
function applyFilters() {
    const location = locationFilter.value;
    const month = monthFilter.value;
    const year = yearFilter.value;
    
    filteredEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        const eventMonth = eventDate.getMonth() + 1;
        const eventYear = eventDate.getFullYear();
        
        const locationMatch = location === 'all' || event.location === location;
        const monthMatch = month === 'all' || eventMonth === parseInt(month);
        const yearMatch = year === 'all' || eventYear === parseInt(year);
        
        return locationMatch && monthMatch && yearMatch;
    });
    
    renderEvents();
}

// Render calendar
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update current month/year display
    currentMonthYear.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    // Clear previous calendar dates
    const calendarDates = document.getElementById('calendar-dates');
    calendarDates.innerHTML = '';
    
    // Add days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
        const dateDiv = document.createElement('div');
        dateDiv.className = 'calendar-date other-month';
        dateDiv.innerHTML = `<div class="date-number">${prevMonthLastDay - i}</div>`;
        calendarDates.appendChild(dateDiv);
    }
    
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
        const dateDiv = document.createElement('div');
        dateDiv.className = 'calendar-date';
        
        // Check if date has events
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const hasEvents = events.some(event => event.date === dateStr);
        
        if (hasEvents) {
            dateDiv.classList.add('has-event');
            const event = events.find(event => event.date === dateStr);
            dateDiv.innerHTML = `
                <div class="date-number">${i}</div>
                <div class="event-indicator"></div>
                <div class="event-title">${event.title}</div>
            `;
            dateDiv.addEventListener('click', () => showEventDetails(event));
        } else {
            dateDiv.innerHTML = `<div class="date-number">${i}</div>`;
        }
        
        calendarDates.appendChild(dateDiv);
    }
    
    // Add days from next month
    const remainingDays = 42 - (startingDay + daysInMonth);
    for (let i = 1; i <= remainingDays; i++) {
        const dateDiv = document.createElement('div');
        dateDiv.className = 'calendar-date other-month';
        dateDiv.innerHTML = `<div class="date-number">${i}</div>`;
        calendarDates.appendChild(dateDiv);
    }
}

// Render events list
function renderEvents() {
    eventsGrid.innerHTML = '';
    
    if (filteredEvents.length === 0) {
        eventsGrid.innerHTML = '<p class="no-events">No events found matching your criteria.</p>';
        return;
    }
    
    filteredEvents.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        eventCard.innerHTML = `
            <div class="event-image">
                <img src="${event.image}" alt="${event.title}">
            </div>
            <div class="event-content">
                <div class="event-date">${formattedDate} at ${event.time}</div>
                <h3 class="event-title">${event.title}</h3>
                <div class="event-location">
                    <i class="fas fa-map-marker-alt"></i> ${event.location}
                </div>
                <div class="event-description">${event.description}</div>
                <div class="event-actions">
                    <button class="btn btn-secondary">Add to Calendar</button>
                    <button class="btn btn-primary">View Details</button>
                </div>
            </div>
        `;
        
        // Add event listener to view details button
        const viewDetailsBtn = eventCard.querySelector('.btn-primary');
        viewDetailsBtn.addEventListener('click', () => showEventDetails(event));
        
        eventsGrid.appendChild(eventCard);
    });
}

// Show event details modal
function showEventDetails(event) {
    const modalTitle = document.querySelector('.modal-title');
    const modalDate = document.querySelector('.modal-date');
    const modalLocation = document.querySelector('.modal-location');
    const modalTime = document.querySelector('.modal-time');
    const modalCategory = document.querySelector('.modal-category');
    const modalDescription = document.querySelector('.modal-description');
    const modalImage = document.querySelector('.modal-image img');
    
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    modalTitle.textContent = event.title;
    modalDate.textContent = formattedDate;
    modalLocation.textContent = event.location;
    modalTime.textContent = event.time;
    modalCategory.textContent = event.category;
    modalDescription.textContent = event.description;
    modalImage.src = event.image;
    modalImage.alt = event.title;
    
    eventDetailsModal.style.display = 'block';
}

// Populate filter dropdowns
function populateFilters() {
    // Get unique locations
    const locations = ['all', ...new Set(events.map(event => event.location))];
    locationFilter.innerHTML = locations.map(location => 
        `<option value="${location}">${location === 'all' ? 'All Locations' : location}</option>`
    ).join('');
    
    // Get unique months
    const months = ['all', ...new Set(events.map(event => {
        const date = new Date(event.date);
        return date.getMonth() + 1;
    }))].sort((a, b) => a - b);
    
    monthFilter.innerHTML = months.map(month => 
        `<option value="${month}">${month === 'all' ? 'All Months' : new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}</option>`
    ).join('');
    
    // Get unique years
    const years = ['all', ...new Set(events.map(event => {
        const date = new Date(event.date);
        return date.getFullYear();
    }))].sort((a, b) => a - b);
    
    yearFilter.innerHTML = years.map(year => 
        `<option value="${year}">${year === 'all' ? 'All Years' : year}</option>`
    ).join('');
}

// Call populateFilters after loading events
setTimeout(populateFilters, 1000);