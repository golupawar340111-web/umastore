// 1. Firebase Configuration Check
// Check karein ki config.js load ho chuki hai
if (typeof firebaseConfig === 'undefined') {
    console.error("Error: config.js load nahi hui hai! Firebase initialize nahi ho payega.");
} else {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
}

const db = firebase.firestore();

// 2. Initialize Dashboard on Load
document.addEventListener('DOMContentLoaded', () => {
    fetchShopStats();
    fetchInventory();
    setupEventListeners();
});

// 3. Fetch Stats (Total Sales & Trust Score)
async function fetchShopStats() {
    try {
        // Real-time listener for orders count
        db.collection("orders").onSnapshot((snapshot) => {
            const totalOrders = snapshot.size;
            document.getElementById('totalOrdersCount').innerText = totalOrders;
        });

        // Shop Name update (If stored in Firestore 'settings')
        const shopDoc = await db.collection("seller_info").doc("profile").get();
        if (shopDoc.exists) {
            const data = shopDoc.data();
            document.getElementById('shopNameDisplay').innerText = data.name || "Uma Premium";
            if(data.logoUrl) document.getElementById('shopLogo').src = data.logoUrl;
        }
    } catch (error) {
        console.error("Stats fetching error:", error);
    }
}

// 4. Fetch & Render Inventory (Medicare Grid Style)
async function fetchInventory() {
    const gridDisplay = document.getElementById('productGridDisplay');
    
    // Loading state
    gridDisplay.innerHTML = `<p style="color: #666; grid-column: 1/-1; text-align: center;">Loading Products...</p>`;

    try {
        db.collection("products").onSnapshot((snapshot) => {
            if (snapshot.empty) {
                gridDisplay.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">No products found.</p>`;
                return;
            }

            let html = "";
            snapshot.forEach((doc) => {
                const p = doc.data();
                const id = doc.id;

                html += `
                <div class="nucleus-card">
                    <div class="card-img-container">
                        <img src="${p.imageUrl || 'https://via.placeholder.com/200'}" alt="${p.name}">
                    </div>
                    <div class="price-float">₹${p.price || 0}</div>
                    <div class="card-info">
                        <h4>${p.name || 'Unnamed Product'}</h4>
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <button class="btn-glow" onclick="editProduct('${id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn-glow" style="background: #e74c3c;" onclick="deleteProduct('${id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
            });
            gridDisplay.innerHTML = html;
        });
    } catch (error) {
        console.error("Inventory error:", error);
    }
}

// 5. Utility Functions
function setupEventListeners() {
    // Edit Brand button logic
    const editBtn = document.querySelector('.btn-glow');
    if(editBtn) {
        editBtn.onclick = () => {
            alert("Shop Settings Open Karein (Aap yahan modal add kar sakte hain)");
        };
    }
}

// Logout Function
function logout() {
    if(confirm("Kya aap logout karna chahte hain?")) {
        // Agar Firebase Auth use kar rahe hain:
        // firebase.auth().signOut().then(() => window.location.href = 'login.html');
        window.location.href = '../index.html'; // Basic redirection
    }
}

// Edit/Delete Product Handlers
function editProduct(id) {
    console.log("Editing product:", id);
    // Yahan aap redirect kar sakte hain edit page par
    // window.location.href = `saller_dashboard/products.html?edit=${id}`;
}

async function deleteProduct(id) {
    if(confirm("Kya aap is product ko delete karna chahte hain?")) {
        try {
            await db.collection("products").doc(id).delete();
            alert("Product deleted successfully!");
        } catch (error) {
            alert("Delete failed: " + error.message);
        }
    }
}