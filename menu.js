import { translations } from './translations.js';

let cart = [];
let menuItems = {};
let currentCategory = 'all';
let currentSearchTerm = '';
let serviceCharge = {
  enabled: true,
  percentage: 10
};

function initCart() {
  const savedCart = localStorage.getItem('restaurantCart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartCount();
  }
  
  firebase.database().ref('serviceCharge').once('value').then(snapshot => {
    const serviceData = snapshot.val();
    if (serviceData) {
      serviceCharge = serviceData;
      updateServiceDisplay();
    }
  });
}

function updateServiceDisplay() {
  const percentageElement = document.getElementById('service-percentage');
  if (percentageElement) {
    percentageElement.textContent = serviceCharge.percentage;
  }
}

function saveCart() {
  localStorage.setItem('restaurantCart', JSON.stringify(cart));
}

function addToCart(itemId) {
  const item = menuItems[itemId];
  if (!item) return;
  
  const existingItem = cart.find(i => i.id === itemId);
  const lang = localStorage.getItem('selectedLanguage') || 'ka';
  
  const translatedName = item.translations?.[lang]?.name || item.name;
  
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      id: itemId,
      name: translatedName,
      price: item.price,
      quantity: 1,
      image: item.imageUrl || 'https://via.placeholder.com/100x100?text=No+Image'
    });
  }
  
  saveCart();
  updateCartCount();
  updateCartDisplay();
  showCartPanel();
}

function removeFromCart(itemId) {
  cart = cart.filter(item => item.id !== itemId);
  saveCart();
  updateCartCount();
  updateCartDisplay();
}

function updateQuantity(itemId, newQuantity) {
  const item = cart.find(i => i.id === itemId);
  if (!item) return;
  
  if (newQuantity > 0) {
    item.quantity = newQuantity;
  } else {
    removeFromCart(itemId);
  }
  
  saveCart();
  updateCartCount();
  updateCartDisplay();
}

function clearCart() {
  const lang = localStorage.getItem('selectedLanguage') || 'ka';
  const t = translations[lang];
  
  if (cart.length === 0) return;

  // Create the confirmation modal
  const modal = document.createElement('div');
  modal.className = 'custom-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <i class="fas fa-trash-alt"></i>
        <h3>${t.clear_cart_confirm || 'დარწმუნებული ხართ, რომ გსურთ მენიუს გასუფთავება?'}</h3>
      </div>
      <div class="modal-body">
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="cancel-clear">${t.cancel || 'გაუქმება'}</button>
        <button class="btn btn-danger" id="confirm-clear">${t.confirm || 'დადასტურება'}</button>
      </div>
    </div>
  `;

  // Add to DOM
  document.body.appendChild(modal);
  
  // Show modal with animation
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);

  // Handle confirm button
  document.getElementById('confirm-clear').addEventListener('click', () => {
    cart = [];
    saveCart();
    updateCartCount();
    updateCartDisplay();
    closeModal(modal);
    showCartClearedNotification();
  });

  // Handle cancel button
  document.getElementById('cancel-clear').addEventListener('click', () => {
    closeModal(modal);
  });

  // Close when clicking outside modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });
}

function closeModal(modal) {
  modal.classList.remove('show');
  setTimeout(() => {
    modal.remove();
  }, 300);
}

function showCartClearedNotification() {
  const lang = localStorage.getItem('selectedLanguage') || 'ka';
  const t = translations[lang];
  
  showAlert(t.cart_cleared || 'მენიუ წარმატებით გასუფთავდა', 'success');
}

function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  document.getElementById('cart-count').textContent = count;
}

function showCartPanel() {
  document.getElementById('cart-panel').classList.add('active');
}

function hideCartPanel() {
  document.getElementById('cart-panel').classList.remove('active');
}

function updateCartDisplay() {
  const lang = localStorage.getItem('selectedLanguage') || 'ka';
  const t = translations[lang];
  
  const cartItemsContainer = document.getElementById('cart-items');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const cartService = document.getElementById('cart-service');
  const cartTotal = document.getElementById('cart-total');
  
  cartItemsContainer.innerHTML = '';
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <div>🍽️</div>
        <h3>${t.empty_cart}</h3>
        <p>${t.add_items}</p>
      </div>
    `;
    cartSubtotal.textContent = '0.00 ₾';
    cartService.textContent = '0.00 ₾';
    cartTotal.textContent = '0.00 ₾';
    return;
  }
  
  let subtotal = 0;
  
  cart.forEach(cartItem => {
    const item = menuItems[cartItem.id];
    const lang = localStorage.getItem('selectedLanguage') || 'ka';
    const displayName = item?.translations?.[lang]?.name || cartItem.name;
    
    const itemTotal = cartItem.price * cartItem.quantity;
    subtotal += itemTotal;
    
    const cartItemElement = document.createElement('div');
    cartItemElement.className = 'cart-item';
    cartItemElement.innerHTML = `
      <div class="cart-item-image">
        <img src="${cartItem.image}" alt="${displayName}">
      </div>
      <div class="cart-item-details">
        <div class="cart-item-name">${displayName}</div>
        <div class="cart-item-price">${cartItem.price.toFixed(2)} ₾</div>
        <div class="quantity-controls">
          <button class="quantity-btn minus" data-id="${cartItem.id}">-</button>
          <input type="number" min="1" value="${cartItem.quantity}" class="quantity-input" data-id="${cartItem.id}">
          <button class="quantity-btn plus" data-id="${cartItem.id}">+</button>
          <button class="remove-item" data-id="${cartItem.id}">✕</button>
        </div>
      </div>
    `;
    cartItemsContainer.appendChild(cartItemElement);
  });
  
  let serviceAmount = 0;
  if (serviceCharge.enabled) {
    serviceAmount = subtotal * (serviceCharge.percentage / 100);
  }
  
  const total = subtotal + serviceAmount;
  
  cartSubtotal.textContent = `${subtotal.toFixed(2)} ₾`;
  cartService.textContent = `${serviceAmount.toFixed(2)} ₾`;
  cartTotal.textContent = `${total.toFixed(2)} ₾`;
  
  document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.id;
      const item = cart.find(i => i.id === itemId);
      if (item) {
        updateQuantity(itemId, item.quantity - 1);
      }
    });
  });
  
  document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.id;
      const item = cart.find(i => i.id === itemId);
      if (item) {
        updateQuantity(itemId, item.quantity + 1);
      }
    });
  });
  
  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const itemId = e.target.dataset.id;
      const newQuantity = parseInt(e.target.value) || 1;
      updateQuantity(itemId, newQuantity);
    });
  });
  
  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.id;
      removeFromCart(itemId);
    });
  });
}

function filterMenuItems(searchTerm) {
  const menuContainer = document.getElementById('menu-container');
  const allItems = menuContainer.querySelectorAll('.menu-item');
  let hasResults = false;
  
  const lang = localStorage.getItem('selectedLanguage') || 'ka';
  const t = translations[lang];
  
  if (searchTerm === '') {
    allItems.forEach(item => item.style.display = 'block');
    return;
  }
  
  const searchLower = searchTerm.toLowerCase();
  
  allItems.forEach(item => {
    const itemName = item.querySelector('h3').textContent.toLowerCase();
    if (itemName.includes(searchLower)) {
      item.style.display = 'block';
      hasResults = true;
    } else {
      item.style.display = 'none';
    }
  });
  
  const noResults = document.querySelector('.no-results');
  if (!hasResults) {
    if (!noResults) {
      const noResultsElement = document.createElement('div');
      noResultsElement.className = 'no-results';
      noResultsElement.innerHTML = `
        <div style="text-align: center; padding: 20px; color: var(--text-light);">
          <i class="fas fa-search"></i>
          <h3>${t.no_results}</h3>
          <p>${t.search_term}: "${searchTerm}"</p>
        </div>
      `;
      menuContainer.appendChild(noResultsElement);
    }
  } else if (noResults) {
    noResults.remove();
  }
}

function loadMenu() {
  const menuContainer = document.getElementById('menu-container');
  const lang = localStorage.getItem('selectedLanguage') || 'ka';
  const t = translations[lang];
  
  firebase.database().ref('menuItems').on('value', (snapshot) => {
    const items = snapshot.val();
    menuItems = items || {};
    menuContainer.innerHTML = '';
    
    const categoryMap = {
      'hot_dishes': t.hot_dishes,
      'cold_dishes': t.cold_dishes,
      'bakery': t.bakery,
      'soups': t.soups,
      'desserts': t.desserts,
      'drinks': t.drinks,
      'alcoholic_drinks': t.alcoholic_drinks
    };

    if (items) {
      const categories = {};
      
      Object.entries(items).forEach(([id, item]) => {
        item.id = id;
        if (!item.available) return;
        
        const lang = localStorage.getItem('selectedLanguage') || 'ka';
        let displayName = item.name;
        let displayDescription = item.description;
        
        if (item.translations && item.translations[lang]) {
          displayName = item.translations[lang].name || displayName;
          displayDescription = item.translations[lang].description || displayDescription;
        }
        
        if (!categories[item.category]) {
          categories[item.category] = [];
        }
        categories[item.category].push({...item, displayName, displayDescription});
      });

      for (const [category, itemsInCategory] of Object.entries(categories)) {
        const categorySection = document.createElement('div');
        categorySection.className = 'menu-category';
        categorySection.dataset.category = category;
        
        const categoryTitle = document.createElement('h2');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = categoryMap[category] || category;
        categorySection.appendChild(categoryTitle);
        
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'category-items';
        
        itemsInCategory.forEach(item => {
          const menuItem = document.createElement('div');
          menuItem.className = 'menu-item';
          menuItem.dataset.category = item.category;
          
          const imageUrl = item.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image';
          
          menuItem.innerHTML = `
            <div class="menu-item-image-container">
              <img src="${imageUrl}" alt="${item.displayName}" class="menu-item-image" 
                   onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=Image+Error'; this.style.opacity='0.7'">
            </div>
            <div class="menu-item-details">
              <div class="menu-item-header">
                <h3>${item.displayName}</h3>
                <span class="price">${item.price.toFixed(2)} ₾</span>
              </div>
              ${item.displayDescription ? `<p class="description">${item.displayDescription}</p>` : ''}
              <div class="menu-item-footer">
                <button class="add-to-cart" data-id="${item.id}">${t.add_to_cart}</button>
              </div>
            </div>
          `;
          
          itemsContainer.appendChild(menuItem);
        });
        
        categorySection.appendChild(itemsContainer);
        menuContainer.appendChild(categorySection);
      }
      
      if (Object.keys(categories).length === 0) {
        menuContainer.innerHTML = `<p style="text-align: center; padding: 40px; color: var(--text-light);">${t.empty_menu}</p>`;
      }
    } else {
      menuContainer.innerHTML = `<p style="text-align: center; padding: 40px; color: var(--text-light);">${t.empty_menu}</p>`;
    }
    
    document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', function() {
        const itemId = this.dataset.id;
        addToCart(itemId);
      });
    });
  });
}

function setupCategoryFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      const category = this.dataset.category;
      filterMenu(category);
    });
  });
}

function filterMenu(category) {
  const menuCategories = document.querySelectorAll('.menu-category');
  const menuItems = document.querySelectorAll('.menu-item');
  
  if (category === 'all') {
    menuCategories.forEach(cat => cat.style.display = 'block');
    menuItems.forEach(item => item.style.display = 'block');
  } else {
    menuCategories.forEach(cat => cat.style.display = 'none');
    
    const selectedCategory = document.querySelector(`.menu-category[data-category="${category}"]`);
    if (selectedCategory) {
      selectedCategory.style.display = 'block';
    }
    
    menuItems.forEach(item => {
      if (item.dataset.category === category) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', function() {
  initCart();
  
  document.getElementById('cart-icon').addEventListener('click', showCartPanel);
  document.querySelector('.close-cart').addEventListener('click', hideCartPanel);
  
  document.getElementById('clear-cart').addEventListener('click', clearCart);
  
  const firebaseReady = setInterval(() => {
    if (firebase.apps.length > 0) {
      clearInterval(firebaseReady);
      loadMenu();
    }
  }, 100);
  
  setupCategoryFilters();
  
  updateCartDisplay();
  
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.trim().toLowerCase();
      filterMenuItems(searchTerm);
    });
  }
});