document.addEventListener('DOMContentLoaded', function() {
  // Sidebar Toggle
  const sidebar = document.querySelector('.dashboard-sidebar');
  const sidebarToggle = document.querySelector('.sidebar-toggle-btn');
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle-dash');
  const mainContent = document.querySelector('.dashboard-main');

  if (sidebarToggle) {
      sidebarToggle.addEventListener('click', function() {
          sidebar.classList.toggle('collapsed');
          mainContent.classList.toggle('sidebar-collapsed');
      });
  }

  if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener('click', function() {
          sidebar.classList.toggle('mobile-open');
      });
  }

  // Profile Dropdown
  const profileButton = document.querySelector('.profile-button');
  const profileDropdown = document.querySelector('.profile-dropdown');

  if (profileButton) {
      profileButton.addEventListener('click', function() {
          profileDropdown.classList.toggle('show');
      });
  }

  document.addEventListener('click', function(event) {
      if (profileDropdown && !event.target.matches('.profile-button')) {
          if (profileDropdown.classList.contains('show')) {
              profileDropdown.classList.remove('show');
          }
      }
  });

  // Notification Dropdown
  const notificationButton = document.querySelector('.notification-btn');
  const notificationDropdown = document.querySelector('.notification-dropdown');

  if (notificationButton) {
      notificationButton.addEventListener('click', function() {
          notificationDropdown.classList.toggle('show');
      });
  }

  document.addEventListener('click', function(event) {
      if (notificationDropdown && !event.target.matches('.notification-btn')) {
          if (notificationDropdown.classList.contains('show')) {
              notificationDropdown.classList.remove('show');
          }
      }
  });

  // Logout Functionality
  const logoutButton = document.getElementById('logout-button');

  if (logoutButton) {
      logoutButton.addEventListener('click', function(event) {
          event.preventDefault();
          console.log('Logout clicked');
          // Add logout logic here, e.g., redirect to login page
      });
  }

  // Submenu Handling
  const submenuItems = document.querySelectorAll('.has-submenu');

  submenuItems.forEach(item => {
      item.addEventListener('click', function(event) {
          if (event.target.classList.contains('arrow')) {
              event.preventDefault();
              const submenu = this.querySelector('.submenu');
              submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
          }
      });
  });

  // Tab Functionality for Cultural Workers
  const tabLinks = document.querySelectorAll('.tab-link');
  const tabContents = document.querySelectorAll('.tab-content');

  tabLinks.forEach(link => {
      link.addEventListener('click', function() {
          const tabId = this.getAttribute('data-tab');

          tabLinks.forEach(tab => tab.classList.remove('active'));
          tabContents.forEach(content => content.classList.remove('active'));

          this.classList.add('active');
          document.getElementById(tabId).classList.add('active');
      });
  });

  // Filter Functionality
  const filterButton = document.querySelector('.filter-btn');
  const resetButton = document.querySelector('.reset-btn');
  const locationFilter = document.getElementById('location-filter');
  const roleFilter = document.getElementById('role-filter');
  const cultureFilter = document.getElementById('culture-filter');
  const memberCards = document.querySelectorAll('.member-card');

  if (filterButton) {
      filterButton.addEventListener('click', function() {
          const selectedLocation = locationFilter.value;
          const selectedRole = roleFilter.value;
          const selectedCulture = cultureFilter.value;

          memberCards.forEach(card => {
              const location = card.querySelector('.member-location').textContent;
              const role = card.querySelector('.member-role').textContent;
              const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent);

              const locationMatch = selectedLocation === 'All Regions' || location.includes(selectedLocation);
              const roleMatch = selectedRole === 'All Roles' || role.includes(selectedRole);
              const cultureMatch = selectedCulture === 'All Cultures' || tags.includes(selectedCulture);

              if (locationMatch && roleMatch && cultureMatch) {
                  card.style.display = 'block';
              } else {
                  card.style.display = 'none';
              }
          });
      });
  }

  if (resetButton) {
      resetButton.addEventListener('click', function() {
          locationFilter.value = 'All Regions';
          roleFilter.value = 'All Roles';
          cultureFilter.value = 'All Cultures';

          memberCards.forEach(card => {
              card.style.display = 'block';
          });
      });
  }

  // Event Slider Functionality (Basic Example - Needs actual slider library for production)
  const eventSlider = document.querySelector('.events-slider');
  let scrollPosition = 0;

  if (eventSlider) {
      eventSlider.addEventListener('wheel', function(event) {
          event.preventDefault();
          scrollPosition += event.deltaY;
          eventSlider.scrollTo({
              left: scrollPosition,
              behavior: 'smooth'
          });
      });
  }

  // Dynamic Data Loading (Example - Replace with actual API calls)
  function loadDynamicData() {
      // Example: Fetch members from API
      fetch('/api/members')
          .then(response => response.json())
          .then(members => {
              // Process members data and update UI
              console.log('Members loaded:', members);
              updateMemberCards(members);
          })
          .catch(error => console.error('Error loading members:', error));

      // Example: Fetch events from API
      fetch('/api/events')
          .then(response => response.json())
          .then(events => {
              // Process events data and update UI
              console.log('Events loaded:', events);
              updateEventCards(events);
          })
          .catch(error => console.error('Error loading events:', error));

      // Example: Fetch cultural workers from API
      fetch('/api/workers')
          .then(response => response.json())
          .then(workers => {
              // Process workers data and update UI
              console.log('Workers loaded:', workers);
              updateWorkerCards(workers);
          })
          .catch(error => console.error('Error loading workers:', error));
  }

  // Example functions to update UI with dynamic data (replace with your logic)
  function updateMemberCards(members) {
      // Example: Update member cards with fetched data
      const membersGrid = document.querySelector('.members-grid');
      if (!membersGrid) return;
      membersGrid.innerHTML = ''; // Clear existing cards

      members.forEach(member => {
          const card = document.createElement('div');
          card.className = 'member-card';
          card.innerHTML = `
              <div class="member-avatar">
                  <img src="${member.avatar}" alt="${member.name}">
                  <div class="member-status ${member.status}"></div>
              </div>
              <div class="member-info">
                  <h3>${member.name}</h3>
                  <p class="member-role">${member.role}</p>
                  <p class="member-location">${member.location}</p>
                  <div class="member-tags">
                      ${member.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                  </div>
              </div>
              <div class="member-actions">
                  <button class="connect-btn"><i class="fas fa-user-plus"></i> Connect</button>
                  <button class="message-btn"><i class="fas fa-envelope"></i></button>
              </div>
          `;
          membersGrid.appendChild(card);
      });
  }

  function updateEventCards(events) {
      // Example: Update event cards with fetched data
      const eventSlider = document.querySelector('.events-slider');
      if (!eventSlider) return;
      eventSlider.innerHTML = ''; // Clear existing cards

      events.forEach(event => {
          const card = document.createElement('div');
          card.className = 'event-card';
          card.innerHTML = `
              <div class="event-date">
                  <span class="day">${event.date.day}</span>
                  <span class="month">${event.date.month}</span>
              </div>
              <div class="event-image">
                  <img src="${event.image}" alt="${event.title}">
              </div>
              <div class="event-details">
                  <h3>${event.title}</h3>
                  <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                  <p class="event-time"><i class="fas fa-clock"></i> ${event.time}</p>
                  <div class="event-tags">
                      ${event.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                  </div>
                  <button class="event-btn">Register</button>
              </div>
          `;
          eventSlider.appendChild(card);
      });
  }

  function updateWorkerCards(workers) {
    // Example: Update Cultural Workers cards with fetched data
    const workersGrid = document.querySelector('.workers-grid');
    if (!workersGrid) return;
    workersGrid.innerHTML = '';
    workers.forEach(worker => {
      const card = document.createElement('div');
      card.className = 'worker-card';
      card.innerHTML = `
          <div class="worker-image">
              <img src="${worker.image}" alt="${worker.name}">
          </div>
          <div class="worker-details">
              <h3>${worker.name}</h3>
              <p class="worker-title">${worker.title}</p>
              <p class="worker-org">${worker.organization}</p>
              <div class="worker-expertise">
                  ${worker.expertise.map(exp => `<span><i class="fas fa-star"></i> ${exp}</span>`).join('')}
              </div>
              <div class="worker-actions">
                  <button class="profile-btn">View Profile</button>
                  <button class="collab-btn">Collaborate</button>
              </div>
          </div>
      `;
      workersGrid.appendChild(card);
    });
  }

  // Load dynamic data on page load
  loadDynamicData();

  // Additional event listeners and functions for interactivity
  // Example: Search functionality
  const searchInput = document.querySelector('.search-bar input');
  const searchButton = document.querySelector('.search-bar button');

  if(searchButton && searchInput){
      searchButton.addEventListener('click', function(){
          const searchTerm = searchInput.value.toLowerCase();
          // Implement search logic here, filtering members, events, etc.
          console.log("Searching for:", searchTerm);
      });
  }

  // Example: Invite members functionality
  const inviteButton = document.querySelector('.invite-btn');
  if(inviteButton){
      inviteButton.addEventListener('click', function(){
          // Implement invite members logic, e.g., show a modal or form
          console.log("Invite members clicked");
      });
  }

  // Example: Community engagement buttons
  const volunteerButton = document.querySelector('.engagement-actions .primary-btn');
  const suggestIdeaButton = document.querySelector('.engagement-actions .secondary-btn');

  if (volunteerButton && suggestIdeaButton){
      volunteerButton.addEventListener('click', function(){
          // Implement volunteer logic
          console.log("Volunteer button clicked");
      });
      suggestIdeaButton.addEventListener('click', function(){
          // Implement suggest idea logic
          console.log("Suggest idea button clicked");
      });
  }

  // Example: Adding more features
  function loadMoreData(){
      //Implement logic to fetch and display more data.
      console.log("Loading more data");
  }

  function createNewEvent(){
      //Implement logic to create a new event.
      console.log("Creating new event");
  }

  function sendChatMessage(){
      //Implement logic to send a chat message.
      console.log("Sending chat message");
  }
});