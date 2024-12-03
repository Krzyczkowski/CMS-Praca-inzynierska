import { address, authorizedFetch } from "../utils/global.js";

// POBIERA LISTĘ TYPÓW TREŚCI Z SERWERA
export async function fetchContentTypes() {
  try {
    const response = await authorizedFetch(`${address}/content/types`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("An error occurred:", error);
    return [];
  }
}
// POBIERA OPCJE RENDEROWANIA NA PODSTAWIE TYPÓW TREŚCI
export async function fetchRenderTypes(content) {
  try {
    const response = await authorizedFetch(
      `${address}/content/render/${content}`,
      { method: "GET" }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("An error occurred:", error);
    return [];
  }
}
// WYSYŁA NOWĄ TREŚĆ NA SERWER Z UŻYCIEM DANYCH FORMULARZA
export async function createContent(website, type, form) {
  let formData = new FormData(form);
  const fileInput = form.querySelector('input[type="file"]');
  if (fileInput && fileInput.files[0]) {
    const base64String = await fileToBase64(fileInput.files[0]);
    formData.append(fileInput.name, base64String);
  }
  for (var pair of formData.entries()) {
    console.log(pair[0] + ", " + pair[1]);
  }

  authorizedFetch(
    `${address}/content/create?websiteName=${encodeURIComponent(
      website
    )}&type=${encodeURIComponent(type)}`,
    {
      method: "POST",
      body: formData,
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    });
}
// AKTUALIZUJE ISTNIEJĄCĄ TREŚĆ NA SERWERZE
export async function updateContent(website, formData) {
  try {
    const response = await authorizedFetch(
      `${address}/content/update?websiteName=${encodeURIComponent(website)}`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await response.text();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
// KONWERTUJE PLIK NA KODOWANIE BASE64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// USUWA OKREŚLONĄ TREŚĆ Z SERWERA
export async function deleteContent(websiteName, contentId) {
  try {
    const response = await authorizedFetch(
      `${address}/content/deleteContent/${encodeURIComponent(
        websiteName
      )}/${contentId}`,
      {
        method: "POST",
      }
    );
    const data = await response.text();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// POBIERA SCHEMAT DLA DANEGO TYPY TREŚCI
export async function fetchContentSchema(content) {
  try {
    const response = await authorizedFetch(
      address + `/content/schema/${content}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  }
}

// POBIERA WSZYSTKIE TREŚCI DLA OKREŚLONEJ STRONY INTERNETOWEJ
export async function getAllContent(websiteName) {
  try {
    const response = await authorizedFetch(
      `${address}/content/getAllContent/${encodeURIComponent(websiteName)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.log(response);
      throw new Error("Network response was not ok");
    }

    const contents = await response.json();
    return contents;
  } catch (error) {
    console.error("An error occurred:", error);
    return [];
  }
}

