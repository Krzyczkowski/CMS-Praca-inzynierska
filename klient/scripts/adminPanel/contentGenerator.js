import { fetchAllWebsites, fetchContentType } from "../../api/website.js";
import {
  createContent,
  fetchContentSchema,
  getAllContent,
  updateContent,
  deleteContent,
} from "../../api/content.js";

let websiteSelect, container, contentContainer, searchFieldSelect, searchInput;

export async function contentGenerator(selectedContainer) {
  container = selectedContainer;
  container.classList.add("contentGeneratorPanel");
  container.innerHTML = "";
  const websites = await fetchAllWebsites();
  if (websites.length === 0) {
    container.innerHTML = "No websites available";
    return;
  }

  websiteSelect = document.createElement("select");

  websites.forEach((website) => {
    const option = document.createElement("option");
    option.value = website.name;
    option.textContent = website.name;
    websiteSelect.appendChild(option);
  });
  container.appendChild(websiteSelect);

  let targetWebsite = localStorage.getItem("websiteTarget");
  console.log("target:" + targetWebsite);
  if (targetWebsite) {
    websiteSelect.value = targetWebsite;
  }
  localStorage.setItem("websiteTarget", "");

  contentContainer = document.createElement("div");
  contentContainer.classList.add("contentContainer");
  container.appendChild(contentContainer);

  // GENEROWANIE SCHEMATU DO TWORZENIA/AKTUALIZACJI CONTENT
  const generateForm = async () => {
    const selectedWebsite = websiteSelect.value;
    const contentType = await fetchContentType(selectedWebsite);
    const schema = await fetchContentSchema(contentType);
    let h1 = container.querySelector("h1");
    if (!h1) {
      h1 = document.createElement("h1");
      h1.textContent = "Select Website:";
      container.insertBefore(h1, container.firstChild);
    }
    const form = document.createElement("form");
    form.classList.add("schemaFormList");
    const table = document.createElement("table");
    table.innerHTML = `<h1>Content Generator</h1>`;

    Object.keys(schema).forEach((key) => {
      const row = table.insertRow();
      const labelCell = row.insertCell();
      const label = document.createElement("label");
      label.textContent = key + ": " + schema[key];
      labelCell.appendChild(label);

      const inputCell = row.insertCell();
      let input = document.createElement("input");
      input.name = key;
      switch (schema[key]) {
        case "String":
          input = document.createElement("textarea");
          input.name = key;
          input.rows = 1;
          break;
        case "Long":
          input.type = "number";
          break;
        case "byte[]":
          input.type = "file";
          break;
        default:
          input.type = "text";
      }

      inputCell.appendChild(input);
    });

    form.appendChild(table);
    let row = document.createElement("div");
    row.classList.add("flexRow");

    const submitButton = document.createElement("button");
    submitButton.classList.add("submitButton");
    submitButton.type = "button";
    submitButton.textContent = "Create Content";
    submitButton.addEventListener("click", async () => {
      await createContent(selectedWebsite, contentType, form);
      setTimeout(async () => {
        await displayContents();
      }, 500);
    });
    row.appendChild(submitButton);

    const updateButton = document.createElement("button");
    updateButton.classList.add("updateButton");
    updateButton.type = "button";
    updateButton.textContent = "Update Content";
    updateButton.addEventListener("click", async (e) => {
      e.preventDefault();
      const formElement = document.querySelector(".schemaFormList");
      let formData = new FormData(formElement);

      // DODAWANIE ELEMENTÓW DO FORMULARZA
      for (let element of formElement.elements) {
        if (element.name && element.type !== "file") {
          formData.set(element.name, element.value);
        }
      }

      const selectedWebsite = websiteSelect.value;
      const updateResult = await updateContent(selectedWebsite, formData);

      if (updateResult) {
        await displayContents(); // ODŚWIEŻENIE
      }
    });

    row.appendChild(updateButton);

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("deleteButton");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete Content";
    deleteButton.addEventListener("click", async () => {
      const selectedRow = document.querySelector(".selectedRow");
      if (!selectedRow) {
        alert("Please select a content to delete.");
        return;
      }
      const contentId = selectedRow.getAttribute("data-content-id");
      const selectedWebsite = websiteSelect.value;
      if (confirm("Are you sure you want to delete this content?")) {
        await deleteContent(selectedWebsite, contentId);
        await displayContents();
      }
    });
    row.appendChild(deleteButton);

    form.appendChild(row);

    const existingForm = container.querySelector("form");
    if (existingForm) {
      container.replaceChild(form, existingForm);
    } else {
      container.appendChild(form);
    }
    if (searchInput && searchInput.parentNode) {
      searchInput.parentNode.removeChild(searchInput);
    }
    searchInput = document.createElement("input");
    searchInput.classList.add("searchContentInput");
    searchInput.type = "text";
    searchInput.placeholder = "Search...";
    container.appendChild(searchInput);
    if (searchFieldSelect && searchFieldSelect.parentNode) {
      searchFieldSelect.parentNode.removeChild(searchFieldSelect);
    }
    searchFieldSelect = document.createElement("select");
    container.appendChild(searchFieldSelect);

    //append tabelka na content
    container.appendChild(contentContainer);
    await displayContents();
  };
  websiteSelect.addEventListener("change", generateForm);

  await generateForm();
  async function displayContents() {
    const selectedWebsite = websiteSelect.value;
    const contents = await getAllContent(selectedWebsite);

    const table = document.createElement("table");
    contentContainer.innerHTML = "";

    if (contents.length > 0) {
      const headerRow = table.insertRow();
      Object.keys(contents[0]).forEach((key) => {
        if (key !== "website" && key !== "schema") {
          const th = document.createElement("th");
          th.textContent = key;
          headerRow.appendChild(th);
        }
      });
    }
    searchFieldSelect.innerHTML = "";
    if (contents.length > 0) {
      Object.keys(contents[0]).forEach((key) => {
        if (key !== "website" && key !== "schema") {
          const option = document.createElement("option");
          option.value = key;
          option.textContent = key;
          searchFieldSelect.appendChild(option);
        }
      });
    }

    contents.forEach((content, index) => {
      const row = table.insertRow();
      row.id = `content-row-${index}`;
      row.setAttribute("data-content-id", content.id);
      Object.entries(content).forEach(([key, value]) => {
        if (key !== "website" && key !== "schema") {
          const cell = row.insertCell();
          const scrollableDiv = document.createElement("div");
          scrollableDiv.className = "scrollableContent";

          // WYŚWIETLANIE PODGLĄDU OBRAZU
          if (content.schema[key] === "byte[]" && value) {
            const img = new Image();
            img.src = "data:image/jpeg;base64," + value;
            scrollableDiv.appendChild(img);
          } else {
            scrollableDiv.textContent = value;
          }

          cell.setAttribute("data-field", key);
          cell.appendChild(scrollableDiv);
        }
      });

      row.addEventListener("click", (e) => {
        let lastSelected = document.querySelector(".selectedRow");
        if (lastSelected) lastSelected.classList.remove("selectedRow");
        row.classList.toggle("selectedRow");
        fillFormWithContentData(content);
      });
    });
    contentContainer.appendChild(table);
  }

  function fillFormWithContentData(content) {
    const form = document.querySelector(".schemaFormList");
    Object.keys(content).forEach((key) => {
      if (key !== "website" && key !== "schema") {
        const element = form.querySelector(`[name="${key}"]`);

        if (element) {
          if (element.type === "file") {
          } else {
            element.value = content[key];
          }
        }
      }
    });
    if (!form.querySelector('[name="id"]')) {
      const hiddenIdInput = document.createElement("input");
      hiddenIdInput.type = "hidden";
      hiddenIdInput.name = "id";
      form.appendChild(hiddenIdInput);
    }

    const hiddenIdInput = form.querySelector('[name="id"]');
    hiddenIdInput.value = content["id"];
  }

  function filterContents() {
    const searchTerm = searchInput.value.toLowerCase();
    const searchField = searchFieldSelect.value;

    const rows = contentContainer.getElementsByTagName("tr");
    for (let i = 1; i < rows.length; i++) {
      let cells = rows[i].getElementsByTagName("td");
      let found = false;

      for (let j = 0; j < cells.length; j++) {
        if (
          cells[j].textContent.toLowerCase().includes(searchTerm) &&
          (searchField === cells[j].getAttribute("data-field") ||
            searchField === "all")
        ) {
          found = true;
          break;
        }
      }
      rows[i].style.display = found ? "" : "none";
    }
  }
  searchInput.addEventListener("input", filterContents);
  searchFieldSelect.addEventListener("change", filterContents);
}
