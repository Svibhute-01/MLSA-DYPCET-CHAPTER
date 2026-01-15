// Navbar scroll effect
const onScroll = () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 10) {
    navbar.classList.add('nav-scrolled');
  } else {
    navbar.classList.remove('nav-scrolled');
  }
};

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced motion preference once
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Add scroll event listener
  window.addEventListener('scroll', onScroll);
  onScroll(); // Initial check

  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  const revealOnScroll = () => {
    reveals.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;
      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('in');
      }
    });
  };

  // Initial reveal check
  revealOnScroll();
  window.addEventListener('scroll', revealOnScroll);

  // Typewriter effect
  const typewriterText = [
    'Empowering student developers',
    'Building tech community',
    'Learning & growing together',
    'Driving innovation'
  ];
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typewriterInterval;
  const typeSpeed = 100;
  const deleteSpeed = 50;
  const pauseBetweenWords = 2000;
  const element = document.getElementById('typed');

  const typeWriter = () => {
    const currentText = typewriterText[textIndex];
    
    if (isDeleting) {
      // Deleting text
      element.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
      
      if (charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % typewriterText.length;
      }
    } else {
      // Typing text
      element.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
      
      if (charIndex === currentText.length) {
        isDeleting = true;
        clearInterval(typewriterInterval);
        typewriterInterval = setInterval(typeWriter, pauseBetweenWords);
        return;
      }
    }
    
    // Set appropriate speed
    const speed = isDeleting ? deleteSpeed : typeSpeed;
    clearInterval(typewriterInterval);
    typewriterInterval = setInterval(typeWriter, speed);
  };

  // Start the typewriter effect if reduced motion is not preferred
  if (!prefersReduced) {
    typewriterInterval = setInterval(typeWriter, typeSpeed);
  }

  // Matrix background effect
  const canvas = document.getElementById('matrix-canvas');
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext('2d');
    const characters = "01";
    const fontSize = 16;
    let columns;
    let drops = [];

    const resizeMatrix = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array(columns).fill(1);
    };

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 15, 28, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#00ff88';
      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        drops[i]++;
      }
    };

    // Initialize and start animation
    resizeMatrix();
    window.addEventListener('resize', resizeMatrix);
    setInterval(draw, 33);
  }

  // Team slider functionality
  const slider = document.getElementById('teamsSlider');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dots = document.querySelectorAll('.slider-dot');
  let currentSlide = 0;
  const slideCount = document.querySelectorAll('.team-slide').length;
  const slideWidth = 100 / 3; // 3 slides visible at a time

  const updateSlider = () => {
    slider.style.transform = `translateX(-${currentSlide * slideWidth}%)`;
    
    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === Math.floor(currentSlide / 3));
    });
  };

  // Navigation buttons
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      currentSlide = Math.max(0, currentSlide - 1);
      updateSlider();
    });

    nextBtn.addEventListener('click', () => {
      currentSlide = Math.min(slideCount - 1, currentSlide + 1);
      updateSlider();
    });
  }

  // Dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentSlide = index * 3; // Jump to the first slide of the group
      updateSlider();
    });
  });

  // Touch events for mobile swipe
  let touchStartX = 0;
  let touchEndX = 0;

  const handleSwipe = () => {
    const swipeThreshold = 50;
    const swipeDistance = touchStartX - touchEndX;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        // Swipe left
        currentSlide = Math.min(slideCount - 1, currentSlide + 1);
      } else {
        // Swipe right
        currentSlide = Math.max(0, currentSlide - 1);
      }
      updateSlider();
    }
  };

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, false);

  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, false);

  // Floating code snippets and logo
  const floatHost = document.getElementById('code-floats');
  const snippets = [
    'git push origin main',
    'npm run dev',
    'console.log("MLSA")',
    '<div class="card">',
    'kubectl get pods',
    'pip install fastapi',
    'az login',
    'SELECT * FROM members;',
    'curl -sL ...',
    'npx create-next-app',
    'docker compose up',
    'gh repo clone org/app'
  ];

  // Add your MLSA logo URL here
  const mlsaLogoUrl = 'assets/mlsa.jpeg';

  function spawnFloat() {
    if (prefersReduced) return;
    
    // Create container for the floating element
    const container = document.createElement('div');
    container.className = 'code-float';
    
    // Decide whether to show text or logo (20% chance for logo)
    const showLogo = Math.random() < 0.2;
    
    if (showLogo) {
      // Create logo element
      const logo = document.createElement('img');
      logo.src = mlsaLogoUrl;
      logo.alt = 'MLSA Logo';
      logo.style.width = '40px';
      logo.style.height = '40px';
      logo.style.filter = 'drop-shadow(0 0 6px rgba(0,255,136,0.8))';
      container.appendChild(logo);
      container.style.color = 'transparent';
    } else {
      // Create text element
      const text = document.createElement('span');
      text.textContent = snippets[Math.floor(Math.random() * snippets.length)];
      text.style.color = Math.random() > 0.5 ? 'rgba(0,229,255,0.85)' : 'rgba(0,255,136,0.85)';
      text.style.fontSize = (0.75 + Math.random() * 0.6) + 'rem';
      text.style.textShadow = '0 0 8px currentColor';
      container.appendChild(text);
    }

    const startX = Math.random() * window.innerWidth * 0.9;
    const startY = window.innerHeight + Math.random() * 200;
    container.style.left = startX + 'px';
    container.style.top = startY + 'px';

    // Random animation duration between 15-25 seconds
    const duration = 15 + Math.random() * 10;
    container.style.animation = `drift ${duration}s linear forwards`;
    container.style.animationDelay = Math.random() * 5 + 's';

    // Add to DOM
    floatHost.appendChild(container);

    // Remove after animation completes
    setTimeout(() => {
      container.remove();
    }, (duration + 5) * 1000);
  }

  // Start spawning floats if not in reduced motion mode
  if (!prefersReduced) {
    setInterval(spawnFloat, 1000);
  }
});
