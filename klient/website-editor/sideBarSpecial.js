
let toolbarContent,
specialContainer,
actionContainer,
currentContentSection, // blok na wszystkie contenty
templateBlock, // pojedynczy blok w ktorym są zmienne content
page,
schema,
maxPageContentNumber = 10;
let contentSection = null;

document.addEventListener("DOMContentLoaded", () => {
  specialContainer = document.createElement("div");
  actionContainer = document.createElement("div");
  toolbarContent = document.querySelector("#toolbar-content");
  const sidebar = document.querySelector(".side-panel");
  

  createSpecialMenu().then(specialMenu => {
      sidebar.appendChild(specialMenu);
  });
  createActionMenu().then(data=>{
    sidebar.appendChild(data);
  })
  page = document.querySelector('#page');
  currentContentSection = page.querySelector('#contentSection');
});

  async function createSpecialMenu(){
    specialContainer.setAttribute('id','special-content');
    specialContainer.style.display = "none";
    specialContainer.classList.add("dropdown-content");
    specialContainer.appendChild(await createContentManagmentSection());
    return specialContainer;
  }
  async function createActionMenu(){
    actionContainer.setAttribute('id','special-content');
    actionContainer.style.display = "none";
    actionContainer.classList.add("dropdown-content");
    actionContainer.appendChild(await createActionSection());
    setTimeout(() => {
      let defaultActionEvent = {
          target: {
              value: document.getElementById('actionTypeSelect').value
          }
      };
      refreshActionType(defaultActionEvent);
  }, 0);
    return actionContainer;
  }
  
  function toggleSpecialMenu(type) {
    if (type === "special" && specialContainer.style.display !== 'block') {
        specialContainer.style.display = 'block';
        actionContainer.style.display = 'none';
        toolbarContent.style.display = 'none';
    } else if (type === "action" && actionContainer.style.display !== 'block') {
        actionContainer.style.display = 'block';
        specialContainer.style.display = 'none';
        toolbarContent.style.display = 'none';
    } else{
        toolbarContent.style.display = 'block';
        specialContainer.style.display = 'none';
        actionContainer.style.display = 'none';
    }
}
  window.toggleSpecialMenu=toggleSpecialMenu;



  async function createContentManagmentSection() {
    let contentManagmentSection = document.createElement("div");
    let content = await fetchContentTypeCall(localStorage.getItem('editingWebsite'));
    schema = await fetchContentSchemaCall(content);
    let tableHTML = '<table><tr><th>Nazwa</th><th>Typ</th><th></th></tr>';
    let schemaNamesList = '';
    for (let key in schema) {
      tableHTML += `
        <tr>
          <td>${key}</td>
          <td>${schema[key]}</td>
          <td><button onclick="schemaButtonClicked('${key}')" id='schemaBlockButton-${key}'>Dodaj</button></td>
        </tr>
      `;
      schemaNamesList += `<option value=${key}>${key}</option>`;
    }
    
  
  
    tableHTML += '</table>';
    // wydobycie maksymalnej ilosci contentu dla sekcji
    currentContentSection = document.querySelector('#contentSection');
    if(currentContentSection){
      let matchedClass = [...currentContentSection.classList].find(cl => /max-(\d+)/.test(cl));
      if (matchedClass) maxPageContentNumber = matchedClass.match(/\d+/)[0];
    }
    let listaStron = await loadPageListCall(localStorage.getItem('editingWebsite'));
    let listaStronOptions = ``;
    listaStron.forEach(strona => {
      let name = strona['name'];
      listaStronOptions+=`
      <option value='${name}'> ${name}</option>
      `;
    });

    contentManagmentSection.innerHTML = `
      <h2>Zawartość Strony</h2>
      <button id="selectContentSection" onclick="makeBlockContentSection()">Wybierz sekcję</button>
      <h2>${content}</h2>

      ${tableHTML}
      <h2>Komentarze</h2>
      <p>Schemat wysyłania komentarzy</p>
      <button onclick="addCommentSchema()">Dodaj schemat</button>
      <p>Schemat wyświetlania komentarzy</p>
      <button onclick="showCommentSchema()">Dodaj schemat</button>


      <h2>Ustawienia Paginacji</h2>
      <p>Maksymalna ilość contentu na stronie:</p>
      <div class="row">
       
        <input type='number' id='maxContentNumber' value='${maxPageContentNumber}' onchange='changeMaxContentNumber()'></input>
        <button id="addPaginatorButton" onclick='addPaginator()'>Dodaj Paginator</button>
        </div>
      <h2>Ustawienia Pól Tekstowych</h2>
      <p>Wyszukiwanie</p>

      <div class="row">
        <select id="selectedSearchName">
        ${schemaNamesList};
        </select>
        <button id="setSearchInput" onclick='setSearchInput()'>Ustaw</button>
      </div>
      <h2>Rejestracja</h2>
        <button onclick="addRegisterSchemat()">Dodaj blok rejestracji</button>
        <h2>Logowanie</h2>
        
        <h3>Przenieś do strony:</h3>
        <select id="internalLink">${listaStronOptions}</select><br>
        <button onclick="addLoginSchemat()">Dodaj blok logowania</button>
    `;
  
    return contentManagmentSection;
  }
  async function createActionSection() {
    let action = document.createElement("div");
    action.innerHTML = `
    <h1>Menadżer Zdarzeń</h1>
    <h3>Wybierz rodzaj zdarzenia</h3>
    <select id="actionTypeSelect" onchange='refreshActionType(event)'>
      <option value="onclick">Kliknięcie</option>
      <option value="onmouseover">Najechanie</option>
    </select>
    <div id="actionSettingsSection"></div>
    `;
    return action;
}

async function refreshActionType(e) {
    let type = "onclick";
    if(e) type = e.target.value;
    
    let actionSettingsSection = document.querySelector('#actionSettingsSection');
    actionSettingsSection.style.paddingLeft='0';
    let listaStron = await loadPageListCall(localStorage.getItem('editingWebsite'));
    let listaStronOptions = ``;
    listaStron.forEach(strona => {
      let name = strona['name'];
      listaStronOptions+=`
      <option value='${name}'> ${name}</option>
      `;
    });

    if(type ==="onclick"){
      actionSettingsSection.innerHTML = `
        <h3>Przenieś do strony:</h3>
        <span>Istniejąca strona:</span>
        <select id="internalLink">${listaStronOptions}</select><br>
        <span>lub Link:</span>
        <input id="externalLinkInput"type="text"></input>
        <button onclick="saveLinkonClick()">Zapisz Przekierowanie </button>
      `;
    }
    else if(type ==="onmouseover"){
      actionSettingsSection.innerHTML = `Prace trwają...`;
    }
}

window.refreshActionType = refreshActionType;



  function makeBlockContentSection() {
    currentContentSection = page.querySelector('.active');
    
    const existingContentSection = document.getElementById('contentSection');
    if (existingContentSection) {
      existingContentSection.removeAttribute('id');
    }
    const existingContentTemplateBlock = document.getElementById('contentTemplateBlock');
    if ( existingContentTemplateBlock) {
      existingContentTemplateBlock.removeAttribute('id');
    }

    if (currentContentSection) {
      currentContentSection.setAttribute('id', 'contentSection');
      currentContentSection.classList.add("max-10");
      if (currentContentSection.children.length > 1) {
        console.log("Element ma już blok!");
      } else {
        addBlock();
      }
      templateBlock =  currentContentSection.querySelector('.draggable');
      templateBlock.setAttribute('id', 'contentTemplateBlock');
      for (let key in schema) {
        addParagrafToTemplate(key);
      }

    } else {
      console.log("Nie wybrano żadnego elementu!");
    }

  }
  
  window.makeBlockContentSection = makeBlockContentSection;

  function schemaButtonClicked(key){
    addParagrafToTemplate(key);
  }
function addParagrafToTemplate(key){
  if(templateBlock || document.querySelector('#contentTemplateBlock')){
    let newParagraf = addParagraf(templateBlock,'$'+key);
    newParagraf.classList.add('var-'+key);
    newParagraf.textContent = '$'+key;
  }else{
    console.log("brak wybranego content block template!");
  }
}
  window.schemaButtonClicked = schemaButtonClicked;

  function addPaginator(){
 
        let newPaginator = addBlock(page);
        newPaginator.style.flexDirection = 'row';
        newPaginator.classList.add("paginator");
        let previous = addParagraf(newPaginator);
        let next = addParagraf(newPaginator);
        previous.innerHTML = "&lt; previous";
        next.innerHTML = "next >";
        next.style.justifyContent = "center";
        previous.style.justifyContent = "center";
        newPaginator.style.height="auto";
        next.style.height = "auto";
        previous.style.height = "auto";
        newPaginator.style.justifyContent = 'center';
        next.setAttribute('onclick','nextPageCall()');
        previous.setAttribute('onclick','previousPageCall()');

  }
  window.addPaginator = addPaginator;

  function changeMaxContentNumber(){
    let newNumber = document.querySelector('#maxContentNumber').value;
    console.log(newNumber);
    currentContentSection = page.querySelector('#contentSection');
    let matchedClass = [...currentContentSection.classList].find(cl => /max-(\d+)/.test(cl));
    if (matchedClass) {
      currentContentSection.classList.remove(matchedClass);
      currentContentSection.classList.add(`max-${newNumber}`);
    }
  }
  window.changeMaxContentNumber = changeMaxContentNumber;
  
  function setSearchInput(){
    let selectedItem = document.querySelector('.active');
    let selectedContentVar = document.querySelector('#selectedSearchName').value;
    if(selectedItem.tagName==='INPUT'){
      selectedItem.setAttribute('id','searchBar');
      selectedItem.setAttribute('onchange','searchContent()');
      selectedItem.classList.add(`selectedVar-${selectedContentVar}`);
    }
  }
  window.setSearchInput = setSearchInput;


function saveLinkonClick(){
 let selectedItem  = document.querySelector(".active");
 let existingPageSelectValue = document.querySelector('#internalLink').value;
 let linkForExternalPage = document.querySelector('#externalLinkInput');
 let link = linkForExternalPage.value; 
 if(link ==="") link = "internal:"+existingPageSelectValue;
 
 if(selectedItem){
  selectedItem.setAttribute("onclick",`elementOnClickScript('${link}')`)
 }
 else{
  console.log("item not selected for acton on click!");
 }
}
window.saveLinkonClick = saveLinkonClick;


function addRegisterSchemat(){
  let selectedItem  = document.querySelector(".active");
  if(selectedItem)
  usersCreateRegisterFormInputs(selectedItem);
}
window.addRegisterSchemat = addRegisterSchemat;

function addLoginSchemat(){
  let existingPageSelectValue = document.querySelector('#internalLink').value;
  let link = existingPageSelectValue; 

  let selectedItem  = document.querySelector(".active");
  usersCreateLoginFormInputs(selectedItem,link);
}
window.addLoginSchemat = addLoginSchemat;


function addCommentSchema(){
  let selected = document.querySelector(".active");
  let commentBlock = addBlock();
  commentBlock.classList.add("commentSendSchema");
  let commentSection = addTextArea(commentBlock);
  let sendComment = addButton(commentBlock);
  let deleteComment = addButton(commentBlock);

  commentSection.innerHTML = "$comment-text-section"
  commentSection.setAttribute("id","commentTextSection");

  sendComment.innerHTML = "Wyślij";
  sendComment.setAttribute("onclick","sendComment()");
  sendComment.setAttribute("id","sendComment");
  deleteComment.innerHTML = "Usuń";
  deleteComment.setAttribute("onclick","deleteComment()");
  sendComment.setAttribute("id","sendComment");
}
window.addCommentSchema = addCommentSchema;

function showCommentSchema(){
  let allCommentsContainer = addBlock();
  allCommentsContainer.setAttribute("id","allCommentsContainer");
  let selected = document.querySelector(".active");
  let commentBlock = addBlock(allCommentsContainer);
  commentBlock.classList.add("commentShowSchema");
  let userNameBlock = addBlock(commentBlock);
  let commentSection = addBlock(commentBlock);
  userNameBlock.innerHTML="$username";
  userNameBlock.setAttribute("id","userNameCommentBlock");

  commentSection.innerHTML = "$comment-text-section"
  commentSection.setAttribute("id","commentTextSection");
}
window.showCommentSchema = showCommentSchema;
