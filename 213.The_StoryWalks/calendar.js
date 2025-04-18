/**
 * Cultural Calendar Module
 * A comprehensive solution for managing cultural events with AI integration
 * Maintains all original links and element names while adding functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // ========== MODULE CONSTANTS ==========
    const CULTURAL_API_BASE = '/api/calendar_ai';
    const EVENT_STORAGE_KEY = 'cultural_events';
    const USER_PREFERENCES_KEY = 'cultural_preferences';
    
    // ========== DOM ELEMENTS ==========
    const elements = {
        eventsList: document.getElementById('eventList'),
        eventInfoBox: document.getElementById('infoBox'),
        regionFilter: document.getElementById('regionFilter'),
        monthFilter: document.getElementById('monthFilter'),
        applyFilters: document.getElementById('applyFilters'),
        selectedEvent: document.getElementById('selectedEvent'),
        eventDate: document.getElementById('eventDate'),
        eventLocation: document.getElementById('eventLocation'),
        eventInfoText: document.getElementById('eventInfoText'),
        shareEvent: document.getElementById('shareEvent'),
        saveEvent: document.getElementById('saveEvent')
    };

    // ========== MODULE STATE ==========
    const state = {
        currentEvents: [],
        selectedEvent: null,
        userPreferences: {
            region: 'all',
            month: 'all',
            savedEvents: []
        },
        isLoading: false
    };

    // ========== INITIALIZATION ==========
    initCalendar();

    // ========== EVENT LISTENERS ==========
    elements.applyFilters.addEventListener('click', applyFilters);
    elements.eventsList.addEventListener('click', handleEventClick);
    elements.shareEvent.addEventListener('click', shareCurrentEvent);
    elements.saveEvent.addEventListener('click', saveCurrentEvent);
    window.addEventListener('resize', handleResponsiveLayout);

    // ========== CORE FUNCTIONS ==========
    
    /**
     * Initialize the calendar module
     */
    async function initCalendar() {
        try {
            loadUserPreferences();
            await loadEvents();
            setupServiceWorker();
            checkForSavedEvents();
        } catch (error) {
            console.error('Initialization error:', error);
            showError('Failed to initialize calendar. Please refresh the page.');
        }
    }

    /**
     * Load events based on current filters
     */
    async function loadEvents() {
        if (state.isLoading) return;
        
        try {
            state.isLoading = true;
            showLoadingState();
            
            const params = {
                region: state.userPreferences.region,
                month: state.userPreferences.month
            };

            // Try to get cached events first
            const cachedEvents = getCachedEvents(params);
            if (cachedEvents && cachedEvents.length > 0) {
                state.currentEvents = cachedEvents;
                displayEvents(cachedEvents);
                
                // Refresh in background
                fetchEvents(params, true);
            } else {
                await fetchEvents(params);
            }
        } catch (error) {
            console.error('Error loading events:', error);
            showError('Failed to load events. Please try again.');
        } finally {
            state.isLoading = false;
            hideLoadingState();
        }
    }

    /**
     * Fetch events from API
     * @param {Object} params - Filter parameters
     * @param {boolean} background - Whether to fetch in background
     */
    async function fetchEvents(params, background = false) {
        try {
            const response = await fetch(`${CULTURAL_API_BASE}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(params)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            
            // Cache the events
            cacheEvents(data.events, params);
            
            if (!background) {
                state.currentEvents = data.events;
                displayEvents(data.events);
            } else if (data.events.length > state.currentEvents.length) {
                // Only update if we got more events
                state.currentEvents = data.events;
                displayEvents(data.events);
                showNotification('New events available!');
            }
        } catch (error) {
            if (!background) throw error;
            console.error('Background fetch error:', error);
        }
    }

    /**
     * Display events in the UI
     * @param {Array} events - Array of event objects
     */
    function displayEvents(events) {
        elements.eventsList.innerHTML = '';

        if (events.length === 0) {
            elements.eventsList.innerHTML = `
                <div class="no-events">
                    <i class="fas fa-calendar-times"></i>
                    <p>No events found matching your criteria.</p>
                    <button class="btn btn-secondary" onclick="resetFilters()">
                        Reset Filters
                    </button>
                </div>
            `;
            return;
        }

        const fragment = document.createDocumentFragment();
        
        events.forEach(event => {
            const eventElement = createEventElement(event);
            fragment.appendChild(eventElement);
        });

        elements.eventsList.appendChild(fragment);
        
        // Highlight saved events
        highlightSavedEvents();
    }

    /**
     * Create DOM element for an event
     * @param {Object} event - Event object
     * @returns {HTMLElement} Event element
     */
    function createEventElement(event) {
        const eventElement = document.createElement('div');
        eventElement.className = 'event-card';
        eventElement.dataset.id = event.id;
        
        const isSaved = state.userPreferences.savedEvents.includes(event.id);
        const savedClass = isSaved ? 'saved' : '';
        
        eventElement.innerHTML = `
            <div class="event-image" style="background-image: url('${event.image || 'images/default-event.jpg'}')">
                ${event.cultural_significance ? 
                    `<span class="cultural-badge">Cultural</span>` : ''}
                ${isSaved ? `<span class="saved-badge"><i class="fas fa-bookmark"></i></span>` : ''}
            </div>
            <div class="event-content ${savedClass}">
                <h3 class="event-title">${event.title}</h3>
                <div class="event-meta">
                    <span class="event-date"><i class="far fa-calendar-alt"></i> ${formatDate(event.date)}</span>
                    <span class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
                </div>
                ${event.short_description ? 
                    `<p class="event-description">${event.short_description}</p>` : ''}
                <button class="btn btn-link details-btn" data-id="${event.id}">
                    View Details <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
        
        return eventElement;
    }

    /**
     * Apply filters and reload events
     */
    function applyFilters() {
        state.userPreferences.region = elements.regionFilter.value;
        state.userPreferences.month = elements.monthFilter.value;
        saveUserPreferences();
        loadEvents();
    }

    /**
     * Reset all filters to default
     */
    function resetFilters() {
        elements.regionFilter.value = 'all';
        elements.monthFilter.value = 'all';
        applyFilters();
    }

    /**
     * Handle click on event
     * @param {Event} e - Click event
     */
    async function handleEventClick(e) {
        const eventCard = e.target.closest('.event-card');
        const detailsBtn = e.target.closest('.details-btn');
        
        if (eventCard || detailsBtn) {
            const eventId = eventCard ? eventCard.dataset.id : detailsBtn.dataset.id;
            await showEventDetails(eventId);
        }
    }

    /**
     * Display detailed view for an event
     * @param {string} eventId - ID of the event to display
     */
    async function showEventDetails(eventId) {
        try {
            const event = state.currentEvents.find(e => e.id === eventId);
            if (!event) return;

            state.selectedEvent = event;
            showLoadingDetails();

            // Check if we have cached details
            const cachedDetails = getCachedEventDetails(eventId);
            if (cachedDetails) {
                displayEventDetails(event, cachedDetails);
                
                // Refresh details in background
                fetchEventDetails(eventId, true);
            } else {
                await fetchEventDetails(eventId);
            }
        } catch (error) {
            console.error('Error showing event details:', error);
            showErrorDetails('Failed to load event details. Please try again.');
        }
    }

    /**
     * Fetch detailed information for an event
     * @param {string} eventId - Event ID
     * @param {boolean} background - Whether to fetch in background
     */
    async function fetchEventDetails(eventId, background = false) {
        try {
            const event = state.currentEvents.find(e => e.id === eventId);
            if (!event) return;

            const response = await fetch(`${CULTURAL_API_BASE}/context`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    event_id: eventId,
                    event_name: event.title,
                    location: event.location,
                    date: event.date,
                    cultural_significance: event.cultural_significance
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const details = await response.json();
            cacheEventDetails(eventId, details);

            if (!background) {
                displayEventDetails(event, details);
            }
        } catch (error) {
            if (!background) throw error;
            console.error('Background details fetch error:', error);
        }
    }

    /**
     * Display event details in the info box
     * @param {Object} event - Event object
     * @param {Object} details - Additional details
     */
    function displayEventDetails(event, details) {
        elements.selectedEvent.textContent = event.title;
        elements.eventDate.textContent = formatDate(event.date, true);
        elements.eventLocation.textContent = event.location;
        
        let infoHTML = `
            <div class="detail-section">
                <h4><i class="fas fa-info-circle"></i> Overview</h4>
                <p>${event.description || details.overview || 'No description available.'}</p>
            </div>
        `;

        if (details.cultural_context) {
            infoHTML += `
                <div class="detail-section">
                    <h4><i class="fas fa-landmark"></i> Cultural Context</h4>
                    <p>${details.cultural_context}</p>
                </div>
            `;
        }

        if (details.traditions) {
            infoHTML += `
                <div class="detail-section">
                    <h4><i class="fas fa-hands-praying"></i> Traditions</h4>
                    <p>${details.traditions}</p>
                </div>
            `;
        }

        if (details.significance) {
            infoHTML += `
                <div class="detail-section">
                    <h4><i class="fas fa-star"></i> Significance</h4>
                    <p>${details.significance}</p>
                </div>
            `;
        }

        elements.eventInfoText.innerHTML = infoHTML;
        elements.eventInfoBox.style.display = 'block';
        
        // Scroll to info box on mobile
        if (window.innerWidth < 768) {
            elements.eventInfoBox.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // ========== EVENT ACTIONS ==========
    
    /**
     * Share the currently selected event
     */
    async function shareCurrentEvent() {
        if (!state.selectedEvent) return;
        await shareEvent(state.selectedEvent.id);
    }

    /**
     * Save the currently selected event
     */
    async function saveCurrentEvent() {
        if (!state.selectedEvent) return;
        await saveEvent(state.selectedEvent.id);
    }

    /**
     * Share an event
     * @param {string} eventId - Event ID to share
     */
    async function shareEvent(eventId) {
        try {
            const event = state.currentEvents.find(e => e.id === eventId);
            if (!event) return;

            const response = await fetch(`${CULTURAL_API_BASE}/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    event_id: eventId,
                    event_name: event.title,
                    date: event.date,
                    location: event.location
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate share message');
            }

            const shareData = await response.json();
            const shareUrl = `${window.location.origin}${window.location.pathname}?event=${eventId}`;

            if (navigator.share) {
                await navigator.share({
                    title: `Cultural Event: ${event.title}`,
                    text: shareData.message,
                    url: shareUrl
                });
            } else {
                await navigator.clipboard.writeText(`${shareData.message}\n\n${shareUrl}`);
                showNotification('Event details copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing event:', error);
            if (error.name !== 'AbortError') { // User cancelled share
                showNotification('Failed to share event. Please try again.', 'error');
            }
        }
    }

    /**
     * Save an event to user's collection
     * @param {string} eventId - Event ID to save
     */
    async function saveEvent(eventId) {
        try {
            const event = state.currentEvents.find(e => e.id === eventId);
            if (!event) return;

            // Check if already saved
            const isSaved = state.userPreferences.savedEvents.includes(eventId);
            
            if (isSaved) {
                // Unsaving
                state.userPreferences.savedEvents = state.userPreferences.savedEvents.filter(id => id !== eventId);
                showNotification('Event removed from your saved events');
            } else {
                // Saving
                state.userPreferences.savedEvents.push(eventId);
                showNotification('Event saved to your collection!');
            }

            saveUserPreferences();
            highlightSavedEvents();
            
            // Update details view if this is the current event
            if (state.selectedEvent && state.selectedEvent.id === eventId) {
                elements.saveEvent.innerHTML = isSaved ? 
                    '<i class="far fa-bookmark"></i> Save' : 
                    '<i class="fas fa-bookmark"></i> Saved';
            }
        } catch (error) {
            console.error('Error saving event:', error);
            showNotification('Failed to save event. Please try again.', 'error');
        }
    }

    // ========== USER PREFERENCES ==========
    
    /**
     * Load user preferences from localStorage
     */
    function loadUserPreferences() {
        const savedPrefs = localStorage.getItem(USER_PREFERENCES_KEY);
        if (savedPrefs) {
            try {
                state.userPreferences = JSON.parse(savedPrefs);
                elements.regionFilter.value = state.userPreferences.region || 'all';
                elements.monthFilter.value = state.userPreferences.month || 'all';
            } catch (e) {
                console.error('Error parsing user preferences:', e);
            }
        }
    }

    /**
     * Save user preferences to localStorage
     */
    function saveUserPreferences() {
        localStorage.setItem(
            USER_PREFERENCES_KEY,
            JSON.stringify(state.userPreferences)
        );
    }

    /**
     * Check for saved events and highlight them
     */
    function checkForSavedEvents() {
        if (state.userPreferences.savedEvents.length > 0) {
            highlightSavedEvents();
        }
    }

    /**
     * Highlight saved events in the list
     */
    function highlightSavedEvents() {
        document.querySelectorAll('.event-card').forEach(card => {
            const isSaved = state.userPreferences.savedEvents.includes(card.dataset.id);
            card.classList.toggle('saved', isSaved);
            
            const badge = card.querySelector('.saved-badge');
            if (badge) {
                badge.style.display = isSaved ? 'flex' : 'none';
            }
        });
    }

    // ========== CACHING FUNCTIONS ==========
    
    /**
     * Cache events data
     * @param {Array} events - Array of events
     * @param {Object} params - Filter parameters used
     */
    function cacheEvents(events, params) {
        const cacheData = {
            events,
            params,
            timestamp: Date.now()
        };
        
        sessionStorage.setItem(
            `${EVENT_STORAGE_KEY}_${params.region}_${params.month}`,
            JSON.stringify(cacheData)
        );
    }

    /**
     * Get cached events
     * @param {Object} params - Filter parameters
     * @returns {Array|null} Cached events or null
     */
    function getCachedEvents(params) {
        const cacheKey = `${EVENT_STORAGE_KEY}_${params.region}_${params.month}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        
        if (!cachedData) return null;
        
        try {
            const { events, timestamp } = JSON.parse(cachedData);
            
            // Cache valid for 1 hour
            if (Date.now() - timestamp < 3600000) {
                return events;
            }
        } catch (e) {
            console.error('Error parsing cached events:', e);
        }
        
        return null;
    }

    /**
     * Cache event details
     * @param {string} eventId - Event ID
     * @param {Object} details - Event details
     */
    function cacheEventDetails(eventId, details) {
        const cacheData = {
            details,
            timestamp: Date.now()
        };
        
        sessionStorage.setItem(
            `${EVENT_STORAGE_KEY}_details_${eventId}`,
            JSON.stringify(cacheData)
        );
    }

    /**
     * Get cached event details
     * @param {string} eventId - Event ID
     * @returns {Object|null} Cached details or null
     */
    function getCachedEventDetails(eventId) {
        const cachedData = sessionStorage.getItem(`${EVENT_STORAGE_KEY}_details_${eventId}`);
        
        if (!cachedData) return null;
        
        try {
            const { details, timestamp } = JSON.parse(cachedData);
            
            // Cache valid for 24 hours for details
            if (Date.now() - timestamp < 86400000) {
                return details;
            }
        } catch (e) {
            console.error('Error parsing cached details:', e);
        }
        
        return null;
    }

    // ========== UI HELPERS ==========
    
    /**
     * Show loading state for events list
     */
    function showLoadingState() {
        elements.eventsList.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Discovering cultural events...</p>
            </div>
        `;
    }

    /**
     * Hide loading state
     */
    function hideLoadingState() {
        const loader = elements.eventsList.querySelector('.loading-state');
        if (loader) loader.remove();
    }

    /**
     * Show loading state for details
     */
    function showLoadingDetails() {
        elements.eventInfoBox.innerHTML = `
            <div class="loading-details">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Gathering cultural insights...</p>
            </div>
        `;
        elements.eventInfoBox.style.display = 'block';
    }

    /**
     * Show error in details panel
     * @param {string} message - Error message
     */
    function showErrorDetails(message) {
        elements.eventInfoBox.innerHTML = `
            <div class="error-details">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Show error in events list
     * @param {string} message - Error message
     */
    function showError(message) {
        elements.eventsList.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
                <button class="btn btn-secondary" onclick="window.location.reload()">
                    <i class="fas fa-sync-alt"></i> Reload
                </button>
            </div>
        `;
    }

    /**
     * Show notification to user
     * @param {string} message - Notification message
     * @param {string} type - Type of notification (default, error, success)
     */
    function showNotification(message, type = 'default') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <p>${message}</p>
            <button class="close-btn" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Manual close
        notification.querySelector('.close-btn').addEventListener('click', () => {
            notification.remove();
        });
    }

    /**
     * Format date for display
     * @param {string} dateString - Date string
     * @param {boolean} detailed - Whether to include time
     * @returns {string} Formatted date
     */
    function formatDate(dateString, detailed = false) {
        const date = new Date(dateString);
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        if (detailed) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        
        return date.toLocaleDateString('en-US', options);
    }

    // ========== RESPONSIVE HELPERS ==========
    
    /**
     * Handle responsive layout changes
     */
    function handleResponsiveLayout() {
        if (window.innerWidth < 768) {
            // Mobile adjustments
        } else {
            // Desktop adjustments
        }
    }

    // ========== SERVICE WORKER ==========
    
    /**
     * Setup service worker for offline support
     */
    function setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(registration => {
                    console.log('ServiceWorker registration successful');
                }).catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
            });
        }
    }

    // ========== GLOBAL EXPORTS ==========
    window.resetFilters = resetFilters;
    window.shareEvent = shareEvent;
    window.saveEvent = saveEvent;
});