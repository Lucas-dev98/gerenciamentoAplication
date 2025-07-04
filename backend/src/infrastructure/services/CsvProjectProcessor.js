// CSV Processing Service para processar arquivos CSV de projetos
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

class CsvProjectProcessor {
  constructor() {
    // Mapeamento de imagens para as frentes de trabalho
    this.imageMapping = {
      'Pátio de Alimentação': '/images/frentes/patioAlimentacao.png',
      Secagem: '/images/frentes/secagem.png',
      'Torre de Resfriamento': '/images/frentes/TorreResfriamento.png',
      Mistura: '/images/frentes/mistura.png',
      Briquetagem: '/images/frentes/briquetagem.png',
      Forno: '/images/frentes/forno.png',
      Ventiladores: '/images/frentes/ventilador.png',
      Precipitadores: '/images/frentes/precipitador.png',
      Peneiramento: '/images/frentes/peneiramento.png',
      'Pátio de Briquete': '/images/frentes/patioBriquete.png',
      'Retorno da Mistura': '/images/frentes/retornoMistura.png',
      'Retorno da Produção': '/images/frentes/retornoProducao.png',
      'Teste Operacional dos Ventiladores':
        '/images/frentes/testeOperacionalVentiladores.png',
      'Torre de Refriamento': '/images/frentes/TorreResfriamento.png',
    };
  }

  /**
   * Processa o arquivo CSV original para extrair frentes de trabalho
   * Baseado no data.py
   */
  async processarFrentes(csvFilePath, encoding = 'utf-8') {
    return new Promise((resolve, reject) => {
      const atividades = [];
      let atividadeAtual = null;

      fs.createReadStream(csvFilePath, { encoding })
        .pipe(csv({ separator: ';' }))
        .on('data', (linha) => {
          const nome = linha['Nome'];
          const nivel = linha['Nível_da_estrutura_de_tópicos'] || '';
          const dashboard = linha['Dashboard'] || '';

          if (nivel === '3') {
            // Atividade principal
            // Salva atividade anterior se tiver subatividades
            if (atividadeAtual && atividadeAtual.sub_activities.length > 0) {
              atividades.push(atividadeAtual);
            }

            // Inicializa nova atividade
            atividadeAtual = {
              name: nome,
              type: this.determinarTipoAtividade(nome),
              planned: this.parseFloat(linha['Porcentagem_Prev_LB']) || 0,
              real: this.parseFloat(linha['Porcentagem_Prev_Real']) || 0,
              progress: this.calcularProgresso(
                linha['Porcentagem_Prev_Real'],
                linha['Porcentagem_Prev_LB']
              ),
              status: this.determinarStatus(
                linha['Porcentagem_Prev_Real'],
                linha['Porcentagem_Prev_LB']
              ),
              priority: 'medium',
              image:
                this.imageMapping[nome] ||
                '/images/frentes/default-placeholder.png',
              order: atividades.length + 1,
              description: `Atividade ${nome}`,
              assignedTo: 'Equipe de Produção',
              estimatedHours: 40,
              actualHours: Math.round(
                ((this.parseFloat(linha['Porcentagem_Prev_Real']) || 0) * 40) /
                  100
              ),
              tags: [this.normalizarTag(nome)],
              dependencies: [],
              sub_activities: [],
              efficiency: this.calcularEficiencia(
                linha['Porcentagem_Prev_Real'],
                linha['Porcentagem_Prev_LB']
              ),
              progressColor: this.determinarCorProgresso(
                linha['Porcentagem_Prev_Real'],
                linha['Porcentagem_Prev_LB']
              ),
            };
          } else if (nivel === '4' && atividadeAtual && dashboard === 'S') {
            // Subatividade
            const subatividade = {
              name: nome,
              planned: this.parseFloat(linha['Porcentagem_Prev_LB']) || 0,
              real: this.parseFloat(linha['Porcentagem_Prev_Real']) || 0,
              progress: this.calcularProgresso(
                linha['Porcentagem_Prev_Real'],
                linha['Porcentagem_Prev_LB']
              ),
              status: this.determinarStatus(
                linha['Porcentagem_Prev_Real'],
                linha['Porcentagem_Prev_LB']
              ),
              order: atividadeAtual.sub_activities.length + 1,
            };
            atividadeAtual.sub_activities.push(subatividade);
          }
        })
        .on('end', () => {
          // Adiciona última atividade
          if (atividadeAtual && atividadeAtual.sub_activities.length > 0) {
            atividades.push(atividadeAtual);
          }
          resolve(atividades);
        })
        .on('error', reject);
    });
  }

  /**
   * Formata dados seguindo as regras do format.py
   */
  formatarDados(texto) {
    if (!texto) return texto;

    // Remove caracteres indesejados baseado no format.py
    texto = texto.replace(/\(([^()]+?)\)/g, (match, p1) =>
      p1.replace(/;/g, ' ')
    );
    texto = texto.replace(/\((BH\d+)\);/g, '$1');
    texto = texto.replace(/(BH\d+);/g, '$1 ');
    texto = texto.replace(/[()]/g, '');
    texto = texto.replace(/[\\/]/g, '');
    texto = texto.replace(/disponível/g, '');

    return texto.trim();
  }

  /**
   * Desempilha dados em blocos (procedimento_parada, manutencao, procedimento_partida)
   * Baseado no desempilhar_csv.py
   */
  desempilharAtividades(atividades) {
    const blocos = {
      procedimentoParada: [],
      manutencao: [],
      procedimentoPartida: [],
    };

    let blocoAtual = 0; // 0=parada, 1=manutencao, 2=partida

    for (let i = atividades.length - 1; i >= 0; i--) {
      const atividade = atividades[i];

      // Aplica formatação
      atividade.name = this.formatarDados(atividade.name);
      atividade.sub_activities = atividade.sub_activities.map((sub) => ({
        ...sub,
        name: this.formatarDados(sub.name),
      }));

      // Distribui entre os blocos
      if (blocoAtual === 0) {
        blocos.procedimentoPartida.unshift(atividade);
      } else if (blocoAtual === 1) {
        blocos.manutencao.unshift(atividade);
      } else if (blocoAtual === 2) {
        blocos.procedimentoParada.unshift(atividade);
      }

      // Muda de bloco quando encontra "Pátio de Alimentação"
      if (atividade.name.includes('Pátio de Alimentação') && blocoAtual < 2) {
        blocoAtual++;
      }
    }

    return blocos;
  }

  /**
   * Cria projeto completo a partir do CSV processado
   */
  criarProjetoDeCSV(csvData, metadata) {
    const blocos = this.desempilharAtividades(csvData);

    return {
      name: metadata.name || 'Projeto Importado via CSV',
      description:
        metadata.description || 'Projeto criado a partir de importação CSV',
      type: metadata.type || 'epu',
      status: 'active',
      priority: metadata.priority || 'medium',
      progress: this.calcularProgressoGeral(blocos),
      assignedTo: metadata.assignedTo || 'Equipe EPU',
      startDate: metadata.startDate || new Date().toISOString().split('T')[0],
      endDate:
        metadata.endDate ||
        new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      tags: metadata.tags || ['csv-import', 'epu'],
      location: metadata.location || '',
      category: 'production',
      activities: [
        ...blocos.procedimentoParada.map((act) => ({ ...act, type: 'parada' })),
        ...blocos.manutencao.map((act) => ({ ...act, type: 'manutencao' })),
        ...blocos.procedimentoPartida.map((act) => ({
          ...act,
          type: 'partida',
        })),
      ],
      metadata: {
        csvImport: true,
        originalData: csvData,
        processedAt: new Date(),
        statistics: this.calcularEstatisticas(blocos),
        customFields: metadata.customFields || {},
      },
    };
  }

  // Métodos auxiliares
  parseFloat(value) {
    if (!value) return 0;
    return Math.min(100, parseFloat(value.toString().replace(',', '.')));
  }

  calcularProgresso(real, planned) {
    const realNum = this.parseFloat(real);
    const plannedNum = this.parseFloat(planned);
    if (plannedNum === 0) return 0;
    return Math.round((realNum / plannedNum) * 100);
  }

  determinarStatus(real, planned) {
    const progresso = this.calcularProgresso(real, planned);
    if (progresso === 0) return 'not_started';
    if (progresso >= 100) return 'completed';
    if (progresso >= 50) return 'in_progress';
    return 'at_risk';
  }

  calcularEficiencia(real, planned) {
    const realNum = this.parseFloat(real);
    const plannedNum = this.parseFloat(planned);
    if (plannedNum === 0) return 0;
    return Math.round((realNum / plannedNum) * 100);
  }

  determinarCorProgresso(real, planned) {
    const eficiencia = this.calcularEficiencia(real, planned);
    if (eficiencia >= 90) return 'green';
    if (eficiencia >= 70) return 'yellow';
    return 'red';
  }

  determinarTipoAtividade(nome) {
    if (nome.toLowerCase().includes('parada')) return 'parada';
    if (
      nome.toLowerCase().includes('manutenção') ||
      nome.toLowerCase().includes('manutencao')
    )
      return 'manutencao';
    if (nome.toLowerCase().includes('partida')) return 'partida';
    return 'parada'; // default
  }

  normalizarTag(nome) {
    return nome
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);
  }

  calcularProgressoGeral(blocos) {
    const todasAtividades = [
      ...blocos.procedimentoParada,
      ...blocos.manutencao,
      ...blocos.procedimentoPartida,
    ];

    if (todasAtividades.length === 0) return 0;

    const progressoTotal = todasAtividades.reduce(
      (sum, atividade) => sum + atividade.progress,
      0
    );
    return Math.round(progressoTotal / todasAtividades.length);
  }

  calcularEstatisticas(blocos) {
    const todasAtividades = [
      ...blocos.procedimentoParada,
      ...blocos.manutencao,
      ...blocos.procedimentoPartida,
    ];

    return {
      totalActivities: todasAtividades.length,
      procedimentoParada: blocos.procedimentoParada.length,
      manutencao: blocos.manutencao.length,
      procedimentoPartida: blocos.procedimentoPartida.length,
      avgProgress: this.calcularProgressoGeral(blocos),
      totalSubActivities: todasAtividades.reduce(
        (sum, act) => sum + act.sub_activities.length,
        0
      ),
    };
  }

  /**
   * Exporta projeto para formato CSV
   */
  exportarParaCSV(projeto) {
    const linhas = [];

    // Cabeçalho
    linhas.push([
      'Nome',
      'Tipo',
      'Planejado',
      'Real',
      'Progresso',
      'Status',
      'Subatividades',
    ]);

    // Atividades
    projeto.activities.forEach((atividade) => {
      const subatividades = atividade.subActivities
        ? atividade.subActivities
            .map((sub) => `${sub.name}:${sub.real}|${sub.planned}`)
            .join(';')
        : '';

      linhas.push([
        atividade.name,
        atividade.type,
        atividade.planned,
        atividade.real,
        atividade.progress,
        atividade.status,
        subatividades,
      ]);
    });

    return linhas;
  }
}

module.exports = CsvProjectProcessor;
