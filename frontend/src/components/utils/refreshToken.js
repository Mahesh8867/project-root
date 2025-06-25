export const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    
      
    if (!refresh) return null;
    
    const res = await fetch('http://localhost:8000/api/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
  
    const data = await res.json();
    if (data.code === 'token_not_valid') {
        alert('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/login';  // or navigate programmatically
      }
    if (data.access) {
      localStorage.setItem('access_token', data.access);
      return data.access;
    } else {
      console.error('Refresh failed:', data);
      return null;
    }
    
  };
  