import { address, jwtToken } from "../../utils/global.js";

let welcomeMessage;
document.addEventListener("DOMContentLoaded", async function () {
  welcomeMessage = document.getElementById("welcomeMessage");
  getUserData();
});

function authorizedFetch(url, options = {}) {
  options.headers = options.headers || {};
  options.headers["Authorization"] = "Bearer " + jwtToken;
  return fetch(url, options);
}

async function getUserData() {
  try {
    const response = await authorizedFetch(address + "/userDetails", {
      method: "GET",
    });
    const data = await response.json();
    console.log(data);
    localStorage.setItem("userName", data.username);
    welcomeMessage.innerHTML = `Welcome ${data.username}! <br><br>`;
  } catch (error) {
    console.error("getUserData() - An error occurred:", error);
  }
}
