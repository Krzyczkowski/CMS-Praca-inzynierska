import {uploadFile} from "../api/page.js";
import { fetchContentSchema } from "../api/content.js";
import { fetchContentType, fetchPageList } from "../api/website.js";
import {loadPage} from "./loadPage.js"
function uploadFileCall(data){
    uploadFile(data);
}
window.uploadFileCall = uploadFileCall;

async function fetchContentSchemaCall(content) {
    return fetchContentSchema(content).then(data => data);
}
window.fetchContentSchemaCall = fetchContentSchemaCall;

async function fetchContentTypeCall(website) {
    return fetchContentType(website).then(data => data);
}
window.fetchContentTypeCall = fetchContentTypeCall;

async function loadPageCall() {
    return loadPage().then(data => data);
}
window.loadPageCall = loadPageCall;

async function loadPageListCall(website) {
    return fetchPageList(website).then(data => data);
}
window.loadPageListCall = loadPageListCall;