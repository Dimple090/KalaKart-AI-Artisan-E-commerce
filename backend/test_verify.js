const axios = require('axios');
(async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', { email: 'artisan@kalakart.com', password: 'password123' });
    const token = res.data.token;
    console.log('Login success');
    
    const verifyRes = await axios.post('http://localhost:5000/api/ai/verify-handmade', { name: 'Clay Pot', description: 'Handcrafted clay pot' }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Verify Success:', verifyRes.data);
  } catch (e) {
    console.error('Error:', e.response ? e.response.data : e.message);
  }
})();
