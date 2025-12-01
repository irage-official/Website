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
                            <img src="${assetPrefix}assets/images/logo-en.svg" alt="Irage" data-lang="en" style="display: none;" fetchpriority="high">
                            <img src="${assetPrefix}assets/images/logo-fa.svg" alt="ایراژ" data-lang="fa" fetchpriority="high">
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
        const isMuted = this.getAttribute('data-muted') === 'true';
        
        let titleHTML = '';
        if (titleFa || titleEn) {
            // Check if title contains "(coming soon)" or "(به زودی)"
            const comingSoonFa = '(به زودی)';
            const comingSoonEn = '(coming soon)';
            
            let titleFaProcessed = titleFa;
            let titleEnProcessed = titleEn;
            
            // Extract number and wrap it in a span with fixed width
            // Pattern: "۱. مقدمه" or "1. Introduction"
            if (titleFa) {
                const faMatch = titleFa.match(/^([۰-۹]+)\.\s*(.+)$/);
                if (faMatch) {
                    const number = faMatch[1];
                    const rest = faMatch[2];
                    titleFaProcessed = `<span class="section-number">${number}.</span>${rest}`;
                }
            }
            
            if (titleEn) {
                const enMatch = titleEn.match(/^(\d+)\.\s*(.+)$/);
                if (enMatch) {
                    const number = enMatch[1];
                    const rest = enMatch[2];
                    titleEnProcessed = `<span class="section-number">${number}.</span>${rest}`;
                }
            }
            
            // Extract main title and coming soon text for Persian
            if (titleFa && titleFaProcessed.includes(comingSoonFa)) {
                const parts = titleFaProcessed.split(comingSoonFa);
                titleFaProcessed = parts[0].trim() + ' <span class="coming-soon">' + comingSoonFa + '</span>';
            }
            
            // Extract main title and coming soon text for English
            if (titleEn && titleEnProcessed.includes(comingSoonEn)) {
                const parts = titleEnProcessed.split(comingSoonEn);
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
                // Make "ایراژ" or "ایرج" bold (handle both with and without quotes) - skip if muted
                if (!isMuted) {
                    descriptionFaProcessed = descriptionFaProcessed.replace(
                        /(«?)(ایراژ|ایرج)(»?)/g,
                        (match, openQuote, word, closeQuote) => {
                            return (openQuote || '') + '<strong>' + word + '</strong>' + (closeQuote || '');
                        }
                    );
                }
                // Style "(میراث ایران)" with color
                descriptionFaProcessed = descriptionFaProcessed.replace(
                    /\(میراث ایران\)/g,
                    '<span class="heritage-text">$&</span>'
                );
            }
            
            // Process English text
            if (descriptionEn) {
                // Make "Irage" bold (handle both with and without quotes) - skip if muted
                if (!isMuted) {
                    descriptionEnProcessed = descriptionEnProcessed.replace(
                        /("?)(Irage)("?)/g,
                        (match, openQuote, word, closeQuote) => {
                            return (openQuote || '') + '<strong>' + word + '</strong>' + (closeQuote || '');
                        }
                    );
                }
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
        
        // Preserve any existing child elements (like donation-wallet-section)
        const existingChildren = Array.from(this.children);
        
        this.innerHTML = `
            <section class="content-section">
                ${titleHTML}
                <div class="content-section-context">
                    ${descriptionHTML}
                    ${noteHTML}
                </div>
            </section>
        `;
        
        // Re-append preserved children to the content-section-context
        if (existingChildren.length > 0) {
            const contextDiv = this.querySelector('.content-section-context');
            if (contextDiv) {
                existingChildren.forEach(child => {
                    contextDiv.appendChild(child);
                });
            }
        }
        
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
    
    // Update page title
    const titleElement = document.querySelector('title');
    if (titleElement) {
        const titleFa = titleElement.getAttribute('data-title-fa');
        const titleEn = titleElement.getAttribute('data-title-en');
        if (lang === 'en' && titleEn) {
            titleElement.textContent = titleEn;
        } else if (lang === 'fa' && titleFa) {
            titleElement.textContent = titleFa;
        }
    }
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

function copyDonationAddress() {
    const tooltip = document.getElementById('copyTooltip');
    
    if (!navigator.clipboard) {
        alert('Clipboard API not available.');
        return;
    }
    
    navigator.clipboard.writeText(DONATION_ADDRESS)
        .then(() => {
            // Show tooltip
            if (tooltip) {
                tooltip.classList.add('show');
                setTimeout(() => {
                    tooltip.classList.remove('show');
                }, 2000);
            }
        })
        .catch(() => {
            alert('Failed to copy address');
        });
}



