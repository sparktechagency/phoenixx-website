export function isAuthenticated() {
  // In a real app, you'd check cookies/tokens
  return localStorage.getItem('isLoggedIn') === true;
}