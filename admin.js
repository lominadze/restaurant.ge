// admin.js
/**
 * Restaurant Menu Admin Panel
 * Handles all admin functionality including:
 * - Adding/editing/deleting menu items
 * - Managing translations
 * - Configuring service charges
 */

document.addEventListener('DOMContentLoaded', function() {
  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyA7orLva5kfdJK3MsT5uXp9RYfycRYNQg8",
    authDomain: "restaurant-menu-2652a.firebaseapp.com",
    projectId: "restaurant-menu-2652a",
    storageBucket: "restaurant-menu-2652a.appspot.com",
    messagingSenderId: "320792367742",
    appId: "1:320792367742:web:5881bfc879ec669eca7e2f",
    measurementId: "G-9FMF7MFXWT"
  };
  
  // Initialize Firebase
  try {
    firebase.initializeApp(firebaseConfig);
  } catch (error) {
    showAlert('Firebase initialization error', error.message, 'error');
    console.error("Firebase initialization error: ", error);
    return;
  }
  
  // Initialize UI components
  initAddItemForm();
  initEditItemForm();
  initImagePreview();
  initSearch();
  initServiceChargeForm();
  initTranslationButtons();
  
  // Load initial data
  loadAdminMenu();
  loadServiceCharge();
  loadTranslationsForEditor('ka');
  loadMenuItemTranslations('ka');
});

// ========================
// INITIALIZATION FUNCTIONS
// ========================

/**
 * Initialize the add item form with auto-translation
 */
function initAddItemForm() {
  const form = document.getElementById('add-item-form');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('item-name').value.trim();
    const price = parseFloat(document.getElementById('item-price').value);
    const category = document.getElementById('item-category').value;
    const description = document.getElementById('item-description-ka').value.trim();
    const imageUrl = document.getElementById('item-image-url').value.trim();
    const available = document.getElementById('item-available').checked;

    // Validation
    if (!name) {
      showAlert('გთხოვთ მიუთითოთ პროდუქტის სახელი', 'error');
      return;
    }
    
    if (isNaN(price) || price <= 0) {
      showAlert('გთხოვთ მიუთითოთ სწორი ფასი', 'error');
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> დამატება...';
    submitBtn.disabled = true;

    try {
      // First create the item with Georgian translations
      const newItem = {
        name: name,
        description: description,
        translations: {
          ka: {
            name: name,
            description: description
          }
        },
        price: price,
        category: category,
        imageUrl: imageUrl || null,
        available: available,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      };

      // Add to Firebase
      const newItemRef = firebase.database().ref('menuItems').push();
      await newItemRef.set(newItem);
      
      showAlert('პროდუქტი წარმატებით დაემატა! თარგმნება...', 'success');
      form.reset();
      document.getElementById('image-preview-container').innerHTML = '';
      
      // Get the newly created item ID
      const itemId = newItemRef.key;
      
      // Translate to all languages
      const translations = {
        en: await translateTexts(name, description, 'en'),
        ru: await translateTexts(name, description, 'ru'),
        tr: await translateTexts(name, description, 'tr')
      };
      
      // Update the item with all translations
      await firebase.database().ref(`menuItems/${itemId}/translations`).update(translations);
      
      showAlert('პროდუქტი წარმატებით დაემატა და თარგმნილია!', 'success');
      
      // Reload menu to show the new item
      loadAdminMenu();
      
    } catch (error) {
      console.error("Error adding item: ", error);
      showAlert('პროდუქტის დამატების შეცდომა: ' + error.message, 'error');
    } finally {
      // Restore button state
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
    }
  });
}

/**
 * Translate name and description to target language
 */
async function translateTexts(name, description, targetLang) {
  try {
    const [translatedName, translatedDescription] = await Promise.all([
      translateText(name, 'ka', targetLang),
      translateText(description, 'ka', targetLang)
    ]);
    
    return {
      name: translatedName,
      description: translatedDescription
    };
  } catch (error) {
    console.error(`Error translating to ${targetLang}:`, error);
    return {
      name: '',
      description: ''
    };
  }
}

/**
 * Translate single text using Google Translate API
 */
async function translateText(text, sourceLang, targetLang) {
  if (!text) return '';
  
  const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  
  const response = await fetch(translateUrl);
  if (!response.ok) {
    throw new Error(`Translation API error: ${response.status}`);
  }
  
  const data = await response.json();
  if (data && data[0] && data[0][0] && data[0][0][0]) {
    return data[0][0][0];
  }
  
  throw new Error('Invalid translation response');
}

// ====================
// EDIT MODAL FUNCTIONS
// ====================

/**
 * Initialize the edit item form
 */
function initEditItemForm() {
  const form = document.getElementById('edit-item-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const itemId = document.getElementById('edit-item-id').value;
    const name = document.getElementById('edit-item-name').value.trim();
    const price = parseFloat(document.getElementById('edit-item-price').value);
    const category = document.getElementById('edit-item-category').value;
    const description = document.getElementById('edit-item-description-ka').value.trim();
    const imageUrl = document.getElementById('edit-item-image-url').value.trim();
    const available = document.getElementById('edit-item-available').checked;

    // Validation
    if (!name) {
      showAlert('გთხოვთ მიუთითოთ პროდუქტის სახელი', 'error');
      return;
    }
    
    if (isNaN(price) || price <= 0) {
      showAlert('გთხოვთ მიუთითოთ სწორი ფასი', 'error');
      return;
    }

    // Prepare updated item data
    const updatedItem = {
      name: name,
      description: description,
      price: price,
      category: category,
      imageUrl: imageUrl || null,
      available: available
    };

    // Update in Firebase
    firebase.database().ref(`menuItems/${itemId}`).update(updatedItem)
      .then(() => {
        showAlert('პროდუქტი წარმატებით განახლდა!', 'success');
        closeEditModal();
      })
      .catch(error => {
        console.error("Error updating item: ", error);
        showAlert('პროდუქტის განახლების შეცდომა: ' + error.message, 'error');
      });
  });

  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    const modal = document.getElementById('edit-product-modal');
    if (event.target === modal) {
      closeEditModal();
    }
  });

  // Close modal with escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeEditModal();
    }
  });
}

// ====================
// UTILITY FUNCTIONS
// ====================

/**
 * Show an alert message
 */
function showAlert(message, type = 'info', options = {}) {
  // Remove any existing alerts first
  const existingAlert = document.querySelector('.custom-alert');
  if (existingAlert) existingAlert.remove();

  const alert = document.createElement('div');
  alert.className = `custom-alert ${type}-alert`;
  
  // Icon based on type
  let icon = '✅';
  if (type === 'confirm') icon = '❓';
  if (type === 'error') icon = '❌';
  
  // For confirmation dialogs (with buttons)
  if (type === 'confirm') {
    alert.innerHTML = `
      <span class="alert-icon">${icon}</span>
      <div>
        <div class="alert-message">${message}</div>
        <div class="alert-buttons">
          <button class="alert-btn alert-btn-cancel">${options.cancelText || 'გაუქმება'}</button>
          <button class="alert-btn alert-btn-confirm">${options.confirmText || 'დადასტურება'}</button>
        </div>
      </div>
    `;
    
    // Add event listeners to buttons
    const confirmBtn = alert.querySelector('.alert-btn-confirm');
    const cancelBtn = alert.querySelector('.alert-btn-cancel');
    
    confirmBtn.addEventListener('click', () => {
      if (options.onConfirm) options.onConfirm();
      removeAlert(alert);
    });
    
    cancelBtn.addEventListener('click', () => {
      if (options.onCancel) options.onCancel();
      removeAlert(alert);
    });
  } 
  // For simple alerts (success/error)
  else {
    alert.innerHTML = `
      <span class="alert-icon">${icon}</span>
      <div class="alert-message">${message}</div>
      <span class="alert-close" onclick="removeAlert(this.parentNode)">&times;</span>
    `;
    
    // Auto-close after delay if specified
    if (options.autoClose !== false) {
      setTimeout(() => {
        removeAlert(alert);
      }, options.duration || 3000);
    }
  }
  
  document.body.appendChild(alert);
  
  return alert;
}

function removeAlert(alert) {
  alert.style.animation = 'fadeOut 0.3s ease-in-out';
  setTimeout(() => {
    alert.remove();
  }, 300);
}

// ====================
// DATA LOAD FUNCTIONS
// ====================

/**
 * Load admin menu items from Firebase
 */
function loadAdminMenu() {
  const menuContainer = document.getElementById('admin-menu-container');
  if (!menuContainer) return;
  
  firebase.database().ref('menuItems').on('value', (snapshot) => {
    const items = snapshot.val();
    menuContainer.innerHTML = '';
    
    if (!items) {
      menuContainer.innerHTML = '<p class="empty-message">მენიუ ცარიელია</p>';
      return;
    }
    
    // Create menu items
    for (const [key, item] of Object.entries(items)) {
      const itemElement = createMenuItemElement(key, item);
      menuContainer.appendChild(itemElement);
    }

    // Attach event listeners to buttons
    attachItemButtonListeners();
  }, (error) => {
    console.error("Error loading menu: ", error);
    showAlert('მენიუს ჩატვირთვის შეცდომა: ' + error.message, 'error');
  });
}

/**
 * Create a menu item element for the admin panel
 */
function createMenuItemElement(key, item) {
  const itemElement = document.createElement('div');
  itemElement.className = 'admin-menu-item';
  
  const imageUrl = item.imageUrl || 'https://via.placeholder.com/300x150?text=No+Image';
  
  const categoryMap = {
    'hot_dishes': 'ცხელი კერძები',
    'cold_dishes': 'ცივი კერძები',
    'bakery': 'ცომეული',
    'soups': 'წვნიანები',
    'desserts': 'დესერტი',
    'drinks': 'სასმელები',
    'alcoholic_drinks': 'ალკოჰოლური სასმელები'
  };
  
  const categoryText = categoryMap[item.category] || item.category;
  
  itemElement.innerHTML = `
    <img src="${imageUrl}" alt="${item.name}" class="menu-item-image-preview" 
         onerror="this.onerror=null; this.src='https://via.placeholder.com/300x150?text=Image+Error'; this.style.opacity='0.7'">
    
    <div class="status-badge status-${item.available ? 'available' : 'unavailable'}">
      ${item.available ? 'ხელმისაწვდომი' : 'არაა ხელმისაწვდომი'}
    </div>
    
    <h3>${item.name}</h3>
    
    <div class="category">${categoryText}</div>
    
    <p class="price">${item.price.toFixed(2)} ₾</p>
    
    ${item.description ? `<p class="description">${item.description}</p>` : ''}
    
    <div class="action-buttons">
      <button class="edit-btn" data-id="${key}">
        <i class="fas fa-edit"></i> რედაქტირება
      </button>
      <button class="toggle-btn ${item.available ? 'available' : 'unavailable'}" data-id="${key}">
        <i class="fas fa-toggle-${item.available ? 'on' : 'off'}"></i>
        ${item.available ? 'გამორთვა' : 'ჩართვა'}
      </button>
      <button class="delete-btn" data-id="${key}">
        <i class="fas fa-trash"></i> წაშლა
      </button>
    </div>
  `;
  
  return itemElement;
}

/**
 * Attach event listeners to menu item buttons
 */
function attachItemButtonListeners() {
  // Edit buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const itemId = this.dataset.id;
      openEditModal(itemId);
    });
  });

  // Toggle buttons
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const itemId = this.dataset.id;
      const currentState = this.classList.contains('available');
      const newState = !currentState;
      
      firebase.database().ref(`menuItems/${itemId}/available`).set(newState)
        .then(() => {
          showAlert(`პროდუქტი წარმატებით ${newState ? 'ჩაირთო' : 'გამოირთო'}!`, 'success');
        })
        .catch(error => {
          showAlert('პროდუქტის სტატუსის შეცვლის შეცდომა: ' + error.message, 'error');
        });
    });
  });

  // Delete buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const itemId = this.dataset.id;
      const itemName = this.closest('.admin-menu-item').querySelector('h3').textContent;
      
      showAlert(
        `დარწმუნებული ხართ რომ გსურთ პროდუქტის "${itemName}" წაშლა?`,
        'confirm',
        {
          confirmText: 'დადასტურება',
          cancelText: 'გაუქმება',
          onConfirm: () => {
            firebase.database().ref(`menuItems/${itemId}`).remove()
              .then(() => {
                showAlert('პროდუქტი წარმატებით წაიშალა', 'success');
              })
              .catch(error => {
                showAlert('პროდუქტის წაშლის შეცდომა: ' + error.message, 'error');
              });
          }
        }
      );
    });
  });
}

/**
 * Open the edit modal for a specific item
 */
function openEditModal(itemId) {
  firebase.database().ref(`menuItems/${itemId}`).once('value').then(snapshot => {
    const item = snapshot.val();
    if (!item) {
      showAlert('პროდუქტი ვერ მოიძებნა', 'error');
      return;
    }

    // Fill form fields
    document.getElementById('edit-item-id').value = itemId;
    document.getElementById('edit-item-name').value = item.name || '';
    document.getElementById('edit-item-price').value = item.price || 0;
    document.getElementById('edit-item-category').value = item.category || 'hot_dishes';
    document.getElementById('edit-item-description-ka').value = item.description || '';
    document.getElementById('edit-item-image-url').value = item.imageUrl || '';
    document.getElementById('edit-item-available').checked = item.available !== false;

    // Show image preview
    const previewContainer = document.getElementById('edit-image-preview-container');
    const url = item.imageUrl || '';
    if (url) {
      previewContainer.innerHTML = `
        <p class="preview-label">სურათის პრევიუ:</p>
        <img src="${url}" class="preview-image" 
             onerror="this.onerror=null; this.src='https://via.placeholder.com/300x150?text=Invalid+Image'; this.style.opacity='0.7'">
      `;
    } else {
      previewContainer.innerHTML = '';
    }

    // Show modal
    document.getElementById('edit-product-modal').style.display = 'block';
  }).catch(error => {
    console.error("Error opening edit modal: ", error);
    showAlert('რედაქტირების მოდალის გახსნის შეცდომა: ' + error.message, 'error');
  });
}

/**
 * Close the edit modal
 */
function closeEditModal() {
  document.getElementById('edit-product-modal').style.display = 'none';
}

/**
 * Initialize image preview functionality
 */
function initImagePreview() {
  const imageUrlInput = document.getElementById('item-image-url');
  if (!imageUrlInput) return;

  imageUrlInput.addEventListener('input', function() {
    const url = this.value.trim();
    const previewContainer = document.getElementById('image-preview-container');
    
    if (url) {
      previewContainer.innerHTML = `
        <p class="preview-label">სურათის პრევიუ:</p>
        <img src="${url}" class="preview-image" 
             onerror="this.onerror=null; this.src='https://via.placeholder.com/300x150?text=Invalid+Image'; this.style.opacity='0.7'">
      `;
    } else {
      previewContainer.innerHTML = '';
    }
  });

  // Also for edit modal
  const editImageUrlInput = document.getElementById('edit-item-image-url');
  if (editImageUrlInput) {
    editImageUrlInput.addEventListener('input', function() {
      const url = this.value.trim();
      const previewContainer = document.getElementById('edit-image-preview-container');
      
      if (url) {
        previewContainer.innerHTML = `
          <p class="preview-label">სურათის პრევიუ:</p>
          <img src="${url}" class="preview-image" 
               onerror="this.onerror=null; this.src='https://via.placeholder.com/300x150?text=Invalid+Image'; this.style.opacity='0.7'">
        `;
      } else {
        previewContainer.innerHTML = '';
      }
    });
  }
}

/**
 * Initialize search functionality
 */
function initSearch() {
  const searchInput = document.getElementById('admin-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.trim().toLowerCase();
    filterAdminItems(searchTerm);
  });
}

/**
 * Filter admin items based on search term
 */
function filterAdminItems(searchTerm) {
  const menuContainer = document.getElementById('admin-menu-container');
  if (!menuContainer) return;
  
  const allItems = menuContainer.querySelectorAll('.admin-menu-item');
  let hasResults = false;
  
  if (searchTerm === '') {
    allItems.forEach(item => item.style.display = 'block');
    return;
  }
  
  allItems.forEach(item => {
    const itemName = item.querySelector('h3').textContent.toLowerCase();
    if (itemName.includes(searchTerm)) {
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
        <i class="fas fa-search"></i>
        <h3>პროდუქტი ვერ მოიძებნა</h3>
        <p>საძიებო ფრაზა: "${searchTerm}"</p>
      `;
      menuContainer.appendChild(noResultsElement);
    }
  } else if (noResults) {
    noResults.remove();
  }
}

/**
 * Initialize service charge form
 */
function initServiceChargeForm() {
  const form = document.getElementById('service-charge-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const enabled = document.getElementById('service-enabled').checked;
    const percentage = parseFloat(document.getElementById('service-percentage').value);
    
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      showAlert('გთხოვთ შეიყვანოთ სწორი პროცენტი (0-100)', 'error');
      return;
    }
    
    firebase.database().ref('serviceCharge').set({
      enabled: enabled,
      percentage: percentage
    })
    .then(() => {
      showAlert('სერვისის პარამეტრები წარმატებით შენახულია!', 'success');
    })
    .catch(error => {
      showAlert('სერვისის პარამეტრების შენახვის შეცდომა: ' + error.message, 'error');
    });
  });
}

/**
 * Load service charge settings from Firebase
 */
function loadServiceCharge() {
  firebase.database().ref('serviceCharge').once('value').then(snapshot => {
    const serviceData = snapshot.val();
    
    if (serviceData) {
      document.getElementById('service-enabled').checked = serviceData.enabled;
      document.getElementById('service-percentage').value = serviceData.percentage;
    }
  }).catch(error => {
    console.error("Error loading service charge: ", error);
    showAlert('სერვისის მონაცემების ჩატვირთვის შეცდომა: ' + error.message, 'error');
  });
}

/**
 * Initialize translation buttons
 */
function initTranslationButtons() {
  const autoTranslateBtn = document.getElementById('auto-translate-all');
  const saveTranslationsBtn = document.getElementById('save-translations');
  
  if (autoTranslateBtn) {
    autoTranslateBtn.addEventListener('click', autoTranslateAll);
  }
  
  if (saveTranslationsBtn) {
    saveTranslationsBtn.addEventListener('click', saveTranslations);
  }
}

/**
 * Load translations for the editor
 */
function loadTranslationsForEditor(lang) {
  const container = document.getElementById('translations-list');
  if (!container) return;
  
  firebase.database().ref(`translations/${lang}`).once('value').then(snapshot => {
    const translations = snapshot.val() || {};
    container.innerHTML = '';
    
    for (const [key, value] of Object.entries(translations)) {
      const row = document.createElement('div');
      row.className = 'translation-row';
      row.dataset.key = key;
      row.innerHTML = `
        <div class="translation-key-cell">${key}</div>
        <div class="translation-value-cell">
          <input type="text" class="translation-input" value="${value || ''}">
        </div>
      `;
      container.appendChild(row);
    }
  }).catch(error => {
    console.error("Error loading translations: ", error);
    showAlert('თარგმანების ჩატვირთვის შეცდომა: ' + error.message, 'error');
  });
}

/**
 * Load menu item translations
 */
function loadMenuItemTranslations(lang) {
  const container = document.getElementById('menu-item-translations-list');
  if (!container) return;
  
  firebase.database().ref('menuItems').once('value').then(snapshot => {
    const items = snapshot.val() || {};
    container.innerHTML = '';
    
    for (const [id, item] of Object.entries(items)) {
      const translations = item.translations || {};
      const row = document.createElement('div');
      row.className = 'menu-item-translation-row';
      row.dataset.id = id;
      
      row.innerHTML = `
        <div class="menu-item-name-cell">
          <strong>${item.name}</strong>
          <p>${item.description || ''}</p>
        </div>
        <div class="menu-item-translation-cell">
          ${createTranslationSection('English', 'en', id, translations)}
          ${createTranslationSection('Русский', 'ru', id, translations)}
          ${createTranslationSection('Türkçe', 'tr', id, translations)}
        </div>
      `;
      
      container.appendChild(row);
    }
    
    // Re-attach event listeners for translation buttons
    document.querySelectorAll('.auto-translate-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const itemId = this.dataset.id;
        const lang = this.dataset.lang;
        const type = this.dataset.type;
        autoTranslateItem(itemId, lang, type);
      });
    });
  }).catch(error => {
    console.error("Error loading menu item translations: ", error);
    showAlert('მენიუს თარგმანების ჩატვირთვის შეცდომა: ' + error.message, 'error');
  });
}

/**
 * Create translation section HTML
 */
function createTranslationSection(languageName, langCode, itemId, translations) {
  return `
    <div class="translation-row">
      <div class="language-label">${languageName}</div>
      <div class="translation-fields">
        <div class="form-group">
          <label>სახელი:</label>
          <input type="text" class="menu-item-name-input" data-lang="${langCode}" 
                 value="${translations[langCode]?.name || ''}">
          <button class="auto-translate-btn" data-id="${itemId}" data-lang="${langCode}" data-type="name">
            <i class="fas fa-robot"></i> თარგმნა
          </button>
        </div>
        <div class="form-group">
          <label>აღწერა:</label>
          <textarea class="menu-item-description-input" data-lang="${langCode}">${translations[langCode]?.description || ''}</textarea>
          <button class="auto-translate-btn" data-id="${itemId}" data-lang="${langCode}" data-type="description">
            <i class="fas fa-robot"></i> თარგმნა
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Auto-translate a single item field
 */
function autoTranslateItem(itemId, lang, type) {
  const statusEl = document.getElementById('translation-status');
  if (!statusEl) return;
  
  statusEl.textContent = 'თარგმნება...';
  statusEl.className = 'translation-status processing';
  
  firebase.database().ref(`menuItems/${itemId}`).once('value').then(snapshot => {
    const item = snapshot.val();
    if (!item) {
      statusEl.textContent = 'პროდუქტი ვერ მოიძებნა';
      statusEl.className = 'translation-status error';
      return;
    }
    
    const text = type === 'name' ? item.name : item.description;
    if (!text) {
      statusEl.textContent = 'ტექსტი ცარიელია';
      statusEl.className = 'translation-status error';
      return;
    }
    
    // Google Translate API endpoint
    const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ka&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
    
    fetch(translateUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data && data[0] && data[0][0] && data[0][0][0]) {
          const translatedText = data[0][0][0];
          
          // Update input field
          const selector = type === 'name' 
            ? `input.menu-item-name-input[data-lang="${lang}"]` 
            : `textarea.menu-item-description-input[data-lang="${lang}"]`;
          
          const input = document.querySelector(`[data-id="${itemId}"] ${selector}`);
          if (input) {
            input.value = translatedText;
          }
          
          statusEl.textContent = 'თარგმნა წარმატებით დასრულდა!';
          statusEl.className = 'translation-status success';
          setTimeout(() => statusEl.textContent = '', 3000);
        } else {
          throw new Error('Invalid translation response');
        }
      })
      .catch(error => {
        console.error('Translation error:', error);
        statusEl.textContent = 'თარგმნის შეცდომა: ' + error.message;
        statusEl.className = 'translation-status error';
      });
  }).catch(error => {
    console.error("Error getting item for translation: ", error);
    statusEl.textContent = 'პროდუქტის მოძებნის შეცდომა: ' + error.message;
    statusEl.className = 'translation-status error';
  });
}

/**
 * Auto-translate all items
 */
function autoTranslateAll() {
  const statusEl = document.getElementById('translation-status');
  if (!statusEl) return;
  
  statusEl.textContent = 'ყველა ელემენტის თარგმნა დაწყებულია...';
  statusEl.className = 'translation-status processing';
  
  const items = document.querySelectorAll('.menu-item-translation-row');
  if (items.length === 0) {
    statusEl.textContent = 'თარგმნისთვის პროდუქტები არ მოიძებნა';
    statusEl.className = 'translation-status error';
    return;
  }
  
  let completed = 0;
  const total = items.length * 6; // 3 languages * 2 fields (name + description)
  
  items.forEach(item => {
    const itemId = item.dataset.id;
    
    // Translate for all languages and both fields
    ['en', 'ru', 'tr'].forEach(lang => {
      ['name', 'description'].forEach(type => {
        setTimeout(() => {
          autoTranslateItem(itemId, lang, type);
          completed++;
          
          if (completed === total) {
            statusEl.textContent = 'ყველა ელემენტი თარგმნილია!';
            statusEl.className = 'translation-status success';
            setTimeout(() => statusEl.textContent = '', 5000);
          }
        }, 300 * completed); // Add delay to avoid rate limiting
      });
    });
  });
}

/**
 * Save all translations
 */
function saveTranslations() {
  const statusEl = document.getElementById('translation-status');
  if (!statusEl) return;
  
  statusEl.textContent = 'შენახვა მიმდინარეობს...';
  statusEl.className = 'translation-status processing';
  
  // Save static translations
  const staticTranslations = {};
  const staticRows = document.querySelectorAll('#translations-list .translation-row');
  staticRows.forEach(row => {
    const key = row.dataset.key;
    const value = row.querySelector('.translation-input').value.trim();
    if (key) staticTranslations[key] = value;
  });
  
  // Save menu item translations
  const menuItemUpdates = {};
  const menuItemRows = document.querySelectorAll('.menu-item-translation-row');
  menuItemRows.forEach(row => {
    const id = row.dataset.id;
    
    const nameInputs = row.querySelectorAll('.menu-item-name-input');
    const descInputs = row.querySelectorAll('.menu-item-description-input');
    
    nameInputs.forEach(input => {
      const lang = input.dataset.lang;
      const name = input.value.trim();
      if (name) {
        menuItemUpdates[`menuItems/${id}/translations/${lang}/name`] = name;
      }
    });
    
    descInputs.forEach(textarea => {
      const lang = textarea.dataset.lang;
      const description = textarea.value.trim();
      if (description) {
        menuItemUpdates[`menuItems/${id}/translations/${lang}/description`] = description;
      }
    });
  });
  
  // Combine all updates
  const updates = {
    ...menuItemUpdates
  };
  
  // Save current language static translations
  const currentLang = document.getElementById('translation-language')?.value || 'ka';
  updates[`translations/${currentLang}`] = staticTranslations;
  
  // Perform the update
  firebase.database().ref().update(updates)
    .then(() => {
      statusEl.textContent = 'ყველა თარგმანი წარმატებით შენახულია!';
      statusEl.className = 'translation-status success';
      setTimeout(() => statusEl.textContent = '', 3000);
    })
    .catch(error => {
      console.error("Error saving translations: ", error);
      statusEl.textContent = 'შენახვისას დაფიქსირდა შეცდომა: ' + error.message;
      statusEl.className = 'translation-status error';
    });
}

/**
 * Switch to a specific tab
 */
function switchToTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  
  document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById(`${tabId}-tab`).classList.add('active');
}