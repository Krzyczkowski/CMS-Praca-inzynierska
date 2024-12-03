import { downloadPage } from "../api/page.js";
export async function loadPage() {
    let websiteName = localStorage.getItem('editingWebsite');
    let pageName = localStorage.getItem('editingPage');
    const pageBlob = await downloadPage(websiteName, pageName);

    // Konwersja Bloba na tekst
    const pageText = await pageBlob.text();

    // Parsowanie tekstu jako dokumentu HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(pageText, 'text/html');

    // Usuwanie wszystkich elementów <script> z dokumentu
    const scripts = doc.querySelectorAll('script');
    scripts.forEach(script => script.parentNode.removeChild(script));

    // Zapisywanie zmodyfikowanej zawartości <body>
    const bodyContent = doc.body.innerHTML;
    return bodyContent;
}
