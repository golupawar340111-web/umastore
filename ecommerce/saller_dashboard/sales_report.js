// 1. Firebase Initialization (Make sure config is loaded)
const db = firebase.firestore();

// Chart Variables (Global taaki update ho sakein)
let revenueChart, orderPieChart;

// 2. Main Function to Load Analytics
async function initAnalytics() {
    const timeFilter = document.getElementById('timePeriod').value; // e.g., 7, 30, 365 days
    
    // Calculate Date Range
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(timeFilter));
    const timestampLimit = firebase.firestore.Timestamp.fromDate(dateLimit);

    try {
        // Fetching only relevant orders based on time filter
        const snapshot = await db.collection("orders")
            .where("orderDate", ">=", timestampLimit)
            .get();

        const orders = [];
        snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));

        // 3. Process Data for CA-Style Report
        calculateFinancials(orders);
        updateCharts(orders);
        renderVillageSales(orders);
        renderTopProducts(orders);

    } catch (error) {
        console.error("Financial Data Fetch Error: ", error);
    }
}

// 4. CA-Style Financial Calculations
function calculateFinancials(orders) {
    let grossSale = 0;
    let pendingCod = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;

    orders.forEach(order => {
        const amount = parseFloat(order.totalAmount || 0);
        
        if (order.status === 'Delivered') {
            grossSale += amount;
            completedOrders++;
        } else if (order.status === 'Cancelled') {
            cancelledOrders++;
        }

        // COD Tracking
        if (order.paymentMethod === 'COD' && order.status !== 'Delivered') {
            pendingCod += amount;
        }
    });

    // Net Earning Logic (Subtracting 5% Platform Fee & Fixed Delivery Est.)
    const platformFee = grossSale * 0.05;
    const netEarning = grossSale - platformFee;

    // UI Updates
    document.getElementById('todaySale').innerText = `₹${grossSale.toLocaleString()}`;
    document.getElementById('monthSale').innerText = `₹${grossSale.toLocaleString()}`; // Based on filter
    document.getElementById('netEarning').innerText = `₹${netEarning.toLocaleString()}`;
    document.getElementById('pendingCod').innerText = `₹${pendingCod.toLocaleString()}`;
}

// 5. Chart.js Integration
function updateCharts(orders) {
    const statusCounts = { 'Delivered': 0, 'Pending': 0, 'Cancelled': 0 };
    
    orders.forEach(o => {
        const s = o.status || 'Pending';
        if(statusCounts[s] !== undefined) statusCounts[s]++;
    });

    // Pie Chart Update
    const ctxPie = document.getElementById('orderPieChart').getContext('2d');
    if (orderPieChart) orderPieChart.destroy();
    orderPieChart = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending', 'Cancelled'],
            datasets: [{
                data: [statusCounts.Delivered, statusCounts.Pending, statusCounts.Cancelled],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
            }]
        }
    });
}

// 6. Village Wise Sales Logic
function renderVillageSales(orders) {
    const villageMap = {};
    orders.forEach(order => {
        const v = order.village || "Unknown";
        if (!villageMap[v]) villageMap[v] = { count: 0, revenue: 0 };
        villageMap[v].count++;
        villageMap[v].revenue += parseFloat(order.totalAmount || 0);
    });

    const tbody = document.querySelector('#villageTable tbody');
    tbody.innerHTML = Object.entries(villageMap)
        .sort((a, b) => b[1].revenue - a[1].revenue) // Top performing village first
        .map(([name, data]) => `
            <tr>
                <td>${name}</td>
                <td>${data.count}</td>
                <td>₹${data.revenue.toLocaleString()}</td>
            </tr>
        `).join('');
}

// 7. Top Selling Products Logic
function renderTopProducts(orders) {
    const productMap = {};
    orders.forEach(order => {
        if(order.items) {
            order.items.forEach(item => {
                if (!productMap[item.name]) productMap[item.name] = 0;
                productMap[item.name] += item.qty || 1;
            });
        }
    });

    const topList = document.getElementById('topProducts');
    topList.innerHTML = Object.entries(productMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5) // Top 5 Products
        .map(([name, qty]) => `
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f1f5f9;">
                <span>${name}</span>
                <span class="badge" style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px; font-weight:bold;">${qty} Sold</span>
            </div>
        `).join('');
}

// Initial Call
document.addEventListener('DOMContentLoaded', initAnalytics);

// Function for Filter Change
function updateAnalytics() {
    initAnalytics();
}