// 1. Firebase Configuration (Apne Console se copy karein)
const firebaseConfig = {
    apiKey: "AIzaSyBEzu1v0s0OxYOIgzdCWMLmt5dd-wX5lO8",
    authDomain: "umastore-4f131.firebaseapp.com",
    projectId: "umastore-4f131",
    storageBucket: "umastore-4f131.firebasestorage.app",
    messagingSenderId: "772729193852",
    appId: "1:772729193852:web:983919536e8196abc110f9",
    measurementId: "G-3YEMJYVLMH"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Invisible reCAPTCHA setup
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    'size': 'invisible'
});

let confirmationResult;

// OTP Bhejne ka Function
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const mobile = document.getElementById('regMobile').value;
    const phoneNumber = "+91" + mobile;
    const appVerifier = window.recaptchaVerifier;

    document.getElementById('sendOtpBtn').innerText = "Sending...";

    auth.signInWithPhoneNumber(phoneNumber, appVerifier)
        .then((result) => {
            confirmationResult = result;
            // UI Switch
            document.getElementById('registerCard').classList.add('hidden');
            document.getElementById('otpCard').classList.remove('hidden');
            alert("OTP sent to +91 " + mobile);
        }).catch((error) => {
            alert("Error: " + error.message);
            document.getElementById('sendOtpBtn').innerText = "Send OTP";
            window.recaptchaVerifier.render().then(function(widgetId) {
                grecaptcha.reset(widgetId);
            });
        });
});

// OTP Verify Function
function verifyOTP() {
    const code = Array.from(document.querySelectorAll('.otp-box')).map(i => i.value).join('');
    
    if(code.length < 6) {
        alert("Please enter 6 digit OTP");
        return;
    }

    confirmationResult.confirm(code).then((result) => {
        const user = result.user;
        const fullName = document.getElementById('regName').value;

        // Save User to LocalStorage (Original Login state)
        localStorage.setItem('userName', fullName);
        localStorage.setItem('userMobile', user.phoneNumber);
        localStorage.setItem('isLoggedIn', 'true');

        alert("Welcome to Uma Store, " + fullName);
        window.location.href = 'index.html'; // Go to shop
    }).catch((error) => {
        alert("Invalid OTP! " + error.message);
    });
}

// Auto-focus logic for OTP boxes
const inputs = document.querySelectorAll('.otp-box');
inputs.forEach((input, index) => {
    input.addEventListener('keyup', (e) => {
        if (e.key >= 0 && e.key <= 9) {
            if (index < inputs.length - 1) inputs[index + 1].focus();
        } else if (e.key === 'Backspace') {
            if (index > 0) inputs[index - 1].focus();
        }
    });
});