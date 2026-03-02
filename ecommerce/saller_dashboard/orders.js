// Firebase Configuration (Replace with your actual config)
const firebaseConfig = {
    apiKey: "AIzaSyBEzu1v0s0OxYOIgzdCWMLmt5dd-wX5lO8",
    projectId: "umastore-4f131",
    // ... rest of the config
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentFilter = 'all';

// Real-time Order Listener
function initOrderListener() {
    db.collection("orders").orderBy("orderDate", "desc")
    .onSnapshot((snapshot) => {
        const orders = [];
        snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));
        renderOrders(orders);
        updateStats(orders);
    }, error => {
        console.error("Order Fetch Error:", error);
    });
}

function renderOrders(orders) {
    const listElement = document.getElementById('ordersList');
    const filtered = currentFilter === 'all' ? orders : orders.filter(o => o.status === currentFilter);

    if (filtered.length === 0) {
        listElement.innerHTML = `<div style="text-align:center; padding:40px;">No orders found for ${currentFilter}.</div>`;
        return;
    }

    listElement.innerHTML = filtered.map(order => `
        <div class="order-card status-${order.status ? order.status.toLowerCase() : 'pending'}">
            <div class="order-header">
                <span class="order-id">#${order.id.slice(-6)}</span>
                <span class="order-status" style="background: #eee;">${order.status || 'Pending'}</span>
            </div>
            
            <div class="order-info">
                <div><span class="info-label">Customer</span>${order.customerName}</div>
                <div><span class="info-label">Village</span>${order.village || 'N/A'}</div>
                <div><span class="info-label">Amount</span>₹${order.totalAmount}</div>
                <div><span class="info-label">Time</span>${order.orderDate}</div>
            </div>

            <div class="order-actions">
                <button class="btn-action btn-view" onclick="viewDetails('${order.id}')">Details</button>
                ${order.status === 'Pending' ? `<button class="btn-action btn-accept" onclick="updateStatus('${order.id}', 'Accepted')">Accept</button>` : ''}
                ${order.status === 'Accepted' ? `<button class="btn-action btn-pack" onclick="updateStatus('${order.id}', 'Packed')">Mark Packed</button>` : ''}
                ${order.status === 'Packed' ? `<button class="btn-action btn-dispatch" onclick="updateStatus('${order.id}', 'Out for Delivery')">Dispatch</button>` : ''}
            </div>
        </div>
    `).join('');
}

async function updateStatus(orderId, newStatus) {
    try {
        await db.collection("orders").doc(orderId).update({ status: newStatus });
        console.log(`Order ${orderId} updated to ${newStatus}`);
    } catch (err) {
        alert("Status update failed: " + err.message);
    }
}

async function viewDetails(orderId) {
    const doc = await db.collection("orders").doc(orderId).get();
    if (!doc.exists) return;
    const data = doc.data();

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Full Order Details</h3>
        <hr>
        <p><strong>Phone:</strong> ${data.mobile}</p>
        <p><strong>Address:</strong> ${data.address}</p>
        <p><strong>Payment:</strong> ${data.status === 'Paid (UPI)' ? '✅ Online Paid' : 'COD'}</p>
        <h4>Items:</h4>
        <ul>
            ${data.items.map(item => `<li>${item.name} x ${item.qty} - ₹${item.price * item.qty}</li>`).join('')}
        </ul>
        <button class="btn-action btn-pack" style="width:100%" onclick="closeModal()">Close Details</button>
    `;
    document.getElementById('orderModal').style.display = 'block';
}

function filterOrders(status) {
    currentFilter = status;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    // Re-fetch logic or re-render
    initOrderListener(); 
}

function updateStats(orders) {
    const pending = orders.filter(o => o.status === 'Pending' || !o.status).length;
    document.getElementById('orderStats').innerText = `${pending} New Orders`;
}

function closeModal() { document.getElementById('orderModal').style.display = 'none'; }

// Start
document.addEventListener('DOMContentLoaded', initOrderListener);