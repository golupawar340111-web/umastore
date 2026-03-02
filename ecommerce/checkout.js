// 1. Precise Khirkiya Coordinates (Shop Location)
const khirkiya = {
    lat: 22.16813555613104, 
    lng: 76.85872281694007
};

// Global variables to keep your data safe
window.itemsTotal = 0;
window.currentDistance = 0;
window.currentDeliveryCharge = 0;
window.finalBill = 0;

// 2. Load Cart Items (Pura Logic)
function loadCheckoutItems() {
    const cart = JSON.parse(localStorage.getItem('umaCart')) || [];
    const container = document.getElementById('checkoutItemsList');
    
    if (cart.length === 0) {
        container.innerHTML = "<div class='empty-cart-msg'>🛒 Your Cart is Empty!</div>";
        return;
    }

    container.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const itemTotal = Number(item.price) * Number(item.qty);
        total += itemTotal;
        container.innerHTML += `
            <div class="order-item">
                <div class="item-details">
                    <span class="item-name">${item.name}</span>
                    <span class="item-qty">x${item.qty}</span>
                </div>
                <span class="item-subtotal">₹${itemTotal}</span>
            </div>`;
    });

    window.itemsTotal = total;
    updateFinalBillUI(); // Initial UI update
}

// 3. User Location Detect (Modern logic)
function getUserLocation() {
    const infoDiv = document.getElementById("deliveryInfo");
    const orderBtn = document.getElementById("mainOrderBtn");
    infoDiv.innerHTML = "<i class='fas fa-spinner fa-spin'></i> Location detect ho rahi hai...";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            const uLat = pos.coords.latitude;
            const uLng = pos.coords.longitude;
            
            // Distance Calculate karein
            const distance = getDistance(khirkiya.lat, khirkiya.lng, uLat, uLng);
            processDeliveryLogic(distance);
            
        }, (err) => {
            infoDiv.innerHTML = "<span style='color:red;'>❌ Location access allow karein!</span>";
        }, { enableHighAccuracy: true });
    }
}

// 4. Distance Formula
function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

// 5. Delivery Charge Logic
function processDeliveryLogic(distance) {
    let charge = 60;
    let time = "Next Day";
    const infoDiv = document.getElementById("deliveryInfo");
    const orderBtn = document.getElementById("mainOrderBtn");

    if (distance <= 10) { charge = 20; time = "2 Hours"; }
    else if (distance <= 20) { charge = 40; time = "Same Day"; }
    else if (distance <= 30) { charge = 60; time = "Next Day"; }
    else {
        infoDiv.innerHTML = `<b style="color:red;">❌ Delivery Not Available</b><br>Doori: ${distance.toFixed(1)} km (Max: 30km)`;
        orderBtn.disabled = true;
        return;
    }

    // Free delivery check
    if (window.itemsTotal >= 299) { charge = 0; }

    window.currentDistance = distance.toFixed(1);
    window.currentDeliveryCharge = charge;
    
    infoDiv.innerHTML = `<b>✅ Available</b><br>Doori: ${window.currentDistance} km<br>Charge: ₹${charge === 0 ? "FREE" : charge}`;
    orderBtn.disabled = false;
    updateFinalBillUI();
}

// 6. UI Update
function updateFinalBillUI() {
    const finalTotal = window.itemsTotal + (window.currentDeliveryCharge || 0);
    window.finalBill = finalTotal;

    document.getElementById('checkoutTotal').innerText = `₹${window.itemsTotal}`;
    document.getElementById('deliveryChargeDisplay').innerText = window.currentDeliveryCharge === 0 ? "FREE" : `₹${window.currentDeliveryCharge}`;
    document.getElementById('finalTotalDisplay').innerText = `₹${finalTotal}`;
}

// 7. Place Order Logic (Firebase + UPI + WhatsApp)
async function placeOrder() {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();

    if (!name || !phone || !address) {
        alert("Saari details bhariye! 🙏");
        return;
    }

    const upiUrl = `upi://pay?pa=9201380750@ybl&pn=UMA_STORE&am=${window.finalBill}&cu=INR&tn=UMA_Order_${name}`;
    window.location.href = upiUrl;

    const orderBtn = document.getElementById('mainOrderBtn');
    orderBtn.innerText = "Verifying Payment...";
    orderBtn.disabled = true;

    setTimeout(async () => {
        if (confirm("Kya aapne payment complete kar di hai?")) {
            const orderData = {
                customerName: name,
                mobile: phone,
                address: address,
                distance: window.currentDistance + " km",
                items: JSON.parse(localStorage.getItem('umaCart')),
                itemsTotal: window.itemsTotal,
                deliveryCharge: window.currentDeliveryCharge,
                totalAmount: window.finalBill,
                status: "Paid (UPI)",
                orderDate: new Date().toLocaleString('en-IN')
            };

            try {
                const docRef = await db.collection("orders").add(orderData);
                sendWhatsAppNotification(orderData, docRef.id);
                localStorage.removeItem('umaCart');
                alert("Order Placed Successfully! ✅");
                window.location.href = 'index.html';
            } catch (e) {
                alert("Database Error: " + e.message);
                orderBtn.disabled = false;
            }
        } else {
            orderBtn.disabled = false;
            orderBtn.innerText = "PAY & PLACE ORDER";
        }
    }, 5000);
}

// 8. WhatsApp Notification
function sendWhatsAppNotification(order, orderId) {
    const myNumber = "919201380750";
    let msg = `*📦 NEW ORDER (UMA STORE)*%0A%0A`;
    msg += `*ID:* ${orderId}%0A`;
    msg += `*Customer:* ${order.customerName}%0A`;
    msg += `*Distance:* ${order.distance}%0A`;
    msg += `*Total Bill:* ₹${order.totalAmount}%0A%0A`;
    msg += `_Admin panel check karein._`;
    window.open(`https://wa.me/${myNumber}?text=${msg}`, '_blank');
}

document.addEventListener('DOMContentLoaded', loadCheckoutItems);