// ===================================
// IncrediWatt Solutions - Main JavaScript
// ===================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initHeroLights();
    initJackpotSequence();
    initROICalculator();
    initContactForm();
    initScrollToTop();
    initScrollAnimations();
});

// ===================================
// Navigation
// ===================================
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            const icon = mobileMenuToggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // Smooth scrolling for anchor links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ===================================
// Hero Lights Animation
// ===================================
function initHeroLights() {
    const heroLights = document.getElementById('heroLights');
    if (!heroLights) return;

    // Create animated light streaks
    setInterval(() => {
        const streak = document.createElement('div');
        streak.classList.add('light-streak');
        streak.style.top = Math.random() * 100 + '%';
        streak.style.width = Math.random() * 200 + 100 + 'px';
        heroLights.appendChild(streak);
        
        // Remove after animation
        setTimeout(() => {
            streak.remove();
        }, 8000);
    }, 800);
}

// ===================================
// Jackpot Sequence Demo - Full Screen Effect
// ===================================
function initJackpotSequence() {
    // Create fullscreen overlay for light effects
    if (!document.getElementById('fullscreenLightOverlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'fullscreenLightOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            display: none;
        `;
        document.body.appendChild(overlay);
    }

    // Keep the demo strip visible for UI purposes
    const lightStrip = document.getElementById('lightStrip');
    if (lightStrip) {
        lightStrip.innerHTML = '<p style="text-align: center; color: #FFD700; font-size: 1.2rem; padding: 2rem;">Click a button below to see the full-screen lighting demonstration!</p>';
    }
}

// Jackpot sequence patterns - EPIC FULL SCREEN VERSION
function triggerSequence(type) {
    const overlay = document.getElementById('fullscreenLightOverlay');
    if (!overlay) return;

    // Clear any existing animations
    overlay.innerHTML = '';
    overlay.style.display = 'block';

    switch(type) {
        case 'rising':
            risingThunderAnimation(overlay);
            break;
        case 'purplerain':
            purpleRainAnimation(overlay);
            break;
        case 'fire':
            fireExplosionAnimation(overlay);
            break;
        case 'collision':
            rainbowCollisionAnimation(overlay);
            break;
    }
}

// 1. RISING THUNDER - Epic lights dash from bottom to top
function risingThunderAnimation(overlay) {
    const colors = ['#FFD700', '#FFA500', '#FFED4E', '#FFFFFF'];
    const strips = 40;
    const duration = 3000;

    for (let i = 0; i < strips; i++) {
        const strip = document.createElement('div');
        strip.style.cssText = `
            position: absolute;
            left: ${(i / strips) * 100}%;
            bottom: -10%;
            width: ${100 / strips}%;
            height: 100%;
            background: ${colors[i % colors.length]};
            opacity: 0;
            box-shadow: 0 0 30px ${colors[i % colors.length]};
        `;
        overlay.appendChild(strip);

        // Staggered animation upward
        setTimeout(() => {
            strip.style.transition = `all ${duration / 1000}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
            strip.style.opacity = '0.8';
            strip.style.bottom = '100%';
            strip.style.transform = 'skewY(-5deg)';

            // Flash effect
            setTimeout(() => {
                strip.style.opacity = '0.3';
            }, duration * 0.4);

            setTimeout(() => {
                strip.style.opacity = '1';
            }, duration * 0.6);

            setTimeout(() => {
                strip.style.opacity = '0';
            }, duration * 0.9);
        }, i * 50);
    }

    // Final burst at top
    setTimeout(() => {
        const burst = document.createElement('div');
        burst.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 30%;
            background: linear-gradient(to bottom, #FFD700, transparent);
            opacity: 0;
            box-shadow: 0 0 100px #FFD700;
        `;
        overlay.appendChild(burst);
        setTimeout(() => {
            burst.style.transition = 'all 0.5s ease';
            burst.style.opacity = '1';
        }, 10);
        setTimeout(() => {
            burst.style.opacity = '0';
        }, 800);
    }, duration + 500);

    // Cleanup
    setTimeout(() => {
        overlay.style.display = 'none';
        overlay.innerHTML = '';
    }, duration + 2000);
}

// 2. PURPLE RAIN - Lightning falls from top with white strikes
function purpleRainAnimation(overlay) {
    const duration = 4000;
    const raindrops = 60;
    const purpleShades = ['#7C3AED', '#9333EA', '#A855F7', '#C084FC'];

    // Create rain effect
    for (let i = 0; i < raindrops; i++) {
        const drop = document.createElement('div');
        const leftPos = Math.random() * 100;
        const delay = Math.random() * 1000;
        const size = Math.random() * 3 + 2;
        
        drop.style.cssText = `
            position: absolute;
            left: ${leftPos}%;
            top: -5%;
            width: ${size}%;
            height: 100%;
            background: linear-gradient(to bottom, ${purpleShades[Math.floor(Math.random() * purpleShades.length)]}, transparent);
            opacity: 0;
            box-shadow: 0 0 20px ${purpleShades[1]};
        `;
        overlay.appendChild(drop);

        setTimeout(() => {
            drop.style.transition = `all ${(duration - delay) / 1000}s linear`;
            drop.style.opacity = '0.7';
            drop.style.top = '100%';
        }, delay);
    }

    // White lightning strikes
    const strikes = 8;
    for (let i = 0; i < strikes; i++) {
        setTimeout(() => {
            const lightning = document.createElement('div');
            lightning.style.cssText = `
                position: absolute;
                left: ${Math.random() * 80 + 10}%;
                top: 0;
                width: 2px;
                height: 100%;
                background: linear-gradient(to bottom, #FFFFFF, #FFD700);
                opacity: 0;
                box-shadow: 0 0 40px #FFFFFF, 0 0 80px #FFD700;
            `;
            overlay.appendChild(lightning);

            setTimeout(() => {
                lightning.style.opacity = '1';
            }, 10);

            setTimeout(() => {
                lightning.style.opacity = '0';
            }, 150);

            setTimeout(() => {
                lightning.style.opacity = '1';
            }, 300);

            setTimeout(() => {
                lightning.style.opacity = '0';
            }, 400);
        }, i * 400 + Math.random() * 500);
    }

    // Cleanup
    setTimeout(() => {
        overlay.style.display = 'none';
        overlay.innerHTML = '';
    }, duration + 1000);
}

// 3. FIRE EXPLOSION - Starts in center, explodes outward
function fireExplosionAnimation(overlay) {
    const duration = 4000;
    const fireColors = ['#FF4500', '#FF6347', '#FFA500', '#FFD700', '#FFFF00'];
    const rings = 30;

    // Create expanding rings from center
    for (let i = 0; i < rings; i++) {
        const ring = document.createElement('div');
        const colorIndex = Math.floor((i / rings) * fireColors.length);
        
        ring.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            background: ${fireColors[colorIndex]};
            opacity: 0;
            box-shadow: 0 0 60px ${fireColors[colorIndex]}, 0 0 120px ${fireColors[colorIndex]};
        `;
        overlay.appendChild(ring);

        setTimeout(() => {
            ring.style.transition = `all ${(duration / rings) * (rings - i) / 1000}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
            ring.style.width = `${200 + i * 50}vmax`;
            ring.style.height = `${200 + i * 50}vmax`;
            ring.style.opacity = '0.6';
        }, i * 80);

        setTimeout(() => {
            ring.style.opacity = '0';
        }, duration * 0.7 + i * 50);
    }

    // Add fire particles
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 40 + 30;
            const size = Math.random() * 20 + 10;
            
            particle.style.cssText = `
                position: absolute;
                left: 50%;
                top: 50%;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: ${fireColors[Math.floor(Math.random() * fireColors.length)]};
                opacity: 0.8;
                box-shadow: 0 0 20px currentColor;
            `;
            overlay.appendChild(particle);

            setTimeout(() => {
                particle.style.transition = `all ${Math.random() * 2 + 1}s ease-out`;
                particle.style.left = `${50 + Math.cos(angle) * distance}%`;
                particle.style.top = `${50 + Math.sin(angle) * distance}%`;
                particle.style.opacity = '0';
                particle.style.transform = 'scale(0.5)';
            }, 10);
        }, Math.random() * 1000);
    }

    // Cleanup
    setTimeout(() => {
        overlay.style.display = 'none';
        overlay.innerHTML = '';
    }, duration + 1000);
}

// 4. RAINBOW COLLISION - All edges converge, splash, ascend and jump off
function rainbowCollisionAnimation(overlay) {
    const duration = 5000;
    const rainbowColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
    const strips = 20;

    // Phase 1: Edges converge to center (1.5s)
    // From left
    for (let i = 0; i < strips / 4; i++) {
        const strip = document.createElement('div');
        strip.style.cssText = `
            position: absolute;
            left: 0;
            top: ${(i / (strips / 4)) * 100}%;
            width: 50%;
            height: ${100 / (strips / 4)}%;
            background: ${rainbowColors[i % rainbowColors.length]};
            opacity: 0.8;
            box-shadow: 0 0 30px ${rainbowColors[i % rainbowColors.length]};
        `;
        overlay.appendChild(strip);
        setTimeout(() => {
            strip.style.transition = 'all 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            strip.style.left = '50%';
            strip.style.width = '5%';
        }, i * 50);
    }

    // From right
    for (let i = 0; i < strips / 4; i++) {
        const strip = document.createElement('div');
        strip.style.cssText = `
            position: absolute;
            right: 0;
            top: ${(i / (strips / 4)) * 100}%;
            width: 50%;
            height: ${100 / (strips / 4)}%;
            background: ${rainbowColors[(i + 2) % rainbowColors.length]};
            opacity: 0.8;
            box-shadow: 0 0 30px ${rainbowColors[(i + 2) % rainbowColors.length]};
        `;
        overlay.appendChild(strip);
        setTimeout(() => {
            strip.style.transition = 'all 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            strip.style.right = '50%';
            strip.style.width = '5%';
        }, i * 50);
    }

    // From top
    for (let i = 0; i < strips / 4; i++) {
        const strip = document.createElement('div');
        strip.style.cssText = `
            position: absolute;
            left: ${(i / (strips / 4)) * 100}%;
            top: 0;
            width: ${100 / (strips / 4)}%;
            height: 50%;
            background: ${rainbowColors[(i + 4) % rainbowColors.length]};
            opacity: 0.8;
            box-shadow: 0 0 30px ${rainbowColors[(i + 4) % rainbowColors.length]};
        `;
        overlay.appendChild(strip);
        setTimeout(() => {
            strip.style.transition = 'all 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            strip.style.top = '50%';
            strip.style.height = '5%';
        }, i * 50);
    }

    // From bottom
    for (let i = 0; i < strips / 4; i++) {
        const strip = document.createElement('div');
        strip.style.cssText = `
            position: absolute;
            left: ${(i / (strips / 4)) * 100}%;
            bottom: 0;
            width: ${100 / (strips / 4)}%;
            height: 50%;
            background: ${rainbowColors[(i + 6) % rainbowColors.length]};
            opacity: 0.8;
            box-shadow: 0 0 30px ${rainbowColors[(i + 6) % rainbowColors.length]};
        `;
        overlay.appendChild(strip);
        setTimeout(() => {
            strip.style.transition = 'all 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            strip.style.bottom = '50%';
            strip.style.height = '5%';
        }, i * 50);
    }

    // Phase 2: Explosion splash at center (1s)
    setTimeout(() => {
        for (let i = 0; i < 50; i++) {
            const splash = document.createElement('div');
            const angle = (Math.PI * 2 * i) / 50;
            const color = rainbowColors[i % rainbowColors.length];
            
            splash.style.cssText = `
                position: absolute;
                left: 50%;
                top: 50%;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: ${color};
                opacity: 0;
                box-shadow: 0 0 40px ${color};
                transform: translate(-50%, -50%);
            `;
            overlay.appendChild(splash);

            setTimeout(() => {
                splash.style.transition = 'all 0.8s ease-out';
                splash.style.left = `${50 + Math.cos(angle) * 30}%`;
                splash.style.top = `${50 + Math.sin(angle) * 30}%`;
                splash.style.opacity = '1';
                splash.style.width = '40px';
                splash.style.height = '40px';
            }, 10);
        }
    }, 1500);

    // Phase 3: All lights rise to top (1.5s)
    setTimeout(() => {
        const allElements = overlay.querySelectorAll('div');
        allElements.forEach((el, index) => {
            setTimeout(() => {
                el.style.transition = 'all 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                el.style.top = '-20%';
                el.style.transform = 'translateY(-100px) scale(1.5)';
            }, index * 10);
        });
    }, 2800);

    // Phase 4: Jump off the page effect (0.5s)
    setTimeout(() => {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 20%;
            background: linear-gradient(to bottom, #FFFFFF, transparent);
            opacity: 0;
        `;
        overlay.appendChild(flash);
        setTimeout(() => {
            flash.style.transition = 'all 0.3s ease';
            flash.style.opacity = '1';
        }, 10);
        setTimeout(() => {
            flash.style.opacity = '0';
        }, 400);
    }, 4200);

    // Cleanup
    setTimeout(() => {
        overlay.style.display = 'none';
        overlay.innerHTML = '';
    }, duration + 500);
}

// ===================================
// ROI Calculator - Range-Based
// ===================================
function initROICalculator() {
    const minSavingsInput = document.getElementById('minSavings');
    const maxSavingsInput = document.getElementById('maxSavings');
    const minSavingsValue = document.getElementById('minSavingsValue');
    const maxSavingsValue = document.getElementById('maxSavingsValue');

    if (minSavingsInput && minSavingsValue) {
        minSavingsInput.addEventListener('input', function() {
            minSavingsValue.textContent = this.value + '%';
            // Ensure max is always greater than min
            if (maxSavingsInput && parseInt(this.value) > parseInt(maxSavingsInput.value)) {
                maxSavingsInput.value = this.value;
                maxSavingsValue.textContent = this.value + '%';
            }
        });
    }

    if (maxSavingsInput && maxSavingsValue) {
        maxSavingsInput.addEventListener('input', function() {
            maxSavingsValue.textContent = this.value + '%';
            // Ensure min is always less than max
            if (minSavingsInput && parseInt(this.value) < parseInt(minSavingsInput.value)) {
                minSavingsInput.value = this.value;
                minSavingsValue.textContent = this.value + '%';
            }
        });
    }
}

function calculateROI() {
    const currentCost = parseFloat(document.getElementById('currentCost').value) || 0;
    const minSavingsPercent = parseFloat(document.getElementById('minSavings').value) || 50;
    const maxSavingsPercent = parseFloat(document.getElementById('maxSavings').value) || 70;
    const installationCost = parseFloat(document.getElementById('installationCost').value) || 0;

    if (currentCost === 0) {
        alert('Please enter your current monthly energy cost');
        return;
    }

    if (installationCost === 0) {
        alert('Please enter the estimated installation cost');
        return;
    }

    // Calculate minimum (conservative) savings
    const minMonthlySavings = currentCost * (minSavingsPercent / 100);
    const minAnnualSavings = minMonthlySavings * 12;
    const maxROIMonths = Math.ceil(installationCost / minMonthlySavings);
    const minFiveYearSavings = (minAnnualSavings * 5) - installationCost;

    // Calculate maximum (optimistic) savings
    const maxMonthlySavings = currentCost * (maxSavingsPercent / 100);
    const maxAnnualSavings = maxMonthlySavings * 12;
    const minROIMonths = Math.ceil(installationCost / maxMonthlySavings);
    const maxFiveYearSavings = (maxAnnualSavings * 5) - installationCost;

    // Display MINIMUM (Conservative) results
    document.getElementById('minMonthlySavings').textContent = '$' + minMonthlySavings.toLocaleString('en-US', { maximumFractionDigits: 0 });
    document.getElementById('minAnnualSavings').textContent = '$' + minAnnualSavings.toLocaleString('en-US', { maximumFractionDigits: 0 });
    document.getElementById('maxROIPeriod').textContent = maxROIMonths + ' months';
    document.getElementById('minFiveYearSavings').textContent = '$' + minFiveYearSavings.toLocaleString('en-US', { maximumFractionDigits: 0 });

    // Display MAXIMUM (Optimistic) results
    document.getElementById('maxMonthlySavings').textContent = '$' + maxMonthlySavings.toLocaleString('en-US', { maximumFractionDigits: 0 });
    document.getElementById('maxAnnualSavings').textContent = '$' + maxAnnualSavings.toLocaleString('en-US', { maximumFractionDigits: 0 });
    document.getElementById('minROIPeriod').textContent = minROIMonths + ' months';
    document.getElementById('maxFiveYearSavings').textContent = '$' + maxFiveYearSavings.toLocaleString('en-US', { maximumFractionDigits: 0 });

    // Show results with animation
    const resultsDiv = document.getElementById('calculatorResults');
    resultsDiv.style.display = 'grid';
    resultsDiv.style.opacity = '0';
    resultsDiv.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        resultsDiv.style.transition = 'all 0.5s ease';
        resultsDiv.style.opacity = '1';
        resultsDiv.style.transform = 'translateY(0)';
    }, 10);

    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===================================
// Contact Form
// ===================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                company: document.getElementById('company').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                venueType: document.getElementById('venueType').value,
                message: document.getElementById('message').value,
                interests: []
            };

            // Get checked interests
            const interestCheckboxes = document.querySelectorAll('input[name="interest"]:checked');
            interestCheckboxes.forEach(checkbox => {
                formData.interests.push(checkbox.value);
            });

            // Validate form
            if (!formData.firstName || !formData.lastName || !formData.company || 
                !formData.email || !formData.phone || !formData.venueType) {
                alert('Please fill in all required fields');
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                alert('Please enter a valid email address');
                return;
            }

            // Log form data (In production, this would be sent to a server)
            console.log('Form submitted:', formData);

            // Show success message
            document.querySelector('.contact-form').style.display = 'none';
            document.getElementById('formSuccess').style.display = 'block';

            // Simulate form reset after 5 seconds
            setTimeout(() => {
                form.reset();
                document.querySelector('.contact-form').style.display = 'block';
                document.getElementById('formSuccess').style.display = 'none';
            }, 5000);
        });
    }
}

// ===================================
// Scroll to Top Button
// ===================================
function initScrollToTop() {
    const scrollBtn = document.getElementById('scrollToTop');
    
    if (scrollBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 500) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        });

        scrollBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ===================================
// Scroll Animations
// ===================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements that should animate on scroll
    const animateElements = document.querySelectorAll('.service-card, .feature-item');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// ===================================
// Utility Functions
// ===================================

// Format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make triggerSequence and calculateROI available globally
window.triggerSequence = triggerSequence;
window.calculateROI = calculateROI;
