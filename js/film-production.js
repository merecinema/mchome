// Navigation
const navbar = document.getElementById('navbar');

// Navbar scroll effect
let lastScrollY = 0;
window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScrollY = currentScrollY;
});


// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.contact-title, .contact-item, .film-section');
    animatedElements.forEach(el => observer.observe(el));
});


// Parallax effect for hero video
const heroVideo = document.querySelector('.hero-video');
let isScrolling = false;

window.addEventListener('scroll', () => {
    if (!isScrolling) {
        window.requestAnimationFrame(() => {
            const scrollTop = window.pageYOffset;
            const hero = document.querySelector('.hero');
            
            if (heroVideo && scrollTop < window.innerHeight) {
                const heroHeight = hero.offsetHeight;
                const opacity = 1 - (scrollTop / heroHeight) * 1.5;
                const scale = 1 + (scrollTop / heroHeight) * 0.1;
                
                heroVideo.style.opacity = Math.max(0, opacity);
                heroVideo.style.transform = `scale(${scale})`;
            }
            
            isScrolling = false;
        });
        isScrolling = true;
    }
});

// Video loading optimization
if (heroVideo) {
    heroVideo.addEventListener('loadeddata', () => {
        heroVideo.style.opacity = 1;
    });
    
    // Ensure video plays
    heroVideo.play().catch(e => {
        console.log('Video autoplay prevented:', e);
    });
}

// Keyboard navigation for sections (optional)
let isScrollingManually = false;
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        
        if (isScrollingManually) return;
        isScrollingManually = true;
        
        const currentSection = getCurrentSection();
        const sections = document.querySelectorAll('section[id]');
        const sectionsArray = Array.from(sections);
        const currentIndex = sectionsArray.indexOf(currentSection);
        
        let nextSection;
        if (e.key === 'ArrowDown' && currentIndex < sectionsArray.length - 1) {
            nextSection = sectionsArray[currentIndex + 1];
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
            nextSection = sectionsArray[currentIndex - 1];
        }
        
        if (nextSection) {
            nextSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        
        setTimeout(() => {
            isScrollingManually = false;
        }, 1000);
    }
});

function getCurrentSection() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset + window.innerHeight / 2;
    
    for (let section of sections) {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollY >= sectionTop && scrollY < sectionBottom) {
            return section;
        }
    }
    return sections[0];
}

// Prevent scroll snap interference on mobile
if (window.innerWidth <= 768) {
    document.documentElement.style.scrollSnapType = 'none';
}