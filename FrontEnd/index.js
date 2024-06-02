document.addEventListener('DOMContentLoaded', function() {
    const worksUrl = 'http://localhost:5678/api/works';
    const categoriesUrl = 'http://localhost:5678/api/categories';

    async function fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur lors de la récupération des données depuis ${url}`);
        }
        return response.json();
    }

    function createCategoryButtons(categoriesData, container) {
        categoriesData.forEach(category => {
            const categoryButton = document.createElement('button');
            categoryButton.textContent = category.name;
            categoryButton.dataset.categoryId = category.id;
            categoryButton.classList.add('categoryButton');
            container.appendChild(categoryButton);
        });
    }

    function updateGallery(filteredWorks) {
        const mainGallery = document.getElementById('mainGallery');
        mainGallery.innerHTML = '';

        filteredWorks.forEach(work => {
            const figure = document.createElement('figure');
            const img = document.createElement('img');
            const figcaption = document.createElement('figcaption');

            img.src = work.imageUrl;
            img.alt = work.title;
            figcaption.textContent = work.title;

            figure.appendChild(img);
            figure.appendChild(figcaption);
            mainGallery.appendChild(figure);
        });

        cloneGalleryToModal(filteredWorks);
    }

    function cloneGalleryToModal(works) {
        const modalGallery = document.getElementById('modalGallery');
        modalGallery.innerHTML = '';

        works.forEach(work => {
            const figure = document.createElement('figure');
            const img = document.createElement('img');
            const deleteButton = document.createElement('button');

            img.src = work.imageUrl;
            img.alt = work.title;
            
            deleteButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', () => deleteImage(work.id, figure));

            figure.appendChild(img);
            figure.appendChild(deleteButton);
            modalGallery.appendChild(figure);
        });
    }

    async function deleteImage(id, figureElement) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5678/api/works/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (!response.ok) {
                throw new Error('Erreur lors de la suppression de l\'image');
            }
    
            // Suppression réussie, retirer l'image de la galerie modale
            figureElement.remove();
            console.log('Image supprimée avec succès');
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'image :', error.message);
        }
    }
    

    async function loadWorksAndCategories() {
        try {
            const [worksData, categoriesData] = await Promise.all([
                fetchData(worksUrl),
                fetchData(categoriesUrl)
            ]);

            const categoryButtonsContainer = document.getElementById('categoryButtons');
            
            // Vérifier si le token est présent
            if (!localStorage.getItem('token')) {
                const allCategoryButton = document.createElement('button');
                allCategoryButton.textContent = 'Tous';
                allCategoryButton.dataset.categoryId = 'all';
                allCategoryButton.classList.add('categoryButton');
                categoryButtonsContainer.appendChild(allCategoryButton);
                createCategoryButtons(categoriesData, categoryButtonsContainer);
    
                const categoryButtons = document.querySelectorAll('.categoryButton');
                categoryButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const categoryId = button.dataset.categoryId;
                        const filteredWorks = categoryId === 'all' ? worksData : worksData.filter(work => work.categoryId == categoryId);
                        updateGallery(filteredWorks);
                        categoryButtons.forEach(btn => btn.classList.remove('active'));
                        button.classList.add('active');
                    });
                });
    
                const firstButton = categoryButtons[0];
                firstButton.classList.add('active');
                firstButton.click();
            } else {
                updateGallery(worksData); // Si l'utilisateur est connecté, afficher toutes les œuvres
            }

            populateCategorySelect(categoriesData); // Appel pour remplir le <select> avec les catégories

        } catch (error) {
            console.error('Erreur lors du chargement des travaux et des catégories :', error.message);
        }
    }

    function populateCategorySelect(categoriesData) {
        const categorySelect = document.getElementById('categoryInput');
        categorySelect.innerHTML = ''; // Clear existing options

        // Ajouter une option vide par défaut
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Sélectionner une catégorie';
        categorySelect.appendChild(defaultOption);

        // Ajouter les options de catégories
        categoriesData.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }

    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    function displayTopBar() {
        const topBar = document.getElementById("topBar");
        topBar.style.display = "block";
    }

    function displayEditButton() {
        const modalButton = document.getElementById("ModalButton");
        modalButton.style.display = "block";
    }

    if (localStorage.getItem('token')) {
        displayTopBar();
        displayEditButton();
    }

    loadWorksAndCategories();

    const editionButton = document.getElementById('editionButton');
    const imagePreview = document.getElementById('imagePreview');
    const imagefile = document.getElementById('imagefile');
    
    if (imagefile) {
        imagefile.addEventListener('change', function(){
            console.log("changement de l'image en cours")
            const file = this.files[0];

            if (file){
                let imageURL = URL.createObjectURL(file);
                imagePreview.innerHTML = `<img src="${imageURL}" alt="photo a envoyer">`
            }
        });
    }

    if (editionButton) {
        editionButton.addEventListener('click', function(event) {
            event.preventDefault();
            const title = document.getElementById('titleInput').value;
            const categoryId = document.getElementById('categoryInput').value;
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('title', title);
            formData.append('category', categoryId);
            formData.append('image', imagefile.files[0]);
            
            fetch('http://localhost:5678/api/works', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors de la création du nouvel élément');
                }
                return response.json();
            })
            .then(data => {
                console.log('Nouvel élément créé :', data);
                window.location.reload();
            })
            .catch(error => {
                console.error('Erreur lors de la création du nouvel élément :', error.message);
            });
        });
    }

    const spans = document.querySelectorAll(".close");

    spans.forEach(span => {
        span.onclick = function() {
            const modal = document.getElementById("myModal");
            modal.style.display = "none";
            loadWorksAndCategories();
        }
    });

    window.onclick = function(event) {
        const modal = document.getElementById("myModal");
        if (event.target == modal) {
            modal.style.display = "none";
            loadWorksAndCategories();
        }
    }

    function openModal() {
        const modal = document.getElementById('myModal');
        modal.style.display = 'block';
    }

    const modalButton = document.getElementById('ModalButton');
    if (modalButton) {
        modalButton.addEventListener('click', openModal);
    }

    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    const goToPage2Button = document.getElementById('goToPage2');
    const leftArrowButton = document.getElementById('leftArrow');

    if (goToPage2Button) {
        goToPage2Button.addEventListener('click', function() {
            page1.classList.remove('active');
            page1.classList.add('hidden');
            page2.classList.remove('hidden');
            page2.classList.add('active');
        });
    }

    if (leftArrowButton) {
        leftArrowButton.addEventListener('click', function(event) {
            event.preventDefault();
            page2.classList.remove('active');
            page2.classList.add('hidden');
            page1.classList.remove('hidden');
            page1.classList.add('active');
        });
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const imagefile = document.getElementById('imagefile');
    const imagePreview = document.getElementById('imagePreview');
    const icon = document.getElementById('icon');
    const uploadLabel = document.getElementById('uploadLabel');
    const fileInfo = document.getElementById('fileInfo');

    imagefile.addEventListener('change', function(){
        console.log("changement de l'image en cours");
        const file = this.files[0];

        if (file) {
            const imageURL = URL.createObjectURL(file);
            imagePreview.innerHTML = `<img src="${imageURL}" alt="photo à envoyer" class="preview-image">`;

            // Masquer les éléments
            icon.style.display = 'none';
            uploadLabel.style.display = 'none';
            fileInfo.style.display = 'none';
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const imagefile = document.getElementById('imagefile');
    const imagePreview = document.getElementById('imagePreview');
    const icon = document.getElementById('icon');
    const uploadLabel = document.getElementById('uploadLabel');
    const fileInfo = document.getElementById('fileInfo');
    const titleInput = document.getElementById('titleInput');
    const categoryInput = document.getElementById('categoryInput');
    const editionButton = document.getElementById('editionButton');

    function checkFields() {
        if (imagefile.files.length > 0 && titleInput.value.trim() !== '' && categoryInput.value.trim() !== '') {
            editionButton.style.backgroundColor = '#1D6154';
            editionButton.disabled = false;
        } else {
            editionButton.style.backgroundColor = '#A7A7A7';
            editionButton.disabled = true;
        }
    }

    imagefile.addEventListener('change', function(){
        console.log("changement de l'image en cours");
        const file = this.files[0];

        if (file) {
            const imageURL = URL.createObjectURL(file);
            imagePreview.innerHTML = `<img src="${imageURL}" alt="photo à envoyer" class="preview-image">`;

            // Masquer les éléments
            icon.style.display = 'none';
            uploadLabel.style.display = 'none';
            fileInfo.style.display = 'none';
        }
        checkFields();
    });

    titleInput.addEventListener('input', checkFields);
    categoryInput.addEventListener('change', checkFields);
});
