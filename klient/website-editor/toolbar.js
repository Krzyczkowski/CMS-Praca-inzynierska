let editingWebsite;

document.addEventListener("DOMContentLoaded", function () {
  
  editingWebsite=localStorage.getItem('editingWebsite');
  let toolBar = document.getElementById("toolbar");

  toolBar.innerHTML = `
  <div class="return">
        <img  src="img/icons/return.png">
        </div>
        <div class="columnTools">
        <div class="websiteInfo">${localStorage.getItem('editingWebsite')} ${localStorage.getItem('editingPage')}</div>
        <div class="tools">
        
          <img src="img/icons/divArea.png" class="toolbar-img" id="add-block">
          <img src="img/icons/textArea.png" class="toolbar-img" id="add-paragraf">
          <img src="img/icons/h1.png" class="toolbar-img" id="add-h1">
          <img src="img/icons/h2.png" class="toolbar-img" id="add-h2">
          <img src="img/icons/h3.png" class="toolbar-img" id="add-h3">
          <img src="img/icons/imageArea.png" class="toolbar-img" id="add-image">
          <img src="img/icons/button.jpg" class="toolbar-img" id="add-input">
          <img src="img/icons/special.png" class="toolbar-img" id="special">
          <img src="img/icons/action.png" class="toolbar-img" id="action">
          <img src="img/icons/savePage.png" class="toolbar-img" id="save-page">
        </div>
        </div>
    `;
  
  let images = toolBar.getElementsByClassName("toolbar-img");
  let returnButton = document.querySelector(".return");
  returnButton.addEventListener("click", (e)=>{
    e.preventDefault();
    window.history.back();
  });


  for (let img of images) {
    img.addEventListener("click", function () {
      for (let i of images) {
        i.classList.remove("activeTool");
      }
      img.classList.add("activeTool");
    });
  }
  addFlashEffectToTools();

  document.getElementById("save-page").addEventListener("click", function (e) {
    e.preventDefault();
    const pageElement = document.querySelector(".page");
    
  
    const pageClone = pageElement.cloneNode(true);
    pageClone.style.transform = "none";
    // Znalezienie wszystkich elementów 'editable' w klonie
    const cloneEditables = pageClone.querySelectorAll(".editable");
  
    cloneEditables.forEach(function (cloneEditable, index) {
      // Usuwanie atrybutów i klas używanych do edycji
      const originalElement = document.querySelectorAll('.page .editable')[index];
      cloneEditable.removeAttribute("contenteditable");
      cloneEditable.classList.remove("editable", "active", "text");
      if(cloneEditable.tagName !== "IMG")
      applyPercentageStyles(cloneEditable, originalElement);
      if (originalElement.getAttribute("onclick")) {
        cloneEditable.setAttribute("onclick", originalElement.getAttribute("onclick"));
      }
      //usuniecie edycji blokow tekstowych
      if (cloneEditable.tagName === "INPUT" || cloneEditable.tagName === "TEXTAREA") {
        cloneEditable.readOnly = false;
        cloneEditable.innerHTML = '';
      }
      // Usuwanie elementów handle do zmiany rozmiaru
      const resizeHandles = cloneEditable.querySelectorAll(".resize-handle");
      resizeHandles.forEach((handle) => handle.remove());
  
      // Kopiowanie stylów bezpośrednio
      cloneEditable.style.color = originalElement.style.color;
      cloneEditable.style.width = originalElement.style.width;
      cloneEditable.style.backgroundColor = originalElement.style.backgroundColor;
      cloneEditable.style.fontSize = originalElement.style.fontSize;
      cloneEditable.style.fontFamily = originalElement.style.fontFamily;
      cloneEditable.style.position = originalElement.style.position;
      cloneEditable.style.borderWidth = originalElement.style.borderWidth;
      cloneEditable.style.borderColor = originalElement.style.borderColor;
      cloneEditable.style.borderRadius = originalElement.style.borderRadius;
      cloneEditable.style.opacity = originalElement.style.opacity;
      cloneEditable.style.marginTop = originalElement.style.marginTop;
      cloneEditable.style.marginRight = originalElement.style.marginRight;
      cloneEditable.style.marginBottom = originalElement.style.marginBottom;
      cloneEditable.style.marginLeft = originalElement.style.marginLeft;
      cloneEditable.style.paddingTop = originalElement.style.paddingTop;
      cloneEditable.style.paddingRight = originalElement.style.paddingRight;
      cloneEditable.style.paddingBottom = originalElement.style.paddingBottom;
      cloneEditable.style.paddingLeft = originalElement.style.paddingLeft;
      cloneEditable.style.display = originalElement.style.display;
      cloneEditable.style.flexDirection = originalElement.style.flexDirection;
      cloneEditable.style.boxSizing = originalElement.style.boxSizing;
      cloneEditable.style.wordBreak = originalElement.style.wordBreak;
      cloneEditable.style.zIndex = originalElement.style.zIndex || '1';
      cloneEditable.setAttribute("draggable", "false");
    });
  
    const pageContent = pageClone.innerHTML;
    // Tworzenie i pobieranie pliku HTML
    const htmlContent = `<!DOCTYPE html>
    <html lang="pl">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zapisana Strona</title>
    <style>
      body {
        margin: 0 auto; 
        display:flex;
        flex-direction: column;
        max-width:100%;
      }

    </style>
    </head>
    <body>${pageContent}</body>
    ${generateContentScript(localStorage.getItem("address"),localStorage.getItem("userName"),editingWebsite)}
    </html>`;

    const formData = new FormData();
    const blob = new Blob([htmlContent], { type: "text/html" });
    formData.append("file", blob, "strona.html");

    formData.append("websiteName",localStorage.getItem('editingWebsite') ); 
    formData.append("pageName", localStorage.getItem('editingPage')); 

    uploadFileCall(formData);
  });


function addFlashEffectToTools(){
  const elements = document.querySelectorAll('.toolbar-img'); // Zastąp 'yourElementId' identyfikatorem Twojego elementu
  elements.forEach(e=>{
    console.log(e);
    e.addEventListener('click', () => {
      e.classList.add('flash-background');

      // Usuń klasę po zakończeniu animacji
      e.addEventListener('animationend', () => {
          e.classList.remove('flash-background');
      }, { once: true }); // Opcja { once: true } powoduje, że nasłuchiwacz jest wywoływany tylko raz
  });
  })

}

function applyPercentageStyles(clone, original) {
  const parentWidth = original.parentElement.offsetWidth;
  const parentHeight = original.parentElement.offsetHeight;
  
  if(original.style.width!=="auto")
  clone.style.width = pixelToPercentage(original.offsetWidth, parentWidth) + '%';
  else console.log("auto");
  console.log(`parentWidth: ${parentWidth} parentHeight: ${parentHeight} childWidth: ${clone.style.width}`);
  // Podobnie dla margin, padding, i border (jeśli potrzebne)
  clone.style.marginTop = pixelToPercentage(parseFloat(getComputedStyle(original).marginTop), parentHeight) + '%';
  clone.style.marginRight = pixelToPercentage(parseFloat(getComputedStyle(original).marginRight), parentWidth) + '%';
  clone.style.marginBottom = pixelToPercentage(parseFloat(getComputedStyle(original).marginBottom), parentHeight) + '%';
  clone.style.marginLeft = pixelToPercentage(parseFloat(getComputedStyle(original).marginLeft), parentWidth) + '%';

  clone.style.paddingTop = pixelToPercentage(parseFloat(getComputedStyle(original).paddingTop), parentHeight) + '%';
  clone.style.paddingRight = pixelToPercentage(parseFloat(getComputedStyle(original).paddingRight), parentWidth) + '%';
  clone.style.paddingBottom = pixelToPercentage(parseFloat(getComputedStyle(original).paddingBottom), parentHeight) + '%';
  clone.style.paddingLeft = pixelToPercentage(parseFloat(getComputedStyle(original).paddingLeft), parentWidth) + '%';

}

// Funkcja pomocnicza do przeliczania pikseli na procenty
function pixelToPercentage(pixelValue, totalPixels) {
  return (pixelValue / totalPixels) * 100;
}



});