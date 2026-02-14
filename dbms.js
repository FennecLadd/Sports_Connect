// ================= DATABASE =================
const DB = {
    generateID() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    getBookings() {
        return JSON.parse(localStorage.getItem("sportsbookings")) || [];
    },

    saveBooking(booking) {
        booking.id = this.generateID();
        booking.username = localStorage.getItem("currentUser");
        const bookings = this.getBookings();
        bookings.push(booking);
        localStorage.setItem("sportsbookings", JSON.stringify(bookings));
    },

    getUserBookings(username) {
        return this.getBookings().filter(b => b.username === username);
    },

    deleteBooking(id) {
        const updated = this.getBookings().filter(b => b.id !== id);
        localStorage.setItem("sportsbookings", JSON.stringify(updated));
    },

    clearAll() {
        localStorage.removeItem("sportsbookings");
    }
};

// ================= LOGOUT (COMMON) =================
function logoutCommon() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isAdmin");
    location.reload();
}
