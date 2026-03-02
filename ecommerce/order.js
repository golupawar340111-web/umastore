// 1. Firebase Configuration (Apni sahi details yahan bharein)
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
const db = firebase.firestore();

// 2. Orders Load Karne ka Function
function loadMyOrders() {
    const ordersList = document.getElementById('ordersList');
    
    // ".onSnapshot" ka matlab hai LIVE connection
    // Jab bhi database mein koi badlav hoga, ye apne aap chalega
    db.collection("orders")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        ordersList.innerHTML = "";
        
        if (snapshot.empty) {
            ordersList.innerHTML = `
                <div class="empty-orders">
                    <i class="fas fa-box-open"></i>
                    <p>Abhi tak koi order nahi mila.</p>
                    <a href="index.html" style="color:var(--primary); text-decoration:none; font-weight:bold;">Shopping Shuru Karein</a>
                </div>`;
            return;
        }

        snapshot.forEach(doc => {
            const order = doc.data();
            const orderId = doc.id;
            
            // Status ke hisab se CSS class (e.g., 'Out for Delivery' becomes 'outfordelivery')
            const statusClass = order.status.toLowerCase().replace(/\s+/g, '');
            const orderDate = order.timestamp ? order.timestamp.toDate().toLocaleDateString('hi-IN') : 'Processing...';

            // Card ka HTML structure
            ordersList.innerHTML += `
                <div class="order-card" id="card-${orderId}">
                    <div class="order-header">
                        <span class="order-id">ID: ${orderId.slice(0, 8).toUpperCase()}</span>
                        <span class="order-date">${orderDate}</span>
                    </div>
                    
                    <div class="product-info">
                        <img src="${order.items[0].img || 'https://placehold.co/150'}" class="product-img">
                        <div class="details">
                            <h3>${order.items[0].name}</h3>
                            <p>${order.items.length > 1 ? '+ ' + (order.items.length - 1) + ' aur items' : 'Single Item'}</p>
                            <p class="price">₹${order.totalAmount}</p>
                            <span class="status-badge status-${statusClass}">${order.status}</span>
                        </div>
                    </div>

                    <div class="delivery-address">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Pata: ${order.address || 'Village Area'}</span>
                    </div>

                    <div class="tracking-box" id="track-${orderId}">
                        <ul class="timeline">
                            <li class="${checkActive('Pending', order.status)}">Order Mil Gaya</li>
                            <li class="${checkActive('Packed', order.status)}">Saaman Pack Ho Gaya</li>
                            <li class="${checkActive('Out for Delivery', order.status)}">Raste Mein Hai</li>
                            <li class="${checkActive('Delivered', order.status)}">Pahunch Gaya ✅</li>
                        </ul>
                    </div>

                    <div class="actions">
                        <button class="btn btn-track" onclick="toggleTracking('${orderId}')">
                            <i class="fas fa-route"></i> Track Order
                        </button>
                        <a href="tel:+919201380750" class="btn btn-call" style="text-decoration:none;">
                            <i class="fas fa-phone-alt"></i> Support
                        </a>
                    </div>
                </div>
            `;
        });
    }, (error) => {
        console.error("Error fetching orders: ", error);
        ordersList.innerHTML = "<p>Orders dikhane mein dikkat ho rahi hai. Permission check karein.</p>";
    });
}

// 3. Timeline Active Status Logic
function checkActive(step, currentStatus) {
    const stages = ['Pending', 'Packed', 'Out for Delivery', 'Delivered'];
    const currentIndex = stages.indexOf(currentStatus);
    const stepIndex = stages.indexOf(step);

    // Agar current status list mein nahi hai (galti se), toh 'Pending' default rahega
    if (stepIndex <= currentIndex && currentIndex !== -1) {
        return 'active';
    }
    return '';
}

// 4. Tracking Box ko Khulne-Band karne ka Logic
function toggleTracking(id) {
    const trackBox = document.getElementById(`track-${id}`);
    const isVisible = trackBox.style.display === 'block';
    
    // Sabhi tracking boxes band kar sakte hain agar chahein, ya sirf current wala toggle karein
    trackBox.style.display = isVisible ? 'none' : 'block';
    
    // Smooth scroll to tracking info
    if(!isVisible) {
        trackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Initialize on Load
window.onload = loadMyOrders;