import { authorizedFetch, address } from "../utils/global.js";

// POBIERA STRONĘ PO JEJ ID
export async function fetchPageById(id) {
  try {
    const response = await authorizedFetch(`${address}/api/pages/${id}`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("An error occurred:", error);
    return null;
  }
}

// TWORZY NOWĄ STRONĘ NA PODSTAWIE PODANYCH PARAMETRÓW
export async function createPage(website, name, title) {
  let payload = {
    website,
    name,
    title,
  };

  return authorizedFetch(`${address}/api/pages/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return "success";
    })
    .catch((error) => {
      console.error("An error occurred:", error);
      return "error";
    });
}

// AKTUALIZUJE DANE STRONY
export async function updatePage(
  websiteName,
  oldPageName,
  newPageName,
  pageTitle
) {
  const payload = {
    websiteName,
    oldPageName,
    newPageName,
    pageTitle,
  };
  try {
    const response = await authorizedFetch(`${address}/api/pages/updatePage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.text();
  } catch (error) {
    console.error("An error occurred:", error);
    return null;
  }
}

// USUWA STRONĘ Z PODANEJ LOKALIZACJI
export async function deletePage(websiteName, pageName) {
  try {
    const response = await authorizedFetch(
      `${address}/api/pages/delete/${websiteName}/${pageName}`,
      { method: "POST" }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return true;
  } catch (error) {
    console.error("An error occurred:", error);
    return false;
  }
}
//PRZESYŁA PLIK NA SERWER
export async function uploadFile(formData) {
  try {
    const response = await authorizedFetch(address + "/api/pages/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Network response error");
    }
  } catch (error) {
    console.error("An Error occurred:", error);
    if (error.response) {
      console.error("Response:", error.response);
    }
  }
}

//POBIERA STRONĘ W FORMACIE BLOB
export async function downloadPage(websiteName, pageName) {
  try {
    const response = await authorizedFetch(
      address + "/api/pages/download/" + websiteName + "/" + pageName,
      { method: "GET" }
    );
    const page = await response.blob();
    return page;
  } catch (error) {
    console.error(error);
    if (error.response) console.log(error.response);
  }
}

//TWORZY KOPIĘ ISTNIEJĄCEJ STRONY
export async function clonePage(websiteName, pageName) {
  try {
    const response = await authorizedFetch(
      address + "/api/pages/clone/" + websiteName + "/" + pageName,
      { method: "POST" }
    );
    const page = await response.blob();
    return "success";
  } catch (error) {
    console.error(error);
    if (error.response) console.log(error.response);
  }
}
