let currentEditable = null;
let addingMode = false;
let addingType = "";
let createdElements = [];
let scale = 1; // Początkowa skala strony
let isPanning = false;
let startX, startY;

let offsetX = 0,
  offsetY = 0; // Dodajemy zmienne do przechowywania przesunięcia strony

let savedObject = null; 
let isResizing = false; // do sprawdzenia czy obecnie rozszerzamy div

sessionStorage.setItem("special", "false");

document.addEventListener("DOMContentLoaded", async function () {
  initializeBasicFunctionality();
  initializeToolsButtons();

  let page = document.querySelector("#page");
  let pageBody = await loadPageCall();
  page.innerHTML = pageBody;
  const elementy = page.querySelectorAll("*:not(img)");
  // ma na celu przygotowanie elementów strony po wcześniejszym pobraniu
  elementy.forEach((el) => {
    el.classList.add("draggable");
    el.classList.add("editable");
    prepareEventListeners(el);
  });

  if (document.querySelector("#contentTemplateBlock"))
    document.querySelector("#contentTemplateBlock").style.display = "flex";

    //odpowiednie ustawienia dla "page" - główny kontener na bloki, nie mozna go przesuwac, ale wewnętrzne bloki tak
  page.addEventListener("dragover", function (e) {
    e.preventDefault();
    e.stopPropagation();
    const afterElement = getDragAfterElement(page, e.clientX, e.clientY);
    const draggable = document.querySelector(".dragging");
    if (afterElement == null) {
      page.appendChild(draggable);
    } else {
      page.insertBefore(draggable, afterElement);
    }
  });

  // FUNKCJE POMOCNICZE DLA OBSLUGI KLIKNIEC
  function removeActiveClassFromElements(elements) {
    elements.forEach((element) => element.classList.remove("active"));
  }

  function removeActiveElement() {
    if (currentEditable) {
      currentEditable.contentEditable = false;
      currentEditable.classList.remove("active");
      const existingHandle = currentEditable.querySelector(".resize-handle");
      if (existingHandle) {
        currentEditable.removeChild(existingHandle);
      }
      currentEditable = null;
    }
  }

  function setActiveElement(element) {
    removeActiveElement();
    currentEditable = element;
    currentEditable.classList.add("active");
    currentEditable.focus();
    updateOptionsPanel(currentEditable);

    if (!currentEditable.querySelector(".resize-handle")) {
      currentEditable.appendChild(createResizeHandle());
    }
  }

  // OBSLUGA KLIKNIEC
  document.body.addEventListener("click", function (e) {
    removeActiveClassFromElements(createdElements);

    if ( 
      e.target.closest("#toolbar-content") ||
      e.target.classList.contains("toolbar-img") ||
      e.target.closest(".side-panel")
    ) {
      return;
    }

    if (
      e.target.tagName === "IMG" &&
      e.target.parentElement.classList.contains("image-container")
    ) {
      setActiveElement(e.target.parentElement);
    } else if (e.target.classList.contains("editable")) {
      setActiveElement(e.target);
    } else {
      removeActiveElement();

    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Delete") {
      if (currentEditable) {
        const index = createdElements.indexOf(currentEditable);
        if (index > -1) {
          createdElements.splice(index, 1);
        }
        currentEditable.remove();
        currentEditable = null;
      }
    }
  });
});

// inicjalizacaja przesuwania strony, oddalania, oraz trybów dodawania dla toolbara
function initializeBasicFunctionality() {
  const page = document.getElementById("page");

  function startPanning(event) {
    if (event.button !== 2) return; // Aktywacja tylko dla lewego przycisku myszy
    isPanning = true;
    startX = event.clientX - offsetX;
    startY = event.clientY - offsetY;
    page.style.cursor = "move";
    document.addEventListener("mousemove", doPanning, false);
    document.addEventListener("mouseup", stopPanning, false);
  }
  window.addEventListener("mousedown", startPanning);

  function doPanning(event) {
    if (!isPanning) return;
    offsetX = event.clientX - startX;
    offsetY = event.clientY - startY;
    page.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  }

  function stopPanning() {
    isPanning = false;
    page.style.cursor = "default";
    document.removeEventListener("mousemove", doPanning);
    document.removeEventListener("mouseup", stopPanning);
  }

  //wyłączenie okienka pod prawym przyciskiem myszy
  document.addEventListener("contextmenu", function (event) {
    event.preventDefault();
  });

  page.addEventListener("wheel", function (event) {
    event.preventDefault();

    const delta = event.deltaY; // deltaY to wartosc "kółka myszy"; gdzie wartość ujemna to oddalenie
    const zoomIntensity = 0.1;
    const oldScale = scale;

    // Obliczanie nowej skali
    if (delta < 0) {
      scale += zoomIntensity;
    } else {
      scale -= zoomIntensity;
    }

    // ograniczenie skalowania 
    scale = Math.min(Math.max(0.5, scale), 2);

    // pozycja myszki wzgledem "page"
    const mouseX = event.clientX - page.getBoundingClientRect().left;
    const mouseY = event.clientY - page.getBoundingClientRect().top;

    // Obliczanie nowego przesunięcia
    offsetX -= mouseX * (scale - oldScale);
    offsetY -= mouseY * (scale - oldScale);

    page.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  });
}
const el = document.getElementById("page");

function clearSelection() {
  const selected = document.querySelector(".selected");
  if (selected) {
    selected.classList.remove("selected");
  }
}


// MECHANIKA TWORZENIA I PRZESUWANIA BLOKÓW

function initDraggableEventListeners(draggableItem) {
  draggableItem.setAttribute("draggable", "true");
  draggableItem.addEventListener("dragstart", function (e) {
    e.stopPropagation();

    //upewnienie sie czy nie kliknalem w rozszerzanie bloku
    if (isResizing) {
      e.preventDefault();
      return;
    }
    draggableItem.classList.add("dragging");
  });
  
  draggableItem.addEventListener("dragend", function () {
    draggableItem.classList.remove("dragging");
    calcPercentageWidth(document.querySelector(".dragging"));
  });
  draggableItem.addEventListener("dragleave", function (e) {
    if (e.target.classList.contains("draggable")) {
      e.target.classList.remove("draggingOn");
    }
  });

  draggableItem.addEventListener("dragover", function (e) {
    e.preventDefault();
    e.stopPropagation();
    const afterElement = getDragAfterElement(
      draggableItem,
      e.clientX,
      e.clientY
    );
    const currentDraggable = document.querySelector(".dragging");
    if (afterElement == null) {
      draggableItem.appendChild(currentDraggable);
    } else {
      draggableItem.insertBefore(currentDraggable, afterElement);
    }
  });
}

function getDragAfterElement(container, x, y) {
  const scaledX = (x - offsetX) / scale;
  const scaledY = (y - offsetY) / scale;
  const flexDirection = window.getComputedStyle(container).flexDirection;

  // Pobranie tylko bezpośrednich dzieci kontenera z klasą 'draggable'
  const draggableElements = Array.from(container.children).filter(
    (child) =>
      child.classList.contains("draggable") &&
      !child.classList.contains("dragging")
  );

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const childCenterX = (box.left + box.width / 2 - offsetX) / scale;
      const childCenterY = (box.top + box.height / 2 - offsetY) / scale;

      let offset; // odleglosc od srodka obiektu
      if (flexDirection === "column") {
        offset = scaledY - childCenterY;
      } else {
        offset = scaledX - childCenterX;
      }
      // jesli offset jest mniejszy niz 0, wtedy kursor znajduje się przed środkiem elementu
      // "przed" oznacza na lewo w układzie poziomym i nad elementem w układzie pionowym
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function createResizeHandle() {
  const resizeHandle = document.createElement("div");
  resizeHandle.className = "resize-handle";
  return resizeHandle;
}
document.addEventListener("mousedown", function (event) {
  if (event.target.className === "resize-handle") {
    isResizing = true;
    const editable = event.target.parentNode;
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = editable.offsetWidth;
    const startHeight = editable.offsetHeight;

    const scaleFactor = 2; // Współczynnik skalujący do regulowania szybkości zmiany rozmiaru

    function resize(event) {
      // Mnożenie różnicy w pozycji kursora przez współczynnik skalujący
      editable.style.width =
        startWidth + (event.clientX - startX) * scaleFactor + "px";
      editable.style.minHeight = //minHeight dlatego żeby przy dodawaniu elementu dalej była możliwość "wydłużania" kontenera
        startHeight + (event.clientY - startY) * scaleFactor + "px";
    }

    function stopResize() {
      isResizing = false;
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", stopResize);
      let percWidth = calcPercentageWidth(editable);
      let percHeight = calcPercentageHeight(editable);
      editable.style.width = editable.getBoundingClientRect().width;
      editable.style.minHeight = editable.getBoundingClientRect().height;
    }

    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
  }
});




function initializeToolsButtons() {
  let page = document.querySelector(".page");
  document.getElementById("add-block").addEventListener("click", function () {
    addBlock();
  });
  document.getElementById("add-input").addEventListener("click", function () {
    addInput();
  });
  document
    .getElementById("add-paragraf")
    .addEventListener("click", function () {
      addParagraf();
    });
  document.getElementById("add-image").addEventListener("click", function () {
    let imageContainer = document.createElement("div");
    setDefaultStyles(imageContainer);
    imageContainer.style.width = "100px";
    imageContainer.style.height = "100px";
    imageContainer.classList.add("editable", "draggable", "image-container");
    let newImage = document.createElement("img");
    newImage.style.backgroundSize = "cover";
    newImage.style.backgroundPosition = "center";
    newImage.style.width = "100%"; // Ustawienie szerokości na 100% kontenera
    newImage.style.height = "100%"; // Zachowanie proporcji obrazu
    imageContainer.style.zIndex = "1000";
    imageContainer.style.backgroundColor = "rgba(0,0,0,0)";
    imageContainer.appendChild(newImage);
    if (currentEditable) {
      currentEditable.appendChild(imageContainer);
    } else {
      page.appendChild(imageContainer);
    }
    prepareEventListeners(imageContainer);
  });

  document.getElementById("add-h1").addEventListener("click", function () {
    let newHeader = document.createElement("h1");
    setDefaultStyles(newHeader);
    newHeader.textContent = "Nowy Nagłówek";
    newHeader.classList.add("editable");
    newHeader.classList.add("draggable");
    newHeader.style.fontSize = "2rem";
    prepareEventListeners(newHeader);
    if (currentEditable) currentEditable.appendChild(newHeader);
    else page.appendChild(newHeader);
  });

  document.getElementById("add-h2").addEventListener("click", function () {
    let newHeader = document.createElement("h2");
    setDefaultStyles(newHeader);
    newHeader.textContent = "Nowy Nagłówek";
    newHeader.classList.add("editable");
    newHeader.classList.add("draggable");
    newHeader.style.fontSize = "1.5rem";
    initDraggableEventListeners(newHeader);
    if (currentEditable) currentEditable.appendChild(newHeader);
    else page.appendChild(newHeader);
  });

  document.getElementById("add-h3").addEventListener("click", function () {
    let newHeader = document.createElement("h3");
    setDefaultStyles(newHeader);
    newHeader.textContent = "Nowy Nagłówek";
    newHeader.classList.add("editable");
    newHeader.classList.add("draggable");
    newHeader.style.fontSize = "1.17rem";
    initDraggableEventListeners(newHeader);
    if (currentEditable) currentEditable.appendChild(newHeader);
    else page.appendChild(newHeader);
  });

  document.getElementById("special").addEventListener("click", function (e) {
    if (sessionStorage.getItem("activeMode") !== "special") {
      sessionStorage.setItem("activeMode", "special");
      e.target.classList.add("activeMode");
      document.getElementById("action").classList.remove("activeMode");
    } else {
      sessionStorage.removeItem("activeMode");
      e.target.classList.remove("activeMode");
    }
    toggleSpecialMenu("special");
  });

  document.getElementById("action").addEventListener("click", function (e) {
    if (sessionStorage.getItem("activeMode") !== "action") {
      sessionStorage.setItem("activeMode", "action");
      e.target.classList.add("activeMode");
      document.getElementById("special").classList.remove("activeMode");
    } else {
      sessionStorage.removeItem("activeMode");
      e.target.classList.remove("activeMode");
    }
    toggleSpecialMenu("action");
  });
}



// funkcje do zamiany wielkosci wyrażonej w pikselach na procenty
function calcPercentageWidth(element) {
  let parent = element.parentElement;
  if (!parent) {
    parent = document.querySelector(".page");
  }

  let parentWidth = parent.getBoundingClientRect().width;
  let childWidth = element.getBoundingClientRect().width;
  let percentageWidth = (childWidth / parentWidth) * 100;
  element.style.width = percentageWidth + "%";
}
function calcPercentageHeight(element) {
  let parent = element.parentElement;
  if (!parent) {
    console.error("Element does not have a parent:", element);
    return;
  }
  // let parentHeight = parent.getBoundingClientRect().height;
  let parentHeight = parent.innerHeight;
  let childHeight = element.getBoundingClientRect().height;
  let percentageHeight = (childHeight / parentHeight) * 100;
  element.style.minHeight = percentageHeight + "vh";
}






function copyParentStyles(childElement) {
  let parent = childElement.parentElement;

  // Pobieranie stylów z elementu rodzica
  let parentStyle = window.getComputedStyle(parent);

  // Kopiowanie stylów do elementu dziecka
  childElement.style.backgroundColor = parentStyle.backgroundColor;
  childElement.style.color = parentStyle.color;
  childElement.style.fontFamily = parentStyle.fontFamily;
  childElement.style.fontSize = parentStyle.fontSize;
}

function properEnterMechanic(textElement) {
  textElement.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (window.getSelection) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const br = document.createElement("br");
        range.insertNode(br);
        range.setStartAfter(br);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  });
}


function doubleClickTextEdition(element){
  element.addEventListener('dblclick', function() {
    element.contentEditable = true;
    element.focus(); 
});

}








//
//  FUNKCJA NADAJĄCA BLOKOM ODPOWIEDNIE EVENT-LISTENERY
//

function prepareEventListeners(element) {
 
  
  switch (element.tagName) {
    case "DIV":
      initDraggableEventListeners(element);
      break;
    case "P":
      initDraggableEventListeners(element);
      properEnterMechanic(element);
      element.setAttribute("contentEditable", false);
      doubleClickTextEdition(element);
      break;
    case "H1":
      initDraggableEventListeners(element);
      properEnterMechanic(element);
      doubleClickTextEdition(element);
      element.setAttribute("contentEditable", false);
      break;
    case "H2":
      initDraggableEventListeners(element);
      properEnterMechanic(element);
      doubleClickTextEdition(element);
      element.setAttribute("contentEditable", false);
      break;
    case "H3":
      initDraggableEventListeners(element);
      properEnterMechanic(element);
      doubleClickTextEdition(element);
      element.setAttribute("contentEditable", false);
      break;
    case "IMG":
      initDraggableEventListeners(element);
      break;
    case "INPUT":
      initDraggableEventListeners(element);
      break;
    default:
      initDraggableEventListeners(element);
  }
}
window.prepareEventListeners = prepareEventListeners;



//
//  FUNKCJE GENERUJĄCE BLOKI KONSTRUKCYJNE
//

function addBlock(parent) {
  let newBlock = document.createElement("div");
  setDefaultStyles(newBlock);
  newBlock.style.display = "flex";
  newBlock.style.flexDirection = "column";
  newBlock.style.padding = "5px";
  newBlock.style.minHeight = "100px";
  newBlock.style.width = "auto";
  newBlock.style.overflow = "auto";
  newBlock.style.alignItems = "center";
  newBlock.classList.add("editable");
  newBlock.classList.add("draggable");
  if (parent) parent.appendChild(newBlock);
  else {
    if (currentEditable) currentEditable.appendChild(newBlock);
    else document.getElementById("page").appendChild(newBlock);
  }
  copyParentStyles(newBlock);
  prepareEventListeners(newBlock);
  return newBlock;
}
window.addBlock = addBlock;
function addParagraf(parent) {
  let newParagraph = document.createElement("p");
  newParagraph.textContent = "Nowy paragraf";
  setDefaultStyles(newParagraph);
  newParagraph.classList.add("editable");
  newParagraph.classList.add("draggable");
  newParagraph.style.minHeight = "10px";
  newParagraph.style.display = "flex";
  newParagraph.style.margin = "0";
  newParagraph.style.oadding = "5px";
  newParagraph.style.overflow = "hidden";
  newParagraph.style.position = "relative";
  newParagraph.style.width = "auto";
  //newParagraph.style.wordBreak = "break-word";

  if (parent) parent.appendChild(newParagraph);
  else {
    if (currentEditable) {
      currentEditable.appendChild(newParagraph);
    } else {
      page.appendChild(newParagraph);
    }
  }

  copyParentStyles(newParagraph);
  prepareEventListeners(newParagraph);
  return newParagraph;
}
window.addParagraf = addParagraf;

function addInput(parent) {
  let newInput = document.createElement("input");
  newInput.setAttribute("type", "text");
  newInput.textContent = "Tekst input";
  setDefaultStyles(newInput);
  newInput.classList.add("editable");
  newInput.readOnly = true;
  newInput.classList.add("draggable");
  newInput.style.minHeight = "10px";
  newInput.style.display = "block";
  newInput.style.margin = "0";
  newInput.style.oadding = "5px";
  newInput.style.overflow = "hidden";
  newInput.style.position = "relative";
  newInput.style.width = "auto";
  //newParagraph.style.wordBreak = "break-word";
  newInput.contentEditable = true;
  if (parent) parent.appendChild(newInput);
  else {
    if (currentEditable) {
      currentEditable.appendChild(newInput);
    } else {
      page.appendChild(newInput);
    }
  }

  copyParentStyles(newInput);
  prepareEventListeners(newInput);
  return newInput;
}
window.addInput = addInput;

function addTextArea(parent) {
  let newText = document.createElement("textarea");
  newText.setAttribute("type", "text");
  newText.textContent = "Tekst input";
  setDefaultStyles(newText);
  newText.classList.add("editable");
  newText.readOnly = true;
  newText.classList.add("draggable");
  newText.style.minHeight = "10px";
  newText.style.display = "block";
  newText.style.margin = "0";
  newText.style.oadding = "5px";
  newText.style.overflow = "hidden";
  newText.style.position = "relative";
  newText.style.width = "auto";
  //newParagraph.style.wordBreak = "break-word";
  newText.contentEditable = true;
  if (parent) parent.appendChild(newText);
  else {
    if (currentEditable) {
      currentEditable.appendChild(newText);
    } else {
      page.appendChild(newText);
    }
  }

  copyParentStyles(newText);
  newText.style.width = "auto";
  prepareEventListeners(newText);
  return newText;
}
window.addTextArea = addTextArea;


function addButton(parent) {
  let newButton = document.createElement("button");
  newButton.setAttribute("type", "submit");
  setDefaultStyles(newButton);
  newButton.classList.add("editable");
  newButton.readOnly = true;
  newButton.classList.add("draggable");
  newButton.style.minHeight = "10px";
  newButton.style.display = "block";
  newButton.style.margin = "0";
  newButton.style.oadding = "5px";
  newButton.style.overflow = "hidden";
  newButton.style.position = "relative";
  newButton.style.width = "auto";
  //newParagraph.style.wordBreak = "break-word";
  newButton.contentEditable = true;
  if (parent) parent.appendChild(newButton);
  else {
    if (currentEditable) {
      currentEditable.appendChild(newButton);
    } else {
      page.appendChild(newButton);
    }
  }

  copyParentStyles(newButton);
  prepareEventListeners(newButton);
  return newButton;
}
window.addButton = addButton;


// NADAWANIE BLOKOM DOMYŚLNYCH USTAWIEŃ CSS 
function setDefaultStyles(element) {
  element.style.color = "#000000"; // Kolor czcionki
  element.style.width = "100%";
  element.style.minWidth = "10px";
  element.style.backgroundColor = "#FFFFFF"; // Kolor tła
  element.style.fontSize = "16px"; // Wielkość czcionki
  element.style.fontFamily = "Arial"; // Rodzina czcionki
  element.style.position = "relative"; // Pozycjonowanie
  element.style.borderWidth = "1px"; // Obramowanie
  element.style.borderColor = "#000000"; // Kolor obramowania
  element.style.borderRadius = "0px"; // Zaokrąglenie
  element.style.opacity = "1"; // Przezroczystość
  element.style.boxSizing = "border-box"; // box sizing
  element.style.marginTop = "5px"; // Margines
  element.style.marginRight = "0px"; // Margines
  element.style.marginBottom = "5px"; // Margines
  element.style.marginLeft = "0px"; // Margines
  element.style.paddingTop = "0px"; // Padding
  element.style.paddingRight = "0px"; // Padding
  element.style.paddingBottom = "0px"; // Padding
  element.style.paddingLeft = "0px"; // Padding
  element.style.display = "flex"; // Display
  element.style.flexDirection = "column"; // Flex direction
  element.style.overflow = "clip";
  element.style.flexWrap = "wrap";
  element.style.wordWrap = "break-word";
}
