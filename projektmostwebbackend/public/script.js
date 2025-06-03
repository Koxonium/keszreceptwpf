Load()

function create() {
    const nameinput = document.getElementById("rname").value;
    const ingredientinput = document.getElementById("ringredients").value;

    if (!nameinput || !ingredientinput) {
        alert("Minden mezőt ki kell tölteni!");
        return;
    }

    const createreq = new XMLHttpRequest();
    createreq.open("POST", "/recipes");
    createreq.setRequestHeader("Content-Type", "application/json");

    createreq.send(JSON.stringify({
        name: nameinput,
        ingredients: ingredientinput,
    }));

    createreq.onreadystatechange = () => {
        if (createreq.readyState === 4) {
            alert("Recept létrehozva!");
            document.getElementById("rname").value = '';
            document.getElementById("ringredients").value = '';
        }
    };

    Load()
}


function Load() {
    const loadreq = new XMLHttpRequest();
    loadreq.open('get', '/recipes');
    loadreq.send();
    loadreq.onreadystatechange = () => {
        if (loadreq.readyState === 4 && loadreq.status === 200) {
            const result = JSON.parse(loadreq.response);
            const osszesDiv = document.getElementById('osszes');
            osszesDiv.innerHTML = '';

            result.forEach(item => {
                const recipeDiv = document.createElement('div');
                recipeDiv.classList.add('recipe-card')
                recipeDiv.style.backgroundColor = "rgba(0, 179, 255, 0.2)"
                const nameParagraph = document.createElement('p');
                const detailsButton = document.createElement('button');

                const detailsDiv = document.createElement('div');
                detailsDiv.classList.add('recipe-details');
                detailsDiv.style.display = "none"
                recipeDiv.appendChild(detailsDiv);

                nameParagraph.innerText = item.name;
                detailsButton.innerText = "Részletek";
                detailsButton.onclick = () => {
                    const detailsDiv = recipeDiv.querySelector('.recipe-details');
                    detailsDiv.style.display = "block"
                    showRecipeDetails(item.id, detailsDiv);
                };
                


                const editButton = document.createElement('button');
                editButton.innerText = "Szerkesztés";
                editButton.onclick = () => {
                    let existingEditDiv = recipeDiv.querySelector('.edit-div');

                    if (existingEditDiv) {
                        recipeDiv.removeChild(existingEditDiv);
                    } else {
                        const editDiv = document.createElement('div');
                        editDiv.classList.add('edit-div');

                        const newNameInput = document.createElement('input');
                        newNameInput.placeholder = "Új név";

                        const saveNewName = document.createElement('button');
                        saveNewName.innerHTML = "Mentés";

                        saveNewName.onclick = () => edit(item.id, newNameInput.value)

                        editDiv.appendChild(newNameInput);
                        editDiv.appendChild(saveNewName);

                        const ingredientEditButton = document.createElement('button');
                        ingredientEditButton.innerText = "Hozzávalók kezelése";
                        ingredientEditButton.onclick = () => {
                            const addDiv = document.createElement('div');
                            const deleteDiv = document.createElement('div');

                            const addInput = document.createElement('input');
                            addInput.placeholder = "Új hozzávaló";
                            addDiv.appendChild(addInput);

                            const deleteInput = document.createElement('input');
                            deleteInput.placeholder = "Hozzávaló törlése";
                            deleteDiv.appendChild(deleteInput);

                            ingredientEditButton.disabled = true;

                            const addSaveButton = document.createElement('button');
                            addSaveButton.innerText = "Mentés";
                            addDiv.appendChild(addSaveButton);

                            const delSaveButton = document.createElement('button');
                            delSaveButton.innerText = "Mentés";
                            deleteDiv.appendChild(delSaveButton);

                            editDiv.appendChild(addDiv);
                            editDiv.appendChild(deleteDiv);

                            addSaveButton.onclick = () => addIngredientFromForm(item.id, addInput.value);
                            delSaveButton.onclick = () => deleteIngredientFromRecipe(item.id, deleteInput.value);
                        };

                        editDiv.appendChild(ingredientEditButton);
                        recipeDiv.appendChild(editDiv);
                    }
                };

                recipeDiv.appendChild(nameParagraph);
                recipeDiv.appendChild(detailsButton);

                const deleteButton = document.createElement('button');
                deleteButton.innerText = 'Törlés';
                deleteButton.onclick = () => deleteRecipe(item.id);
                recipeDiv.appendChild(deleteButton);
                recipeDiv.appendChild(editButton);

                const showIngredients = document.createElement('button');
                showIngredients.innerText = "Hozzávalók megtekintése";
                showIngredients.onclick = () => {
                    let existingLookDiv = recipeDiv.querySelector('.recipe-div');
                    if(existingLookDiv){
                        recipeDiv.removeChild(existingLookDiv)
                    }
                    else{
                        const d = document.createElement('div');
                        d.classList.add('recipe-div');
                        recipeDiv.appendChild(d);
                        viewIngredients(item.id, d);
                    }

                    
                };
                recipeDiv.appendChild(showIngredients);

                const categoryButton = document.createElement('button')
                categoryButton.innerText = "Kategória"
                categoryButton.style.marginTop = "1em"

                categoryButton.onclick = () =>{
                    let existingDiv = recipeDiv.querySelector('.recipe-div');
                    if(existingDiv){
                        recipeDiv.removeChild(existingDiv)
                    }
                    else{
                        const categoryDiv = document.createElement('div')
                        categoryDiv.classList.add('recipe-div')

                        const categoryInput = document.createElement('input')
                        categoryInput.placeholder = "Kategória ID"

                        const saveCategoryButton = document.createElement('button')
                        saveCategoryButton.innerText = "Mentés"

                        saveCategoryButton.onclick = () => assignCategoryToRecipe(item.id, categoryInput.value)
                        
                        categoryDiv.appendChild(categoryInput)
                        categoryDiv.appendChild(saveCategoryButton)
                        recipeDiv.appendChild(categoryDiv)
                    }
                }
                recipeDiv.appendChild(categoryButton)

                osszesDiv.appendChild(recipeDiv);
            });
        }
    };
}


function showRecipeDetails(id, container) {
    if (container.innerHTML.trim() !== "") {
        container.innerHTML = "";
        container.style.display = "none"
        return;
    }

    const detailReq = new XMLHttpRequest();
    detailReq.open('GET', `/recipes/${id}`);
    detailReq.send();
    detailReq.onreadystatechange = () => {
        if (detailReq.readyState === 4) {
            if (detailReq.status === 200) {
                const recipe = JSON.parse(detailReq.response);
                container.innerHTML = `
                    <h3>${recipe.name}</h3>
                    <p>ID: ${recipe.id}</p>
                    <p>Összetevők: ${Array.isArray(recipe.ingredients) ? recipe.ingredients.join(', ') : recipe.ingredients}</p>
                `;
            } else {
                container.innerHTML = "<p>Hiba a recept betöltésekor.</p>";
            }
        }
    };
}


function deleteRecipe(id) {
    const deleteReq = new XMLHttpRequest();
    deleteReq.open("DELETE", `/recipes/${id}`);
    deleteReq.send();
    deleteReq.onreadystatechange = () => {
        if (deleteReq.readyState === 4) {
            const response = JSON.parse(deleteReq.responseText);
            alert(response.message);
            Load();
        }
    };
}



function searchByName() {
  const query = document.getElementById('searchInput').value;
  const searchreq = new XMLHttpRequest();
  searchreq.open('GET', `/recipes/title/${encodeURIComponent(query)}`);
  searchreq.send();
  searchreq.onreadystatechange = () => {
    if (searchreq.readyState === 4) {
      const list = JSON.parse(searchreq.responseText);
      const container = document.getElementById('searchResults');
      container.innerHTML = '<h3>Keresés eredménye:</h3>';
      if (searchreq.status === 200 && list.length) {
        list.forEach(item => {
          const div = document.createElement('div');
          div.innerHTML = `<strong>${item.name}</strong>: ${item.ingredients}`;
          container.appendChild(div);
        });
      } else {
        container.innerHTML += '<p>Nincs találat.</p>';
      }
    }
  };
}

function edit(recipeId, newName) {
    if (isNaN(recipeId)) {
        alert("Érvénytelen recept ID!");
        return;
    }

    const editReq = new XMLHttpRequest();
    editReq.open("PUT", `/recipes/${recipeId}`);
    editReq.setRequestHeader('Content-Type', 'application/json');
    editReq.send(JSON.stringify({
        name: newName,
    }));
    editReq.onreadystatechange = () => {
        if (editReq.readyState === 4) {
            const response = JSON.parse(editReq.responseText);
            alert(response.message);
            Load();
        }
    };
}


function reg() {
    const username = document.getElementById('regname').value;
    const password = document.getElementById('rpass').value;
    
    const regReq = new XMLHttpRequest();
    regReq.open("POST", "/users/register");
    regReq.setRequestHeader("Content-Type", "application/json");
    regReq.send(JSON.stringify({ username, password }));
    
    regReq.onreadystatechange = () => {
        if (regReq.readyState === 4) {
            const response = JSON.parse(regReq.responseText);
            if (regReq.status === 201) {
                alert(response.message + " Felhasználó ID: " + response.userId);
                window.location.href = "login.html"
            } else {
                alert("Hiba: " + response.message);
            }
        }
    };
}

function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const loginReq = new XMLHttpRequest();
    loginReq.open("POST", "/auth/login");
    loginReq.setRequestHeader("Content-Type", "application/json");
    loginReq.send(JSON.stringify({ username, password }));
    
    loginReq.onreadystatechange = () => {
        if (loginReq.readyState === 4) {
            const response = JSON.parse(loginReq.responseText);
            if (loginReq.status === 200) {
                alert(response.message);
                localStorage.setItem('jwtToken', response.token);
                window.location.href = "index.html"
            } else {
                alert("Hiba: " + response.message);
            }
        }
    };
}

function getProfile() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        alert("Először jelentkezz be!");
        return;
    }
    
    const profileReq = new XMLHttpRequest();
    profileReq.open("GET", "/users/me");
    profileReq.setRequestHeader("Authorization", `Bearer ${token}`);
    profileReq.send();
    
    profileReq.onreadystatechange = () => {
        if (profileReq.readyState === 4) {
            const profileDiv = document.getElementById('profileDetails');
            if (profileReq.status === 200) {
                const user = JSON.parse(profileReq.responseText);
                profileDiv.innerHTML = `
                    <p>Felhasználónév: ${user.username}</p>
                    <p>Regisztráció ideje: ${new Date(user.createdAt).toLocaleDateString()}</p>
                `;
            } else {
                profileDiv.innerHTML = "<p>Hiba a profil betöltésekor.</p>";
            }
        }
    };
}

function addIngredientFromForm(recipeId, addI) {
    if (!recipeId || !addI) {
        alert("Kérlek, add meg a recept ID-ját és a hozzávaló nevét.");
        return;
    }

    const req = new XMLHttpRequest();
    req.open("POST", `/recipes/${recipeId}/ingredients`);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({ name: addI }));

    req.onreadystatechange = () => {
        if (req.readyState === 4) {
            const res = JSON.parse(req.responseText);
            alert(res.message);
            document.getElementById("newIngredient").value = "";
        }
    };
}

async function viewIngredients(id, d) {

    const res = await fetch(`/recipes/${id}`);
    if (!res.ok) {
        d.innerText = "Nem található recept vagy hiba történt!";
        return;
    }

    const recipe = await res.json();
    const parts = recipe.ingredients.split(',').map(item => item.trim());
    const list = parts.map(item => `<li>${item}</li>`).join("");

    d.innerHTML = `<ul>${list}</ul>`;
}

async function deleteIngredientFromRecipe(recipeId, ingredientToDelete) {
    if (!ingredientToDelete.trim()) {
        alert("Kérlek, adj meg egy hozzávaló nevet!");
        return;
    }

    const recipeRes = await fetch(`/recipes/${recipeId}`);
    if (!recipeRes.ok) {
        d.innerText = "Recept nem található.";
        return;
    }

    const recipe = await recipeRes.json();
    const originalIngredientsArray = (recipe.ingredients || '')
        .split(',')
        .map(i => i.trim());

    const updatedIngredientsArray = originalIngredientsArray
        .filter(i => i.toLowerCase() !== ingredientToDelete.toLowerCase());

    if (updatedIngredientsArray.length === originalIngredientsArray.length) {
        alert("Nincs ilyen hozzávaló a receptben.");
        return;
    }

    const updatedIngredients = updatedIngredientsArray.join(', ');

    const updateRes = await fetch(`/recipes/${recipeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: recipe.name, ingredients: updatedIngredients })
    });

    const result = await updateRes.json();

    if (updateRes.ok) {
        alert("Hozzávaló sikeresen törölve!");
        document.getElementById("ingredientDeleteMsg").innerText = result.message || "Sikeres törlés.";
        Load(); 
    } else {
        alert("Hiba történt a törlés során.");
        document.getElementById("ingredientDeleteMsg").innerText = result.message || "Törlés sikertelen.";
    }
}


function searchByCategory() {
    const category = document.getElementById('categoryInput').value;
    const req = new XMLHttpRequest();
    req.open('GET', `/recipes?category=${encodeURIComponent(category)}`);
    req.send();

    req.onreadystatechange = () => {
        if (req.readyState === 4) {
            const container = document.getElementById('categoryResults');
            container.innerHTML = '<h3>Kategória szerinti találatok:</h3>';
            if (req.status === 200) {
                const recipes = JSON.parse(req.responseText);
                if (recipes.length === 0) {
                    container.innerHTML += '<p>Nincs találat.</p>';
                } else {
                    recipes.forEach(recipe => {
                        const div = document.createElement('div');
                        div.innerHTML = `<strong>${recipe.name}</strong>: ${recipe.ingredients}`;
                        container.appendChild(div);
                    });
                }
            } else {
                container.innerHTML += '<p>Hiba a lekérdezés során.</p>';
            }
        }
    };
}

function searchByIngredient() {
    const ingredient = document.getElementById('ingredientInput').value;
    const req = new XMLHttpRequest();
    req.open('GET', `/recipes?ingredient=${encodeURIComponent(ingredient)}`);
    req.send();

    req.onreadystatechange = () => {
        if (req.readyState === 4) {
            const container = document.getElementById('ingredientResults');
            container.innerHTML = '<h3>Hozzávaló szerinti találatok:</h3>';
            if (req.status === 200) {
                const recipes = JSON.parse(req.responseText);
                if (recipes.length === 0) {
                    container.innerHTML += '<p>Nincs találat.</p>';
                } else {
                    recipes.forEach(recipe => {
                        const div = document.createElement('div');
                        div.innerHTML = `<strong>${recipe.name}</strong>: ${recipe.ingredients}`;
                        container.appendChild(div);
                    });
                }
            } else {
                container.innerHTML += '<p>Hiba a lekérdezés során.</p>';
            }
        }
    };
}

function loadPopularCategories() {
    const req = new XMLHttpRequest();
    req.open('GET', '/categories/popular');
    req.send();

    req.onreadystatechange = () => {
        if (req.readyState === 4) {
            const container = document.getElementById('popularCategories');
            container.style.display = "block"

            container.innerHTML = '<h3>Legnépszerűbb kategóriák:</h3>';
            if (req.status === 200) {
                const categories = JSON.parse(req.responseText);
                if (categories.length === 0) {
                    container.innerHTML += '<p>Nincs adat.</p>';
                } else {
                    const list = document.createElement('ul');
                    categories.forEach(cat => {
                        liText = `${cat.category.name} (${cat.count} recept)`;
                        const li = document.createElement('li');
                        li.innerText = liText;
                        li.style.listStyleType = "none"
                        list.appendChild(li);
                    });
                    container.appendChild(list);
                }
            } else {
                container.innerHTML += '<p>Hiba a kategóriák lekérdezésekor.</p>';
            }
        }
    };
}

function loadCategories() {
    const req = new XMLHttpRequest();
    req.open("GET", "/categories");
    req.send();

    req.onreadystatechange = () => {
        if (req.readyState === 4) {
            const container = document.getElementById("categoryList");
            container.style.display = "block"
            container.innerHTML = "<h3>Kategóriák:</h3>";
            if (req.status === 200) {
                const categories = JSON.parse(req.responseText);
                const list = document.createElement('ul');
                categories.forEach(cat => {
                    const li = document.createElement('li');
                    li.innerText = `${cat.id} - ${cat.name}`;
                    li.style.listStyleType = "none"
                    list.appendChild(li);
                });
                container.appendChild(list);
                const select = document.getElementById("rcategory");
                if (select) {
                    select.innerHTML = '';
                    categories.forEach(cat => {
                        const option = document.createElement("option");
                        option.value = cat.id;
                        option.textContent = cat.name;
                        select.appendChild(option);
                    });
                }
            } else {
                container.innerHTML += "<p>Hiba a kategóriák lekérdezésekor.</p>";
            }
        }
    };
}

function createCategory() {
    const name = document.getElementById("categoryName").value;
    if (!name) {
        alert("Adj meg egy kategóriannevet!");
        return;
    }

    const req = new XMLHttpRequest();
    req.open("POST", "/categories");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({ name }));

    req.onreadystatechange = () => {
        if (req.readyState === 4) {
            const res = JSON.parse(req.responseText);
            alert(res.message || "Kategória létrehozva.");
            loadCategories();
            document.getElementById("categoryName").value = '';
        }
    };
}

function assignCategoryToRecipe(recipeId, categoryId) {
    if (!recipeId || !categoryId) {
        alert("Add meg a recept ID-ját és a kategória ID-ját!");
        return;
    }

    const req = new XMLHttpRequest();
    req.open("PUT", `/recipes/${recipeId}/category`);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({ categoryId }));

    req.onreadystatechange = () => {
        if (req.readyState === 4) {
            const res = JSON.parse(req.responseText);
            alert(res.message || "Kategória hozzárendelve.");
        }
    };
}


window.onload = () => {
    loadCategories();
};

document.getElementById("openModalBtn").addEventListener("click", function() {
    document.getElementById("recipeModal").style.display = "block";
});

document.getElementById("closeModalBtn").addEventListener("click", function() {
    document.getElementById("recipeModal").style.display = "none";
});

window.onclick = function(event) {
    let modal = document.getElementById("recipeModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

function openSearchTab(tabName) {
    const tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = "none";
    }

    const tabButtons = document.getElementsByClassName("tab-button");
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].className = tabButtons[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";
}

function goToReg(){
    window.location.href = "register.html"
}

function goToLogin(){
    window.location.href = "login.html"
}