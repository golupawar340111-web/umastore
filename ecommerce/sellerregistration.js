// --- Firebase Config (Don't Change) ---
const firebaseConfig = {
    apiKey: "AIzaSyBEzu1v0s0OxYOIgzdCWMLmt5dd-wX5lO8",
    authDomain: "umastore-4f131.firebaseapp.com",
    projectId: "umastore-4f131",
    storageBucket: "umastore-4f131.firebasestorage.app",
    messagingSenderId: "772729193852",
    appId: "1:772729193852:web:983919536e8196abc110f9"
};

// Initialize Firebase
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- 1. Session Check (Auto Redirect to Dashboard) ---
auth.onAuthStateChanged(user => {
    // Check both Firebase and LocalStorage for bypass
    if (user || localStorage.getItem("uma_test_login") === "true") {
        console.log("Session active");
        window.location.href = "seller_dashboard.html";
    }
});

// --- 2. Tab Switcher Logic ---
function switchTab(type) {
    const regForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const tabReg = document.getElementById('tab-reg');
    const tabLogin = document.getElementById('tab-login');

    if (type === 'reg') {
        regForm.style.display = 'block';
        loginForm.style.display = 'none';
        tabReg.classList.add('active');
        tabLogin.classList.remove('active');
    } else {
        regForm.style.display = 'none';
        loginForm.style.display = 'block';
        tabLogin.classList.add('active');
        tabReg.classList.remove('active');
    }
}

let confirmationResult;

// --- 3. Send OTP Function (Bypass Updated) ---
async function sendOTP(mode) {
    const mobileField = mode === 'reg' ? 'regMobile' : 'loginMobile';
    const mobile = document.getElementById(mobileField).value;

    if (mobile.length !== 10) return alert("10 digit number daalo!");

    if (mobile === "9201380750") {
        alert("Developer Mode: Dummy OTP Active (Code: 123456)");
        document.getElementById(mode + '-otp-section').style.display = 'block';
        
        confirmationResult = {
            confirm: async (code) => {
                if (code === "123456") {
                    // Bypass logic: Save to localStorage to trick the session check
                    localStorage.setItem("uma_test_login", "true");
                    return { user: { uid: "dummy_user_9201380750" } };
                } else {
                    throw new Error("Invalid Dummy OTP");
                }
            }
        };
        if(mode === 'reg') startTimer();
    } else {
        alert("Real SMS ke liye Blaze Plan chahiye. Abhi testing number use karein.");
    }
}

// --- 4. Registration Submit Logic ---
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const otp = document.getElementById('regOtpInput').value;

    if (!otp) return alert("Pehle OTP daalo bhai!");

    try {
        const result = await confirmationResult.confirm(otp);
        const user = result.user;

        await db.collection("sellers").doc(user.uid).set({
            shopName: document.getElementById('regShopName').value,
            ownerName: document.getElementById('regOwnerName').value,
            mobile: document.getElementById('regMobile').value,
            village: document.getElementById('regVillage').value,
            category: document.getElementById('regCategory').value,
            uid: user.uid,
            status: "active",
            verified: true,
            createdAt: new Date()
        });

        alert("🎉 Registration Successful!");
        window.location.href = "seller_dashboard.html";

    } catch (error) {
        console.error(error);
        alert("Registration failed: " + error.message);
    }
});

// --- 5. Login Submit Logic ---
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const otp = document.getElementById('loginOtpInput').value;

    try {
        await confirmationResult.confirm(otp);
        alert("Welcome Back! 🚀");
        window.location.href = "seller_dashboard.html";
    } catch (error) {
        alert("Login fail ho gaya! OTP check karein.");
    }
});

// --- 6. Resend Timer Logic ---
function startTimer() {
    let timeLeft = 30;
    const timerSpan = document.getElementById('reg-sec');
    if(!timerSpan) return; 
    const interval = setInterval(() => {
        timeLeft--;
        timerSpan.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(interval);
            timerSpan.parentElement.innerHTML = "Ab aap OTP resend kar sakte hain.";
        }
    }, 1000);
}