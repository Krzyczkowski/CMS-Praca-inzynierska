import { authorizedFetch, address } from "../utils/global.js";

// USUWA UŻYTKOWNIKA
export async function deleteUser(userId) {
  try {
    const response = await authorizedFetch(`${address}/user/delete/${userId}`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return "success"; // Zwraca "success" w przypadku pomyślnego usunięcia użytkownika
  } catch (error) {
    console.error("An error occurred:", error);
    return "error"; // Zwraca "error" w przypadku wystąpienia błędu
  }
}
