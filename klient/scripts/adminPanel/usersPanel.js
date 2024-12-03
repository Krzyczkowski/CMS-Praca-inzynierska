import { fetchWebsiteUsers, fetchAllWebsites } from "../../api/website.js";
import { fetchUserComments, deleteComment } from "../../api/comment.js";
import { deleteUser } from "../../api/user.js";
export async function usersPanel(container) {
  const websites = await fetchAllWebsites();
  if (websites.length === 0) {
    container.innerHTML = "<h2>No websites available!</h2>";
    return;
  }

  let options = websites
    .map(
      (website) => `<option value="${website.name}">${website.name}</option>`
    )
    .join("");

  const htmlContent = `
      <div class="website_creator">
        <h1>Users Management Panel</h1>
        <select id="selectedWebsite" onchange="updateUsersTable()">${options}</select>
        <div id="usersTable"></div>
      </div>
    `;

  container.innerHTML = htmlContent;

  // AKTUALIZUJE TABELE UŻYTKOWNIKÓW
  window.updateUsersTable = async () => {
    const allUsers = await fetchWebsiteUsers();
    let selectedWebsite = document.querySelector("#selectedWebsite").value;

    let tableHtml = `<table>
                           <tr>
                             <th>Username</th>
                             <th>Email</th>
                             <th>Website Name</th>
                             <th>Comment List</th>
                             <th>Action</th>
                           </tr>`;
    allUsers
      .filter((user) => user.websiteName === selectedWebsite)
      .forEach((user) => {
        tableHtml += `<tr>
                            <td>${user.username}</td>
                            <td>${user.email}</td>
                            <td>${user.websiteName}</td>
                            <td><button onclick="commentsUser('${user.username}')">Comments</button></td>
                            <td><button onclick="callDeleteUser('${user.id}')">Delete</button></td>
                          </tr>`;
      });
    tableHtml += `</table>`;

    document.getElementById("usersTable").innerHTML = tableHtml;
  };
  let targetWebsite = localStorage.getItem("websiteTarget");
  if (targetWebsite) {
    let selectElement = document.querySelector("#selectedWebsite");
    selectElement.value = targetWebsite;
  }
  localStorage.setItem("websiteTarget", "");
  // STWORZENIE TABELI UZYTKOWNIKÓW
  updateUsersTable();
}

async function callDeleteUser(userId) {
  const result = await deleteUser(userId);
  if (result === "success") {
    // ODŚWIEŻENIE
    updateUsersTable();
  } else {
    console.error("Failed to delete user");
  }
}
window.callDeleteUser = callDeleteUser;


async function commentsUser(username) {
  let modal = document.querySelector("#myModal");
  let modalContent = document.querySelector(".modal-contents");
  let span = document.getElementsByClassName("close")[0];
  const websiteAuthor = localStorage.getItem("userName");
  modal.style.display = "block";
  let websiteName = document.querySelector("#selectedWebsite").value;
  let comments = await fetchUserComments(websiteAuthor, websiteName, username);
  let htmlContent = `<h2> ${username} Comments</h2><div class="comments-list">`;
  if (comments.length > 0) {
    comments.forEach((comment) => {
      htmlContent += `<div class="comment-item">
                                <p><strong>ContentID= ${comment.contentId}</strong>: ${comment.text}
                                  <button onclick="callDeleteComment(${comment.id},'${username}')">
                                    Delete
                                  </button>
                                </p>
                            </div>`;
    });
  } else {
    htmlContent += `<p>No comments available for this user.</p>`;
  }

  htmlContent += `</div>`;

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

window.commentsUser = commentsUser;
async function callDeleteComment(commentId, username) {
  await deleteComment(commentId);
  //ODŚWIEŻENIE
  commentsUser(username);
}
window.callDeleteComment = callDeleteComment;
