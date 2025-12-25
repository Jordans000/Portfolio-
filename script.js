// ========================================
// Portfolio JavaScript - Interactivity
// ========================================
// Updated to connect to the backend API

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const navbar = document.getElementById('navbar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.querySelector('.nav-links');
const navLinkItems = document.querySelectorAll('.nav-link');
const contactForm = document.getElementById('contactForm');
const skillCards = document.querySelectorAll('.skill-card');
const projectsGrid = document.querySelector('.projects-grid');

// ========================================
// Navbar Scroll Effect
// ========================================
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ========================================
// Mobile Menu Toggle
// ========================================
mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
});

// Close mobile menu when a link is clicked
navLinkItems.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
    });
});

// ========================================
// Active Navigation Link on Scroll
// ========================================
const sections = document.querySelectorAll('section[id]');

function updateActiveLink() {
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinkItems.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveLink);

// ========================================
// Smooth Scroll for Navigation Links
// ========================================
navLinkItems.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========================================
// Intersection Observer for Animations
// ========================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');

            // Trigger skill bar animation
            if (entry.target.classList.contains('skill-card')) {
                const progressBar = entry.target.querySelector('.skill-progress');
                if (progressBar) {
                    progressBar.style.animationPlayState = 'running';
                }
            }
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.skill-card, .project-card, .about-content, .contact-content').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add animate-in styles
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // Load projects from API
    loadProjects();
});

// ========================================
// CONTACT FORM - Connected to Backend API
// ========================================
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form values
    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    // Simple validation
    if (!name || !email || !message) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    // Update button state
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
        // Send to backend API
        const response = await fetch(`${API_BASE_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, message })
        });

        const data = await response.json();

        if (data.success) {
            showNotification(data.message, 'success');
            contactForm.reset();
        } else {
            showNotification(data.error || 'Failed to send message', 'error');
        }

    } catch (error) {
        console.error('API Error:', error);
        // Fallback message if API is not running
        showNotification('Message saved! (Note: Start the backend server for full functionality)', 'info');
        contactForm.reset();
    }

    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
});

// ========================================
// LOAD PROJECTS FROM API
// ========================================
async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/projects?featured=true`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            renderProjects(data.data);
            console.log(`✅ Loaded ${data.count} projects from API`);
        }
    } catch (error) {
        console.log('📌 Using static projects (backend not running)');
        // Keep the static HTML projects if API fails
    }
}

// ========================================
// RENDER PROJECTS
// ========================================
function renderProjects(projects) {
    if (!projectsGrid) return;

    // Icon mapping for different project types
    const iconMap = {
        'robotics': '🤖',
        'web': '📱',
        'iot': '🌾',
        'education': '🎓',
        'default': '💻'
    };

    const projectsHTML = projects.map(project => {
        // Determine icon based on tags
        let icon = iconMap.default;
        const tags = project.tags || [];
        if (tags.some(t => t.toLowerCase().includes('arduino') || t.toLowerCase().includes('robot'))) {
            icon = iconMap.robotics;
        } else if (tags.some(t => t.toLowerCase().includes('react') || t.toLowerCase().includes('web'))) {
            icon = iconMap.web;
        } else if (tags.some(t => t.toLowerCase().includes('iot') || t.toLowerCase().includes('sensor'))) {
            icon = iconMap.iot;
        }

        const tagsHTML = tags.map(tag => `<span>${tag}</span>`).join('');

        return `
            <article class="project-card">
                <div class="project-image">
                    <div class="project-placeholder">${icon}</div>
                    <div class="project-overlay">
                        <a href="${project.demo_url || '#'}" class="project-link">View Project</a>
                    </div>
                </div>
                <div class="project-content">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="project-tags">
                        ${tagsHTML}
                    </div>
                </div>
            </article>
        `;
    }).join('');

    projectsGrid.innerHTML = projectsHTML;

    // Re-observe new project cards for animation
    document.querySelectorAll('.project-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ========================================
// Notification System
// ========================================
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add styles
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1';
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        padding: 16px 24px;
        background: ${bgColor};
        color: white;
        border-radius: 12px;
        font-weight: 500;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 350px;
    `;

    document.body.appendChild(notification);

    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add notification animations
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// ========================================
// Parallax Effect for Hero Orbs
// ========================================
document.addEventListener('mousemove', (e) => {
    const orbs = document.querySelectorAll('.gradient-orb');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    orbs.forEach((orb, index) => {
        const speed = (index + 1) * 20;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;
        orb.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// ========================================
// Console Easter Egg
// ========================================
console.log(`
%c👋 Hello there, curious developer!
%cThis portfolio was built with ❤️ by Muwanguzi Jordan
%cTechnologies: HTML5, CSS3, Vanilla JavaScript, Node.js, Express, SQLite
`,
    'font-size: 20px; font-weight: bold;',
    'font-size: 14px; color: #6366f1;',
    'font-size: 12px; color: #888;'
);

// ========================================
// Initialize
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    updateActiveLink();
    document.body.classList.add('loaded');
});
