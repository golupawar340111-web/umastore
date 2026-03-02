// --- Firebase Config (Same as before) ---
const firebaseConfig = {
    apiKey: "AIzaSyBEzu1v0s0OxYOIgzdCWMLmt5dd-wX5lO8",
    authDomain: "umastore-4f131.firebaseapp.com",
    projectId: "umastore-4f131",
    storageBucket: "umastore-4f131.firebasestorage.app",
    messagingSenderId: "772729193852",
    appId: "1:772729193852:web:983919536e8196abc110f9"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 1. URL se Seller ID nikalna (Example: shop_feed.html?id=SELLER_UID)
const urlParams = new URLSearchParams(window.location.search);
const sellerId = urlParams.get('id') || "dummy_user_9201380750"; // Testing ke liye dummy

// --- 🟢 Load Shop Basic Info ---
async function loadShopInfo() {
    const doc = await db.collection("sellers").doc(sellerId).get();
    if (doc.exists) {
        const data = doc.data();
        document.getElementById('shopNameDisplay').innerText = data.shopName;
        document.getElementById('shopLocation').innerText = data.village;
        // Phone number save karlo WhatsApp button ke liye
        window.sellerPhone = data.mobile;
    }
}

// --- 🔥 Live Today's Highlights (Horizontal Scroll) ---
function listenToHighlights() {
    db.collection("sellers").doc(sellerId).collection("products")
      .where("isHighlight", "==", true)
      .onSnapshot((snapshot) => {
          const container = document.querySelector('.scroll-row');
          container.innerHTML = ""; // Purana clear karo

          snapshot.forEach(doc => {
              const p = doc.data();
              container.innerHTML += `
                <div class="p-card">
                    <img src="${p.image || 'https://via.placeholder.com/150'}" alt="${p.name}">
                    <h4>${p.name}</h4>
                    <p>₹${p.price} <span>₹${p.oldPrice || ''}</span></p>
                </div>
              `;
          });
      });
}

// --- 📸 Live Daily Feed (Instagram Style) ---
function listenToDailyPosts() {
    db.collection("sellers").doc(sellerId).collection("posts")
      .orderBy("createdAt", "desc")
      .onSnapshot((snapshot) => {
          const feedContainer = document.querySelector('.daily-feed');
          // Section title mat hatana, sirf posts refresh karna
          const title = '<div class="section-title">📸 Shop ki Diary</div>';
          let postsHTML = "";

          snapshot.forEach(doc => {
              const post = doc.data();
              const timeAgo = post.createdAt ? moment(post.createdAt.toDate()).fromNow() : "Just now";
              
              postsHTML += `
                <div class="post-card">
                    <div class="post-header">
                        <img src="https://ui-avatars.com/api/?name=${document.getElementById('shopNameDisplay').innerText}&background=random" alt="Logo">
                        <span>${document.getElementById('shopNameDisplay').innerText} • <small>${timeAgo}</small></span>
                    </div>
                    <img src="${post.image}" class="post-img">
                    <div class="post-desc">
                        <b>${post.title || ''}:</b> ${post.description}
                    </div>
                </div>
              `;
          });
          feedContainer.innerHTML = title + postsHTML;
      });
}

// --- 💬 WhatsApp Order Logic ---
function orderOnWhatsApp() {
    const phone = window.sellerPhone || "9201380750";
    const msg = encodeURIComponent("Namaste! Maine aapki digital dukaan dekhi, mujhe kuch saaman order karna hai.");
    window.open(`https://wa.me/91${phone}?text=${msg}`, '_blank');
}

// --- Initialize Everything ---
window.onload = () => {
    loadShopInfo();
    listenToHighlights();
    listenToDailyPosts();
};