// Language Toggle Function
function toggleLanguage() {
    const html = document.getElementById('html-root');
    const currentLang = html.getAttribute('lang');
    const newLang = currentLang === 'fa' ? 'en' : 'fa';
    
    // Update HTML lang and dir attributes
    html.setAttribute('lang', newLang);
    html.setAttribute('dir', newLang === 'fa' ? 'rtl' : 'ltr');
    
    // Toggle visibility of language-specific elements
    const faElements = document.querySelectorAll('[data-lang="fa"]');
    const enElements = document.querySelectorAll('[data-lang="en"]');
    
    faElements.forEach(el => {
        el.style.display = newLang === 'fa' ? '' : 'none';
    });
    
    enElements.forEach(el => {
        el.style.display = newLang === 'en' ? '' : 'none';
    });
    
    // Save language preference
    localStorage.setItem('preferredLanguage', newLang);
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedLang = localStorage.getItem('preferredLanguage') || 'fa';
    const html = document.getElementById('html-root');
    
    if (savedLang !== html.getAttribute('lang')) {
        // Trigger language change if saved language is different
        const faElements = document.querySelectorAll('[data-lang="fa"]');
        const enElements = document.querySelectorAll('[data-lang="en"]');
        
        html.setAttribute('lang', savedLang);
        html.setAttribute('dir', savedLang === 'fa' ? 'rtl' : 'ltr');
        
        faElements.forEach(el => {
            el.style.display = savedLang === 'fa' ? '' : 'none';
        });
        
        enElements.forEach(el => {
            el.style.display = savedLang === 'en' ? '' : 'none';
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

