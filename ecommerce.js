// ===== GLOBAL VARIABLES =====
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let allProducts = [];
let selectedProduct = null;
let searchTimeout = null;

// ===== GSAP ANIMATIONS =====
gsap.registerPlugin(ScrollTrigger);

// Initialize GSAP animations
function initAnimations() {
    // Hero section animation
    gsap.from("#home h1", {
        duration: 1.2,
        y: 100,
        opacity: 0,
        ease: "power3.out"
    });
    
    gsap.from("#home p", {
        duration: 1.2,
        y: 50,
        opacity: 0,
        ease: "power3.out",
        delay: 0.3
    });
    
    gsap.from("#home button", {
        duration: 1,
        y: 30,
        opacity: 0,
        ease: "back.out(1.7)",
        delay: 0.6
    });

    gsap.from(".hero-image", {
        duration: 1.5,
        x: 100,
        opacity: 0,
        ease: "power3.out",
        delay: 0.8
    });

    // Navbar animation
    gsap.from(".navbar", {
        duration: 1,
        y: -100,
        opacity: 0,
        ease: "power3.out"
    });

    // Products animation
    gsap.from(".card", {
        duration: 0.8,
        y: 50,
        opacity: 0,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
            trigger: "#products",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
        }
    });

    // News animation
    gsap.from("#news .card", {
        duration: 0.8,
        x: -50,
        opacity: 0,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
            trigger: "#news",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
        }
    });

    // Contact form animation
    gsap.from("#contact form", {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: "power3.out",
        scrollTrigger: {
            trigger: "#contact",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
        }
    });
}

// ===== SEARCH FUNCTIONALITY =====
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const searchBtn = document.getElementById('searchBtn');
    const mobileSearchBtn = document.getElementById('mobileSearchBtn');

    // Desktop search
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('focus', showSearchSuggestions);
        searchInput.addEventListener('blur', hideSearchSuggestions);
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    // Mobile search
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', handleSearchInput);
        mobileSearchInput.addEventListener('focus', showSearchSuggestions);
        mobileSearchInput.addEventListener('blur', hideSearchSuggestions);
    }

    if (mobileSearchBtn) {
        mobileSearchBtn.addEventListener('click', performSearch);
    }

    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-container')) {
            hideSearchSuggestions();
        }
    });
}

function handleSearchInput(e) {
    const query = e.target.value.trim();
    
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Set new timeout for search suggestions
    searchTimeout = setTimeout(() => {
        if (query.length >= 2) {
            showSearchSuggestions(query);
        } else {
            hideSearchSuggestions();
        }
    }, 300);
}

function showSearchSuggestions(query = '') {
    const suggestions = document.querySelectorAll('.search-suggestions');
    
    if (!query) {
        // Show recent searches or popular products
        const recentSearches = getRecentSearches();
        suggestions.forEach(container => {
            container.innerHTML = recentSearches.map(item => `
                <div class="search-suggestion-item" data-search="${item}">
                    <div class="search-suggestion-title">
                        <i class="fas fa-history me-2"></i>${item}
                    </div>
                </div>
            `).join('');
            container.style.display = 'block';
        });
        return;
    }

    // Filter products based on query
    const filteredProducts = allProducts.filter(product => 
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    suggestions.forEach(container => {
        if (filteredProducts.length > 0) {
            container.innerHTML = filteredProducts.map(product => `
                <div class="search-suggestion-item" data-product-id="${product.id}">
                    <div class="search-suggestion-title">${product.title}</div>
                    <div class="search-suggestion-category">${product.category} - ${product.price.toFixed(2)} €</div>
                </div>
            `).join('');
        } else {
            container.innerHTML = `
                <div class="search-suggestion-item">
                    <div class="search-suggestion-title">Aucun produit trouvé</div>
                </div>
            `;
        }
        container.style.display = 'block';
    });

    // Add click handlers to suggestions
    addSearchSuggestionHandlers();
}

function hideSearchSuggestions() {
    setTimeout(() => {
        const suggestions = document.querySelectorAll('.search-suggestions');
        suggestions.forEach(container => {
            container.style.display = 'none';
        });
    }, 200);
}

function addSearchSuggestionHandlers() {
    document.querySelectorAll('.search-suggestion-item').forEach(item => {
        item.addEventListener('click', function() {
            const productId = this.dataset.productId;
            const searchTerm = this.dataset.search;
            
            if (productId) {
                // Show product detail
                showProductDetail(parseInt(productId));
                hideSearchSuggestions();
                // Clear search inputs
                document.querySelectorAll('.search-input').forEach(input => input.value = '');
            } else if (searchTerm) {
                // Perform search
                performSearch(searchTerm);
            }
        });
    });
}

function performSearch(query = '') {
    if (!query) {
        const searchInputs = document.querySelectorAll('.search-input');
        query = searchInputs[0]?.value.trim() || '';
    }
    
    if (!query) return;

    // Save to recent searches
    saveRecentSearch(query);
    
    // Filter and display products
    const filteredProducts = allProducts.filter(product => 
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
    );

    displayFilteredProducts(filteredProducts, query);
    hideSearchSuggestions();
    
    // Clear search inputs
    document.querySelectorAll('.search-input').forEach(input => input.value = '');
    
    // Scroll to products section
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

function displayFilteredProducts(products, query) {
    const productsList = document.getElementById('productsList');
    const productsError = document.getElementById('productsError');
    
    if (products.length === 0) {
        productsList.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4>Aucun produit trouvé pour "${query}"</h4>
                <p class="text-muted">Essayez avec d'autres mots-clés</p>
                <button class="btn btn-gaming" onclick="displayProducts()">
                    <i class="fas fa-undo"></i> Voir tous les produits
                </button>
            </div>
        `;
        productsError.textContent = '';
        return;
    }

    // Group by category
    const categories = {};
    products.forEach(product => {
        if (!categories[product.category]) categories[product.category] = [];
        categories[product.category].push(product);
    });

    productsList.innerHTML = `
        <div class="col-12 mb-4">
            <div class="d-flex justify-content-between align-items-center">
                <h4>Résultats pour "${query}" (${products.length} produits)</h4>
                <button class="btn btn-outline-primary" onclick="displayProducts()">
                    <i class="fas fa-undo"></i> Voir tous
                </button>
            </div>
        </div>
        ${Object.entries(categories).map(([cat, catProducts]) => `
            <div class="mb-4">
                <h5 class="glow-text mb-3">${cat.charAt(0).toUpperCase() + cat.slice(1)}</h5>
                <div class="row">
                    ${catProducts.map(product => `
                        <div class="col-md-4 col-lg-3 mb-4 d-flex">
                            <div class="card h-100 w-100 product-card" data-product-id="${product.id}">
                                <img src="${product.thumbnail}" class="card-img-top" alt="${product.title}"
                                     onerror="this.src='https://via.placeholder.com/300x200/6366f1/ffffff?text=Image+Non+Disponible'"
                                     onload="this.style.display='block'">
                                <div class="card-body d-flex flex-column">
                                    <h5 class="card-title">${product.title}</h5>
                                    <span class="badge product-category mb-2">${product.category}</span>
                                    <p class="card-text">${product.description.substring(0, 70)}...</p>
                                    <div class="mt-auto d-flex gap-2 flex-column">
                                        <p class="product-price mb-2 text-center">${product.price.toFixed(2)} €</p>
                                        <button class="btn btn-gaming w-100 add-to-cart" data-id="${product.id}">
                                            <i class="fas fa-cart-plus"></i> Ajouter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')}
    `;

    console.log('Products HTML generated:', productsList.innerHTML.length, 'characters');
    console.log('Number of product cards:', document.querySelectorAll('.product-card').length);
    
    initProductCardAnimations();
    productsError.textContent = '';
}

function getRecentSearches() {
    const searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    return searches.slice(0, 3);
}

function saveRecentSearch(query) {
    let searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    searches = searches.filter(search => search !== query);
    searches.unshift(query);
    searches = searches.slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(searches));
}

// ===== PRODUCT MANAGEMENT =====
async function displayProducts() {
    const productsList = document.getElementById('productsList');
    const productsError = document.getElementById('productsError');
    
    console.log('Starting displayProducts function...');
    console.log('productsList element:', productsList);
    
    productsList.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-success" role="status"></div></div>';
    productsError.textContent = '';
    
    try {
        console.log('Fetching products from API...');
        const res = await fetch('https://dummyjson.com/products?limit=100');
        console.log('API response status:', res.status);
        
        if (!res.ok) throw new Error('Erreur API');
        const data = await res.json();
        console.log('API data received:', data);
        console.log('Number of products:', data.products ? data.products.length : 'No products array');
        
        // Store products globally
        allProducts = data.products;
        
        // Group by category
        const categories = {};
        data.products.forEach(product => {
            if (!categories[product.category]) categories[product.category] = [];
            categories[product.category].push(product);
        });
        
        console.log('Categories created:', Object.keys(categories));
        
        const productsHTML = Object.entries(categories).map(([cat, products]) => `
            <div class="mb-4">
                <h4 class="glow-text mb-3">${cat.charAt(0).toUpperCase() + cat.slice(1)}</h4>
                <div class="row">
                    ${products.map(product => `
                        <div class="col-md-4 col-lg-3 mb-4 d-flex">
                            <div class="card h-100 w-100 product-card" data-product-id="${product.id}">
                                <img src="${product.thumbnail}" class="card-img-top" alt="${product.title}" 
                                     onerror="this.src='https://via.placeholder.com/300x200/6366f1/ffffff?text=Image+Non+Disponible'"
                                     onload="this.style.display='block'">
                                <div class="card-body d-flex flex-column">
                                    <h5 class="card-title">${product.title}</h5>
                                    <span class="badge product-category mb-2">${product.category}</span>
                                    <p class="card-text">${product.description.substring(0, 70)}...</p>
                                    <div class="mt-auto d-flex gap-2 flex-column">
                                        <p class="product-price mb-2 text-center">${product.price.toFixed(2)} €</p>
                                        <button class="btn btn-gaming w-100 add-to-cart" data-id="${product.id}">
                                            <i class="fas fa-cart-plus"></i> Ajouter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
        
        console.log('Products HTML generated:', productsHTML.length, 'characters');
        console.log('Setting innerHTML...');
        
        productsList.innerHTML = productsHTML;
        
        console.log('Number of product cards after setting HTML:', document.querySelectorAll('.product-card').length);
        
        updateCartButtons();
        initProductCardAnimations();
        
        console.log('Products loaded successfully:', allProducts.length, 'products');
        
    } catch (e) {
        console.error('Error loading products:', e);
        productsList.innerHTML = '';
        productsError.textContent = "Impossible de charger les produits. Veuillez réessayer plus tard.";
    }
}

// ===== PRODUCT CARD INTERACTIONS =====
function initProductCardAnimations() {
    // Product card click for details
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on buttons
            if (e.target.closest('.btn')) return;
            
            const productId = parseInt(this.dataset.productId);
            showProductDetail(productId);
        });
    });

    // Add to cart button
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = parseInt(this.dataset.id);
            addToCart(productId);
        });
    });
}

// ===== CART FUNCTIONALITY =====
function loadCartFromStorage() {
    const storedCart = localStorage.getItem('cart');
    console.log('Loading cart from storage. Raw value:', storedCart);
    
    if (storedCart) {
        try {
            cart = JSON.parse(storedCart);
            console.log('Cart parsed successfully:', cart);
        } catch (error) {
            console.error('Error parsing cart from localStorage:', error);
            cart = [];
        }
    } else {
        console.log('No cart found in localStorage, using empty array');
        cart = [];
    }
    
    updateCartCount();
    console.log('Final cart state:', cart);
}

function updateCartCount() {
    document.getElementById('cartCount').textContent = cart.length;
}

function addToCart(productId) {
    // Remove login requirement - anyone can add to cart
    cart.push(productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Animation feedback
    const btn = document.querySelector(`.add-to-cart[data-id="${productId}"]`);
    if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Ajouté !';
        btn.disabled = true;
        btn.classList.add('btn-success');
        
        // GSAP animation
        gsap.to(btn, {
            scale: 1.1,
            duration: 0.2,
            yoyo: true,
            repeat: 1
        });
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            btn.classList.remove('btn-success');
            updateCartButtons();
        }, 1500);
    }
    
    showNotification('Produit ajouté au panier !', 'success');
    console.log('Cart updated:', cart); // Debug log
}

function buyNow(productId) {
    const isLoggedIn = !!localStorage.getItem('user');
    const product = allProducts.find(p => p.id === productId);
    
    if (!product) return;
    
    if (!isLoggedIn) {
        showNotification('Veuillez vous connecter pour finaliser votre achat', 'warning');
        // Add to cart instead of showing buy modal
        addToCart(productId);
        return;
    }
    
    selectedProduct = product;
    showBuyModal(product);
}

function updateCartButtons() {
    // Remove login requirement for add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.disabled = false;
        btn.title = "Ajouter au panier";
    });
    
    // Keep login requirement for buy now buttons
    const isLoggedIn = !!localStorage.getItem('user');
    document.querySelectorAll('.buy-now').forEach(btn => {
        btn.disabled = !isLoggedIn;
        btn.title = isLoggedIn ? "" : "Connectez-vous pour acheter";
    });
}

function displayCart() {
    const cartItems = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center py-5">
                <div class="empty-cart-icon mb-4">
                    <i class="fas fa-shopping-cart fa-4x text-muted"></i>
                </div>
                <h4 class="text-muted mb-3">Votre panier est vide</h4>
                <p class="text-muted mb-4">Découvrez nos produits et commencez votre shopping !</p>
                <button class="btn btn-gaming" onclick="document.getElementById('products').scrollIntoView({behavior: 'smooth'})">
                    <i class="fas fa-shopping-bag"></i> Découvrir nos produits
                </button>
            </div>
        `;
        document.getElementById('cartTotal').textContent = "";
        return;
    }
    
    let total = 0;
    const cartProducts = cart.map((itemId, idx) => {
        const product = allProducts.find(p => p.id === itemId);
        if (!product) return null;
        total += product.price;
        return { product, idx };
    }).filter(item => item !== null);

    cartItems.innerHTML = `
        <div class="cart-header mb-4">
            <h5 class="glow-text mb-0">
                <i class="fas fa-shopping-cart me-2"></i>
                Votre Panier (${cartProducts.length} article${cartProducts.length > 1 ? 's' : ''})
            </h5>
        </div>
        <div class="cart-items-container">
            ${cartProducts.map(({ product, idx }) => `
                <div class="cart-item">
                    <div class="cart-item-content">
                        <div class="cart-item-image">
                            <img src="${product.thumbnail}" alt="${product.title}" class="cart-product-image">
                        </div>
                        <div class="cart-item-details">
                            <h6 class="cart-item-title">${product.title}</h6>
                            <div class="cart-item-category">
                                <span class="badge product-category">${product.category}</span>
                            </div>
                            <div class="cart-item-price">
                                <span class="price-amount">${product.price.toFixed(2)} €</span>
                            </div>
                        </div>
                        <div class="cart-item-actions">
                            <button class="btn btn-sm btn-danger remove-from-cart" data-idx="${idx}" title="Retirer du panier">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="cart-summary mt-4">
            <div class="summary-item">
                <span>Sous-total:</span>
                <span>${total.toFixed(2)} €</span>
            </div>
            <div class="summary-item">
                <span>Livraison:</span>
                <span class="text-success">Gratuite</span>
            </div>
            <div class="summary-item total">
                <span>Total:</span>
                <span class="total-amount">${total.toFixed(2)} €</span>
            </div>
        </div>
    `;
    
    // Add event listeners for remove buttons
    document.querySelectorAll('.remove-from-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.dataset.idx);
            cart.splice(idx, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            displayCart();
            showNotification('Produit retiré du panier', 'info');
        });
    });
    
    // Update checkout button behavior
    const checkoutBtn = document.getElementById('checkoutBtn');
    const isLoggedIn = !!localStorage.getItem('user');
    
    if (isLoggedIn) {
        checkoutBtn.innerHTML = '<i class="fas fa-credit-card me-2"></i>Procéder au paiement';
        checkoutBtn.className = 'btn btn-success btn-lg';
        checkoutBtn.onclick = function() {
            showNotification('Redirection vers le paiement...', 'info');
            // Here you would typically redirect to payment page
        };
    } else {
        checkoutBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Se connecter pour commander';
        checkoutBtn.className = 'btn btn-warning btn-lg';
        checkoutBtn.onclick = function() {
            bootstrap.Modal.getInstance(document.getElementById('cartModal')).hide();
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
            showNotification('Veuillez vous connecter pour finaliser votre commande', 'warning');
        };
    }
}

// ===== PRODUCT DETAIL MODAL =====
function showProductDetail(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const modalBody = document.getElementById('productDetailBody');
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <img src="${product.thumbnail}" alt="${product.title}" class="img-fluid rounded" style="max-height: 300px; object-fit: cover;">
            </div>
            <div class="col-md-6">
                <h4 class="glow-text mb-3">${product.title}</h4>
                <div class="mb-3">
                    <span class="badge product-category">${product.category}</span>
                </div>
                <p class="mb-3">${product.description}</p>
                <div class="mb-3">
                    <strong>Prix:</strong> <span class="product-price">${product.price.toFixed(2)} €</span>
                </div>
                <div class="mb-3">
                    <strong>Stock:</strong> ${product.stock} unités
                </div>
                <div class="mb-3">
                    <strong>Note:</strong> ${product.rating}/5 ⭐
                </div>
                <div class="mb-3">
                    <strong>Marque:</strong> ${product.brand || 'N/A'}
                </div>
            </div>
        </div>
    `;
    
    // Add to cart from detail modal
    document.getElementById('addToCartFromDetail').onclick = function() {
        addToCart(productId);
        bootstrap.Modal.getInstance(document.getElementById('productDetailModal')).hide();
    };
    
    const modal = new bootstrap.Modal(document.getElementById('productDetailModal'));
    modal.show();
}

// ===== BUY MODAL =====
function showBuyModal(product) {
    const buyModalBody = document.getElementById('buyModalBody');
    buyModalBody.innerHTML = `
        <div class="text-center">
            <img src="${product.thumbnail}" alt="${product.title}" style="width:120px;height:120px;object-fit:cover;border-radius:12px;box-shadow: var(--shadow-light);">
            <h5 class="mt-3 mb-2">${product.title}</h5>
            <div class="mb-2">Catégorie : <span class="badge product-category">${product.category}</span></div>
            <div class="mb-2">Prix : <span class="product-price">${product.price.toFixed(2)} €</span></div>
        </div>
    `;
    
    const buyModal = new bootstrap.Modal(document.getElementById('buyModal'));
    buyModal.show();
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        box-shadow: var(--shadow-heavy);
    `;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // GSAP animation
    gsap.fromTo(notification, 
        { x: 300, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
    );
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        gsap.to(notification, {
            x: 300,
            opacity: 0,
            duration: 0.5,
            ease: "power3.in",
            onComplete: () => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }
        });
    }, 3000);
}

// ===== LOGIN/LOGOUT =====
function updateLoginUI() {
    const user = localStorage.getItem('user');
    if (user) {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = '';
        document.getElementById('userWelcome').style.display = '';
        document.getElementById('userName').textContent = user;
    } else {
        document.getElementById('loginBtn').style.display = '';
        document.getElementById('logoutBtn').style.display = 'none';
        document.getElementById('userWelcome').style.display = 'none';
    }
    updateCartButtons();
}

// ===== STORE NEWS =====
const newsData = [
    {
        title: "Nadahe Store lance sa nouvelle collection 2025",
        description: "Découvrez notre nouvelle collection exclusive avec des produits innovants et des designs uniques. Une sélection soigneusement choisie pour nos clients les plus exigeants.",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
        date: "15 Jan 2025"
    },
    {
        title: "Nouveau programme de fidélité Nadahe Rewards",
        description: "Rejoignez notre programme de fidélité et bénéficiez d'avantages exclusifs : réductions spéciales, livraison prioritaire et offres personnalisées.",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
        date: "12 Jan 2025"
    },
    {
        title: "Service client premium : support 24/7",
        description: "Notre équipe de support client est maintenant disponible 24h/24 et 7j/7 pour vous accompagner dans tous vos besoins et questions.",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
        date: "10 Jan 2025"
    },
    {
        title: "Livraison express gratuite sur tous les produits",
        description: "Profitez de la livraison express gratuite sur tous les produits Nadahe Store, sans minimum d'achat. Recevez vos commandes en 24h !",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80",
        date: "8 Jan 2025"
    },
    {
        title: "Guide d'achat : Comment choisir vos produits",
        description: "Un guide complet pour vous aider à choisir les meilleurs produits selon vos besoins et votre budget. Conseils d'experts et recommandations personnalisées.",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
        date: "5 Jan 2025"
    },
    {
        title: "Nouvelle boutique Nadahe Store à Paris",
        description: "Nous sommes ravis d'annoncer l'ouverture de notre nouvelle boutique au cœur de Paris. Venez nous rencontrer et découvrir nos produits en exclusivité !",
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
        date: "3 Jan 2025"
    }
];

function displayNews() {
    const newsList = document.getElementById('newsList');
    newsList.innerHTML = newsData.map(article => `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
                <img src="${article.urlToImage}" class="card-img-top" alt="${article.title}">
                <div class="card-body d-flex flex-column">
                    <div class="mb-2">
                        <small class="text-muted">${article.date}</small>
                    </div>
                    <h5 class="card-title">${article.title}</h5>
                    <p class="card-text">${article.description}</p>
                    <a href="${article.url}" target="_blank" class="btn btn-outline-primary mt-auto">Lire l'article</a>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Starting initialization...');
    
    // Check if required elements exist
    const productsList = document.getElementById('productsList');
    const productsError = document.getElementById('productsError');
    
    console.log('Products list element:', productsList);
    console.log('Products error element:', productsError);
    
    if (!productsList) {
        console.error('ERROR: productsList element not found!');
        return;
    }
    
    // Initialize everything
    loadCartFromStorage();
    initAnimations();
    displayProducts();
    displayNews();
    updateLoginUI();
    updateCartCount();
    initSearch();
    
    // Hero buttons
    document.getElementById('exploreCollectionBtn').addEventListener('click', function() {
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    });
    
    document.getElementById('learnMoreBtn').addEventListener('click', function() {
        document.getElementById('news').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Login form
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = this.username.value.trim();
        const password = this.password.value.trim();
        
        if (username && password) {
            localStorage.setItem('user', username);
            updateLoginUI();
            document.getElementById('loginError').textContent = '';
            bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
            showNotification(`Bienvenue ${username} !`, 'success');
        } else {
            document.getElementById('loginError').textContent = "Nom d'utilisateur ou mot de passe invalide.";
        }
        this.reset();
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('user');
        updateLoginUI();
        showNotification('Vous avez été déconnecté', 'info');
    });
    
    // Sign up form
    document.getElementById('signupForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = this.username.value.trim();
        const email = this.email.value.trim();
        const password = this.password.value.trim();
        
        if (username && email && password) {
            document.getElementById('signupError').textContent = '';
            document.getElementById('signupSuccess').textContent = 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.';
            setTimeout(() => {
                bootstrap.Modal.getInstance(document.getElementById('signupModal')).hide();
                document.getElementById('signupSuccess').textContent = '';
            }, 1500);
        } else {
            document.getElementById('signupError').textContent = "Veuillez remplir tous les champs.";
        }
        this.reset();
    });
    
    // Cart button
    document.querySelector('[data-bs-target="#cartModal"]').addEventListener('click', function() {
        displayCart();
    });
    
    // Buy confirmation
    document.getElementById('confirmBuyBtn').addEventListener('click', function() {
        const buyModalBody = document.getElementById('buyModalBody');
        buyModalBody.innerHTML = '<div class="text-success text-center py-3"><i class="fas fa-check-circle fa-2x mb-2"></i><br>Merci pour votre achat !</div>';
        this.style.display = 'none';
        setTimeout(() => {
            const buyModal = bootstrap.Modal.getInstance(document.getElementById('buyModal'));
            buyModal.hide();
        }, 1800);
    });
    
    // Contact form
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        let valid = true;
        this.querySelectorAll('input, textarea').forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('is-invalid');
                valid = false;
            } else {
                input.classList.remove('is-invalid');
            }
        });
        
        if (!valid) return;
        
        document.getElementById('contactMsg').innerHTML = "<span class='text-success'>Message envoyé ! Nous vous répondrons rapidement.</span>";
        this.reset();
        showNotification('Message envoyé avec succès !', 'success');
    });
    
    // Back to top button
    const backToTopBtn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});