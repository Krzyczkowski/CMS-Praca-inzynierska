// ten skrypt ma generować nowy skrypt jako string zapisywany w HTML
// nowy skrypt ma być dołączony do generowanej strony internetowej
// skrypt ma generować zestaw obiektów typu content według ustalonego schematu HTML diva 'blockTemplate'

// 1. znajdź obiekt contentSection oraz blockTemplate
// 2. pobierz listę content z backendu
// 3. usuń blockTemplate z contentSection
// 4. na podstawie blockTemplate generuj w pętli obiekty typu content

function generateContentScript(address, author, websiteName) {
  const paginator = preparePaginator();
  const scriptContent = `

    let author = "${author}";
    let address = "${address}";
    let websiteName = "${websiteName}";
    let maxContentPerPage = 10;
    let currentPage = 1;
    let contentList = [];
    let actualContentList = []; // lista na obiekty aktualne do obsługi searchingu
    let number = 10; 
    let blockTemplate, templateCopy;
    let blockTemplateDisplay;
    let commentShowSchema;
    
    async function getAllContent() {
      try {
        const query = address + '/public/content/' + author + '/' + websiteName;
        const response = await fetch(query, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const contents = await response.json();
        return contents;
      } catch (error) {
        console.error('An error occurred:', error);
        return [];
      }
    }
    async function getAllComments(contentId) {
      try {
        const query = address + '/comment/all/' + websiteName + '/' + contentId;
        const response = await fetch(query, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const comments = await response.json();
        return comments;
      } catch (error) {
        console.error('An error occurred:', error);
        return [];
      }
    }
    async function renderPage(pageNumber) {
      let contentSection = document.querySelector('#contentSection');
      let schema = contentList[0].schema;
      contentSection.innerHTML = '';
    
      const start = (pageNumber - 1) * maxContentPerPage;
      const end = start + maxContentPerPage;
      const pageContents = actualContentList.slice(start, end); //ograniczenie elementow dla danej strony
    
      for (const content of pageContents) {
          let templateCopy = blockTemplate.cloneNode(true);
          templateCopy.removeAttribute('id');
    
          let commentSchema = templateCopy.querySelector(".commentSendSchema");
        if (commentSchema) {
            let sendButton = commentSchema.querySelector("#sendComment");
            let deleteButton = commentSchema.querySelector("#deleteComment");
            let commentTextSection = commentSchema.querySelector("#commentTextSection");

            if (sendButton) {
                sendButton.setAttribute("onclick", "sendComment(" + content['id'] + ")");
            }
            if (deleteButton) {
                deleteButton.setAttribute("contentId", content['id']);
            }
            if (commentTextSection) {
                commentTextSection.setAttribute("textCommentContentId", content['id']);
            }
        }
    
          Object.keys(schema).forEach(key => {
              let templateItems = templateCopy.querySelectorAll(".var-" + key);
              if (templateItems.length > 0) {
                  templateItems.forEach(templateItem => {
                      if (schema[key] === 'byte[]' && content[key]) {
                          let img = new Image();
                          img.src = 'data:image/jpeg;base64,' + content[key];
                          img.style.cssText = templateItem.style.cssText;
                          templateItem.parentNode.replaceChild(img, templateItem);
                      } else {
                          templateItem.textContent = content[key];
                      }
                  });
              }
          });
          contentSection.appendChild(templateCopy);

          // KOMENTARZE 
          let allCommentsContainer = templateCopy.querySelector("#allCommentsContainer");
          if (!allCommentsContainer) {
            console.error('allCommentsContainer element not found');
            continue; 
          }
          let oneCommentSchema = allCommentsContainer.querySelector(".commentShowSchema");
          if (!oneCommentSchema) {
            console.error('oneCommentSchema element not found');
            continue; 
          }
          commentShowSchema = oneCommentSchema.cloneNode(true);
          await generateCommentsForContent(content['id'], commentShowSchema ,allCommentsContainer);
          oneCommentSchema.style.display="none";
        
      };
    }
    async function generateCommentsForContent(contentId, commentBlock, container) {

      container.setAttribute('commentcontainerid',contentId);
      const comments = await getAllComments(contentId); // Pobierz komentarze dla contentId
      if(comments.length>0){
        if(container.style.display=="none")
          container.style.display="flex";
        clearCommentContainer(contentId);
        comments.forEach(comment => {
          let clonedSchema = commentBlock.cloneNode(true);
          let userNameBlock = clonedSchema .querySelector("#userNameCommentBlock");
          let commentSection = clonedSchema .querySelector("#commentTextSection");
          userNameBlock.innerHTML = comment.author; // Ustawiamy username komentarza
          commentSection.innerHTML = comment.text; // Ustawiamy tekst komentarza
      
          container.appendChild(clonedSchema); // Dodajemy sklonowany i wypełniony komentarz do bloku treści
        });
      }
      else
        container.style.display="none";

    }
    
    document.addEventListener("DOMContentLoaded", async function () {
      const startTime = performance.now();
      blockTemplate = document.querySelector('#contentTemplateBlock');
    
      let paginator = document.querySelector("#contentSection");
      let number = 10; // Domyślna wartość, jeśli klasa nie zostanie znaleziona
    
      if (paginator) {
          let matchedClass = [...paginator.classList].find(cl => /max-(\\d+)/.test(cl));
          console.log(matchedClass);
          if (matchedClass) {
              let match = matchedClass.match(/max-(\\d+)/);

              if (match && match[1]) {
                  number = parseInt(match[1], 10);
              }
          }
      }
      maxContentPerPage = number;
      
      if (blockTemplate) {
          contentList = await getAllContent();
          if (contentList) {
              actualContentList = contentList;
              await renderPage(currentPage);
              await preparePaginator();
          } else {
              console.error("Nie udało się pobrać listy treści.");
          }
      } else {
          console.error("Nie znaleziono szablonu treści.");
      }
      
      // Raportowanie czasu ładowania, jeśli wszystko poszło dobrze
      raportLoadingTime(startTime);
    
    });
    
    async function preparePaginator(){
      async function nextPageCall(){
        if (currentPage * maxContentPerPage < actualContentList.length) {
          currentPage++;
          await renderPage(currentPage);
        }
      }
      window.nextPageCall = nextPageCall;
    
      async function previousPageCall(){
        if (currentPage > 1) {
          currentPage--;
          await renderPage(currentPage);
        }
      }
      window.previousPageCall = previousPageCall;
    }
    preparePaginator();
    
    async function searchContent() {
      let searchBar = document.querySelector('#searchBar');
      let searchText = searchBar.value.toLowerCase(); 
      let searchingTypeVar = extractVariableNameFromElement(searchBar);
    
      if (searchText == '') {
        actualContentList = contentList;
      } else if (searchingTypeVar) {
        actualContentList = contentList.filter(content => {
          return content[searchingTypeVar] && content[searchingTypeVar].toLowerCase().startsWith(searchText);
        });
      }
    
      currentPage = 1;
      await renderPage(currentPage);
    }
    
    window.searchContent = searchContent;
    
    function extractVariableNameFromElement(element) {
      for (let className of element.classList) {
        let match = className.match(/^selectedVar-(.+)/);
        if (match) {
          return match[1]; 
        }
      }
      return null; 
    }
    function elementOnClickScript(link){
      if(link.startsWith("internal:")){
        link = link.slice(9) + '.html';
        var currentUrl = window.location.href;
        var parts = currentUrl.split('/');
        parts[parts.length - 1] = link;
        var newUrl = parts.join('/');
        window.location.href = newUrl;
      }else{
      window.location.href = link;
      }
    }
    function raportLoadingTime(startTime){
      const loadTime = performance.now() - startTime;
      console.log("czas wczytywania to " + loadTime);
      // Wysyłanie danych do serwera
      fetch('/public/report-loading-time', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ websiteName: websiteName, loadTime: loadTime })
      }).then(response => {
          if (response.ok) {
              console.log("Czas ładowania wysłany pomyślnie");
          } else {
              console.error("Nie udało się wysłać czasu ładowania");
          }
      });
    
    }
    function usersRegisterUser() {
      const regUsername = document.getElementById('regusername').value;
      const regPassword = document.getElementById('regpassword').value;
      const email = document.getElementById('email').value;
      const wiek = parseInt(document.getElementById('wiek').value);
      const websiteAuthor = author;
      fetch('http://localhost:8080/register', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: regUsername, password: regPassword, email, wiek, websiteAuthor, websiteName}),
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
    }
    window.usersRegisterUser = usersRegisterUser;
    
    function usersLoginUser() {
      const username = document.getElementById('logusername').value;
      const password = document.getElementById('logpassword').value;
      const loginButton = document.getElementById('login-submit');
      const redirect = loginButton.getAttribute("redirect");
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
          localStorage.setItem('userJwtToken', data.jwtToken);
          const currentPath = window.location.pathname.split('/');
          currentPath[currentPath.length - 1] = redirect + '.html';
          const newPath = currentPath.join('/');
    
          window.location.href = window.location.origin + newPath;
      })
      .catch(error => {
          alert('Error: ' + error.message);
      });
      }
      window.usersLoginUser = usersLoginUser;
    
    
      // USER SCRIPTS (API CALLS WITH JWT TOKEN AFTER LOGIN)
      
      
      function authorizedFetch(url, options = {}) {
          const jwtToken = localStorage.getItem('userJwtToken');
          if (!jwtToken) {
            alert("You are not logged in.");
            return; // Exit the function if no JWT token is found
          }
          options.headers = options.headers || {};
          options.headers['Authorization'] = 'Bearer ' + jwtToken;
          options.headers['Content-Type'] = 'application/json';
          return fetch(url, options);
      }
    
      async function createComment(websiteName, contentId, text) {
        let websiteAuthor = author;
          let payload = {
              websiteAuthor,
              websiteName,
              contentId,
              text
          };
    
          try {
            const response = await authorizedFetch('${address}/comment/add', {
              method: "POST",
              body: JSON.stringify(payload)
            });
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            const data = await response.json();
            return data;
          } catch (error) {
            console.error("An error occurred:", error);
            return [];
          }
      }
    
      async function sendComment(contentId){
        let commentTextArea = document.querySelector('[textCommentContentId="' + contentId + '"]');
        let text = commentTextArea ? commentTextArea.value : '';
        try {
          let returnval = await createComment(websiteName, contentId, text);
          console.log(returnval)
          let commentsContainer = document.querySelector('[commentcontainerid="' + contentId + '"]');
          await generateCommentsForContent(contentId, commentShowSchema, commentsContainer);
        } catch (error) {
          console.error("An error occurred while sending a comment:", error);
        }
      }
      window.sendComment = sendComment;

      function clearCommentContainer(contentId){
        let commentsContainer = document.querySelector('[commentcontainerid="' + contentId + '"]');
        if(commentsContainer){
        let commentElements = commentsContainer.querySelectorAll(".commentShowSchema");

        commentElements.forEach(commentElement => {
          commentElement.remove(); // Usunięcie każdego elementu komentarza
        });
      }
      }
     
    

    `;

  return `<script>${scriptContent}</script>`;
}

window.generateContentScript = generateContentScript;

function preparePaginator() {
  const paginatorHtmlScript = `
  function nextPageCall(){
    if (currentPage * maxContentPerPage < contentList.length) {
      currentPage++;
      renderPage(currentPage);
    }
  }
  window.nextPageCall = nextPageCall;
  
  function previousPageCall(){
    if (currentPage > 1) {
      currentPage--;
      renderPage(currentPage);
    }
  }
  window.previousPageCall = previousPageCall;
  `;
  return paginatorHtmlScript;
}



async function renderPage(pageNumber) {
  const contentSection = document.querySelector('#contentSection');
  const blockTemplate = document.querySelector('#contentTemplateBlock');
  let contentList = await getAllContent();
  const schema = contentList[0].schema;
 
  const start = (pageNumber - 1) * maxContentPerPage;
  const pageContents = actualContentList.slice(start, start + maxContentPerPage);

  for (const content of pageContents) {
    const templateCopy = blockTemplate.cloneNode(true);
    templateCopy.removeAttribute('id');

    // Populate template
    Object.keys(schema).forEach(key => {
      templateCopy.querySelectorAll(`.var-${key}`).forEach(item => {
        if (schema[key] === 'byte[]' && content[key]) {
          const img = new Image();
          img.src = `data:image/jpeg;base64,${content[key]}`;
          img.style.cssText = item.style.cssText;
          item.parentNode.replaceChild(img, item);
        } else {
          item.textContent = content[key];
        }
      });
    });

    contentSection.appendChild(templateCopy);
  }
}