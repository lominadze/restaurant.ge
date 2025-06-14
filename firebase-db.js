const firebaseConfig = {
  apiKey: "AIzaSyA7orLva5kfdJK3MsT5uXp9RYfycRYNQg8",
  authDomain: "restaurant-menu-2652a.firebaseapp.com",
  projectId: "restaurant-menu-2652a",
  storageBucket: "restaurant-menu-2652a.firebasestorage.app",
  messagingSenderId: "320792367742",
  appId: "1:320792367742:web:5881bfc879ec669eca7e2f",
  measurementId: "G-9FMF7MFXWT"
};
// firebase-db.js
// ინიციალიზაცია
firebase.initializeApp(firebaseConfig);

// დაამატეთ ეს ხაზები
const storage = firebase.storage();
const database = firebase.database();