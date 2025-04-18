// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDBYx04o9699LZ5ZhLxCNhmsRtzxo84hxM",
    authDomain: "thestory-d73b7.firebaseapp.com",
    projectId: "thestory-d73b7",
    storageBucket: "thestory-d73b7.appspot.com",
    messagingSenderId: "127364201980",
    appId: "1:127364201980:web:02cda0fbdfdf1144d50679"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const authButtons = document.querySelector('.auth-buttons');
const userActions = document.querySelector('.user-actions');
const userProfile = document.querySelector('.user-profile');
const userAvatarContainer = document.querySelector('.user-avatar-container');
const logoutButton = document.querySelector('.logout-button');

// Check authentication state
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in
        const authButtons = document.getElementById('auth-buttons-section');
        const userProfile = document.getElementById('user-profile-section');
        
        if (authButtons) authButtons.style.display = 'none';
        if (userProfile) userProfile.style.display = 'block';
        
        // Get user data from Firestore
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                // Update UI with user data
                const userAvatar = document.getElementById('user-avatar');
                if (userData.profileImage && userAvatar) {
                    userAvatar.src = userData.profileImage;
                } else if (user.photoURL && userAvatar) {
                    userAvatar.src = user.photoURL;
                }
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    } else {
        // User is signed out
        const authButtons = document.getElementById('auth-buttons-section');
        const userProfile = document.getElementById('user-profile-section');
        
        if (authButtons) authButtons.style.display = 'flex';
        if (userProfile) userProfile.style.display = 'none';
    }
});

// Handle logout
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error signing out:', error);
            alert('Error signing out. Please try again.');
        }
    });
}

// Handle search functionality
const searchInput = document.querySelector('.search-container input');
const searchButton = document.querySelector('.search-container button');

if (searchButton) {
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            // Implement search functionality
            console.log('Searching for:', searchTerm);
            // Add your search logic here
        }
    });
}

// Handle mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mainNav = document.querySelector('.main-nav');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
    });
}

// Add smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

const header = document.querySelector('.home-header');
if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) { // Add class if scrolled more than 50px
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Add click event listener for user profile
if (userProfile) {
    userProfile.addEventListener('click', (e) => {
        e.preventDefault();
        // Check if user is authenticated before redirecting
        if (auth.currentUser) {
            window.location.href = 'dashboard.html';
        } else {
            // Redirect to login page if not authenticated
            window.location.href = 'login.html';
        }
    });
}

// --- Placeholder for Dynamic Content Loading ---
// This requires fetching data from Firestore or another backend
/*
function loadFeaturedTrails() {
    const grid = document.querySelector('#trails .featured-grid');
    if (!grid) return;
    // TODO: Fetch trail data from Firestore
    // const trails = await fetchTrailsFromDB();
    // grid.innerHTML = ''; // Clear placeholders
    // trails.forEach(trail => {
    //    const cardHTML = `... create card HTML based on trail data ...`;
    //    grid.insertAdjacentHTML('beforeend', cardHTML);
    // });
    console.log("Placeholder: Load featured trails data");
}
// Call functions to load data
// loadFeaturedTrails();
// loadFeaturedVillages();
// loadRecentStories();
*/

document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('nav-active');
            // Optional: Toggle icon class (e.g., hamburger to close icon)
            // const icon = menuToggle.querySelector('i');
            // if (icon) {
            //     icon.classList.toggle('fa-bars');
            //     icon.classList.toggle('fa-times');
            // }
        });
    }

    
    const header = document.querySelector('.home-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) { // Add class if scrolled more than 50px
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // --- Placeholder for Auth State Check ---
    // This requires integrating Firebase Auth SDK
    /*
    import { getAuth, onAuthStateChanged } from "firebase/auth"; // Example import

    const auth = getAuth(); // Assuming Firebase is initialized elsewhere
    const authButtons = document.querySelector('.auth-buttons');
    const userActions = document.querySelector('.user-actions'); // Ensure this div exists in HTML

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            if (authButtons) authButtons.style.display = 'none';
            if (userActions) userActions.style.display = 'flex'; // Show user actions
            // TODO: Update user profile icon/link based on user data
            console.log("User is logged in:", user.uid);
        } else {
            // User is signed out
            if (authButtons) authButtons.style.display = 'flex'; // Show login/signup
            if (userActions) userActions.style.display = 'none';
            console.log("User is logged out");
        }
    });
    */

    // --- Placeholder for Dynamic Content Loading ---
    // This requires fetching data from Firestore or another backend
    /*
    function loadFeaturedTrails() {
        const grid = document.querySelector('#trails .featured-grid');
        if (!grid) return;
        // TODO: Fetch trail data from Firestore
        // const trails = await fetchTrailsFromDB();
        // grid.innerHTML = ''; // Clear placeholders
        // trails.forEach(trail => {
        //    const cardHTML = `... create card HTML based on trail data ...`;
        //    grid.insertAdjacentHTML('beforeend', cardHTML);
        // });
        console.log("Placeholder: Load featured trails data");
    }
    // Call functions to load data
    // loadFeaturedTrails();
    // loadFeaturedVillages();
    // loadRecentStories();
    */


}); // End DOMContentLoaded