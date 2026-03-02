// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBEzu1v0s0OxYOIgzdCWMLmt5dd-wX5lO8",
    authDomain: "umastore-4f131.firebaseapp.com",
    projectId: "umastore-4f131",
    storageBucket: "umastore-4f131.firebasestorage.app",
    messagingSenderId: "772729193852",
    appId: "1:772729193852:web:983919536e8196abc110f9"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// Default mode hum Password rakhenge kyunki Phone billing error de raha hai
let isOtpMode = false;

// --- 1. LOGIN WITH PASSWORD LOGIC ---
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const mobile = document.getElementById('loginMobile').value;
    const password = document.getElementById('loginPass').value;
    const mainBtn = document.getElementById('mainBtn');

    if (isOtpMode) {
        alert("Bhai, Billing error ki wajah se abhi sirf Password ya Google se login karein.");
        return;
    }

    if (mobile.length < 10) {
        alert("Pehle 10-digit ka mobile number sahi se dalo!");
        return;
    }

    // Mobile to Fake Email Trick
    const fakeEmail = mobile + "@umastore.com";
    mainBtn.innerText = "Checking...";

    auth.signInWithEmailAndPassword(fakeEmail, password)
        .then((userCredential) => {
            const user = userCredential.user;
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', user.displayName || "Customer");
            
            alert("Sahi hai! Welcome " + (user.displayName || "User"));
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error(error);
            alert("Error: Mobile number ya Password galat hai ya account nahi bana!");
            mainBtn.innerText = "Login Now";
        });
});

// --- 2. CONTINUE WITH GOOGLE LOGIC ---
// Make sure your button has class "google-btn"
const googleBtn = document.querySelector('.google-btn');
if (googleBtn) {
    googleBtn.addEventListener('click', function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        
        // Popup block na ho isliye directly call
        auth.signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userName', user.displayName);
                
                alert("Google Login Successful! Welcome " + user.displayName);
                window.location.href = 'index.html';
            })
            .catch((error) => {
                console.error(error);
                // Agar Console mein Support Email nahi dala hoga toh ye error dega
                if (error.code === "auth/operation-not-allowed") {
                    alert("Firebase Console mein Google Setup adhura hai! Support Email select karke Save karo.");
                } else {
                    alert("Google Login Error: " + error.message);
                }
            });
    });
}

// --- TOGGLE LOGIC (Fixing Default View) ---
function toggleLoginMethod() {
    const otpArea = document.getElementById('otpArea');
    const passwordArea = document.getElementById('passwordArea');
    const mainBtn = document.getElementById('mainBtn');
    const toggleBtn = document.getElementById('toggleBtn');

    if (!isOtpMode) {
        // Switch to OTP (Abhi disabled hai billing ki wajah se)
        otpArea.classList.remove('hidden');
        passwordArea.classList.add('hidden');
        mainBtn.innerText = "Verify OTP";
        toggleBtn.innerText = "Login with Password instead";
        isOtpMode = true;
    } else {
        // Switch back to Password
        otpArea.classList.add('hidden');
        passwordArea.classList.remove('hidden');
        mainBtn.innerText = "Login Now";
        toggleBtn.innerText = "Login with OTP";
        isOtpMode = false;
    }
}