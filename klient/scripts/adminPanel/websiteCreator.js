import {
  createWebsite,
  fetchAllWebsites,
  setContent,
  fetchContentType,
} from "../../api/website.js";
import { fetchContentTypes, fetchRenderTypes } from "../../api/content.js";
import { populateSelectFromList } from "../../utils/select.js";
import { extractValuesFromKey } from "../../utils/list.js";

let websiteList,
  contentTypesList,
  renderTypeslist,
  selectWebsites,
  selectContentTypes,
  selectRenderTypes,
  currentContent,
  currentContentSection;
export async function websiteCreator(container) {
  const htmlContent = `<div class="website_creator">
    <h1>Create a Website</h1>
    <div class="boxShadow">
    <form id="create-website-form">
        Website Name:<br> <input type="text" id="websiteName"><br>
        <button type="submit">Create </button>
    </form>
    </div>
    <h1>Website Content </h1>
    <div>
    Website: <br><select id="selectWebsite"></select><br>
    </div>
    <div id="websiteSettings" class="boxShadow">
        <div id="currentContent"></div>
        Select content type:<br> <select id="selectContentType"></select> <br>
        <button onclick="setContentType()"> Save </button>
    </div>
    </div>
    `;
  container.innerHTML = htmlContent;
  selectWebsites = document.getElementById("selectWebsite");
  selectContentTypes = document.getElementById("selectContentType");
  currentContentSection = document.querySelector("#currentContent");

  selectWebsites.addEventListener("change", async function (e) {
    refreshCurrentContent();
  });

  document
    .getElementById("create-website-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      await createWebsite(event);
      refreshWebsiteSelects();
    });
  await refreshWebsiteSelects();

  if (selectWebsites.options.length > 0) {
    refreshCurrentContent();
  }
}

async function setContentType() {
  let website = selectWebsites.value;
  let content = selectContentTypes.value;
  await setContent(website, content);
  refreshCurrentContent();
}
window.setContentType = setContentType;

async function refreshWebsiteSelects() {
  await fetchAllWebsites().then((data) => {
    websiteList = extractValuesFromKey(data, "name");
  });
  populateSelectFromList(selectWebsites, websiteList);
  await fetchContentTypes().then((data) => {
    contentTypesList = data;
  });
  populateSelectFromList(selectContentTypes, contentTypesList);
}

async function refreshCurrentContent() {
  currentContent = await fetchContentType(selectWebsites.value);
  currentContentSection.innerHTML = `Current Content: ${currentContent}`;
}
