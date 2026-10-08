import { initTheme, toggleTheme } from "./theme.js";

let selectedRecipe = null;

let thresholdLowCarb = 15.0;
let thresholdLowSugar = 2.0;
let thresholdLowFat = 3.0;
let thresholdLowCal = 200.0;

let searchQuery = "";

let bookmarkedIdList = [];
let bookmarkedFlagList = [];

const mainEl = document.getElementById("main-panel");
const appHeaderEl = document.getElementById("header-panel");
const shownRecipeEl = document.getElementById("shown-recipe");
const listEl = document.getElementById("recipe-list");
const emptyStateEl = document.getElementById("empty-state");
const noResultsEl = document.getElementById("no-results");
const searchInput = document.getElementById("search-input");
//const btnAdd = document.getElementById("add-btn");
//const btnMealType = document.getElementById("btn-meal-type");
const btnLowCarb = document.getElementById("btn-low-carb");
const btnLowSugar = document.getElementById("btn-low-sugar");
const btnLowFat = document.getElementById("btn-low-fat");
const btnLowCal = document.getElementById("btn-low-cal");
const btnBookmarked = document.getElementById("btn-bookmarked");
const btnAbout = document.getElementById("btn-about");
const btnConfig = document.getElementById("btn-config");
const btnExport = document.getElementById("btn-export");
const btnImport = document.getElementById("btn-import");
const themeToggleBtn = document.getElementById("theme-toggle");

const dialogAbout = document.getElementById("dialog-about");
const btnCloseAbout = document.getElementById("btn-close-about");

const dialogConfig = document.getElementById("dialog-config");
const btnCloseConfig = document.getElementById("btn-close-config");

const dialogImport = document.getElementById("dialog-import");
const btnCloseImport = document.getElementById("btn-close-import");

const sliderLowCarb = document.getElementById("slider-low-carb");
const sliderLowCal = document.getElementById("slider-low-cal");
const sliderLowSugar = document.getElementById("slider-low-sugar");
const sliderLowFat = document.getElementById("slider-low-fat");

const labelLowCarb = document.getElementById("label-low-carb");
const labelLowCal = document.getElementById("label-low-cal");
const labelLowSugar = document.getElementById("label-low-sugar");
const labelLowFat = document.getElementById("label-low-fat");


/** Prevents raw user text from being interpreted as HTML when we build innerHTML. */
function escapeHtml(str = "") {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function openRecipe(recipe) {
  selectedRecipe = recipe;    
  appHeaderEl.setAttribute('data-state','in-active');
  mainEl.setAttribute('data-state','show-recipe');
  window.scrollTo(0, 0); // reset scroll to top
  render();
}

function closeRecipe(recipe) {
  appHeaderEl.setAttribute('data-state','active');
  mainEl.setAttribute('data-state','list-recipes');
  selectedRecipe = null;    
  render();
}

function matchesSearch(recipe, query) {
  let flagQ = false;
  let flagLowCarb = false;
  let flagLowSugar = false;
  let flagLowFat = false;
  let flagLowCal = false;

  // match query string
  flagQ = false;
  if (!query) {
    flagQ = true;
  } else {
    const haystack = [
      recipe.name,
      recipe.description,
      recipe.directions,
      recipe.notes,
      ...(recipe.ingredients ?? []),
      ...(recipe.ingredients ?? []).flatMap(f => [f.key, f.value]),
    ]
      .join(" ")
      .toLowerCase();
    flagQ = haystack.includes(query.toLowerCase());
  }

  if (btnLowCarb.getAttribute('data-state') == 'active') {
    let res = {};
    let totalCarb = 0.0; 

    // match criteria
    res = recipe.nutrition.filter((n) => n.key === "carbohydrates");
    totalCarb = res[0].amount;
    
    if (totalCarb < thresholdLowCarb) {
      flagLowCarb = true; 
    } else {
      flagLowCarb = false;
    }
  } else {
    flagLowCarb = true;
  }

  if (btnLowSugar.getAttribute('data-state') == 'active') {
    let res = {};
    let totalSugar = 0.0; 

    // match criteria
    res = recipe.nutrition.filter((n) => n.key === "total_sugars");
    totalSugar = res[0].amount;
    
    if (totalSugar < thresholdLowSugar) {
      flagLowSugar = true; 
    } else {
      flagLowSugar = false;
    }
  } else {
    flagLowSugar = true;
  }

  if (btnLowFat.getAttribute('data-state') == 'active') {
    let res = {};
    let totalFat = 0.0; 

    // match criteria
    res = recipe.nutrition.filter((n) => n.key === "total_fat");
    totalFat = res[0].amount;
    
    if (totalFat < thresholdLowFat) {
      flagLowFat = true; 
    } else {
      flagLowFat = false;
    }
  } else {
    flagLowFat = true;
  }

  if (btnLowCal.getAttribute('data-state') == 'active') {
    let res = {};
    let totalCal = 0.0; 

    // match criteria
    res = recipe.nutrition.filter((n) => n.key === "total_calories");
    totalCal = res[0].amount;
    
    if (totalCal < thresholdLowCal) {
      flagLowCal = true; 
    } else {
      flagLowCal = false;
    }
  } else {
    flagLowCal = true;
  }

  return flagQ & flagLowCarb & flagLowSugar & flagLowFat & flagLowCal;
}

function recipeCardHtml(recipe) {
 
  // button bookmark state 
  let I = recipe_data.findIndex(c => c.slug == recipe.slug);
  let bookmarkState = "";
  let bookmarkStateLabel = "";

  if (bookmarkedFlagList[I] == 1) {
    bookmarkState = 'in-active'; 
    bookmarkStateLabel = 'Bookmarked'; 
  } else {
    bookmarkState = 'active';
    bookmarkStateLabel = 'Bookmark';
  }

  const avatar = recipe.image_url
    ? `<img class="avatar" src="${escapeHtml(recipe.image_url)}" alt="${escapeHtml(recipe.name)}"
         onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'avatar',textContent:''}))">`
    : `<div class="avatar">${escapeHtml(initials(recipe.name))}</div>`;

  return `
    <article class="card" data-id="${recipe.slug}">
      <div class="card-top">
        ${avatar}
        <div>
          <div class="card-name">${escapeHtml(recipe.name)}</div>
          <!--
          ${recipe.name ? `<div class="card-title">${escapeHtml(recipe.name)}</div>` : ""}
          -->
        </div>
      </div>
      ${recipe.description ? `<div class="card-notes">${escapeHtml(recipe.description)}</div>` : ""}
      <div class="card-actions">
        <button class="btn btn-secondary btn-small btn-card-bookmark" data-state="${bookmarkState}" data-action="bookmark">${bookmarkStateLabel}</button>
        <!-- 
        <button class="btn btn-secondary btn-small" data-action="edit">Edit</button>
        <button class="btn btn-danger btn-small" data-action="delete">Delete</button>
        -->
      </div>
    </article>
  `;
}

function htmlFullRecipe(recipe) {
 
  const avatar = recipe.image_url
    ? `<img class="full-recipe-avatar" src="${escapeHtml(recipe.image_url)}" alt="${escapeHtml(recipe.name)}"
         onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'avatar',textContent:''}))">`
    : `<div class="avatar">${escapeHtml(initials(recipe.name))}</div>`;

  // button bookmark state 
  let I = recipe_data.findIndex(c => c.slug == recipe.slug);
  let bookmarkState = "";
  let bookmarkStateLabel = "";

  if (bookmarkedFlagList[I] == 1) {
    bookmarkState = 'in-active'; 
    bookmarkStateLabel = 'Bookmarked'; 
  } else {
    bookmarkState = 'active';
    bookmarkStateLabel = 'Bookmark';
  }
  
  let ingredientsStr = "";
  let directionsStr = "";
  let nutritionStr = "";
  let res = {};
  let totalCarb = 0;
  let totalCal = 0;
  let totalSugar = 0;
  let totalFat = 0;
  let count = 0; 
  let unit = "";

  // format the ingredients 
  count = 1;
  recipe.ingredients.forEach((item) => {
    ingredientsStr += `- ${item.text}`;
    if (item.note) {
      ingredientsStr += `${item.note}`;
    }
    ingredientsStr += "<br> <br>";
    count += 1;
  });

  // format the directions 
  count = 1;
  recipe.directions.split('.').forEach((item) => {
    if (item.length != 0) {
      directionsStr += `${count}. ${item}`;
      directionsStr += "<br> <br>";
      count += 1;
    }
  });

  // format nutrition info
  res = recipe.nutrition.filter((n) => n.key === "carbohydrates");
  totalCarb = res[0].amount; unit = res[0].unit; 
  if (unit == "null") {unit=""};
  nutritionStr += `Total Carbohydrates: ${totalCarb} ${unit} <br> `;

  res = recipe.nutrition.filter((n) => n.key === "total_sugars");
  totalSugar = res[0].amount; unit = res[0].unit;
  if (unit == "null") {unit=""};
  nutritionStr += `Total Sugar: ${totalSugar} ${unit} <br> `;

  res = recipe.nutrition.filter((n) => n.key === "total_fat");
  totalFat = res[0].amount; unit = res[0].unit;
  if (unit == "null") {unit=""};
  nutritionStr += `Total Fat: ${totalFat} ${unit} <br> `;

  res = recipe.nutrition.filter((n) => n.key === "total_calories");
  totalCal = res[0].amount; unit = res[0].unit;
  if (unit == "null") {unit=""};
  nutritionStr += `Total Calories: ${totalCal} <br> `;

  return `
    <article class="full-recipe" data-id="${recipe.slug}">
      <div class="full-recipe-top">
        ${avatar}
        ${recipe.name ? `<div class="full-recipe-title">${escapeHtml(recipe.name)}</div>` : ""}
      </div>
      <div class="card-actions">
      <button class="btn btn-secondary btn-small" data-action="close">Close</button>
      <button class="btn btn-secondary btn-small btn-card-bookmark" data-state="${bookmarkState}" data-action="bookmark" recipe-id="${recipe.slug}">${bookmarkStateLabel}</button>
      </div>
      <div class="full-recipe-detail">
      <h3> Nutrition Info: </h3> 
      ${nutritionStr} 
      <h3> Description: </h3> 
      ${recipe.description} 
      <h3> Serving Size: </h3> 
      ${recipe.serving_size} 
      <h3> Ingredients: </h3> 
      ${ingredientsStr} 
      <h3> Directions: </h3> 
      ${directionsStr} 
      ${recipe.notes ? `<h3> Notes: </h3> ${recipe.notes}` : ""} <br> <br>
      <div>
      <button class="btn btn-secondary btn-small btn-span" data-action="close">Close</button> <br>
      </div>
      <div>
      <button class="btn btn-secondary btn-small btn-span btn-card-bookmark" data-state="${bookmarkState}" data-action="bookmark" recipe-id="${recipe.slug}">${bookmarkStateLabel}</button>
      </div>
    </article>
  `;

}

function render() {

  if (mainEl.getAttribute('data-state') == 'show-recipe') {
    shownRecipeEl.innerHTML = htmlFullRecipe(selectedRecipe);    

    // only show recipe 
    shownRecipeEl.setAttribute('data-state','active');
    // make sure to hide single recipe display  
    listEl.setAttribute('data-state','in-active');

    emptyStateEl.hidden = true;
    noResultsEl.hidden = true; 
  } else if (mainEl.getAttribute('data-state') == 'list-recipes') {
    let consider_recipes = recipe_data;

    if (btnBookmarked.getAttribute('data-state') == 'active') {
       consider_recipes = recipe_data.filter(c => bookmarkedIdList.includes(c.slug));
    }    

    const filtered = consider_recipes.filter(c => matchesSearch(c, searchQuery));

    //listEl.innerHTML = filtered.map(cardHtml).join("");
    listEl.innerHTML = filtered.map(recipeCardHtml).join("");
    listEl.setAttribute('data-state','active');
    // make sure to hide single recipe display  
    shownRecipeEl.setAttribute('data-state','in-active');

    emptyStateEl.hidden = recipe_data.length !== 0;
    noResultsEl.hidden = !(recipe_data.length > 0 && filtered.length === 0);
  } else {
    let ss = mainEl.getAttribute('data-state');
    console.log(`mainEl.data-state = ${ss}`);
    console.error("Unknown state for 'mainEl.data-state'.");
  } 

}

function changeMealType() {

  if (btnMealType.textContent == "Meal Type") {
    btnMealType.textContent = "Dinner";
    btnMealType.setAttribute('data-state', 'dinner');
  } else if (btnMealType.textContent == "Dinner") {
    btnMealType.textContent = "Lunch";
    btnMealType.setAttribute('data-state', 'lunch');
  } else if (btnMealType.textContent == "Lunch") {
    btnMealType.textContent = "Breakfast";
    btnMealType.setAttribute('data-state', 'breakfast');
  } else if (btnMealType.textContent == "Breakfast") {
    btnMealType.textContent = "Snack";
    btnMealType.setAttribute('data-state', 'snack');
  } else if (btnMealType.textContent == "Snack") {
    btnMealType.textContent = "Meal Type";
    btnMealType.setAttribute('data-state', 'meal-type');
  } else {
    btnMealType.textContent = "Meal Type";
    btnMealType.setAttribute('data-state', 'meal-type');
  }

}

function toggleLowCarb() {
  if (btnLowCarb.getAttribute('data-state') == 'active') {
    btnLowCarb.setAttribute('data-state','in-active');
  } else {
    btnLowCarb.setAttribute('data-state','active');
  }

  render();
}

function toggleLowSugar() {
  if (btnLowSugar.getAttribute('data-state') == 'active') {
    btnLowSugar.setAttribute('data-state','in-active');
  } else {
    btnLowSugar.setAttribute('data-state','active');
  }
  render();
}

function toggleLowFat() {
  if (btnLowFat.getAttribute('data-state') == 'active') {
    btnLowFat.setAttribute('data-state','in-active');
  } else {
    btnLowFat.setAttribute('data-state','active');
  }
  render();
}

function toggleLowCal() {
  if (btnLowCal.getAttribute('data-state') == 'active') {
    btnLowCal.setAttribute('data-state','in-active');
  } else {
    btnLowCal.setAttribute('data-state','active');
  }
  render();
}

function toggleBookmarked() {
  if (btnBookmarked.getAttribute('data-state') == 'active') {
    btnBookmarked.setAttribute('data-state','in-active');
  } else {
    btnBookmarked.setAttribute('data-state','active');
    searchQuery = ""; // clear search 
    searchInput.value = searchQuery;
  }
  render();
}



function bookmarkBuildFlagList(idList) {

  // build flag list by finding indices of the IDs
  let flagList = new Array(recipe_data.length).fill(0);
  let I = -1; 
  for (const id of idList) { 
    I = recipe_data.findIndex(c => c.slug == id);
    flagList[I] = 1;
  }

  return flagList; 

}


function saveBookmarks() {

  // update local storage for bookmarks 
  const data = {'bookmarkedIdList':bookmarkedIdList};
  localStorage.setItem('recipe-bookmarks', JSON.stringify(data));

}

function loadBookmarks() {

  // load local storage for bookmarks 
  const data = JSON.parse(localStorage.getItem('recipe-bookmarks'));
  if (data) {
    bookmarkedIdList = data.bookmarkedIdList;
    bookmarkedFlagList = bookmarkBuildFlagList(bookmarkedIdList);
  } else {
    bookmarkedIdList = [];
    bookmarkedFlagList = new Array(recipe_data.length).fill(0);
  }
 
}

function exportBookmarks() {
  const fileName = "recipe_bookmarks.json";
  const data = {'bookmarkedIdList':bookmarkedIdList};

  // Convert object to a formatted JSON string
  const jsonString = JSON.stringify(data, null, 2);
  
  // Create a Blob (Binary Large Object) containing the JSON string
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // Create a temporary anchor (link) element
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  
  // Trigger the download and clean up
  link.click();
  URL.revokeObjectURL(link.href);
}

function setupImportBookmarks() {
  // use HTML someplace to import 
  // <input type="file" id="fileInput" accept=".json" />
  const fileInput = document.getElementById('fileInput'); 

  fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Initialize the FileReader
  const reader = new FileReader();

  // Define what happens when reading succeeds
  reader.onload = (e) => {
    try {
      // 3. Parse the file text back into an object
      const loadedData = JSON.parse(e.target.result);
      console.log('Successfully loaded data:', loadedData);
      
      // use loaded data
      bookmarkedIdList = loadedData.bookmarkedIdList;
      bookmarkedFlagList = bookmarkBuildFlagList(bookmarkedIdList);

      // save to local storage
      saveBookmarks(); 
      fileInput.value = ''; // allows uploading same file again 
      dialogImport.close(); // automatically close (once file read)

      // update display 
      render();

    } catch (error) {
      alert('Error: The selected file is not a valid JSON file.');
    }
 
  }

  reader.readAsText(file);

  });


}

function bookmarkRecipeAdd(id) {
  let I = 0;

  bookmarkedIdList.push(id);
  I = recipe_data.findIndex(c => c.slug == id);
  bookmarkedFlagList[I] = 1;

  // save to local storage 
  saveBookmarks(); 

  // update display 
  render();
}

function bookmarkRecipeRemove(id) {
  bookmarkedIdList = bookmarkedIdList.filter(item => item !== id);
  let I = recipe_data.findIndex(c => c.slug == id);
  bookmarkedFlagList[I] = 0;
  
  // save to local storage 
  saveBookmarks(); 

  // update display 
  render();
}

// -- handling events

//btnMealType.addEventListener("click", () => changeMealType());
//btnMealType.setAttribute('data-state','meal-type');
btnLowCarb.addEventListener("click", () => toggleLowCarb());
btnLowCarb.setAttribute('data-state','in-active');
btnLowSugar.addEventListener("click", () => toggleLowSugar());
btnLowSugar.setAttribute('data-state','in-active');
btnLowFat.addEventListener("click", () => toggleLowFat());
btnLowFat.setAttribute('data-state','in-active');
btnLowCal.addEventListener("click", () => toggleLowCal());
btnLowCal.setAttribute('data-state','in-active');
btnBookmarked.addEventListener("click", () => toggleBookmarked());
btnBookmarked.setAttribute('data-state','in-active');

// Open the dialog in an exclusive modal state
btnAbout.addEventListener("click", () => {
  dialogAbout.showModal(); 
});

// Close the dialog
btnCloseAbout.addEventListener("click", () => {
  dialogAbout.close();
});

btnConfig.addEventListener("click", () => {
  dialogConfig.showModal(); 
});

btnExport.addEventListener("click", () => {
  exportBookmarks(); 
});

btnImport.addEventListener("click", () => {
  dialogImport.showModal();  
});

// Close the dialog
btnCloseConfig.addEventListener("click", () => {
  dialogConfig.close();
});

// Close the dialog
btnCloseImport.addEventListener("click", () => {
  dialogImport.close();
});

// Sliders for adjusting thresholds 
sliderLowCarb.addEventListener("input", (event) => {
  thresholdLowCarb = Number(event.target.value);
  labelLowCarb.textContent = thresholdLowCarb;
  render();
});

sliderLowCal.addEventListener("input", (event) => {
  thresholdLowCal = Number(event.target.value);
  labelLowCal.textContent = thresholdLowCal;
  render();
});

sliderLowSugar.addEventListener("input", (event) => {
  thresholdLowSugar = Number(event.target.value);
  labelLowSugar.textContent = thresholdLowSugar;
  render();
});

sliderLowFat.addEventListener("input", (event) => {
  thresholdLowFat = Number(event.target.value);
  labelLowFat.textContent = thresholdLowFat;
  render();
});

// Event delegation: one listener handles Edit/Delete for every card,
// including cards that don't exist yet at page-load time.
listEl.addEventListener("click", event => {
  
  const button = event.target.closest("button[data-action]");
  const buttonEl = event.target.closest(".btn");

  const card = event.target.closest(".card");
  const id = card.dataset.id;

  if (button && buttonEl) { // check if button pressed 

    //console.log("button pressed");
    //console.log(`${button.dataset.action}`);
    //console.log(`buttonEl.data-state=${buttonEl.getAttribute('data-state')}`);
   
    // toggle button 
    if (buttonEl.getAttribute('data-state') === "active") {

      if (button.dataset.action === "bookmark") {
        //console.log(`bookmarked id = ${id}`);
        bookmarkRecipeAdd(id);
      }

      buttonEl.setAttribute('data-state',"in-active")
    } else { // unbookmark it 

      if (button.dataset.action === "bookmark") {
        //console.log(`bookmarked id = ${id}`);
        bookmarkRecipeRemove(id);
      }

      buttonEl.setAttribute('data-state',"active")
    }

  } else { // if no button, then open the card


    // console.log(`clicked id = ${id}`);
    openRecipe(recipe_data.find(c => c.slug === id));

  } 

});

shownRecipeEl.addEventListener("click", event => {

  const button = event.target.closest("button[data-action]");
  if (!button) return;

  if (button.dataset.action === "close") {
    closeRecipe();
  } 

  const buttonEl = event.target.closest(".btn");
  if (buttonEl) { // check further what button pressed 

    //console.log("button pressed");
    //console.log(`${button.dataset.action}`);
    //console.log(`buttonEl.data-state=${buttonEl.getAttribute('data-state')}`);
   
    // toggle button 
    if (buttonEl.getAttribute('data-state') === "active") {

      if (button.dataset.action === "bookmark") {
        const id = buttonEl.getAttribute('recipe-id');
        //console.log(`bookmarked id = ${id}`);
        bookmarkRecipeAdd(id);
      }

      buttonEl.setAttribute('data-state',"in-active")
    } else { // unbookmark it 

      if (button.dataset.action === "bookmark") {
        const id = buttonEl.getAttribute('recipe-id');
        //console.log(`bookmarked id = ${id}`);
        bookmarkRecipeRemove(id);
      }

      buttonEl.setAttribute('data-state',"active")
    }

  } else { // if no button pressed 
    // nothing 
  } 


});

searchInput.addEventListener("input", event => {
  searchQuery = event.target.value;
  render();
});

themeToggleBtn.addEventListener("click", () => {
  const next = toggleTheme();
  themeToggleBtn.textContent = next === "dark" ? "☀️" : "🌙";
});

// ---------- Startup ----------
initTheme();
themeToggleBtn.textContent =
  document.documentElement.getAttribute("data-theme") === "dark" ? "☀️" : "🌙";

import recipe_data from './recipes_data.json' with { type: 'json' };

loadBookmarks(); // load data from local storage  

setupImportBookmarks(); 



mainEl.setAttribute('data-state','list-recipes');

// update slider label data so in sync with default values (override HTML)
labelLowCarb.textContent = thresholdLowCarb;
labelLowCal.textContent = thresholdLowCal;
labelLowSugar.textContent = thresholdLowSugar;
labelLowFat.textContent = thresholdLowFat;

// test using console 
console.log(`recipe_data.length = ${recipe_data.length} `); 
//console.log(recipe_data[0].slug); 
//console.log(recipe_data[0].directions); 

render();
