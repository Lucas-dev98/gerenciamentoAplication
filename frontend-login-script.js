// Script para fazer login programaticamente no frontend
console.log('🔐 Fazendo login programaticamente...');

// Simular login
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'l.o.bastos@live.com',
    password: '44351502741-+as',
  }),
})
  .then((response) => response.json())
  .then((data) => {
    if (data.success) {
      console.log('✅ Login realizado com sucesso!');

      // Armazenar no localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      console.log('🎫 Token armazenado:', data.token.substring(0, 20) + '...');
      console.log('👤 Usuário armazenado:', data.user.email);

      // Recarregar a página
      window.location.reload();
    } else {
      console.error('❌ Erro no login:', data.message);
    }
  })
  .catch((error) => {
    console.error('❌ Erro na requisição:', error);
  });
