// Firebase Setup
const db = firebase.firestore();

// 1. Get Order ID from URL
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('id');

if (!orderId) {
    alert("Invalid Order ID");
    window.location.href = "index.html";
}

// 2. Real-time Order Listener
function trackOrder() {
    db.collection("orders").doc(orderId).onSnapshot((doc) => {
        if (!doc.exists) {
            console.log("No such order!");
            return;
        }

        const data = doc.data();
        updateUI(data, doc.id);
    });
}

// 3. Update UI and Timeline
function updateUI(data, id) {
    document.getElementById('order-id-val').innerText = id.toUpperCase();
    document.getElementById('item-name').innerText = data.items[0].name;
    document.getElementById('item-qty').innerText = `Qty: ${data.items.length}`;
    document.getElementById('item-price').innerText = `Total Paid: ₹${data.totalAmount}`;
    document.getElementById('item-img').src = data.items[0].img || 'placeholder.jpg';
    document.getElementById('delivery-address').innerText = data.address;

    const currentStatus = data.status; // e.g., "Packed"
    const stages = ['Pending', 'Packed', 'Out for Delivery', 'Delivered'];
    const currentIndex = stages.indexOf(currentStatus);

    // Timeline Glow Logic
    const stepIds = ['step-pending', 'step-packed', 'step-out', 'step-delivered'];
    
    stepIds.forEach((stepId, index) => {
        const element = document.getElementById(stepId);
        if (index <= currentIndex) {
            element.classList.add('active');
        } else {
            element.classList.remove('active');
        }
    });
}

// Initialize
window.onload = trackOrder;