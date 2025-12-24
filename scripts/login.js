// scripts/login.js

const form = document.getElementById('loginForm');
const loader = document.getElementById('miniLoader');
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const submitBtn = form.querySelector('button[type="submit"]');

// Demo credentials
const DEMO_USER = {
  email: 'a',
  password: '1'
};

// Fake async auth (Firebase-like)
function fakeAuth(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === DEMO_USER.email && password === DEMO_USER.password) {
        resolve({ uid: 'demo-uid', email });
      } else {
        reject();
      }
    }, 600);
  });
}

function resetUI() {
  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  resetUI();
  loader.style.display = 'block';
  submitBtn.disabled = true;

  try {
    const user = await fakeAuth(email, password);

    localStorage.setItem('cs_user', JSON.stringify(user));

    loader.style.display = 'none';
    successMsg.style.display = 'block';

    setTimeout(() => {
      window.location.href = './pages/dashboard.html';
    }, 700);

  } catch {
    loader.style.display = 'none';
    errorMsg.style.display = 'block';
    submitBtn.disabled = false;
  }
});
