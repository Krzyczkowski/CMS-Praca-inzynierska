import { address, authorizedFetch } from "../utils/global.js";

// POBIERA LISTĘ WSZYSTKICH STRON INTERNETOWYCH
export async function fetchAllWebsites() {
  try {
    const response = await authorizedFetch(
      `${address}/websites/fetchAllWebsites`,
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

// TWORZY NOWĄ STRONĘ INTERNETOWĄ
export async function createWebsite(event) {
  event.preventDefault();
  const name = document.getElementById("websiteName").value;

  try {
    const response = await authorizedFetch(`${address}/websites/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await response.text();

    if (data !== "Website created successfully!") {
      throw new Error("Website could not be created");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
//AKTUALIZUJE USTAWIENIA STRONY INTERNETOWEJ
export async function updateWebsite(name, contentType, renderType) {
  const payload = {
    name,
    contentType,
    renderType,
  };
  authorizedFetch(`${address}/websites/updateSettings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Settings updated:", data);
    })
    .catch((error) => {
      console.error("An error occurred:", error);
    });
}

// POBIERA TYPY RENDEROWANIA DLA DANEJ TREŚCI
export async function fetchRenderTypes(contentType) {
  try {
    const response = await authorizedFetch(`/content/render/${contentType}`, {
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

//POBIERA LISTĘ STRON(PAGE) DLA KONKRETNEJ STRONY INTERNETOWEJ
export async function fetchPageList(websiteName) {
  try {
    const response = await authorizedFetch(
      `${address}/websites/fetchPages/${websiteName}`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("An error occurred:", error);
    return [];
  }
}
//USTAWIA TREŚĆ DLA STRONY INTERNETOWEJ
export async function setContent(website, content) {
  let payload = { website, content };
  try {
    const response = await authorizedFetch(`${address}/websites/setContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response;
  } catch (error) {
    console.error("An error occurred:", error);
    return null;
  }
}

//POBIERA TYP TREŚCI STRONY INTERNETOWEJ
export async function fetchContentType(website) {
  try {
    const response = await authorizedFetch(
      `${address}/websites/fetchContentType/${website}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.text();
    return data;
  } catch (error) {
    console.error("An error occurred:", error);
    return null;
  }
}
//POBIERA LISTĘ UŻYTKOWNIKÓW STRONY INTERNETOWEJ
export async function fetchWebsiteUsers() {
  try {
    const response = await authorizedFetch(
      `${address}/websites/fetchWebsiteUsers`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
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
export async function deleteWebsite(websiteName) {
  try {
    const response = await authorizedFetch(`${address}/websites/deleteWebsite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ website: websiteName }),
    });
    const data = await response.text();

    if (data !== "Website deleted successfully!") {
      throw new Error("Website could not be deleted");
    } else {
      console.log("Website deleted successfully!");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
