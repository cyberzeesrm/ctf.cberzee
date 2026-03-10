// --- 1. Canvas Particle System (Space/Cyberpunk Hybrid) ---
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

function initCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];

    // Amount of particles based on screen width
    const particleCount = Math.floor(Math.min(window.innerWidth / 8, 180));

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Varying sizes for "depth"
        this.size = Math.random() * 2 + 0.5;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;

        // Slower drifting speed
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;

        // Randomly assign color (white, purple, light blue)
        const colors = ['#ffffff', '#8736ff', '#b976ff', '#dcd0ff', '#4d4dff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.5 + 0.1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around screen beautifully
        if (this.x > width + 10) this.x = -10;
        else if (this.x < -10) this.x = width + 10;
        if (this.y > height + 10) this.y = -10;
        else if (this.y < -10) this.y = height + 10;

        // Subtle twinkling effect
        if (Math.random() > 0.98) {
            this.opacity = Math.random() * 0.8 + 0.2;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Add glow to larger particles
        if (this.size > 1.5) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
        } else {
            ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;
    }
}

// Mouse interaction tracking
let mouse = {
    x: null,
    y: null,
    radius: 150
}

window.addEventListener('mousemove', function (event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

window.addEventListener('mouseout', function () {
    mouse.x = undefined;
    mouse.y = undefined;
});

function animateParticles() {
    ctx.clearRect(0, 0, width, height);

    // Draw constellation lines
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Connect close particles
            if (distance < 80) {
                // Calculate opacity based on distance
                const opacity = 1 - (distance / 80);
                ctx.strokeStyle = `rgba(135, 54, 255, ${opacity * 0.3})`;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }

        // Mouse interaction (repel slightly)
        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - particles[i].x;
            let dy = mouse.y - particles[i].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
                // Gently push particles away
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouse.radius - distance) / mouse.radius;
                const directionX = forceDirectionX * force * this.density;
                const directionY = forceDirectionY * force * this.density;

                // Max force limit
                particles[i].x -= forceDirectionX * 1;
                particles[i].y -= forceDirectionY * 1;
            }
        }
    }

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animateParticles);
}

// Initialize and start
window.addEventListener('resize', initCanvas);
initCanvas();
animateParticles();

// --- 2. Countdown Timer ---
// Set target to March 14, 10:30 AM
const targetDate = new Date();
targetDate.setMonth(2); // March is 0-indexed (2)
targetDate.setDate(14);
targetDate.setHours(10, 30, 0, 0);

const targetTime = targetDate.getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetTime - now;

    if (distance < 0) {
        document.getElementById("days").innerText = "00";
        document.getElementById("hours").innerText = "00";
        document.getElementById("minutes").innerText = "00";
        document.getElementById("seconds").innerText = "00";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = days.toString().padStart(2, '0');
    document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
    document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
    document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');
}

setInterval(updateCountdown, 1000);
updateCountdown();

// --- 3. 3D Card Parallax Effect ---
const card = document.querySelector('.glass-card');

// Only apply on desktop
if (window.matchMedia("(min-width: 768px)").matches) {
    document.addEventListener('mousemove', (e) => {
        // Calculate center of screen
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Calculate rotation (max 10 degrees)
        const rotateY = ((mouseX / windowWidth) - 0.5) * 15;
        const rotateX = ((0.5 - (mouseY / windowHeight)) * 15);

        // Apply smooth transform
        card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    document.addEventListener('mouseleave', () => {
        // Reset nicely
        card.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg)`;
        card.style.transition = 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
    });

    document.addEventListener('mouseenter', () => {
        // Remove transition to make it follow mouse instantly
        setTimeout(() => {
            card.style.transition = 'none';
        }, 800);
    });
}
