// Simplify the DOMContentLoaded setup and element initialization
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".side-panel");
  sidebar.appendChild(createDropDownMenu());
  setupEventListeners();
});

// Refactor element creation by creating a generic function
function createElement(type, classes, content, attributes = {}) {
  const element = document.createElement(type);
  if (classes) element.classList.add(...classes.split(" "));
  if (content) element.textContent = content;
  Object.keys(attributes).forEach((key) =>
    element.setAttribute(key, attributes[key])
  );
  return element;
}

// Create a single function for creating options that share a similar pattern
function createOption(labelText, inputType, className, attributes = {}) {
  const optionWrapper = createElement("div");
  const label = createElement("label", "settingTitle", labelText);
  optionWrapper.appendChild(label);

  // Dodanie znacznika <br> dla przerwy linii
  optionWrapper.appendChild(createElement("br"));

  const input = createElement("input", className, null, {
    type: inputType,
    ...attributes,
  });
  optionWrapper.appendChild(input);
  return optionWrapper;
}

function createMarginPaddingOption(labelText, className) {
  const optionWrapper = createElement("div");
  optionWrapper.appendChild(createElement("label", "settingTitle", labelText));
  ["Top", "Right", "Bottom", "Left"].forEach((direction) => {
    optionWrapper.appendChild(createElement("br"));
    optionWrapper.appendChild(createElement("label", null, direction));
    optionWrapper.appendChild(
      createElement("input", className + "-" + direction.toLowerCase(), null, {
        type: "number",
        min: "0",
      })
    );
  });
  return optionWrapper;
}

function createResponsiveSizeOption(labelText, className, attributes = {}) {
  const optionWrapper = createElement("div");
  optionWrapper.appendChild(createElement("label", "settingTitle", labelText));
  optionWrapper.appendChild(createElement("br"));
  optionWrapper.appendChild(
    createElement("input", className, null, { type: "text", ...attributes })
  );
  return optionWrapper;
}

function createSelectOption(labelText, className, options) {
  const optionWrapper = createElement("div");
  const label = createElement("label", "settingTitle", labelText);
  optionWrapper.appendChild(label);

  // Dodanie znacznika <br> dla przerwy linii
  optionWrapper.appendChild(createElement("br"));

  const select = createElement("select", className);
  options.forEach((opt) =>
    select.appendChild(createElement("option", null, opt, { value: opt }))
  );
  optionWrapper.appendChild(select);
  return optionWrapper;
}
function createDropDownMenu() {
  const dropdownMenu = createElement("div", "dropdown");

  const dropdownContent = createElement("div", "dropdown-content");
  dropdownContent.setAttribute("id", "toolbar-content");
  dropdownMenu.appendChild(dropdownContent);
  
  dropdownContent.innerHTML = '<div><h1 id="objectTypeHeader">Ustawienia</h1> <h2 id="objectIdHeader"></h2></div>'



  const options = [
    createSelectOption("Typ Bloku", "flex-direction-select", ["column", "row"]),
    createSelectOption("justify-content", "justify-content", [
      "flex-start",
      "center",
      "flex-end",
      "space-between",
      "space-around",
    ]),
    createSelectOption("Ułożenie zawartości", "align-items", [
      "start",
      "center",
      "end",
      "stretch",
    ]),
    createSelectOption("Załamywanie Wierszy", "flex-wrap-select", [
      "nowrap",
      "wrap",
      "wrap-reverse",
    ]),
    createSelectOption("Pozycjonowanie Tekstu", "text-align-select", [
      "left",
      "center",
      "right"
    ]),
    createResponsiveSizeOption("Szerokość", "width", {
      placeholder: "np. 50%",
      pattern: "\\d+%|auto",
    }),
    createResponsiveSizeOption("Wysokość", "minHeight", {
      placeholder: "np. 100px",
      pattern: "\\d+(px|%)|auto",
    }),
    createOption("Kolor czcionki", "color", "font-color-picker"),
    createOption("Kolor tła", "color", "background-color-picker"),
    createOption("Przezroczystość tła", "range", "background-opacity-input", {
      min: "0",
      max: "1",
      step: "0.1",
      value: "1",
    }),
    createOption("Kolor obramowania", "color", "border-color-input"),
    createOption("Wielkość czcionki", "number", "font-size-input", {
      min: "1",
    }),
    createMarginPaddingOption("Margines", "margin"),
    createMarginPaddingOption("Padding", "padding"),
    createSelectOption("Rodzina czcionki", "font-family-select", [
      "Arial",
      "Verdana",
      "Helvetica",
      "Times New Roman",
      "Courier New",
      "Georgia",
      "Palatino",
      "Garamond",
      "Bookman",
      "Comic Sans MS",
      "Trebuchet MS",
      "Arial Black",
      "Impact",
      "Lucida Sans Unicode",
      "Tahoma",
      "Geneva",
      "Century Gothic",
      "Lucida Console",
      "Monaco",
      "Brush Script MT",
    ]),
    createOption("URL obrazka", "text", "url", {
      placeholder: "Wpisz URL obrazka",
    }),
    createOption("Obramowanie", "number", "border-size-input", {
      placeholder: "Wielkość",
    }),
    createOption("Zaokrąglenie", "number", "border-radius-input", {
      placeholder: "Wartość",
    }),
    createOption("Rozmiar cienia", "range", "shadow-size-input", {
      min: "0",
      max: "100",
      step: "1",
      value: "0",
    }),
    createOption("Przezroczystość", "range", "opacity-input", {
      min: "0",
      max: "1",
      step: "0.1",
      value: "1",
    }),
    createSelectOption("Sposób wyświetlania", "display-select", [
      "block",
      "inline",
      "absolute",
      "flex",
    ]),
    createSelectOption("Pozycjonowanie", "position-select", [
      "static",
      "relative",
      "absolute",
      "fixed",
      "sticky",
    ]),

  ];

  options.forEach((option) => dropdownContent.appendChild(option));

  return dropdownContent;
}

function setupEventListeners() {
  const content = document.querySelector(".dropdown-content");
  content.addEventListener("input", handleInput);
  content.addEventListener("change", handleInput);
}

function handleInput(event) {
  const currentEditable = document.querySelector(".active");
  if (!currentEditable) return;

  const inputClass = event.target.classList[0];
  let cssValue = event.target.value;

  switch (inputClass) {
    case "font-size-input":
      currentEditable.style.fontSize = cssValue + "px";
      break;
    case "font-family-select":
      currentEditable.style.fontFamily = cssValue;
      break;
    case "border-size-input":
      currentEditable.style.borderWidth = cssValue + "px";
      currentEditable.style.borderStyle = "solid";
      break;
    case "border-color-input":
      currentEditable.style.borderColor = cssValue;
      break;
    case "border-radius-input":
      currentEditable.style.borderRadius = cssValue + "px";
      break;
    case "opacity-input":
      currentEditable.style.opacity = cssValue;
      break;
    case "margin-top":
      currentEditable.style.marginTop = cssValue + "px";
      break;
    case "margin-right":
      currentEditable.style.marginRight = cssValue + "px";
      break;
    case "margin-bottom":
      currentEditable.style.marginBottom = cssValue + "px";
      break;
    case "margin-left":
      currentEditable.style.marginLeft = cssValue + "px";
      break;
    case "padding-top":
      currentEditable.style.paddingTop = cssValue + "px";
      break;
    case "padding-right":
      currentEditable.style.paddingRight = cssValue + "px";
      break;
    case "padding-bottom":
      currentEditable.style.paddingBottom = cssValue + "px";
      break;
    case "padding-left":
      currentEditable.style.paddingLeft = cssValue + "px";
      break;
    case "width":
      currentEditable.style.width = cssValue;
      break;
    case "minHeight":
      currentEditable.style.minHeight = cssValue;
      break;
    case "display-select":
      currentEditable.style.display = cssValue;
      break;
    case "flex-direction-select":
      currentEditable.style.flexDirection = cssValue;
      break;
    case "position-select":
      currentEditable.style.position = cssValue;
      break;
    case "background-color-picker":
      currentEditable.style.backgroundColor = cssValue;
      break;
    case "font-color-picker":
      currentEditable.style.color = cssValue;
      break;
    case "justify-content":
      currentEditable.style.justifyContent = cssValue;
      break;
    case "align-items":
      currentEditable.style.alignItems = cssValue;
      break;
    case "color-input": // Ogólne inputy koloru
      currentEditable.style[
        inputClass.replace("-picker", "").replace("-input", "")
      ] = cssValue;
      break;
    case "url":
      if (currentEditable.classList.contains("image-container")) {
        const img = currentEditable.querySelector("img");
        currentEditable.src = cssValue;
        img.src = cssValue;
      }
      break;
    case "shadow-size-input":
      currentEditable.style.boxShadow = `0 0 ${cssValue}px  rgba(0,0,0,0.6)`;
      break;
    case "flex-wrap-select":
      currentEditable.style.flexWrap = cssValue;
      break;
      case "text-align-select":
        currentEditable.style.textAlign = cssValue;
        break;
    case "bold-checkbox":
      currentEditable.style.fontWeight = event.target.checked
        ? "bold"
        : "normal";
      break;
    case "italic-checkbox":
      currentEditable.style.fontStyle = event.target.checked
        ? "italic"
        : "normal";
      break;
    case "underline-checkbox":
      currentEditable.style.textDecoration = event.target.checked
        ? "underline"
        : "none";
      break;
    case "background-opacity-input":
      // Przechwytujemy aktualny kolor tła (w formacie RGB)
      const backgroundColor = window
        .getComputedStyle(currentEditable, null)
        .getPropertyValue("background-color");

      // Konwersja koloru tła na RGBA
      const rgbaColor = convertRGBtoRGBA(backgroundColor, cssValue);
      currentEditable.style.backgroundColor = rgbaColor;
      break;
    default:
      console.log("Nieobsługiwana klasa:", inputClass);
  }
}

function rgbToHex(rgb) {
  if (!rgb || rgb.indexOf("rgb") === -1) return "#000000"; // Domyślny kolor

  let rgbValues = rgb
    .replace("rgb(", "")
    .replace(")", "")
    .split(",")
    .map(Number);
  let hex = rgbValues
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("");
  return "#" + hex;
}
function convertRGBtoRGBA(rgb, opacity) {
  if (!rgb) return "rgba(0, 0, 0, 1)"; // Domyślny kolor, jeśli nie ma wartości RGB

  // Usunięcie 'rgb' i nawiasów, a następnie podzielenie wyniku
  const rgbValues = rgb
    .replace("rgb(", "")
    .replace(")", "")
    .split(",")
    .map(Number);

  return `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${opacity})`;
}

function updateOptionsPanel(element) {
  if (!element) return;
  let typeHeader = document.querySelector("#objectTypeHeader");
  let idHeader = document.querySelector("#objectIdHeader");
  
    typeHeader.innerHTML = `${element.tagName}`;
    idHeader.innerHTML =element.getAttribute('id');
  
  // Konwersja RGB na heksadecymalny dla inputów typu 'color'
  document.querySelector(".font-color-picker").value = rgbToHex(
    element.style.color
  );
  
  document.querySelector(".background-color-picker").value = rgbToHex(
    element.style.backgroundColor
  );

  document.querySelector(".font-size-input").value =
    element.style.fontSize.replace("px", "") || "";
  document.querySelector(".font-family-select").value =
    element.style.fontFamily.replace(/['"]+/g, "") || "";
  document.querySelector(".position-select").value =
    element.style.position || "";
  document.querySelector(".border-size-input").value =
    element.style.borderWidth.replace("px", "") || "";
  document.querySelector(".border-color-input").value = rgbToHex(
    element.style.borderColor
  );
  document.querySelector(".border-radius-input").value =
    element.style.borderRadius.replace("px", "") || "";
  document.querySelector(".opacity-input").value = element.style.opacity || "";
  document.querySelector(".flex-wrap-select").value = element.style.flexWrap || "";
  document.querySelector(".text-align-select").value = element.style.textAlign || "";
  document.querySelector(".justify-content").value =
    element.style.justifyContent || "";
    document.querySelector(".shadow-size-input").value =
    element.style.boxShadow || "";
  // Nowe aktualizacje dla szerokości, wysokości, marginesów i paddingów
  document.querySelector(".width").value = element.style.width || "";
  document.querySelector(".minHeight").value = element.style.minHeight || ""; // false Height

  // Aktualizacje dla marginesów i paddingów
  ["Top", "Right", "Bottom", "Left"].forEach((direction) => {
    document.querySelector(`.margin-${direction.toLowerCase()}`).value =
      element.style[`margin${direction}`].replace("px", "") || "";
    document.querySelector(`.padding-${direction.toLowerCase()}`).value =
      element.style[`padding${direction}`].replace("px", "") || "";
  });
  document.querySelector(".url").value = element.src || "";
  document.querySelector(".display-select").value = element.style.display || "";
  document.querySelector(".flex-direction-select").value =
    element.style.flexDirection || "";
  document.querySelector(".justify-content").value =
    element.style.justifyContent || "";
  document.querySelector(".align-items").value = element.style.alignItems || "";
}
function clearSideBarHeader(){
  let typeHeader = document.querySelector("#objectTypeHeader");
  let idHeader = document.querySelector("#objectIdHeader");
    typeHeader.innerHTML = 'Ustawienia';
    idHeader.innerHTML ='';
  
}
window.clearSideBarHeader = clearSideBarHeader;