// 1. Pehle Firebase ko initialize karna zaroori hai
const firebaseConfig = {
    apiKey: "AIzaSyBEzu1v0s0OxYOIgzdCWMLmt5dd-wX5lO8",
    authDomain: "umastore-4f131.firebaseapp.com",
    projectId: "umastore-4f131",
    storageBucket: "umastore-4f131.firebasestorage.app",
    messagingSenderId: "772729193852",
    appId: "1:772729193852:web:983919536e8196abc110f9",
    measurementId: "G-3YEMJYVLMH"
};

// Ye line error khatam kar degi
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
// ... baaki ka aapka purana fetchProducts() wala code yahan se shuru hoga
// Initialize Firebase (Assuming Config is global or provided)
const db = firebase.firestore();
const storage = firebase.storage();

// Real-time Product Listener
function fetchProducts() {
    db.collection("products").onSnapshot((snapshot) => {
        const products = [];
        snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
        renderProducts(products);
    });
}

function renderProducts(products) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = products.map(p => `
        <div class="product-card">
            ${p.tag !== 'None' ? `<span class="card-tag">${p.tag}</span>` : ''}
            <img src="${p.imageUrl || 'https://via.placeholder.com/150'}" class="card-img" alt="${p.name}">
            <div class="card-content">
                <h3 style="margin:0; font-size:1.1rem;">${p.name}</h3>
                <p style="color:#64748b; font-size:0.85rem;">${p.category}</p>
                <div class="price-stock">
                    <span style="font-weight:bold; font-size:1.1rem;">₹${p.price}</span>
                    <span class="stock-badge ${p.stock > 0 ? 'in-stock' : 'out-stock'}">
                        ${p.stock > 0 ? `In Stock (${p.stock})` : 'Out of Stock'}
                    </span>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn-edit" onclick="editProduct('${p.id}')"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn-delete" onclick="deleteProduct('${p.id}')"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join('');
}

// Add/Update Logic
document.getElementById('productForm').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('productId').value;
    const file = document.getElementById('pPhoto').files[0];
    
    let productData = {
        name: document.getElementById('pName').value,
        price: Number(document.getElementById('pPrice').value),
        stock: Number(document.getElementById('pStock').value),
        category: document.getElementById('pCategory').value,
        tag: document.getElementById('pTag').value,
        description: document.getElementById('pDesc').value,
        lastUpdated: new Date()
    };

    try {
        if (file) {
            const storageRef = storage.ref(`products/${file.name}`);
            await storageRef.put(file);
            productData.imageUrl = await storageRef.getDownloadURL();
        }

        if (id) {
            await db.collection("products").doc(id).update(productData);
        } else {
            await db.collection("products").add(productData);
        }
        
        closeProductModal();
        alert("Product saved successfully!");
    } catch (error) {
        alert("Error saving product: " + error.message);
    }
};

async function deleteProduct(id) {
    if(confirm("Are you sure you want to remove this product?")) {
        await db.collection("products").doc(id).delete();
    }
}

// Modal Handlers
function openProductModal() { 
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('modalTitle').innerText = 'Add New Product';
    document.getElementById('productModal').style.display = 'block'; 
}

function closeProductModal() { 
    document.getElementById('productModal').style.display = 'none'; 
}

async function editProduct(id) {
    const doc = await db.collection("products").doc(id).get();
    const data = doc.data();
    
    document.getElementById('productId').value = id;
    document.getElementById('pName').value = data.name;
    document.getElementById('pPrice').value = data.price;
    document.getElementById('pStock').value = data.stock;
    document.getElementById('pCategory').value = data.category;
    document.getElementById('pTag').value = data.tag;
    document.getElementById('pDesc').value = data.description;
    
    document.getElementById('modalTitle').innerText = 'Edit Product';
    document.getElementById('productModal').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', fetchProducts);