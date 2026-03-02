// 1. Khirkiya Center Point Coordinates
const khirkiya = {
    lat: 22.1989,
    lng: 76.8485
};

let deliveryCharge = 0; // Global variable to store charge

// 2. Function to get User's Current Location
function checkDeliveryEligibility() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            const userLat = pos.coords.latitude;
            const userLng = pos.coords.longitude;
            
            calculateDelivery(userLat, userLng);
        }, (err) => {
            alert("Please enable Location to check delivery availability.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// 3. Haversine Formula to calculate distance in KM
function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radius of Earth in KM
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// 4. Delivery Logic based on distance
function calculateDelivery(userLat, userLng) {
    const distance = getDistance(khirkiya.lat, khirkiya.lng, userLat, userLng);
    const infoDiv = document.getElementById("deliveryInfo");
    
    let time = "";
    let possible = true;

    if (distance <= 10) {
        deliveryCharge = 20;
        time = "2 Hour Delivery";
    } else if (distance <= 20) {
        deliveryCharge = 40;
        time = "Same Day Delivery";
    } else if (distance <= 30) {
        deliveryCharge = 60;
        time = "Next Day Delivery";
    } else {
        deliveryCharge = 0;
        possible = false;
        alert("Sorry! Delivery not available beyond 30 KM from Khirkiya.");
    }

    if (possible) {
        infoDiv.innerHTML = `
            <div style="color: #16a34a; font-weight: bold; margin-top: 10px;">
                <i class="fas fa-truck"></i> Distance: ${distance.toFixed(1)} km <br>
                <i class="fas fa-clock"></i> Delivery: ${time} <br>
                <i class="fas fa-money-bill-wave"></i> Charge: ₹${deliveryCharge}
            </div>
        `;
    } else {
        infoDiv.innerHTML = `<span style="color: red;">Out of delivery zone!</span>`;
    }
}