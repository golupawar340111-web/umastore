// product.js
const db = firebase.firestore();

// 1. URL se Product ID nikalna (e.g. product.html?id=ABC123)
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

if (productId) {
    loadProductDetails(productId);
} else {
    alert("Product nahi mila!");
    window.location.href = 'index.html';
}

// 2. Data load karne ka function
async function loadProductDetails(id) {
    try {
        const doc = await db.collection("products").doc(id).get();
        if (doc.exists) {
            const p = doc.data();
            
            // HTML Update karna
            document.getElementById('pTitle').innerText = p.name;
            document.getElementById('offerPrice').innerText = p.price;
            document.getElementById('mrpPrice').innerText = p.mrp || (p.price + 200);
            document.getElementById('pDesc').innerHTML = p.description;
            document.getElementById('mainImage').src = p.images[0];

            // Thumbnails banana
            const thumbGroup = document.getElementById('thumbGroup');
            p.images.forEach((imgSrc, index) => {
                const img = document.createElement('img');
                img.src = imgSrc;
                img.onclick = () => {
                    document.getElementById('mainImage').src = imgSrc;
                };
                thumbGroup.appendChild(img);
            });

            // Global variable for cart
            window.currentProduct = {
                id: id,
                name: p.name,
                price: p.price,
                img: p.images[0]
            };

        } else {
            console.log("No such product!");
        }
    } catch (error) {
        console.error("Error getting product:", error);
    }
}

// 3. Add to Cart Logic
function addToCart() {
    let cart = JSON.parse(localStorage.getItem('umaCart')) || [];
    
    // Check if product already in cart
    const exists = cart.find(item => item.id === window.currentProduct.id);
    if (exists) {
        exists.qty += 1;
    } else {
        cart.push({ ...window.currentProduct, qty: 1 });
    }
    
    localStorage.setItem('umaCart', JSON.stringify(cart));
    alert("Item Cart mein add ho gaya! ✅");
}

// product.js ke aakhir mein ise update karo
function buyNowShortcut() {
    // 1. Current product check karo load hua ya nahi
    if (!window.currentProduct) {
        alert("Rukiye, product load ho raha hai...");
        return;
    }

    // 2. Cart logic bina alert ke (taaki seedha checkout par jaye)
    let cart = JSON.parse(localStorage.getItem('umaCart')) || [];
    const exists = cart.find(item => item.id === window.currentProduct.id);
    
    if (exists) {
        exists.qty += 1;
    } else {
        cart.push({ ...window.currentProduct, qty: 1 });
    }
    
    localStorage.setItem('umaCart', JSON.stringify(cart));

    // 3. Final Step: Checkout par bhejo
    console.log("Redirecting to checkout...");
    window.location.href = 'checkout.html';
}