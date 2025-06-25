export default async function fetchWithAuth(url, options = {}) {
    const accessToken = localStorage.getItem('access_token');
  
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  
    const response = await fetch(url, {
      ...options,
      headers,
    });
  
    if (response.status === 401 || response.status === 403) {
      // Token invalid or expired
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login'; // Redirect to login page
      return;
    }
  
    return response;
  }