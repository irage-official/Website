// Language Toggle Function
function toggleLanguage() {
    const html = document.getElementById('html-root');
    const currentLang = html.getAttribute('lang');
    const newLang = currentLang === 'fa' ? 'en' : 'fa';
    
    // Apply new language
    applyLanguage(newLang);
    
    // Save language preference
    localStorage.setItem('preferredLanguage', newLang);
}

// Header web component used across all pages
class SiteHeader extends HTMLElement {
    static get observedAttributes() {
        return ['data-active'];
    }

    connectedCallback() {
        // Prevent double render if element is re-attached
        if (this._rendered) {
            this.updateActiveLink(this.getAttribute('data-active'));
            return;
        }

        const isNestedPage = window.location.pathname.includes('/pages/');
        const assetPrefix = isNestedPage ? '../' : '';
        const pagesPrefix = isNestedPage ? '' : 'pages/';
        const homeHref = isNestedPage ? '../index.html' : 'index.html';
        const activeLink = this.getAttribute('data-active') || '';

        const navLinks = [
            this.createNavLink('donation', `${pagesPrefix}donation.html`, 'حمایت مالی', 'Donation'),
            this.createNavLink('about', `${pagesPrefix}about.html`, 'درباره ما', 'About us'),
            this.createNavLink('policy', `${pagesPrefix}policy.html`, 'حریم خصوصی', 'Policy Privacy'),
            this.createNavLink('terms', `${pagesPrefix}terms.html`, 'شرایط استفاده', 'Terms & Conditions')
        ].join('');

        this.innerHTML = `
            <header class="header">
                <div class="container">
                    <div class="header-content">
                        <a href="${homeHref}" class="logo">
                            <img src="${assetPrefix}assets/images/logo-en.svg" alt="Irage" data-lang="en" style="display: none;">
                            <img src="${assetPrefix}assets/images/logo-fa.svg" alt="ایراژ" data-lang="fa">
                        </a>
                        <nav class="header-nav">
                            ${navLinks}
                        </nav>
                        <div class="header-actions">
                            <button class="btn-lang" onclick="toggleLanguage()">
                                <span data-lang="fa">EN</span>
                                <span data-lang="en" style="display: none;">فا</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        `;

        this._rendered = true;
        this.updateActiveLink(activeLink);
    }

    attributeChangedCallback(name, _oldValue, newValue) {
        if (name === 'data-active' && this._rendered) {
            this.updateActiveLink(newValue);
        }
    }

    createNavLink(id, href, faLabel, enLabel) {
        return `
            <a href="${href}" class="nav-link nav-${id}" data-link="${id}">
                <span data-lang="fa">${faLabel}</span>
                <span data-lang="en" style="display: none;">${enLabel}</span>
            </a>
        `;
    }

    updateActiveLink(activeId) {
        const navLinks = this.querySelectorAll('.nav-link');
        if (!navLinks.length || !activeId) {
            return;
        }

        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.link === activeId);
        });
    }
}

if (!customElements.get('site-header')) {
    customElements.define('site-header', SiteHeader);
}

// Content Section web component for page content
class ContentSection extends HTMLElement {
    connectedCallback() {
        if (this._rendered) return;
        
        const titleFa = this.getAttribute('data-title-fa') || '';
        const titleEn = this.getAttribute('data-title-en') || '';
        const descriptionFa = this.getAttribute('data-description-fa') || '';
        const descriptionEn = this.getAttribute('data-description-en') || '';
        const noteFa = this.getAttribute('data-note-fa') || '';
        const noteEn = this.getAttribute('data-note-en') || '';
        
        let titleHTML = '';
        if (titleFa || titleEn) {
            // Check if title contains "(coming soon)" or "(به زودی)"
            const comingSoonFa = '(به زودی)';
            const comingSoonEn = '(coming soon)';
            
            let titleFaProcessed = titleFa;
            let titleEnProcessed = titleEn;
            
            // Extract main title and coming soon text for Persian
            if (titleFa && titleFa.includes(comingSoonFa)) {
                const parts = titleFa.split(comingSoonFa);
                titleFaProcessed = parts[0].trim() + ' <span class="coming-soon">' + comingSoonFa + '</span>';
            }
            
            // Extract main title and coming soon text for English
            if (titleEn && titleEn.includes(comingSoonEn)) {
                const parts = titleEn.split(comingSoonEn);
                titleEnProcessed = parts[0].trim() + ' <span class="coming-soon">' + comingSoonEn + '</span>';
            }
            
            titleHTML = `
                <h2 class="content-section-title">
                    ${titleFa ? `<span data-lang="fa">${titleFaProcessed}</span>` : ''}
                    ${titleEn ? `<span data-lang="en" style="display: none;">${titleEnProcessed}</span>` : ''}
                </h2>
            `;
        }
        
        let descriptionHTML = '';
        if (descriptionFa || descriptionEn) {
            // Process description to style "Irage"/"ایراژ" and "(Iranian Heritage)"/"(میراث ایران)"
            let descriptionFaProcessed = descriptionFa;
            let descriptionEnProcessed = descriptionEn;
            
            // Process Persian text
            if (descriptionFa) {
                // Make "ایراژ" or "ایرج" bold (handle both with and without quotes)
                descriptionFaProcessed = descriptionFaProcessed.replace(
                    /(«?)(ایراژ|ایرج)(»?)/g,
                    (match, openQuote, word, closeQuote) => {
                        return (openQuote || '') + '<strong>' + word + '</strong>' + (closeQuote || '');
                    }
                );
                // Style "(میراث ایران)" with color
                descriptionFaProcessed = descriptionFaProcessed.replace(
                    /\(میراث ایران\)/g,
                    '<span class="heritage-text">$&</span>'
                );
            }
            
            // Process English text
            if (descriptionEn) {
                // Make "Irage" bold (handle both with and without quotes)
                descriptionEnProcessed = descriptionEnProcessed.replace(
                    /("?)(Irage)("?)/g,
                    (match, openQuote, word, closeQuote) => {
                        return (openQuote || '') + '<strong>' + word + '</strong>' + (closeQuote || '');
                    }
                );
                // Style "(Iranian Heritage)" with color
                descriptionEnProcessed = descriptionEnProcessed.replace(
                    /\(Iranian Heritage\)/g,
                    '<span class="heritage-text">$&</span>'
                );
            }
            
            // Check if description contains HTML tags (like <ul>, <li>, etc.)
            const hasHTML = descriptionFaProcessed.includes('<ul>') || descriptionEnProcessed.includes('<ul>') ||
                           descriptionFaProcessed.includes('<br>') || descriptionEnProcessed.includes('<br>');
            
            if (hasHTML) {
                // For HTML content, use div instead of p and wrap each language version
                descriptionHTML = `
                    <div class="content-section-description">
                        ${descriptionFa ? `<div data-lang="fa">${descriptionFaProcessed}</div>` : ''}
                        ${descriptionEn ? `<div data-lang="en" style="display: none;">${descriptionEnProcessed}</div>` : ''}
                    </div>
                `;
            } else {
                // For plain text, use p tag
                descriptionHTML = `
                    <p class="content-section-description">
                        ${descriptionFa ? `<span data-lang="fa">${descriptionFaProcessed}</span>` : ''}
                        ${descriptionEn ? `<span data-lang="en" style="display: none;">${descriptionEnProcessed}</span>` : ''}
                    </p>
                `;
            }
        }
        
        let noteHTML = '';
        if (noteFa || noteEn) {
            // Process note text to convert "Submit a Report" and "Add or Edit Record" to links
            let noteFaProcessed = noteFa;
            let noteEnProcessed = noteEn;
            
            // Replace "Submit a Report" with link in English
            if (noteEn && noteEn.includes('Submit a Report')) {
                noteEnProcessed = noteEn.replace(
                    'Submit a Report',
                    '<a href="mailto:feedback@irage.site" class="note-link">Submit a Report</a>'
                );
            }
            
            // Replace "ارسال گزارش" or similar Persian text with link
            if (noteFa && noteFa.includes('ارسال گزارش')) {
                noteFaProcessed = noteFa.replace(
                    'ارسال گزارش',
                    '<a href="mailto:feedback@irage.site" class="note-link">ارسال گزارش</a>'
                );
            }
            
            // Replace "Add or Edit Record" with link in English
            if (noteEn && noteEn.includes('Add or Edit Record')) {
                noteEnProcessed = noteEn.replace(
                    'Add or Edit Record',
                    '<a href="mailto:feedback@irage.site" class="note-link">Add or Edit Record</a>'
                );
            }
            
            // Replace "افزودن یا ویرایش رکورد" or similar Persian text with link
            if (noteFa && noteFa.includes('افزودن یا ویرایش رکورد')) {
                noteFaProcessed = noteFa.replace(
                    'افزودن یا ویرایش رکورد',
                    '<a href="mailto:feedback@irage.site" class="note-link">افزودن یا ویرایش رکورد</a>'
                );
            }
            
            noteHTML = `
                <div class="content-section-note">
                    <p>
                        ${noteFa ? `<span data-lang="fa">${noteFaProcessed}</span>` : ''}
                        ${noteEn ? `<span data-lang="en" style="display: none;">${noteEnProcessed}</span>` : ''}
                    </p>
                </div>
            `;
        }
        
        this.innerHTML = `
            <section class="content-section">
                ${titleHTML}
                <div class="content-section-context">
                    ${descriptionHTML}
                    ${noteHTML}
                </div>
            </section>
        `;
        
        this._rendered = true;
        
        // Apply current language after rendering
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
            const html = document.getElementById('html-root');
            if (html) {
                const currentLang = html.getAttribute('lang') || 'fa';
                this.applyLanguageToContent(currentLang);
            } else {
                // If html-root not found yet, try again after a short delay
                setTimeout(() => {
                    const html = document.getElementById('html-root');
                    if (html) {
                        const currentLang = html.getAttribute('lang') || 'fa';
                        this.applyLanguageToContent(currentLang);
                    }
                }, 100);
            }
        }, 0);
    }
    
    applyLanguageToContent(lang) {
        const faElements = this.querySelectorAll('[data-lang="fa"]');
        const enElements = this.querySelectorAll('[data-lang="en"]');
        
        faElements.forEach(el => {
            el.style.display = lang === 'fa' ? '' : 'none';
        });
        
        enElements.forEach(el => {
            el.style.display = lang === 'en' ? '' : 'none';
        });
    }
}

if (!customElements.get('content-section')) {
    customElements.define('content-section', ContentSection);
}

// Function to detect user location and set default language
async function detectUserLocation() {
    try {
        // Use ipapi.co to detect country (free, no API key needed)
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        // Check if country is Iran (IR)
        if (data.country_code === 'IR') {
            return 'fa'; // Persian for Iran
        } else {
            return 'en'; // English for other countries
        }
    } catch (error) {
        console.log('Location detection failed, using fallback:', error);
        // Fallback: try to detect from browser language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('fa') || browserLang.startsWith('ar')) {
            return 'fa';
        }
        return 'en'; // Default to English if detection fails
    }
}

// Function to apply language settings
function applyLanguage(lang) {
    const html = document.getElementById('html-root');
    
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');
    
    // Toggle visibility of language-specific elements
    const faElements = document.querySelectorAll('[data-lang="fa"]');
    const enElements = document.querySelectorAll('[data-lang="en"]');
    
    faElements.forEach(el => {
        el.style.display = lang === 'fa' ? '' : 'none';
    });
    
    enElements.forEach(el => {
        el.style.display = lang === 'en' ? '' : 'none';
    });
    
    // Update content-section components
    const contentSections = document.querySelectorAll('content-section');
    contentSections.forEach(section => {
        if (section.applyLanguageToContent) {
            section.applyLanguageToContent(lang);
        }
    });
    
    // Update logo images
    const logoImages = document.querySelectorAll('.logo img');
    logoImages.forEach(img => {
        const imgLang = img.getAttribute('data-lang');
        img.style.display = imgLang === lang ? '' : 'none';
    });
    
    // Update screenshots images
    const screenshotsImages = document.querySelectorAll('.screenshots-image');
    screenshotsImages.forEach(img => {
        const imgLang = img.getAttribute('data-lang');
        img.style.display = imgLang === lang ? '' : 'none';
    });
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user has a saved preference first
    const savedLang = localStorage.getItem('preferredLanguage');
    
    if (savedLang) {
        // Use saved preference
        applyLanguage(savedLang);
    } else {
        // Detect user location and get default language
        const detectedLang = await detectUserLocation();
        
        // Apply detected language
        applyLanguage(detectedLang);
        
        // Save detected language
        localStorage.setItem('preferredLanguage', detectedLang);
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

const DONATION_ADDRESS = 'TNdXt3TSZnhuyGraxFhdSrUsNPtyXS4MZp';
const DONATION_QR_URL = 'https://api.qrserver.com/v1/create-qr-code/?size=640x640&data=' + DONATION_ADDRESS;

function copyDonationAddress() {
    if (!navigator.clipboard) {
        alert('Clipboard API not available.');
        return;
    }
    navigator.clipboard.writeText(DONATION_ADDRESS)
        .then(() => console.log('Donation address copied'))
        .catch(err => console.error('Failed to copy donation address', err));
}

function downloadDonationQR() {
    const link = document.createElement('a');
    link.href = DONATION_QR_URL;
    link.download = 'irage-usdt-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function shareDonationAddress() {
    if (navigator.share) {
        navigator.share({
            title: 'Irage Donation Address',
            text: DONATION_ADDRESS,
            url: window.location.origin + '/pages/donation.html'
        }).catch(() => {});
    } else {
        copyDonationAddress();
        alert('آدرس کپی شد. می‌توانید آن را در پیام خود قرار دهید.');
    }
}

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

