# Relatório de Segurança - Rotas Protegidas

## Rotas que exigem autenticação (authMiddleware):

### 1. Cadastro de Projetos
- POST /api/projects/upload-csv -  Protegida
- POST /api/projects-crud -  Protegida  
- POST /api/projects-crud/import-csv -  Protegida
- POST /api/projects/import-csv -  Protegida

### 2. Edição de Projetos
- PUT /api/projects-crud/:id -  Protegida

### 3. Exclusão de Projetos
- DELETE /api/projects-crud/:id -  Protegida
- DELETE /api/projects-crud/batch -  Protegida

### 4. Duplicação de Projetos
- POST /api/projects-crud/:id/duplicate -  Protegida

### 5. Rotas de Consulta (Não necessitam autenticação)
- GET /api/projects -  Livre (consulta)
- GET /api/projects/:id -  Livre (consulta)
- GET /api/projects-crud -  Livre (consulta)
- GET /api/projects-crud/:id -  Livre (consulta)
- GET /api/projects-crud/stats -  Livre (consulta)
- GET /api/projects/:id/procedimento-parada -  Livre (consulta)
- GET /api/projects/:id/manutencao -  Livre (consulta)
- GET /api/projects/:id/procedimento-partida -  Livre (consulta)
- GET /api/projects/:id/frentes -  Livre (consulta)
- GET /api/projects/:id/statistics -  Livre (consulta)

## Verificação Completa:  TODAS AS OPERAÇÕES SENSÍVEIS ESTÃO PROTEGIDAS

 Cadastrar projeto: Exige autenticação
 Editar projeto: Exige autenticação
 Excluir projeto: Exige autenticação
 Excluir vários projetos: Exige autenticação
 Duplicar projeto: Exige autenticação
 Importar CSV: Exige autenticação

Data: 2025-07-03 11:09:16

