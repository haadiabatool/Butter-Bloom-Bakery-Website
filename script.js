const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');

    function toggleMenu() {
      const isOpen = navMenu.classList.toggle('open');
      mobileMenuBtn.classList.toggle('is-open', isOpen);
      mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    }

    mobileMenuBtn.addEventListener('click', toggleMenu);

    // Close menu when any link is clicked on mobile/tablet
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileMenuBtn.classList.remove('is-open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });


// 2. DISCOVER BUTTONS -> STORE & REDIRECT TO CATEGORIES

const discoverButtons = document.querySelectorAll('.btn-discover');

discoverButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    const selectedCategory = button.getAttribute('data-category');
    if (selectedCategory) {
      // Store selected category in localStorage as well as URL query param
      localStorage.setItem('butterBloomSelectedCategory', selectedCategory);
    }
  });
});