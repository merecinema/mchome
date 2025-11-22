// Navigation
const navbar = document.getElementById('navbar');

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
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
                heroVideo.style.transform = `translate(-50%, -50%) scale(${scale})`;
            } else if (heroVideo) {
                // 스크롤 범위를 벗어나면 기본 상태로 복원
                heroVideo.style.transform = 'translate(-50%, -50%)';
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
