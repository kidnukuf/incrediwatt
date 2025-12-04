// ===================================
// IncrediWatt Solutions - Main JavaScript
// ===================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initHeroLights();
    initJackpotSequence();
    initROICalculator();
    initPortfolioFilters();
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
    mobileMenuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            const icon = mobileMenuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
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

    // Create animated light dots
    for (let i = 0; i < 30; i++) {
        const light = document.createElement('div');
        light.style.position = 'absolute';
        light.style.width = Math.random() * 4 + 2 + 'px';
        light.style.height = light.style.width;
        light.style.borderRadius = '50%';
        light.style.left = Math.random() * 100 + '%';
        light.style.top = Math.random() * 100 + '%';
        
        const colors = ['#FFD700', '#7C3AED', '#06B6D4', '#10B981', '#EF4444'];
        light.style.background = colors[Math.floor(Math.random() * colors.length)];
        light.style.boxShadow = `0 0 10px currentColor`;
        
        // Random animation
        light.style.animation = `float ${Math.random() * 10 + 5}s ease-in-out infinite`;
        light.style.animationDelay = Math.random() * 5 + 's';
        
        heroLights.appendChild(light);
    }

    // Add keyframes for floating animation
    if (!document.querySelector('#float-animation')) {
        const style = document.createElement('style');
        style.id = 'float-animation';
        style.textContent = `
            @keyframes float {
                0%, 100% {
                    transform: translate(0, 0);
                    opacity: 0.3;
                }
                25% {
                    transform: translate(20px, -20px);
                    opacity: 0.6;
                }
                50% {
                    transform: translate(-15px, -40px);
                    opacity: 0.9;
                }
                75% {
                    transform: translate(-25px, -20px);
                    opacity: 0.5;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ===================================
// Jackpot Sequence Demo
// ===================================
function initJackpotSequence() {
    const lightStrip = document.getElementById('lightStrip');
    if (!lightStrip) return;

    // Create 12 lights
    for (let i = 0; i < 12; i++) {
        const light = document.createElement('div');
        light.className = 'light';
        light.dataset.index = i;
        lightStrip.appendChild(light);
    }

    // Auto-play demo on load
    setTimeout(() => {
        triggerSequence('wave');
    }, 1000);
}

// Jackpot sequence patterns
function triggerSequence(type) {
    const lights = document.querySelectorAll('.light');
    const colors = {
        jackpot: ['#FFD700', '#FFA500', '#FF6B6B'],
        celebration: ['#7C3AED', '#3B82F6', '#06B6D4'],
        wave: ['#10B981', '#06B6D4', '#7C3AED'],
        rainbow: ['#EF4444', '#F59E0B', '#FFD700', '#10B981', '#06B6D4', '#7C3AED']
    };

    // Reset all lights
    lights.forEach(light => {
        light.classList.remove('active');
        light.style.background = '#334155';
    });

    switch(type) {
        case 'jackpot':
            jackpotAnimation(lights, colors.jackpot);
            break;
        case 'celebration':
            celebrationAnimation(lights, colors.celebration);
            break;
        case 'wave':
            waveAnimation(lights, colors.wave);
            break;
        case 'rainbow':
            rainbowAnimation(lights, colors.rainbow);
            break;
    }
}

function jackpotAnimation(lights, colors) {
    let iteration = 0;
    const maxIterations = 3;

    function animate() {
        lights.forEach((light, i) => {
            setTimeout(() => {
                const colorIndex = Math.floor(Math.random() * colors.length);
                light.style.background = colors[colorIndex];
                light.style.color = colors[colorIndex];
                light.classList.add('active');
                
                setTimeout(() => {
                    light.classList.remove('active');
                    light.style.background = '#334155';
                }, 200);
            }, i * 50);
        });

        iteration++;
        if (iteration < maxIterations) {
            setTimeout(animate, lights.length * 50 + 200);
        } else {
            // Final celebration
            setTimeout(() => {
                lights.forEach(light => {
                    light.style.background = colors[0];
                    light.style.color = colors[0];
                    light.classList.add('active');
                });
            }, lights.length * 50 + 200);
        }
    }

    animate();
}

function celebrationAnimation(lights, colors) {
    let round = 0;
    const maxRounds = 5;

    function animate() {
        const evenLights = Array.from(lights).filter((_, i) => i % 2 === 0);
        const oddLights = Array.from(lights).filter((_, i) => i % 2 === 1);

        evenLights.forEach(light => {
            light.style.background = colors[round % colors.length];
            light.style.color = colors[round % colors.length];
            light.classList.add('active');
        });

        setTimeout(() => {
            evenLights.forEach(light => {
                light.classList.remove('active');
                light.style.background = '#334155';
            });

            oddLights.forEach(light => {
                light.style.background = colors[(round + 1) % colors.length];
                light.style.color = colors[(round + 1) % colors.length];
                light.classList.add('active');
            });

            setTimeout(() => {
                oddLights.forEach(light => {
                    light.classList.remove('active');
                    light.style.background = '#334155';
                });
            }, 300);
        }, 300);

        round++;
        if (round < maxRounds) {
            setTimeout(animate, 600);
        }
    }

    animate();
}

function waveAnimation(lights, colors) {
    let wave = 0;
    const maxWaves = 4;

    function animate() {
        lights.forEach((light, i) => {
            setTimeout(() => {
                const colorIndex = i % colors.length;
                light.style.background = colors[colorIndex];
                light.style.color = colors[colorIndex];
                light.classList.add('active');

                setTimeout(() => {
                    light.classList.remove('active');
                    light.style.background = '#334155';
                }, 500);
            }, i * 80);
        });

        wave++;
        if (wave < maxWaves) {
            setTimeout(animate, lights.length * 80 + 200);
        }
    }

    animate();
}

function rainbowAnimation(lights, colors) {
    let position = 0;
    const duration = 3000;
    const interval = 100;
    const steps = duration / interval;

    const intervalId = setInterval(() => {
        lights.forEach((light, i) => {
            const colorIndex = (i + position) % colors.length;
            light.style.background = colors[colorIndex];
            light.style.color = colors[colorIndex];
            light.classList.add('active');
        });

        position++;
        if (position >= steps) {
            clearInterval(intervalId);
            setTimeout(() => {
                lights.forEach(light => {
                    light.classList.remove('active');
                    light.style.background = '#334155';
                });
            }, 500);
        }
    }, interval);
}

// ===================================
// ROI Calculator
// ===================================
function initROICalculator() {
    const savingsPercentInput = document.getElementById('savingsPercent');
    const savingsPercentValue = document.getElementById('savingsPercentValue');

    if (savingsPercentInput && savingsPercentValue) {
        savingsPercentInput.addEventListener('input', function() {
            savingsPercentValue.textContent = this.value + '%';
        });
    }

    // Trigger initial calculation if values are present
    const currentCost = document.getElementById('currentCost');
    if (currentCost && currentCost.value) {
        calculateROI();
    }
}

function calculateROI() {
    const currentCost = parseFloat(document.getElementById('currentCost').value) || 0;
    const savingsPercent = parseFloat(document.getElementById('savingsPercent').value) || 70;
    const installationCost = parseFloat(document.getElementById('installationCost').value) || 0;

    if (currentCost === 0) {
        alert('Please enter your current monthly energy cost');
        return;
    }

    // Calculate savings
    const monthlySavings = currentCost * (savingsPercent / 100);
    const annualSavings = monthlySavings * 12;
    const roiMonths = Math.ceil(installationCost / monthlySavings);
    const fiveYearSavings = (annualSavings * 5) - installationCost;

    // Display results
    document.getElementById('monthlySavings').textContent = '$' + monthlySavings.toLocaleString('en-US', { maximumFractionDigits: 0 });
    document.getElementById('annualSavings').textContent = '$' + annualSavings.toLocaleString('en-US', { maximumFractionDigits: 0 });
    document.getElementById('roiPeriod').textContent = roiMonths + ' months';
    document.getElementById('fiveYearSavings').textContent = '$' + fiveYearSavings.toLocaleString('en-US', { maximumFractionDigits: 0 });

    // Show results with animation
    const resultsDiv = document.getElementById('calculatorResults');
    resultsDiv.style.display = 'block';
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
// Portfolio Filters
// ===================================
function initPortfolioFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;

            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Filter portfolio items
            portfolioItems.forEach(item => {
                const category = item.dataset.category;
                
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    // Animate in
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.transition = 'all 0.4s ease';
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.transition = 'all 0.3s ease';
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
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
    const animateElements = document.querySelectorAll('.service-card, .portfolio-item, .testimonial-card, .feature-item');
    
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

// Make triggerSequence available globally for inline onclick handlers
window.triggerSequence = triggerSequence;
window.calculateROI = calculateROI;
