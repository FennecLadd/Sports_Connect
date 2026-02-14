// Check if the user is already logged in when the page loads
let currentUser = localStorage.getItem("currentUser");
let isAdmin = localStorage.getItem("isAdmin") === "true";

window.addEventListener('load', function () {
    const savedUser = localStorage.getItem('currentUser');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (savedUser) {
        currentUser = savedUser;
        if (isAdmin) {
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('adminPage').style.display = 'block';
            updateAdminStats();
            displayAdminBookings();
        }
    }
});

// Login handling
document.getElementById('loginButton').addEventListener('click', function () {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === 'admin') {
        currentUser = 'admin';
        isAdmin = true;

        // Save login state in localStorage
        localStorage.setItem('currentUser', currentUser);
        localStorage.setItem('isAdmin', isAdmin);

        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('adminPage').style.display = 'block';
        updateAdminStats();
        displayAdminBookings();
    } else {
        alert('Invalid username or password');
    }
});

// Logout handler
document.getElementById("logoutTabAdmin").addEventListener("click", logoutCommon);



// Display all bookings for admin
function displayAdminBookings() {
    let bookings = DB.getBookings();
    const tableDiv = document.getElementById('adminBookingsTable');

    // Apply filters
    const filterVenue = document.getElementById('filterVenue').value;
    const filterSport = document.getElementById('filterSport').value;
    const filterDate = document.getElementById('filterDate').value;

    if (filterVenue) {
        bookings = bookings.filter(booking => booking.venue === filterVenue);
    }

    if (filterSport) {
        bookings = bookings.filter(booking => booking.sport === filterSport);
    }

    if (filterDate) {
        bookings = bookings.filter(booking => booking.date === filterDate);
    }

    if (bookings.length === 0) {
        tableDiv.innerHTML = '<div class="no-bookings">No bookings found.</div>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Name</th>
                    <th>Sport</th>
                    <th>Venue</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    bookings.forEach(booking => {
        // Format the date for display
        const bookingDate = new Date(booking.date);
        const formattedDate = bookingDate.toLocaleDateString();

        html += `
            <tr>
                <td>${booking.username}</td>
                <td>${booking.name}</td>
                <td>${booking.sport}</td>
                <td>${booking.venue}</td>
                <td>${formattedDate}</td>
                <td>${booking.time}</td>
                <td>
                    <button class="delete-btn" data-id="${booking.id}">Delete</button>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    tableDiv.innerHTML = html;

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this booking?')) {
                DB.deleteBooking(id);
                displayAdminBookings();
                updateAdminStats();
            }
        });
    });
}

// Update admin statistics
function updateAdminStats() {
    const bookings = DB.getBookings();
    const todayStr = new Date().toISOString().split('T')[0];

    // Total bookings
    document.getElementById('totalBookings').textContent = bookings.length;

    // Today's bookings
    const todayBookings = bookings.filter(booking => booking.date === todayStr);
    document.getElementById('todayBookings').textContent = todayBookings.length;

    // Upcoming bookings (future dates)
    const upcomingBookings = bookings.filter(booking => booking.date > todayStr);
    document.getElementById('upcomingBookings').textContent = upcomingBookings.length;

    // Most popular venue
    const venueCounts = {};
    bookings.forEach(booking => {
        venueCounts[booking.venue] = (venueCounts[booking.venue] || 0) + 1;
    });

    let mostPopularVenue = '-';
    let maxCount = 0;

    for (const venue in venueCounts) {
        if (venueCounts[venue] > maxCount) {
            mostPopularVenue = venue;
            maxCount = venueCounts[venue];
        }
    }

    document.getElementById('mostPopularVenue').textContent = mostPopularVenue;
}

// Export JSON button
document.getElementById('exportJSON').addEventListener('click', function () {
    const bookings = DB.getBookings();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bookings, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "sports_bookings.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
});

// Clear database button
document.getElementById('clearDatabase').addEventListener('click', function () {
    if (confirm('Are you sure you want to delete ALL bookings? This cannot be undone.')) {
        DB.clearAll();
        displayAdminBookings();
        updateAdminStats();
    }
});

// Filter handlers for admin console
document.getElementById('filterVenue').addEventListener('change', displayAdminBookings);
document.getElementById('filterSport').addEventListener('change', displayAdminBookings);
document.getElementById('filterDate').addEventListener('change', displayAdminBookings);

