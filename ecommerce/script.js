// 1. Database of Products
const allProducts = [
    { id: 1, name: "Fresh Aashirvaad Atta", price: 450, category: "Daily", img: "https://www.bigbasket.com/media/uploads/p/l/126906_8-aashirvaad-atta-whole-wheat.jpg" },
    { id: 2, name: "Health Kit Combo", price: 999, category: "Health", img: "https://m.media-amazon.com/images/I/71R2m7-9KUL._AC_UL320_.jpg" },
    { id: 3, name: "Organic Urea Fertilizer", price: 250, category: "Farming", img: "https://m.media-amazon.com/images/I/618mS784mEL._AC_UL320_.jpg" },
    { id: 4, name: "School Stationery Set", price: 199, category: "Education", img: "https://m.media-amazon.com/images/I/71YvRtoD1-L._AC_UL320_.jpg" },
    { id: 5, name: "Cow Ghee (1L)", price: 650, category: "Daily", img: "https://www.bigbasket.com/media/uploads/p/l/40006988_4-amul-ghee.jpg" }
];

let cart = [];

async function loadProducts() {
    const grid = document.getElementById('productGrid');
    const snapshot = await db.collection("products").get();
    
    allProductsData = []; // Purana data saaf karo
    grid.innerHTML = ""; 

    snapshot.forEach(doc => {
        const p = { id: doc.id, ...doc.data() };
        allProductsData.push(p); // 👈 Yahan data save ho raha hai
    });

    displayProducts(allProductsData); // Naya function jo sirf dikhane ka kaam karega
}

// Ye function products ko HTML mein convert karega
function displayProducts(products) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = ""; 

    if (products.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 20px;">Kuch nahi mila! 🛒</p>`;
        return;
    }

    products.forEach(p => {
        grid.innerHTML += `
            <div class="product-card">
                <img src="${p.images ? p.images[0] : 'placeholder.jpg'}" alt="${p.name}">
                <div class="p-details">
                    <h3>${p.name}</h3>
                    <p style="font-size:12px; color:gray;">${p.category || ''}</p>
                    <p class="p-price">₹${p.price}</p>
                    <button class="add-to-cart-btn" onclick="addToCart('${p.id}', '${p.name}', ${p.price})">Add to Cart</button>
                </div>
            </div>`;
    });
}function searchProduct() {
    // 1. Jo search kiya gaya use chote aksharon (lowercase) mein lo
    let input = document.getElementById('searchInput').value.toLowerCase().trim();
    let grid = document.getElementById('productGrid');
    let cards = grid.getElementsByClassName('product-card');
    let headings = grid.getElementsByClassName('category-divider');
    
    let foundAny = false;

    // 2. Har ek card ke andar jhaanko
    for (let i = 0; i < cards.length; i++) {
        // 'innerText' use karne se card ke andar ka saara text (Name, Price, Category) mil jayega
        let cardContent = cards[i].innerText.toLowerCase();
        
        // 3. Match Checking
        if (cardContent.includes(input)) {
            cards[i].style.display = "block";
            foundAny = true;
            
            // Highlight effect (Optional: search match hone par card thoda chamke)
            cards[i].style.animation = "pulse 0.5s";
        } else {
            cards[i].style.display = "none";
        }
    }

    // 4. Headings ko manage karo
    for (let j = 0; j < headings.length; j++) {
        headings[j].style.display = (input.length > 0) ? "none" : "block";
    }

    // 5. "Not Found" message handle karo
    let existingMsg = document.getElementById('no-results');
    if (!foundAny && input.length > 0) {
        if (!existingMsg) {
            let msg = document.createElement('div');
            msg.id = 'no-results';
            msg.style.cssText = "grid-column: 1/-1; text-align: center; padding: 50px; font-size: 18px; color: #666;";
            msg.innerHTML = `<i class="fas fa-search-minus" style="font-size: 40px; color: #ccc; display: block; margin-bottom: 10px;"></i>
                             Maaf kijiye, humein "<b>${input}</b>" se juda kuch nahi mila.`;
            grid.appendChild(msg);
        }
    } else if (existingMsg) {
        existingMsg.remove();
    }
}
// 4. Category Filter
function filterCategory(cat) {
    const filtered = allProducts.filter(p => p.category === cat);
    loadProducts(filtered);
}

// 5. Cart Logic
function addToCart(id) {
    const product = allProducts.find(p => p.id === id);
    cart.push(product);
    updateCartUI();
}

function toggleCart() {
    document.getElementById('sideCart').classList.toggle('active');
}

function updateCartUI() {
    document.getElementById('cart-count').innerText = cart.length;
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    let total = 0;
    cartItems.innerHTML = cart.map((item, index) => {
        total += item.price;
        return `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;">
                <span>${item.name}</span>
                <b>₹${item.price}</b>
            </div>
        `;
    }).join('');
    
    cartTotal.innerText = `Total: ₹${total}`;
}

// 6. Real WhatsApp Order Generation
function checkoutWhatsApp() {
    if(cart.length === 0) return alert("Cart khali hai!");
    
    let message = "Hi, I want to order:\n\n";
    cart.forEach((item, i) => {
        message += `${i+1}. ${item.name} - ₹${item.price}\n`;
    });
    
    let total = cart.reduce((sum, item) => sum + item.price, 0);
    message += `\n*Grand Total: ₹${total}*\n\nPlease confirm my order.`;
    
    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/919876543210?text=${encodedMsg}`, '_blank');
}

// Initialize
window.onload = () => loadProducts(allProducts);