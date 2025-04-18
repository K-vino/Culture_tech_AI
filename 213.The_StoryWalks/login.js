import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDBYx04o9699LZ5ZhLxCNhmsRtzxo84hxM",
    authDomain: "thestory-d73b7.firebaseapp.com",
    databaseURL: "https://thestory-d73b7-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "thestory-d73b7",
    storageBucket: "thestory-d73b7.firebasestorage.app",
    messagingSenderId: "127364201980",
    appId: "1:127364201980:web:02cda0fbdfdf1144d50679",
    measurementId: "G-ERYC2CFGT7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            window.location.href = 'home.html'; // Redirect to index.html
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(`Error: ${errorMessage}`);
        });
});

