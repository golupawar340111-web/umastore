// Firebase Config - Use your actual credentials
const db = firebase.firestore();
const auth = firebase.auth();

auth.onAuthStateChanged(user => {
    if (user) {
        syncCart(user.uid);
    } else {
        window.location.href = 'login.html'; // Redirect if not logged in
    }
});

function syncCart(uid) {
    const cartWrapper = document.getElementById('cart-items-wrapper');
    
    // Listen to real-time cart changes for this specific user
    db.collection('users').doc(uid).collection('cart')
    .onSnapshot(snapshot => {
        cartWrapper.innerHTML = '';
        let total = 0;
        let count = 0;

        snapshot.forEach(doc => {
            const item = doc.data();
            const subtotal = item.price * item.quantity;
            total += subtotal;
            count += item.quantity;

            cartWrapper.innerHTML += `
                <div class="cart-item">
                    <img src="${item.img}" class="item-img">
                    <div class="item-info">
                        <h3>${item.name}</h3>
                        <p class="item-price">₹${item.price}</p>
                        <div class="qty-control">
                            <button class="qty-btn" onclick="updateQty('${uid}', '${doc.id}', -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQty('${uid}', '${doc.id}', 1)">+</button>
                        </div>
                    </div>
                    <button class="remove-btn" onclick="removeItem('${uid}', '${doc.id}')">
                        <i class="far fa-trash-alt"></i>
                    </button>
                </div>
            `;
        });

        document.getElementById('items-count').innerText = `${count} Items`;
        document.getElementById('subtotal').innerText = `₹${total}`;
        document.getElementById('grand-total').innerText = `₹${total}`;
    });
}

function updateQty(uid, productId, change) {
    const docRef = db.collection('users').doc(uid).collection('cart').doc(productId);
    
    docRef.get().then(doc => {
        const newQty = doc.data().quantity + change;
        if (newQty > 0) {
            docRef.update({ quantity: newQty });
        } else {
            removeItem(uid, productId);
        }
    });
}

function removeItem(uid, productId) {
    db.collection('users').doc(uid).collection('cart').doc(productId).delete();
}

function proceedToCheckout() {
    // This will redirect to your WhatsApp or Checkout page
    window.location.href = 'checkout.html'; 
}