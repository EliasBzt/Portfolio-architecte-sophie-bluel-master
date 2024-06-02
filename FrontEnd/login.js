document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');
  
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Empêcher le rechargement de la page
  
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
  
        // Envoyer les informations de connexion à l'API
        fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Vos identifiants de connexion sont incorrects');
            }
            return response.json()
        })
        .then(json => {
            // Rediriger vers la page d'accueil si la connexion est réussie
            let user = json
            localStorage.setItem("token", user.token);
            window.location.href = 'index.html';
        })
        .catch(error => {
            // Afficher le message d'erreur dans l'élément HTML
            errorMessage.textContent = error && error.message ? error.message : 'Erreur inattendue';
        });
    });
  });
  