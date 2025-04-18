// Import necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
// Import Firestore functions
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use if needed
// https://firebase.google.com/docs/web/setup#available-libraries

console.log("signup.js loaded"); // Check if script runs

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDBYx04o9699LZ5ZhLxCNhmsRtzxo84hxM", // Keep this secure!
    authDomain: "thestory-d73b7.firebaseapp.com",
    projectId: "thestory-d73b7",
    storageBucket: "thestory-d73b7.appspot.com",
    messagingSenderId: "127364201980",
    appId: "1:127364201980:web:02cda0fbdfdf1144d50679",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
// Get the Auth service instance
const auth = getAuth(app);
// Get the Firestore service instance
const db = getFirestore(app);

// Get references to the HTML elements
const signupForm = document.getElementById('signup-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const fullNameInput = document.getElementById('fullName'); // Maps to 'username'
const ageInput = document.getElementById('age');
const countryInput = document.getElementById('country');
const stateInput = document.getElementById('state');
const cityInput = document.getElementById('city');     // Maps to 'district'
const phoneNumberInput = document.getElementById('phoneNumber'); // New reference
const profileImageInput = document.getElementById('profileImage'); // New reference
const errorMessageElement = document.getElementById('error-message');

// Add event listener for form submission
signupForm.addEventListener('submit', async (e) => { // Make the handler async
    e.preventDefault(); // Prevent default page reload
    errorMessageElement.textContent = ''; // Clear previous errors
    console.log("Signup form submitted");

    // Get values from all form fields
    const email = emailInput.value;
    const password = passwordInput.value;
    const fullName = fullNameInput.value; // Use this for 'username'
    const age = ageInput.value;
    const country = countryInput.value;
    const state = stateInput.value;
    const city = cityInput.value;         // Use this for 'district'
    const phoneNumber = phoneNumberInput.value; // Get phone number value
    const profileImage = profileImageInput.value; // Get profile image URL value

    // Basic validation for collected fields
    if (!fullName || isNaN(age) || age <= 0 || !country || !state || !city /* || !phoneNumber */) {
         errorMessageElement.textContent = 'Please fill in all required fields correctly.';
         return;
    }
    // Optional: Basic URL validation for profile image if a value is entered
    if (profileImage && !isValidHttpUrl(profileImage)) {
        errorMessageElement.textContent = 'Please enter a valid URL for the profile image.';
        return;
    }

    console.log("Attempting createUserWithEmailAndPassword...");

    try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Prepare user data for Firestore
        const userData = {
            email,
            fullName,
            age: parseInt(age),
            country,
            state,
            city,
            phoneNumber: phoneNumber || null,
            profileImage: profileImage || null,
            createdAt: new Date()
        };

        // Save user data to Firestore
        await setDoc(doc(db, 'users', user.uid), userData);

        // Show success message and redirect
        alert('Account created successfully!');
        window.location.href = 'index.html';
    } catch (error) {
        // Handle errors
        let errorMessage = 'An error occurred during signup.';
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'This email is already registered.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password should be at least 6 characters.';
                break;
            default:
                console.error('Signup error:', error);
        }
        errorMessageElement.textContent = errorMessage;
    }
});

// Helper function for basic URL validation (optional)
function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
} 
