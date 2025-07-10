// Para testar o botão "Sair" no navegador:
// 1. Abra http://localhost:3000 no navegador
// 2. Abra o DevTools (F12)
// 3. Vá para o Console
// 4. Execute o código abaixo:

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzRjNTM3YjgxNmI1ODM4NTU4Y2E2YmMiLCJlbWFpbCI6Imwuby5iYXN0b3NAbGl2ZS5jb20iLCJpYXQiOjE3MzYyNTY4NzEsImV4cCI6MTczNjI2NzY3MX0.iOF4gy_eDRjO-LNgPfBpNYdM0Uh2uLwH6TJFvFGqN5M';

const user = {
  _id: '674c537b816b5838558ca6bc',
  email: 'l.o.bastos@live.com',
  nome: 'Lucas Bastos',
  tipo: 'administrador',
};

// Armazenar no localStorage
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

// Recarregar a página para ver o botão "Sair"
window.location.reload();

console.log('✅ Token e usuário configurados! A página será recarregada...');
