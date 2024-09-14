// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    // Get the toggle button and navbar links
    const toggleButton = document.querySelector('.navbar-toggle');
    const navbarLinks = document.querySelector('.navbar-links');

    // Add a click event listener to the toggle button
    toggleButton.addEventListener('click', function() {
        // Toggle the 'show' class on the navbar links
        navbarLinks.classList.toggle('show');
    });
});
