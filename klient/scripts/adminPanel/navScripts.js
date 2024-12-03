import { websiteCreator } from "./websiteCreator.js";
import { contentGenerator } from "./contentGenerator.js";
import { usersPanel } from "./usersPanel.js";
import { mainPanel } from "./mainPanel.js";

// ZBIÓR FUNKCJI DLA NAWIGACJI W PANELU ADMINISTRATORA


document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("mainPanel")
    .addEventListener("click", nmainPanelFunction);
  document
    .getElementById("websiteCreatorBtn")
    .addEventListener("click", websiteCreatorFunction);
  document
    .getElementById("websiteEditorBtn")
    .addEventListener("click", websiteEditorFunction);
  document
    .getElementById("contentGeneratorBtn")
    .addEventListener("click", contentGeneratorFunction);
  document
    .getElementById("usersPanelBtn")
    .addEventListener("click", usersPanelFunction);
  document
    .getElementById("loginPanelBtn")
    .addEventListener("click", loginPanelFunction);
  mainPanel(document.getElementsByTagName("main")[0]);
});

function websiteCreatorFunction() {
  websiteCreator(document.getElementsByTagName("main")[0]);
}

function nmainPanelFunction() {
  mainPanel(document.getElementsByTagName("main")[0]);
}

function websiteEditorFunction() {
  mainPanel(document.getElementsByTagName("main")[0]);
}

function contentGeneratorFunction() {
  contentGenerator(document.getElementsByTagName("main")[0]);
}
window.contentGeneratorFunction = contentGeneratorFunction;
function usersPanelFunction() {
  usersPanel(document.getElementsByTagName("main")[0]);
}
window.usersPanelFunction = usersPanelFunction;

function loginPanelFunction() {
  localStorage.setItem("jwtToken", "");
  window.location.href = "./index.html";
}
window.loginPanelFunction = loginPanelFunction;
