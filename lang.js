// lang.js

const translations = {
  "restaurant-title": {
    "ka": "სათაფა",
    "en": "Satapa",
    "ru": "Сатапа",
    "tr": "Satapa"
  },
  "location": {
    "ka": "რუსთაველის გამზირი 13, თბილისი",
    "en": "13 Rustaveli Ave, Tbilisi",
    "ru": "проспект Руставели 13, Тбилиси",
    "tr": "Rustaveli Cad. 13, Tiflis"
  },
  "wifi": {
    "ka": "WiFi: Gourmet_2023",
    "en": "WiFi: Gourmet_2023",
    "ru": "WiFi: Gourmet_2023",
    "tr": "WiFi: Gourmet_2023"
  },
  "info": {
    "ka": "ჩვენი რესტორანი მოგაწვდით ტრადიციულ და თანამედროვე ქართულ კერძებს. ყველა პროდუქტი ადგილობრივი ფერმერებისგან არის შერჩეული.",
    "en": "Our restaurant offers traditional and modern Georgian dishes. All products are selected from local farmers.",
    "ru": "Наш ресторан предлагает традиционные и современные грузинские блюда. Все продукты отобраны у местных фермеров.",
    "tr": "Restoranımız geleneksel ve modern Gürcü yemekleri sunmaktadır. Tüm ürünler yerel çiftçilerden seçilmiştir."
  },
  "spacing": {
    "ka": "ყოველდღე: 10:00 - 23:00",
    "en": "Every day: 10:00 AM - 11:00 PM",
    "ru": "Ежедневно: 10:00 - 23:00",
    "tr": "Her gün: 10:00 - 23:00"
  },
  "button-all": {
    "ka": "ყველა",
    "en": "All",
    "ru": "Все",
    "tr": "Tümü"
  },
  "button-breakfast": {
    "ka": "საუზმე",
    "en": "Breakfast",
    "ru": "Завтрак",
    "tr": "Kahvaltı"
  },
  "button-hot-dishes": {
    "ka": "ცხელი კერძები",
    "en": "Hot Dishes",
    "ru": "Горячие блюда",
    "tr": "Sıcak Yemekler"
  },
  "button-salads": {
    "ka": "სალათები",
    "en": "Salads",
    "ru": "Салаты",
    "tr": "Salatalar"
  },
  "button-desserts": {
    "ka": "დესერტები",
    "en": "Desserts",
    "ru": "Десерты",
    "tr": "Tatlılar"
  },
  "button-wine": {
    "ka": "ღვინო",
    "en": "Wine",
    "ru": "Вино",
    "tr": "Şarap"
  },
  "search-placeholder": {
    "ka": "მენიუში ძებნა...",
    "en": "Search menu...",
    "ru": "Поиск в меню...",
    "tr": "Menüde ara..."
  },
  "cart-title": {
    "ka": "თქვენი მენიუ",
    "en": "Your Menu",
    "ru": "Ваше меню",
    "tr": "Menünüz"
  },
  "clear-cart": {
    "ka": "მენიუს გასუფთავება",
    "en": "Clear Menu",
    "ru": "Очистить меню",
    "tr": "Menüyü Temizle"
  },
  "admin-btn": {
    "ka": "ადმინი",
    "en": "Admin",
    "ru": "Админ",
    "tr": "Admin"
  },
  "add-to-cart": {
  "ka": "კალათაში დამატება",
  "en": "Add to Cart",
  "ru": "Добавить в меню",
  "tr": "Menüye Ekle"
},
  "restaurant-title": {
    "ka": "სათაფა",
    "en": "Satapa",
    "ru": "Сатапа",
    "tr": "Satapa"
  },
  "add-to-cart": {
    "ka": "კალათაში დამატება",
    "en": "Add to cart",
    "ru": "Добавить в корзину",
    "tr": "Sepete ekle"
  },
  // შეგიძლია სხვა ტექსტებიც დაამატო ასე:
  "კატეგორია": {
    "ka": "კატეგორია",
    "en": "Category",
    "ru": "Категория",
    "tr": "Kategori"
  },
  "წაშლა": {
    "ka": "წაშლა",
    "en": "Delete",
    "ru": "Удалить",
    "tr": "Sil"
  },
  "ხელმისაწვდომი": {
    "ka": "ხელმისაწვდომი",
    "en": "Available",
    "ru": "Доступно",
    "tr": "Mevcut"
  },
  "დამალული": {
    "ka": "დამალული",
    "en": "Hidden",
    "ru": "Скрыто",
    "tr": "Gizli"
  },
  "მენიუს გასუფთავება": {
    "ka": "მენიუს გასუფთავება",
    "en": "Clear menu",
    "ru": "Очистить меню",
    "tr": "Menüyü temizle"
  },
  "თქვენი მენიუ": {
    "ka": "თქვენი მენიუ",
    "en": "Your Menu",
    "ru": "Ваше меню",
    "tr": "Menünüz"
  }
  
}
const cartTranslations = {
  ka: "კალათაში დამატება",
  en: "Add to Cart",
  ru: "Добавить в корзину",
  tr: "Sepete Ekle"
};

// თარგმნის მთელ გვერდს არჩეული ენით
function translatePage(lang) {
  // ძირითადი ბლოკების თარგმნა
  const el = (selector) => document.querySelector(selector);
  const all = (selector) => document.querySelectorAll(selector);

  el('.restaurant-title').textContent = translations["restaurant-title"][lang];
  el('.location').childNodes[1].nodeValue = " " + translations["location"][lang];
  el('.wifi').childNodes[1].nodeValue = " " + translations["wifi"][lang];
  el('.info-section .info').textContent = translations["info"][lang];
  el('.info-section .spacing').textContent = translations["spacing"][lang];

  // ღილაკები (მენიუს კატეგორიები)
  all('.button-group .tag').forEach(btn => {
    const category = btn.getAttribute('data-category');
    switch (category) {
      case "all":
        btn.textContent = translations["button-all"][lang];
        break;
      case "საუზმე":
        btn.textContent = translations["button-breakfast"][lang];
        break;
      case "ცხელი კერძები":
        btn.textContent = translations["button-hot-dishes"][lang];
        break;
      case "სალათები":
        btn.textContent = translations["button-salads"][lang];
        break;
      case "დესერტები":
        btn.textContent = translations["button-desserts"][lang];
        break;
      case "ღვინო":
        btn.textContent = translations["button-wine"][lang];
        break;
    }
  });

  // ძებნის placeholder
  el('#search-input').setAttribute('placeholder', translations["search-placeholder"][lang]);

  // კალათისა და ადმინის ტექსტები
  el('#cart-panel h2').textContent = translations["cart-title"][lang];
  el('#clear-cart').textContent = translations["clear-cart"][lang];
  all('.admin-btn').forEach(el => {
    el.textContent = translations["admin-btn"][lang];
  });
}

// ენის ცვლილება dropdown-დან
document.querySelector('.language-select').addEventListener('change', e => {
  translatePage(e.target.value);
});

// დატვირთვისას ავტომატურად აირჩიოს ქართული
window.addEventListener('DOMContentLoaded', () => {
  const select = document.querySelector('.language-select');
  translatePage(select.value);
});
