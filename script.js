const burger = document.getElementById('hamburger');
const navMenu = document.getElementById('menu-links');

burger.addEventListener('click', () => {
    navMenu.classList.toggle('menu-hidden');
});

// ==========================================
// SYSTÈME DE COMPÉTENCES (FILTRES ET MODALES)
// ==========================================
const skillFilter = document.getElementById('skill-filter');
const skillsBoard = document.getElementById('skills-board');
const skillCards = document.querySelectorAll('.skill-card');
const geiiHeaders = document.querySelectorAll('.geii-header');

const modal = document.getElementById('skill-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const closeModal = document.getElementById('close-modal');

if (skillFilter && skillsBoard) {
    
    // 1. GESTION DES FILTRES
    skillFilter.addEventListener('change', (e) => {
        const selectedLabel = e.target.value;

        // Si GEII est sélectionné, on active les couleurs spécifiques
        if (selectedLabel === 'geii') {
            skillsBoard.classList.add('geii-active');
        } else {
            skillsBoard.classList.remove('geii-active');
        }

        // Afficher/Cacher les titres GEII (Concevoir, Vérifier...)
        geiiHeaders.forEach(header => {
            header.style.display = (selectedLabel === 'geii') ? 'block' : 'none';
        });

        // Afficher/Cacher les cartes
        skillCards.forEach(card => {
            if (selectedLabel === 'all' || card.dataset.label === selectedLabel) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // 2. GESTION DE LA FENÊTRE MODALE (POP-UP)
    skillCards.forEach(card => {
        card.addEventListener('click', () => {
            // Récupérer le titre de la carte
            const title = card.querySelector('h3').innerText;
            // Récupérer le HTML caché dans .skill-details
            const detailsHTML = card.querySelector('.skill-details').innerHTML;

            // Remplir la modale
            modalTitle.innerText = title;
            modalBody.innerHTML = detailsHTML;

            // Afficher la modale
            modal.classList.remove('modal-hidden');
            modal.classList.add('modal-visible');
        });
    });

    // 3. FERMER LA MODALE
    const closeAction = () => {
        modal.classList.add('modal-hidden');
        modal.classList.remove('modal-visible');
    };

    // Fermer avec le bouton X
    closeModal.addEventListener('click', closeAction);

    // Fermer en cliquant dans le flou autour
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeAction();
        }
    });
}

// --- LOGIQUE DES CARROUSELS AUTOMATIQUES ---

const carousels = document.querySelectorAll('.carousel-slide');

carousels.forEach((carousel) => {
    let isPaused = false;
    let autoScroll;

    // Fonction pour faire défiler
    const scrollNext = () => {
        if (isPaused) return;

        const slideWidth = carousel.clientWidth;
        const maxScroll = carousel.scrollWidth - slideWidth;

        if (carousel.scrollLeft >= maxScroll - 5) {
            // Si on est à la fin, on revient au début en douceur
            carousel.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            // Sinon, on passe à l'image suivante
            carousel.scrollBy({ left: slideWidth, behavior: 'smooth' });
        }
    };

    // Fonction pour initialiser/redémarrer proprement le compteur de 3 secondes
    const startInterval = () => {
        clearInterval(autoScroll);
        autoScroll = setInterval(scrollNext, 3000);
    };

    // Lancement initial au chargement
    startInterval();

    // MODIFICATION ICI : On met en pause uniquement au clic/swipe de l'utilisateur
    carousel.addEventListener('mousedown', () => isPaused = true, { passive: true });
    carousel.addEventListener('touchstart', () => isPaused = true, { passive: true });

    // On relance le compteur à zéro pour redonner 3 secondes complètes après l'action
    const releaseCarousel = () => {
        if (isPaused) {
            isPaused = false;
            startInterval(); 
        }
    };

    window.addEventListener('mouseup', releaseCarousel, { passive: true });
    window.addEventListener('touchend', releaseCarousel, { passive: true });
});

// --- COULEUR DE FOND DYNAMIQUE (PAGE PHOTO UNIQUEMENT) ---
const isPhotoPage = document.querySelector('body.photo-theme');

if (isPhotoPage) {
    let activeCarousel = null;

    // 1. Fonction qui change la couleur en fonction du scroll du carrousel
    const updateBackgroundColor = (carousel) => {
        if (!carousel) return;
        const images = carousel.querySelectorAll('img');
        
        // On calcule quelle image est actuellement au centre
        const index = Math.round(carousel.scrollLeft / carousel.clientWidth);
        
        if (images[index] && images[index].dataset.color) {
            document.body.style.backgroundColor = images[index].dataset.color;
        }
    };

    // 2. Observer pour détecter QUEL carrousel est affiché à l'écran
    const carouselObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                activeCarousel = entry.target; // Ce carrousel devient l'actif
                updateBackgroundColor(activeCarousel);
            }
        });
    }, { threshold: 0.6 }); // Déclenche quand 60% du carrousel est visible

    // 3. Observer pour réinitialiser la couleur quand on remonte tout en haut (Bannière)
    const bannerObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            document.body.style.backgroundColor = 'var(--bg-dark)';
            activeCarousel = null;
        }
    }, { threshold: 0.3 });
    
    // CORRECTION ICI : Sécurisation de la cible de la bannière photo
    const photoBanner = document.querySelector('.photo-banner-bg');
    if (photoBanner) bannerObserver.observe(photoBanner);

    // 4. On attache l'observer et l'écouteur de scroll à chaque carrousel
    carousels.forEach(carousel => {
        carouselObserver.observe(carousel);

        // Quand le carrousel défile (manuellement ou auto), on met à jour la couleur
        carousel.addEventListener('scroll', () => {
            // On ne change la couleur que si c'est LE carrousel que l'utilisateur regarde
            if (activeCarousel === carousel) {
                updateBackgroundColor(carousel);
            }
        });
    });
}