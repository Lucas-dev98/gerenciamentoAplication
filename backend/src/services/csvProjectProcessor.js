const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const chardet = require('chardet');
const { createObjectCsvWriter } = require('csv-writer');
const { IMAGE_MAPPING, DEFAULT_IMAGE } = require('../config/imageMapping');
const logger = require('../utils/logger');
const projectService = require('./projectServices');

class CSVProjectProcessor {
  constructor() {
    this.tempDir = path.join(__dirname, '../temp');
    this.ensureTempDir();
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  // ETAPA 1: Replicar data.py - Processar frentes do CSV principal
  async processarFrentes(caminhoArquivo) {
    return new Promise((resolve, reject) => {
      const atividades = [];
      let atividadeAtual = null;

      logger.info('Iniciando processamento de frentes (data.py)', {
        arquivo: caminhoArquivo,
      }); // Detecta a codificação do arquivo (igual ao Python)
      const buffer = fs.readFileSync(caminhoArquivo);
      const encodingDetected = chardet.detect(buffer);

      // Mapear encodings problemáticos para encodings válidos do Node.js
      let encoding = 'latin1'; // fallback seguro
      if (encodingDetected) {
        const normalizedEncoding = encodingDetected.toLowerCase();
        if (
          normalizedEncoding.includes('utf-8') ||
          normalizedEncoding.includes('utf8')
        ) {
          encoding = 'utf8';
        } else if (
          normalizedEncoding.includes('iso-8859-1') ||
          normalizedEncoding.includes('latin1')
        ) {
          encoding = 'latin1';
        } else if (
          normalizedEncoding.includes('windows-1252') ||
          normalizedEncoding.includes('cp1252')
        ) {
          encoding = 'latin1'; // latin1 é compatível com windows-1252
        }
      }

      logger.info(
        `Codificação detectada: ${encodingDetected} -> usando: ${encoding}`
      );

      // Abre arquivo com encoding detectado e tratamento de erros (errors='replace' do Python)
      fs.createReadStream(caminhoArquivo, {
        encoding: encoding,
        // Em Node.js não há 'replace' direto, mas o csv-parser lida com isso
      })
        .pipe(csv({ separator: ';' }))
        .on('data', (linha) => {
          // Mapear colunas com possível problema de encoding (igual ao Python com .get())
          const nome = linha['Nome'] || linha['Name'] || '';
          const nivel =
            linha['Nível_da_estrutura_de_tópicos'] ||
            linha['N�vel_da_estrutura_de_t�picos'] ||
            linha['Nivel'] ||
            '';
          const dashboard = linha['Dashboard'] || ''; // CORREÇÃO: .get() do Python
          const percentReal = linha['Porcentagem_Prev_Real'] || '';
          const percentLB = linha['Porcentagem_Prev_LB'] || '';

          // Log para debug
          if (!nome) {
            logger.warn('Linha sem nome encontrada', {
              colunas: Object.keys(linha),
            });
            return;
          }

          if (nivel === '3') {
            // Atividade principal
            // Salva atividade anterior se tiver subatividades
            if (atividadeAtual && atividadeAtual.sub_activities.length > 0) {
              atividades.push(atividadeAtual);
            }

            // Nova atividade
            atividadeAtual = {
              name: nome,
              value: percentReal,
              baseline: percentLB,
              sub_activities: [],
            };
          } else if (nivel === '4' && atividadeAtual && dashboard === 'S') {
            // Subatividade com Dashboard S - ORDEM CORRETA: Real|Planejado
            const subatividade = `${nome}:${percentReal}|${percentLB}`;
            atividadeAtual.sub_activities.push(subatividade);
          }
        })
        .on('end', () => {
          // Adiciona última atividade se tiver subatividades
          if (atividadeAtual && atividadeAtual.sub_activities.length > 0) {
            atividades.push(atividadeAtual);
          }

          logger.info(
            `Processamento de frentes concluído: ${atividades.length} atividades`
          );
          resolve(atividades);
        })
        .on('error', (error) => {
          logger.error('Erro no processamento de frentes', {
            error: error.message,
          });
          reject(error);
        });
    });
  }

  // ETAPA 2: Replicar format.py - Aplicar filtros de formatação
  aplicarFormatacao(texto) {
    if (!texto) return texto;

    let textoFormatado = texto;

    // 1. Substitui os `;` dentro de parênteses por espaços
    textoFormatado = textoFormatado.replace(
      /\(([^()]+?)\)/g,
      (match, content) => {
        return `(${content.replace(/;/g, ' ')})`;
      }
    );

    // 2. Remove o `;` após padrões como (BH129)
    textoFormatado = textoFormatado.replace(/\((BH\d+)\);/g, '$1');

    // 3. Substitui o `;` por espaço em padrões como BH128; BH129; BH130
    textoFormatado = textoFormatado.replace(/(BH\d+);/g, '$1 ');

    // 4. Remove todos os parênteses
    textoFormatado = textoFormatado.replace(/[()]/g, '');

    // 5. Remove os caracteres `/`, `\`
    textoFormatado = textoFormatado.replace(/[\\/]/g, '');

    // 6. Remove a palavra "disponível"
    textoFormatado = textoFormatado.replace(/disponível/g, '');

    return textoFormatado.trim();
  }

  // Aplica formatação em todas as atividades
  formatarAtividades(atividades) {
    logger.info('Aplicando formatação (format.py)');

    return atividades.map((atividade) => ({
      ...atividade,
      name: this.aplicarFormatacao(atividade.name),
      sub_activities: atividade.sub_activities.map((sub) => {
        // Separa nome e valores para formatar apenas o nome
        const [nome, valores] = sub.split(':');
        const nomeFormatado = this.aplicarFormatacao(nome);
        return `${nomeFormatado}:${valores}`;
      }),
    }));
  }

  // ETAPA 3: Replicar desempilhar_csv.py - Separar em blocos usando pilhas
  desempilharEmBlocos(atividades) {
    logger.info('Desempilhando em blocos (desempilhar_csv.py)');

    // Cria pilha principal com todas as atividades (igual ao Python)
    const pilhaPrincipal = [...atividades];

    // Três pilhas auxiliares, uma para cada bloco
    const pilhaAuxParada = [];
    const pilhaAuxManutencao = [];
    const pilhaAuxPartida = [];

    let cont = 0;

    // Processa a pilha principal (igual ao Python)
    while (pilhaPrincipal.length > 0 && cont < 3) {
      const linha = pilhaPrincipal.pop(); // Remove do final (simula pilha)

      if (cont === 0) {
        pilhaAuxParada.push(linha);
      } else if (cont === 1) {
        pilhaAuxManutencao.push(linha);
      } else if (cont === 2) {
        pilhaAuxPartida.push(linha);
      }

      // Muda de bloco quando encontra "Pátio de Alimentação"
      if (linha.name.trim() === 'Pátio de Alimentação') {
        cont++;
      }
    }

    // Retorna os blocos exatamente como no script Python:
    // pilha_aux_parada vai para procedimento_partida.csv
    // pilha_aux_manutencao vai para manutencao.csv
    // pilha_aux_partida vai para procedimento_parada.csv
    const blocos = {
      parada: pilhaAuxPartida.reverse(), // pilha_aux_partida -> procedimento_parada.csv
      manutencao: pilhaAuxManutencao.reverse(), // pilha_aux_manutencao -> manutencao.csv
      partida: pilhaAuxParada.reverse(), // pilha_aux_parada -> procedimento_partida.csv
    };

    logger.info('Blocos criados', {
      parada: blocos.parada.length,
      manutencao: blocos.manutencao.length,
      partida: blocos.partida.length,
    });

    return blocos;
  }

  // Calcula estatísticas do projeto
  calcularEstatisticas(blocos) {
    const stats = {
      totalAtividades: 0,
      atividadesCompletas: 0,
      progressoGeral: 0,
      progressoPorBloco: {},
    };

    Object.keys(blocos).forEach((nomeBloco) => {
      const atividades = blocos[nomeBloco];
      let totalProgress = 0;
      let completedCount = 0;

      atividades.forEach((atividade) => {
        const progress = this.normalizarValor(atividade.value);
        totalProgress += progress;

        if (progress >= 100) {
          completedCount++;
        }
      });

      const avgProgress =
        atividades.length > 0 ? totalProgress / atividades.length : 0;

      stats.progressoPorBloco[nomeBloco] = {
        total: atividades.length,
        completas: completedCount,
        progresso: Math.round(avgProgress * 100) / 100,
      };

      stats.totalAtividades += atividades.length;
      stats.atividadesCompletas += completedCount;
    });

    // Calcula progresso geral
    const totalProgress = Object.values(stats.progressoPorBloco).reduce(
      (sum, bloco) => sum + bloco.progresso * bloco.total,
      0
    );

    stats.progressoGeral =
      stats.totalAtividades > 0
        ? Math.round((totalProgress / stats.totalAtividades) * 100) / 100
        : 0;

    return stats;
  }

  // Processa arquivo CSV completo seguindo as 3 etapas dos scripts Python
  async processarArquivoCSV(caminhoArquivo, nomeProject, userId) {
    try {
      logger.info('Iniciando processamento completo de CSV', {
        arquivo: caminhoArquivo,
        projeto: nomeProject,
        userId,
      });

      // ETAPA 1: data.py - Processa frentes
      logger.info('Iniciando Etapa 1: processarFrentes (data.py)');
      const atividadesBrutas = await this.processarFrentes(caminhoArquivo);
      logger.info(
        `Etapa 1 concluída: ${atividadesBrutas.length} atividades extraídas`
      );

      // ETAPA 2: format.py - Aplica formatação
      logger.info('Iniciando Etapa 2: formatarAtividades (format.py)');
      const atividadesFormatadas = this.formatarAtividades(atividadesBrutas);
      logger.info('Etapa 2 concluída: formatação aplicada');

      // ETAPA 3: desempilhar_csv.py - Separa em blocos
      logger.info(
        'Iniciando Etapa 3: desempilharEmBlocos (desempilhar_csv.py)'
      );
      const blocos = this.desempilharEmBlocos(atividadesFormatadas);
      logger.info('Etapa 3 concluída: blocos separados');

      // 4. Calcula estatísticas
      const estatisticas = this.calcularEstatisticas(blocos);
      logger.info('Estatísticas calculadas', estatisticas);

      // 5. Cria projeto no banco de dados
      const projectData = {
        name: nomeProject,
        description: `Projeto importado de CSV - ${estatisticas.totalAtividades} atividades processadas`,
        status: this.determinarStatus(estatisticas.progressoGeral),
        priority: 'high',
        startDate: new Date(),
        endDate: null,
        budget: 0,
        tags: ['csv-import', 'cronograma-operacional'],
        owner: userId,
        progress: estatisticas.progressoGeral,
        metadata: {
          csvImport: true,
          estatisticas,
          blocos: {
            parada: blocos.parada.length,
            manutencao: blocos.manutencao.length,
            partida: blocos.partida.length,
          },
          processedAt: new Date().toISOString(),
        },
        activities: this.formatarAtividadesParaBanco(blocos),
      };

      const projeto = await projectService.createProject(projectData);

      logger.info('Projeto criado com sucesso', {
        projectId: projeto._id,
        nome: projeto.name,
        progresso: projeto.progress,
      });

      return {
        success: true,
        project: projeto,
        estatisticas,
        blocos,
      };
    } catch (error) {
      logger.error('Erro ao processar arquivo CSV', {
        error: error.message,
        stack: error.stack,
        arquivo: caminhoArquivo,
      });
      throw error;
    }
  }

  // Normaliza valores para não exceder 100
  normalizarValor(valor) {
    if (!valor) return 0;
    const numerico = parseFloat(valor.replace(',', '.'));
    return Math.min(numerico, 100); // Limita a 100
  }

  // Determina status baseado no progresso
  determinarStatus(progresso) {
    if (progresso >= 100) return 'completed';
    if (progresso >= 50) return 'active';
    if (progresso > 0) return 'active';
    return 'draft';
  }

  // Formata atividades para salvar no banco (melhorado com imagens e regex do Flask)
  formatarAtividadesParaBanco(blocos) {
    const activities = [];

    Object.keys(blocos).forEach((tipoBloco) => {
      blocos[tipoBloco].forEach((atividade, index) => {
        // Processar subatividades com regex melhorada (baseada no Flask)
        const subActivities = atividade.sub_activities.map((sub) => {
          // Usar regex similar ao Flask para processar subatividades
          const match = sub.match(/(.+):\s*([0-9,\.]+)\|([0-9,\.]+)/);
          if (match) {
            const nome = match[1].trim();
            const real = Math.min(100, parseFloat(match[2].replace(',', '.')));
            const planejado = Math.min(
              100,
              parseFloat(match[3].replace(',', '.'))
            );

            return {
              name: nome,
              progress: real,
              baseline: planejado,
            };
          } else {
            // Fallback para formato antigo
            const [nome, valores] = sub.split(':');
            const [real, planejado] = valores.split('|');
            return {
              name: nome,
              progress: this.normalizarValor(real),
              baseline: this.normalizarValor(planejado),
            };
          }
        });

        const activity = {
          name: atividade.name,
          type: tipoBloco,
          progress: this.normalizarValor(atividade.value),
          baseline: this.normalizarValor(atividade.baseline),
          // Adicionar imagem baseada no mapeamento do Flask
          image: IMAGE_MAPPING[atividade.name] || DEFAULT_IMAGE,
          subActivities,
          order: index,
        };
        activities.push(activity);
      });
    });

    return activities;
  }

  // Limpa arquivos temporários
  async cleanup() {
    try {
      const files = fs.readdirSync(this.tempDir);
      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      logger.info('Arquivos temporários limpos');
    } catch (error) {
      logger.warn('Erro ao limpar arquivos temporários', {
        error: error.message,
      });
    }
  }
}

module.exports = new CSVProjectProcessor();
