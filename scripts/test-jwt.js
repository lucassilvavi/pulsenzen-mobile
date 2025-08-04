/**
 * Debug direto na API - teste de JWT
 */
const jwt = require('jsonwebtoken');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5OGM0MzA2OC03YTNkLTQ4MjEtOWZlOS0zMzcxODBjYmJjZGUiLCJlbWFpbCI6Imx1Y2FzMUBpZy5jb20iLCJpYXQiOjE3NTQzMzQzODYsImV4cCI6MTc1NDMzNTI4Nn0.n2EPK_yIHyzI7eHj7Rc1DeXo0D9eG2mek8yjOBc8Mzg';
const secret = 'your-super-secret-jwt-key-here-change-in-production-256-bits';

try {
  const decoded = jwt.verify(token, secret);
  console.log('✅ Token válido:', decoded);
} catch (error) {
  console.log('❌ Token inválido:', error.message);
}
