document.addEventListener('DOMContentLoaded', function() {
    // ========== AUTHENTICATION SYSTEM ==========
    const accountLink = document.getElementById('accountLink');
    const plannerLink = document.getElementById('plannerLink');
    const aboutLink = document.getElementById('aboutLink');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const loginForm = document.getElementById('login');
    const signupForm = document.getElementById('signup');
    const darkModeToggle = document.getElementById('darkModeToggle');

    // URLs that require authentication
    const restrictedPages = ['planner.html', 'index.html', 'about.html'];

    function checkAuthStatus() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const currentPath = window.location.pathname.split('/').pop();

        // If the user is on a restricted page and not logged in, redirect to login.
        if (!currentUser && restrictedPages.includes(currentPath)) {
            window.location.href = 'login.html';
        }

        // If logged in, update the navbar.
        if (currentUser) {
            if (accountLink) {
                accountLink.textContent = 'Logout';
                accountLink.href = '#'; // Prevents navigating away
            }
            if (userProfile) {
                userProfile.classList.remove('hidden');
                userName.textContent = currentUser.name;
                userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
            }
        }
    }

    // Login logic
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const user = { name: email.split('@')[0], email: email };
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'index.html';
        });
    }

    // Signup logic
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const user = { name: name, email: email };
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'index.html';
        });
    }

    // Handle Logout
    if (accountLink) {
        accountLink.addEventListener('click', function(e) {
            if (accountLink.textContent === 'Logout') {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            }
        });
    }

    // ========== DARK MODE TOGGLE ==========
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode);
            darkModeToggle.querySelector('i').className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        });

        // Set initial state
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            darkModeToggle.querySelector('i').className = 'fas fa-sun';
        }
    }

    // ========== MEAL PLANNER INTERACTIVITY ==========
    const plannerGrid = document.querySelector('.planner-grid');
    const aiGeneratorSection = document.querySelector('.ai-generator');
    const shoppingList = document.querySelector('.shopping-list ul');

    if (plannerGrid) {
        // Mock data for recipes
        const recipes = [
            { name: 'Creamy Tomato Pasta', ingredients: ['pasta', 'olive oil', 'garlic', 'crushed tomatoes', 'heavy cream', 'parmesan cheese', 'salt', 'pepper', 'fresh basil'] },
            { name: 'Grilled Lemon Salmon', ingredients: ['salmon fillet', 'olive oil', 'lemon', 'garlic', 'dill', 'salt', 'pepper'] },
            { name: 'Avocado Toast Deluxe', ingredients: ['bread', 'avocado', 'lime', 'garlic powder', 'salt', 'pepper', 'red pepper flakes', 'pumpkin seeds'] },
            { name: 'Chicken Caesar Salad', ingredients: ['romaine lettuce', 'chicken breast', 'croutons', 'parmesan cheese', 'caesar dressing'] },
            { name: 'Vegetable Stir Fry', ingredients: ['broccoli', 'carrots', 'bell pepper', 'snap peas', 'ginger', 'soy sauce', 'rice vinegar'] }
        ];

        function getRecipeData(name) {
            return recipes.find(r => r.name === name);
        }

        // Drag and drop functionality
        document.querySelectorAll('.planner-recipes .card').forEach(card => {
            card.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text/plain', this.querySelector('h4').textContent);
            });
        });

        document.querySelectorAll('.day .slot').forEach(slot => {
            slot.addEventListener('dragover', function(e) {
                e.preventDefault();
            });

            slot.addEventListener('drop', function(e) {
                e.preventDefault();
                const recipeName = e.dataTransfer.getData('text/plain');
                const existingRecipe = this.querySelector('.card');
                if (existingRecipe) {
                    existingRecipe.remove();
                }

                const newCard = document.createElement('div');
                newCard.className = 'card';
                const recipeData = getRecipeData(recipeName);
                newCard.innerHTML = `
                    <h4>${recipeName}</h4>
                    <p class="muted">${recipeData.ingredients.slice(0, 3).join(', ')}</p>
                `;
                this.appendChild(newCard);
                updateShoppingList();
            });
        });

        document.querySelector('.planner-actions .btn').addEventListener('click', updateShoppingList);
        document.querySelector('.planner-actions .btn.outline').addEventListener('click', clearPlanner);

        function updateShoppingList() {
            // Get all planned recipes
            const plannedRecipes = [];
            document.querySelectorAll('.day .slot .card h4').forEach(title => {
                plannedRecipes.push(title.textContent);
            });
            
            // Get all ingredients
            const allIngredients = [];
            plannedRecipes.forEach(recipeName => {
                const recipe = getRecipeData(recipeName);
                if (recipe) {
                    recipe.ingredients.forEach(ingredient => {
                        if (!allIngredients.includes(ingredient)) {
                            allIngredients.push(ingredient);
                        }
                    });
                }
            });
            
            // Update shopping list UI
            shoppingList.innerHTML = '';
            allIngredients.forEach(ingredient => {
                const li = document.createElement('li');
                li.textContent = ingredient;
                shoppingList.appendChild(li);
            });
            
            if (allIngredients.length === 0) {
                shoppingList.innerHTML = '<li class="muted">No ingredients needed. Add some recipes to your plan!</li>';
            }
        }
        
        function clearPlanner() {
            if (confirm('Are you sure you want to clear your meal plan?')) {
                document.querySelectorAll('.day .slot').forEach(slot => {
                    slot.innerHTML = '';
                });
                updateShoppingList();
            }
        }
    }

    // ========== AI GENERATOR SYSTEM ==========
    if (aiGeneratorSection) {
        const generateAIButton = document.getElementById('generateAIButton');
        const aiIngredientsInput = document.getElementById('aiIngredients');
        const aiResult = document.getElementById('aiResult');
        
        generateAIButton.addEventListener('click', () => {
            const ingredients = aiIngredientsInput.value;
            if (ingredients.trim() === '') {
                aiResult.innerHTML = '<div class="error">Please enter at least one ingredient.</div>';
                return;
            }
            
            // Show loading state
            aiResult.innerHTML = '<div class="loading">Generating recipe...</div>';
            
            // Simulates a loading state for 2 seconds
            setTimeout(() => {
                const recipe = generateAIRecipe(ingredients);
                displayAIRecipe(recipe);
            }, 2000);
        });
    }
    
    // Mock AI Recipe Generation
    function generateAIRecipe(ingredients) {
        const ingredientList = ingredients.split(',').map(i => i.trim());
        const recipes = [
            { name: "Hearty Vegetable Stir Fry", ingredients: [...ingredientList, "soy sauce", "garlic", "ginger"], steps: ["Chop all ingredients.", "Heat oil in a wok.", "Stir fry vegetables until tender.", "Add sauce and serve."], prepTime: "15 minutes" },
            { name: "Savory Skillet Dinner", ingredients: [...ingredientList, "onion", "olive oil"], steps: ["Dice the onions and sauté.", "Add your ingredients to the pan.", "Cook until tender and seasoned."], prepTime: "20 minutes" }
        ];
        return recipes[Math.floor(Math.random() * recipes.length)];
    }
    
    function displayAIRecipe(recipe) {
        aiResult.innerHTML = `
            <h3>${recipe.name}</h3>
            <p><strong>Prep Time:</strong> ${recipe.prepTime}</p>
            <p><strong>Ingredients:</strong> ${recipe.ingredients.join(', ')}</p>
            <h4>Instructions:</h4>
            <ol>
                ${recipe.steps.map(step => `<li>${step}</li>`).join('')}
            </ol>
        `;
    }

    // ========== INITIALIZE ==========
    checkAuthStatus();
});
