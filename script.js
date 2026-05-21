const firebaseConfig = {
  apiKey: "AIzaSyBKUL_iThk5jhZr7npM5HJjQ-FBopBnO7Q",
  authDomain: "wanderlust-8b3ba.firebaseapp.com",
  projectId: "wanderlust-8b3ba",
  storageBucket: "wanderlust-8b3ba.firebasestorage.app",
  messagingSenderId: "638626664196",
  appId: "1:638626664196:web:055e66c3f7757b0a7d0a51"
};

// Logik zur Initialisierung und zum Google Login
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.getElementById('login-btn').addEventListener('click', () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("Erfolgreich angemeldet als:", result.user.displayName);
            document.getElementById('login-btn').innerText = "Abmelden";
        })
        .catch((error) => {
            console.error("Login Fehler:", error);
            alert("Login fehlgeschlagen. Stelle sicher, dass die Domain registriert ist.");
        });
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('login-btn').innerText = "Abmelden";
    } else {
        document.getElementById('login-btn').innerText = "Login";
    }
});

// App Logik (Beispiel für Trip Darstellung)
let trips = JSON.parse(localStorage.getItem('wanderlust_trips')) || [];

function renderTrips() {
    const container = document.getElementById('trips-container');
    container.innerHTML = trips.map(t => `
        <div class="bg-[#022c22]/30 p-4 rounded-2xl border border-[#b87333]/10">
            <h3 class="font-bold text-[#b87333]">${t.destination}</h3>
            <p class="text-xs text-neutral-400">${t.purpose}</p>
        </div>
    `).join('');
}

window.showDashboard = () => { /* Logik für Dashboard Sichtbarkeit */ };
window.showFlashback = () => { /* Logik für Rückblick */ };
renderTrips();