export const address = "http://localhost:8080"
localStorage.setItem("address",address);
export const jwtToken = localStorage.getItem('jwtToken');


export function authorizedFetch(url, options = {}) {
    options.headers = options.headers || {};
    options.headers['Authorization'] = 'Bearer ' + jwtToken;
    return fetch(url, options);
}
