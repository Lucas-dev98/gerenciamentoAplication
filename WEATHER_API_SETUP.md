# Configuração de Ambiente para API do Clima

# Para ativar a previsão do tempo real, você precisa:

# 1. Criar uma conta gratuita em: https://openweathermap.org/api

# 2. Obter sua API key

# 3. Criar um arquivo .env.local na pasta frontend/

# 4. Adicionar a linha abaixo com sua chave:

VITE_OPENWEATHER_API_KEY=sua_chave_api_aqui

# Configurações opcionais (padrão: São Paulo):

VITE_DEFAULT_LAT=-23.5505
VITE_DEFAULT_LON=-46.6333

# Exemplo de arquivo .env.local:

# VITE_OPENWEATHER_API_KEY=abc123def456ghi789jkl012mno345pqr678stu

# VITE_DEFAULT_LAT=-23.5505

# VITE_DEFAULT_LON=-46.6333

# IMPORTANTE:

# - Nunca commite o arquivo .env.local no git

# - O arquivo .env.local é automaticamente ignorado pelo .gitignore

# - Sem a API key, o sistema usará dados simulados como fallback
