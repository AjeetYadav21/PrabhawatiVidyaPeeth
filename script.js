// ============================================
// PRABHAWATI VIDYAPEETH - INTERACTIVE FEATURES
// ============================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {

    // ============================================
    // ANIMATED STARS IN HERO SECTION WITH CIRCULAR ORBITS
    // ============================================
    const starsContainer = document.getElementById('stars');

    if (starsContainer) {
        // Create multiple stars with random properties
        const numberOfStars = 50;

        // Orbit animation options
        const orbitAnimations = [
            'orbit-small',
            'orbit-medium',
            'orbit-large',
            'orbit-reverse-small',
            'orbit-reverse-medium'
        ];

        for (let i = 0; i < numberOfStars; i++) {
            const star = document.createElement('div');
            star.className = 'star';

            // Random position
            const left = Math.random() * 100;
            const top = Math.random() * 100;

            // Random size (1-3px)
            const size = Math.random() * 2 + 1;

            // Random animation duration (3-8 seconds for smoother orbital movement)
            const twinkleDuration = Math.random() * 3 + 3;
            const orbitDuration = Math.random() * 10 + 8;

            // Random delay to stagger animations
            const delay = Math.random() * 4;

            // Random orbit animation
            const orbitType = orbitAnimations[Math.floor(Math.random() * orbitAnimations.length)];

            // Apply styles
            star.style.left = `${left}%`;
            star.style.top = `${top}%`;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.setProperty('--duration', `${twinkleDuration}s`);
            star.style.animationDelay = `${delay}s`;

            // Combine twinkle with circular orbit movement
            // Most stars orbit, some just twinkle
            if (Math.random() > 0.3) {
                // Most stars get orbital movement + twinkle
                star.style.animation = `
                    twinkle ${twinkleDuration}s ease-in-out infinite ${delay}s,
                    ${orbitType} ${orbitDuration}s linear infinite ${delay}s
                `;
            } else {
                // Some stars just twinkle in place
                star.style.animation = `twinkle ${twinkleDuration}s ease-in-out infinite ${delay}s`;
            }

            starsContainer.appendChild(star);
        }
    }

    // ============================================
    // MOBILE NAVIGATION
    // ============================================
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    menuToggle.addEventListener('click', function () {
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function (event) {
        const isClickInside = navMenu.contains(event.target) || menuToggle.contains(event.target);
        if (!isClickInside && navMenu.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // ============================================
    // STICKY HEADER ON SCROLL
    // ============================================
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', function () {
        const currentScroll = window.pageYOffset;

        // Add shadow when scrolled
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // ============================================
    // ACTIVE NAVIGATION HIGHLIGHTING
    // ============================================
    const sections = document.querySelectorAll('section[id]');

    function highlightNavigation() {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) {
                    navLink.classList.add('active');
                }
            }
        });
    }

    window.addEventListener('scroll', highlightNavigation);

    // ============================================
    // SMOOTH SCROLLING
    // ============================================
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Only handle internal links
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ============================================
    // SCROLL REVEAL ANIMATIONS
    // ============================================
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        }
    );

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    // ============================================
    // GALLERY LIGHTBOX
    // ============================================
    const galleryItems = document.querySelectorAll('.gallery-item');
    let lightbox = null;

    // Create lightbox element
    function createLightbox() {
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'lightbox';
            lightbox.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                cursor: pointer;
                padding: 20px;
            `;

            const lightboxImg = document.createElement('img');
            lightboxImg.id = 'lightboxImg';
            lightboxImg.style.cssText = `
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
                border-radius: 8px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            `;

            const closeBtn = document.createElement('span');
            closeBtn.innerHTML = '×';
            closeBtn.style.cssText = `
                position: absolute;
                top: 20px;
                right: 40px;
                font-size: 60px;
                color: white;
                cursor: pointer;
                font-weight: 300;
                transition: color 0.3s;
            `;
            closeBtn.addEventListener('mouseenter', () => closeBtn.style.color = '#f97316');
            closeBtn.addEventListener('mouseleave', () => closeBtn.style.color = 'white');

            lightbox.appendChild(lightboxImg);
            lightbox.appendChild(closeBtn);
            document.body.appendChild(lightbox);

            // Close on click
            lightbox.addEventListener('click', closeLightbox);
            closeBtn.addEventListener('click', closeLightbox);

            // Prevent closing when clicking image
            lightboxImg.addEventListener('click', (e) => e.stopPropagation());

            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && lightbox.style.display === 'flex') {
                    closeLightbox();
                }
            });
        }
    }

    function openLightbox(imageSrc) {
        createLightbox();
        const lightboxImg = document.getElementById('lightboxImg');
        lightboxImg.src = imageSrc;
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Add click handlers to gallery items
    galleryItems.forEach(item => {
        item.addEventListener('click', function () {
            const img = this.querySelector('img');
            if (img) {
                openLightbox(img.src);
            }
        });
    });

    // ============================================
    // CONTACT FORM HANDLING
    // ============================================
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        // Validate form
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            showFormMessage('Please fill in all required fields.', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showFormMessage('Please enter a valid email address.', 'error');
            return;
        }

        // Simulate form submission (replace with actual backend integration)
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Simulate server response (replace with actual API call)
        setTimeout(() => {
            // Success
            showFormMessage('Thank you for your message! We will get back to you soon.', 'success');
            contactForm.reset();
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;

            // Hide message after 5 seconds
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        }, 1500);
    });

    function showFormMessage(message, type) {
        formMessage.textContent = message;
        formMessage.style.display = 'block';
        formMessage.style.padding = '1rem';
        formMessage.style.borderRadius = '0.5rem';
        formMessage.style.marginTop = '1rem';

        if (type === 'success') {
            formMessage.style.backgroundColor = '#d1fae5';
            formMessage.style.color = '#065f46';
            formMessage.style.border = '1px solid #10b981';
        } else {
            formMessage.style.backgroundColor = '#fee2e2';
            formMessage.style.color = '#991b1b';
            formMessage.style.border = '1px solid #ef4444';
        }
    }

    // ============================================
    // BACK TO TOP BUTTON
    // ============================================
    const backToTopBtn = document.getElementById('backToTop');

    window.addEventListener('scroll', function () {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ============================================
    // LAZY LOADING IMAGES
    // ============================================
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('loading' in HTMLImageElement.prototype) {
        // Browser supports native lazy loading
        images.forEach(img => {
            img.src = img.src;
        });
    } else {
        // Fallback for browsers that don't support native lazy loading
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src;
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => {
            imageObserver.observe(img);
        });
    }

    // ============================================
    // ANIMATION ON HOVER FOR CARDS
    // ============================================
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-8px)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(-4px)';
        });
    });

    // ============================================
    // PREVENT FORM RESUBMISSION
    // ============================================
    if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.href);
    }

    // ============================================
    // CONSOLE MESSAGE
    // ============================================
    console.log('%cPrabhawati Vidyapeeth', 'font-size: 24px; font-weight: bold; color: #1e3a8a;');
    console.log('%cEmpowering Young Minds for a Brighter Future', 'font-size: 14px; color: #f97316;');
    console.log('%cWebsite built with ❤️ for education', 'font-size: 12px; color: #6b7280;');

});

// ============================================
// PRELOADER (Optional)
// ============================================
window.addEventListener('load', function () {
    // Hide preloader if it exists
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
});
