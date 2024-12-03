import { address, authorizedFetch } from "../utils/global.js";

//POBIERA KOMENTARZE DLA KONKRETNEJ TREŚCI NA STRONIE
export async function fetchContentComments(websiteName, contentId) {
  try {
    const response = await authorizedFetch(
      `${address}/comment/all/${websiteName}/${contentId}`,
      {
        method: "GET",
      }
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

//TWORZY NOWY KOMENTARZ DO TREŚCI NA STRONIE
async function createComment(websiteName, contentId, text) {
  let payload = {
    websiteName,
    contentId,
    text,
  };
  try {
    const response = await authorizedFetch(`${address}/comment/add`, {
      method: "POST",
      body: JSON.stringify(payload),
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

//POBIERA KOMENTARZE UŻYTKOWNIKA DLA KONKRETNEJ STRONY I AUTORA
export async function fetchUserComments(websiteAuthor, websiteName, author) {
  console.log(websiteAuthor + " " + websiteName + " " + author);
  try {
    const response = await authorizedFetch(
      `${address}/comment/all/${websiteAuthor}/${websiteName}/${author}`,
      {
        method: "GET",
      }
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
//USUWA KONKRETNY KOMENTARZ
export async function deleteComment(commentId) {
  try {
    const response = await authorizedFetch(
      `${address}/comment/delete/${commentId}`,
      {
        method: "POST",
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.ok;
  } catch (error) {
    console.error("An error occurred while deleting the comment:", error);
    return false;
  }
}
