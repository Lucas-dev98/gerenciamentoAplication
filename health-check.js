#!/usr/bin/env node

/**
 * Script de Verificação Contínua do EPU-Gestão
 * Execute este script regularmente para garantir que todas as rotas estão funcionando
 */

const { runAllTests } = require('./test-complete-frontend-routes');
const { runAdditionalTests } = require('./test-additional-frontend-routes');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function showBanner() {
  log(`${colors.bold}${colors.blue}
╔══════════════════════════════════════════════════════════════╗
║                    EPU-GESTÃO HEALTH CHECK                   ║
║                  Verificação Contínua do Sistema            ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);
}

async function runHealthCheck() {
  showBanner();

  let overallSuccess = true;

  try {
    log(`${colors.yellow}🔍 Executando testes principais...${colors.reset}`);
    const mainResults = await runAllTests();

    if (mainResults.failed > 0) {
      overallSuccess = false;
      log(
        `${colors.red}❌ Testes principais falharam: ${mainResults.failed} de ${mainResults.total}${colors.reset}`
      );
    } else {
      log(
        `${colors.green}✅ Todos os testes principais passaram: ${mainResults.passed}/${mainResults.total}${colors.reset}`
      );
    }

    log(`\n${colors.yellow}🔍 Executando testes adicionais...${colors.reset}`);
    const additionalResults = await runAdditionalTests();

    const notFound = additionalResults.filter(
      (r) => r.status === 'NOT_FOUND'
    ).length;
    const errors = additionalResults.filter(
      (r) => r.status === 'ERROR' || r.status === 'CONNECTION_ERROR'
    ).length;

    if (errors > 0) {
      overallSuccess = false;
      log(
        `${colors.red}❌ Testes adicionais com erros: ${errors}${colors.reset}`
      );
    } else if (notFound > 0) {
      log(
        `${colors.yellow}⚠️  Testes adicionais com rotas não encontradas: ${notFound}${colors.reset}`
      );
    } else {
      log(
        `${colors.green}✅ Todos os testes adicionais passaram${colors.reset}`
      );
    }

    // Resumo final
    log(`\n${colors.bold}📊 RESUMO FINAL:${colors.reset}`);

    if (overallSuccess) {
      log(
        `${colors.bold}${colors.green}🎉 SISTEMA TOTALMENTE FUNCIONAL${colors.reset}`
      );
      log(`${colors.green}✅ Backend compatível com frontend${colors.reset}`);
      log(
        `${colors.green}✅ Todas as rotas principais funcionando${colors.reset}`
      );
      log(`${colors.green}✅ Sistema pronto para uso${colors.reset}`);
    } else {
      log(
        `${colors.bold}${colors.red}⚠️  SISTEMA COM PROBLEMAS${colors.reset}`
      );
      log(`${colors.red}❌ Algumas rotas precisam de correção${colors.reset}`);
      log(
        `${colors.yellow}🔧 Verifique os logs acima para detalhes${colors.reset}`
      );
    }

    // Informações do sistema
    log(`\n${colors.bold}ℹ️  INFORMAÇÕES DO SISTEMA:${colors.reset}`);
    log(`Data: ${new Date().toLocaleString('pt-BR')}`);
    log(`Node.js: ${process.version}`);
    log(`Backend: http://localhost:3001`);
    log(`Frontend: http://localhost:3000`);

    return overallSuccess;
  } catch (error) {
    log(
      `${colors.red}❌ Erro fatal durante a verificação: ${error.message}${colors.reset}`
    );
    return false;
  }
}

// Verificar se está sendo executado diretamente
if (require.main === module) {
  runHealthCheck()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      log(`${colors.red}Erro fatal: ${error.message}${colors.reset}`);
      process.exit(1);
    });
}

module.exports = { runHealthCheck };
