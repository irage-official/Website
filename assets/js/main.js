// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navMenu.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                navMenu.classList.remove('active');
            }
        });
    }
});

// Donation Modal Functions
function openDonationModal() {
    const modal = document.getElementById('donationModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeDonationModal() {
    const modal = document.getElementById('donationModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('donationModal');
    if (event.target === modal) {
        closeDonationModal();
    }
}

// Copy Wallet Address Function
function copyWalletAddress() {
    const walletAddress = document.getElementById('walletAddress');
    if (walletAddress) {
        const text = walletAddress.textContent;
        
        // Create a temporary textarea to copy text
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            
            // Show feedback
            const btn = event.target;
            const originalText = btn.textContent;
            btn.textContent = 'کپی شد!';
            btn.style.backgroundColor = '#00B383';
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = '';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
            alert('خطا در کپی کردن آدرس. لطفاً به صورت دستی کپی کنید.');
        }
        
        document.body.removeChild(textarea);
    }
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '#!') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Add active class to current page in navigation
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        if (linkPath === currentPath || 
            (currentPath.endsWith('/') && linkPath === currentPath.slice(0, -1)) ||
            (currentPath === '/index.html' && linkPath.endsWith('index.html'))) {
            link.classList.add('active');
        }
    });
});

