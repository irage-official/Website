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
    
    // Toggle logo images
    const logoImages = document.querySelectorAll('.logo img');
    logoImages.forEach(img => {
        const imgLang = img.getAttribute('data-lang');
        img.style.display = imgLang === newLang ? '' : 'none';
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
        
        // Update logo images
        const logoImages = document.querySelectorAll('.logo img');
        logoImages.forEach(img => {
            const imgLang = img.getAttribute('data-lang');
            img.style.display = imgLang === savedLang ? '' : 'none';
        });
    }
    
    // Prevent scroll on home page
    const isHomePage = window.location.pathname === '/' || 
                      window.location.pathname.endsWith('index.html') ||
                      window.location.pathname.endsWith('/');
    
    if (isHomePage) {
        document.body.classList.add('no-scroll');
        
        // Prevent scroll on touch devices
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
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

// Element Inspector: Option+Click to inspect elements
document.addEventListener('click', function(e) {
    if (e.altKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        
        const el = e.target;
        
        // Get element info
        const tagName = el.tagName.toLowerCase();
        const className = el.className ? (typeof el.className === 'string' ? el.className : Array.from(el.className).join(' ')) : '';
        const id = el.id || '';
        
        // Build selector
        let selector = tagName;
        if (id) selector += '#' + id;
        if (className) {
            const classes = className.split(' ').filter(c => c.trim());
            if (classes.length > 0) {
                selector += '.' + classes.join('.');
            }
        }
        
        // Highlight element
        const originalOutline = el.style.outline;
        const originalBackground = el.style.backgroundColor;
        el.style.outline = '3px solid #735BF2';
        el.style.backgroundColor = 'rgba(115, 91, 242, 0.1)';
        
        // Log to console
        console.group('🔍 Element Inspector');
        console.log('Element:', el);
        console.log('Tag:', tagName);
        console.log('ID:', id || '(none)');
        console.log('Classes:', className || '(none)');
        console.log('Selector:', selector);
        console.log('HTML:', el.outerHTML.substring(0, 200) + (el.outerHTML.length > 200 ? '...' : ''));
        console.log('Computed Styles:', window.getComputedStyle(el));
        console.groupEnd();
        
        // Remove highlight after 2 seconds
        setTimeout(() => {
            el.style.outline = originalOutline;
            el.style.backgroundColor = originalBackground;
        }, 2000);
        
        // Copy selector to clipboard (optional)
        if (navigator.clipboard) {
            navigator.clipboard.writeText(selector).then(() => {
                console.log('✅ Selector copied to clipboard:', selector);
            });
        }
    }
}, true);

