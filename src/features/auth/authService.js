export const saveToken = (token) => {
    localStorage.setItem("loginToken", token);
  };
  
  export const getToken = () => {
    return localStorage.getItem("loginToken");
  };
  
  export const removeToken = () => {
    localStorage.removeItem("loginToken");
  };
  
  export const isAuthenticated = () => {
    return !!getToken(); 
  };
  