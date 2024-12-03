document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        fetch('http://localhost:8080/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to login');
            }
        })
        .then(data => {
            localStorage.setItem('jwtToken', data.jwtToken);
            console.log(data.jwtToken);
            window.location.href = './adminPanel.html';
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
    });
    // Register logic
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const regUsername = document.getElementById('regUsername').value;
        const regPassword = document.getElementById('regPassword').value;
        const email = document.getElementById('email').value;
        const wiek = parseInt(document.getElementById('wiek').value);

        fetch('http://localhost:8080/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: regUsername, password: regPassword, email, wiek, websiteNameUser: "author" }),
        })
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('Failed to register');
            }
        })
        .then(data => {
            alert('User registered successfully');
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
    });
});
