import {
  createWebsite,
  fetchAllWebsites,
  fetchPageList,
  deleteWebsite
} from "../../api/website.js";

import { extractValuesFromKey } from "../../utils/list.js";
import { address } from "../../utils/global.js";
import {
  createPage,
  downloadPage,
  updatePage,
  deletePage,
  clonePage,
} from "../../api/page.js";
let websiteNameList, mainContainer;
export async function mainPanel(container) {
  mainContainer = container;
  let fullWebsitesList = [];
  await fetchAllWebsites().then((data) => {
    fullWebsitesList = data;
    websiteNameList = extractValuesFromKey(data, "name");
  });
  let htmlWithWebsites = "";
  fullWebsitesList.forEach((ws) => {
    htmlWithWebsites += ` <div class="website-item">
      <div class="website-main-row"> 
      
      <h1>${ws["name"]}</h1>
        <div class="metrics">
                <div>
                Views:
                <span class="value">${ws["visitedCount"]}</span>
                </div>
                <div>
                Load Time:
                <span class="value"> ${ws["averageLoadingTime"]}ms</span>
                </div>
                <div>
                Content:
                <span class="value">${ws["selectedContentType"]}</span>
                </div> 
        </div>
      </div>
        <hr>
      

      <button  onclick="pageList('${ws["name"]}')"><img src="./img/page.png" class="defaultIcon"> Pages</button>
      <button onclick="previewWebsite('${ws["name"]}')"style="background-color:#33CC66"onclick="previewWebsite('${ws["name"]}')"><img src="./img/preview.png" class="defaultIcon"> Preview</button>
      <button style="background-color:#FF9933"onclick="usersWebsite('${ws["name"]}')"><img src="./img/user.png" class="defaultIcon"> Users</button>
      <button style="background-color:#CC0077"onclick="contentWebsite('${ws["name"]}')"><img src="./img/stats.png" class="defaultIcon"> Content</button>
      <button style="background-color:#CC0000"onclick="callDeleteWebsite('${ws["name"]}')"><img src="./img/trash.png" class="defaultIcon"> Delete</button>
      </div>`;
  });

  const htmlContent = `
        ${htmlWithWebsites}
    `;

  container.innerHTML = htmlContent;
}

async function pageList(websiteName) {
  let modal = document.querySelector("#myModal");
  let modalContent = document.querySelector(".modal-contents");
  let span = document.getElementsByClassName("close")[0];
  modal.style.display = "block";
  let pages = await fetchPageList(websiteName);

  let htmlContent = ``;

  let tableHtml = createTableWithPages(websiteName, pages);
  tableHtml += `
      <div class="pageList">
      <div class="modalSection"> <h2>Create a Page</h2>
      <label>Page Name</label>
      <input id="pageName" type="text">
      <label>Page Title</label>
      <input id="pageTitle" type="text">
      <button onclick="handlePageSubmit('${websiteName}')">Create</button>
      </div></div></div>
      `;
  htmlContent += tableHtml;

  modalContent.innerHTML = htmlContent;

  span.onclick = function () {
    modal.style.display = "none";
  };
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}
window.pageList = pageList;

async function editPage(pageName, websiteName) {
  localStorage.setItem("editingPage", pageName);
  localStorage.setItem("editingWebsite", websiteName);

  window.location.href = "./website-editor/index.html";
}
window.editPage = editPage;

function renamePage(pageName, websiteName) {
  const row = document.getElementById(pageName);
  const oldName = row.cells[0].textContent;
  const oldTitle = row.cells[1].textContent;

  row.innerHTML = `
    <td><input type="text" value="${oldName}" class="edit-name"></td>
    <td><input type="text" value="${oldTitle}" class="edit-title"></td>
    <td>
      <button class="saveButton" onclick="saveChanges('${pageName}','${websiteName}')">Save</button>
    </td>
  `;
}
window.renamePage = renamePage;

async function saveChanges(oldPageName, websiteName) {
  const row = document.getElementById(oldPageName);
  const newPageName = row.querySelector(".edit-name").value;
  const newTitle = row.querySelector(".edit-title").value;
  try {
    const response = await updatePage(
      websiteName,
      oldPageName,
      newPageName,
      newTitle
    );
    if (response) {
      console.log("Page updated successfully:", response);

      //AKTUALIZACJA INTERFEJSU
      row.innerHTML = `
              <td>${newPageName}</td>
              <td>${newTitle}</td>
              <td>
                  <button class="editButton" onclick="editPage('${newPageName}','${websiteName}')">Build</button>
                  <button class="renameButton" onclick="renamePage('${newPageName}','${websiteName}')">Rename</button>
                  <button class="visitButton" onclick="visitPage('${newPageName}','${websiteName}')">Visit</button>
                  <button class="cloneButton" onclick="clonePageCall('${newPageName}','${websiteName}')">Clone</button>
                  <button class="deleteButton" onclick="deletePagecall('${newPageName}','${websiteName}')">Delete</button>
              </td>
          `;
    } else {
      console.error("Failed to update the page");
    }
  } catch (error) {
    console.error("An error occurred while updating the page:", error);
  }
}
window.saveChanges = saveChanges;

async function deletePagecall(pageName, websiteName) {
  const row = document.getElementById(pageName);
  try {
    const response = await deletePage(websiteName, pageName);
    if (response) {
      console.log("Page removed successfully:", response);
      row.remove();
    } else {
      console.error("Failed to remove the page");
    }
  } catch (error) {
    console.error("An error occurred while removing the page:", error);
  }
}
window.deletePagecall = deletePagecall;

async function handlePageSubmit(websiteName) {
  let title = document.querySelector("#pageTitle").value;
  let name = document.querySelector("#pageName").value;
  let response = await createPage(websiteName, name, title);

  if (response === "success") {
    refreshPageList(websiteName);
  } else {
    console.error("Failed to create the page, response:", response);
  }
}
window.handlePageSubmit = handlePageSubmit;

function settingsWebsite(websiteName) {
  console.log(`settings: ${websiteName}`);
}
window.settingsWebsite = settingsWebsite;

function statsWebsite(websiteName) {
  console.log(`stats: ${websiteName}`);
}
window.statsWebsite = statsWebsite;
function visitPage(page, website) {
  let username = localStorage.getItem("userName");
  let url = `${address}/${username}/${website}/${page}.html`;
  window.open(url, "_blank").focus();
}
window.visitPage = visitPage;

async function clonePageCall(page, website) {
  const res = await clonePage(website, page);

  if (res === "success") {
    refreshPageList(website);
  } else {
    console.error("Failed to clone the page:", res.message);
  }
}
window.clonePageCall = clonePageCall;

function createTableWithPages(websiteName, pages) {
  let tableHtml = `<h1>Website: ${websiteName}</h1><div class="flexRow"><table class="modalTable">`;
  tableHtml += "<tr><th>Name</th><th>Title</th><th>Actions</th></tr>";
  pages.forEach((page) => {
    tableHtml += `
        <tr id='${page.name}'>
          <td>${page.name}</td>
          <td>${page.title}</td>
          <td>
            <button class="editButton" onclick="editPage('${page.name}','${websiteName}')">Build</button>
            <button class="renameButton" onclick="renamePage('${page.name}','${websiteName}')">Rename</button>
            <button class="visitButton" onclick="visitPage('${page.name}','${websiteName}')">Visit</button>
            <button class="cloneButton" onclick="clonePageCall('${page.name}','${websiteName}')">Clone</button>
            <button class="deleteButton" onclick="deletePagecall('${page.name}','${websiteName}')">Delete</button>
          </td>
        </tr>
        
      `;
  });
  tableHtml += "</table>";
  return tableHtml;
}

async function refreshPageList(websiteName) {
  let pages = await fetchPageList(websiteName);
  let modalContent = document.querySelector(".modal-contents");
  let htmlContent = ``;

  if (pages.length > 0) {
    htmlContent += createTableWithPages(websiteName, pages);
  } else {
    htmlContent += `<p>${websiteName} has no Pages!</p>`;
  }
  htmlContent += `      <div class="pageList">
  <div class="modalSection"> <h2>Create a Page</h2>
  <label>Page Name</label>
  <input id="pageName" type="text">
  <label>Page Title</label>
  <input id="pageTitle" type="text">
  <button onclick="handlePageSubmit('${websiteName}')">Create</button>
  </div></div></div>`;

  modalContent.innerHTML = htmlContent;
}

async function previewWebsite(websiteName) {
  let username = localStorage.getItem("userName");
  let pages = await fetchPageList(websiteName);
  console.log(pages);
  let url = `${address}/${username}/${websiteName}/${pages[0].name}.html`;

  // NOWA KARTA DLA STRONY
  window.open(url, "_blank");
}
window.previewWebsite = previewWebsite;

function usersWebsite(website) {
  localStorage.setItem("websiteTarget", website);
  usersPanelFunction();
}
window.usersWebsite = usersWebsite;

function contentWebsite(website) {
  localStorage.setItem("websiteTarget", website);
  contentGeneratorFunction();
}
window.contentWebsite = contentWebsite;

async function callDeleteWebsite(website) {
  if (confirm("Czy na pewno chcesz usunąć tę stronę?")) {
    await deleteWebsite(website);
    window.location.reload();
  }
}

window.callDeleteWebsite = callDeleteWebsite;