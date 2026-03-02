// user.js - UMA STORE User Profile Logic

// 1. Initialize Firebase Auth and Firestore
const auth = firebase.auth();
const db = firebase.firestore();

// 2. Check Login Status on Page Load
auth.onAuthStateChanged(user => {
    if (user) {
        // Agar user login hai
        console.log("User logged in:", user.uid);
        setupUserProfile(user);
        fetchUserOrderCount(user.uid);
    } else {
        // Agar login nahi hai, toh login.html par bhej do
        console.log("No user found, redirecting to login...");
        window.location.href = 'login.html';
    }
});

// 3. User ki info display karna
function setupUserProfile(user) {
    const nameDisplay = document.getElementById('userNameDisplay');
    const phoneDisplay = document.getElementById('userPhoneDisplay');

    // Agar user ne naam set kiya hai (DisplayName)
    if (user.displayName) {
        nameDisplay.innerText = `Namaste, ${user.displayName}!`;
    } else {
        nameDisplay.innerText = "Namaste, Grahak!";
    }

    // Phone number dikhana
    phoneDisplay.innerText = user.phoneNumber || "Verified Account";
}

// 4. Firebase se Orders ki sankhya (Count) nikaalna
async function fetchUserOrderCount(uid) {
    const orderCountBadge = document.getElementById('orderCount');
    
    try {
        const snapshot = await db.collection("orders")
            .where("userId", "==", uid)
            .get();
        
        const count = snapshot.size;
        orderCountBadge.innerText = count;
        
        // Agar koi order nahi hai toh badge chhupa sakte ho
        if (count === 0) {
            orderCountBadge.style.background = "#ccc";
        }
    } catch (error) {
        console.error("Error fetching orders:", error);
        orderCountBadge.innerText = "0";
    }
}

// 5. Logout Function
function userLogout() {
    // Gaon ki bhasha mein confirmation
    const confirmLogout = confirm("Bhai, kya aap sach mein UMA STORE se bahar nikalna (Logout) chahte hain?");
    
    if (confirmLogout) {
        auth.signOut().then(() => {
            alert("Aap safely logout ho gaye hain. Fir milenge!");
            window.location.href = 'index.html';
        }).catch((error) => {
            alert("Logout mein error aaya: " + error.message);
        });
    }
}

// 6. Navigation Helpers (Optional)
// Agar aapko check karna ho ki user ne address save kiya hai ya nahi
async function checkUserAddress(uid) {
    const doc = await db.collection("users").doc(uid).get();
    if (doc.exists && doc.data().address) {
        console.log("Address found");
    } else {
        console.log("Please update address");
    }
}