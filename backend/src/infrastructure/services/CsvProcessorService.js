const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const chardet = require('chardet');
const iconv = require('iconv-lite');

class CsvProcessorService {
  constructor() {
    this.imageMapping = {
      'Pátio de Alimentação': '/static/images/frentes/patioAlimentacao.png',
      Secagem: '/static/images/frentes/secagem.png',
      'Torre de Resfriamento': '/static/images/frentes/TorreResfriamento.png',
      Mistura: '/static/images/frentes/mistura.png',
      Briquetagem: '/static/images/frentes/briquetagem.png',
      Forno: '/static/images/frentes/forno.png',
      'Forno Industrial': '/static/images/frentes/forno.png',
      Ventiladores: '/static/images/frentes/ventilador.png',
      'Ventiladores Principais': '/static/images/frentes/ventilador.png',
      Precipitadores: '/static/images/frentes/precipitador.png',
      'Precipitadores Eletrostáticos':
        '/static/images/frentes/precipitador.png',
      Peneiramento: '/static/images/frentes/peneiramento.png',
      'Pátio de Briquete': '/static/images/frentes/patioBriquete.png',
      'Retorno da Mistura': '/static/images/frentes/retornoMistura.png',
      'Retorno da Produção': '/static/images/frentes/retornoProducao.png',
      'Teste Operacional dos Ventiladores':
        '/static/images/frentes/testeOperacionalVentiladores.png',
      'Torre de Refriamento': '/static/images/frentes/TorreResfriamento.png',
      'Moinho Principal': '/static/images/frentes/moinho.png',
      'Sistema de Controle': '/static/images/frentes/controle.png',
      'Sistema de Secagem': '/static/images/frentes/secagem.png',
      'Teste Operacional Geral': '/static/images/frentes/testeOperacional.png',
    };
  }

  /**
   * Detecta a codificação do arquivo CSV
   */
  async detectEncoding(filePath) {
    try {
      const buffer = fs.readFileSync(filePath);
      const detection = chardet.detect(buffer);
      console.log(`Codificação detectada: ${detection}`);
      return detection || 'utf-8';
    } catch (error) {
      console.error('Erro ao detectar codificação:', error);
      return 'utf-8';
    }
  }

  /**
   * Processa arquivo CSV principal e organiza atividades
   */
  async processMainCsv(filePath) {
    try {
      const encoding = await this.detectEncoding(filePath);
      const activities = [];
      let currentActivity = null;

      return new Promise((resolve, reject) => {
        const stream = fs
          .createReadStream(filePath)
          .pipe(iconv.decodeStream(encoding))
          .pipe(csv({ separator: ';' }));

        stream.on('data', (row) => {
          const nome = row['Nome'];
          const nivel = row['Nível_da_estrutura_de_tópicos'] || '';
          const dashboard = row['Dashboard'] || '';

          if (nivel === '3') {
            // Atividade principal
            // Salva a atividade anterior se tiver subatividades
            if (currentActivity && currentActivity.subActivities.length > 0) {
              activities.push(currentActivity);
            }

            // Inicializa nova atividade
            currentActivity = {
              name: nome,
              real: parseFloat(
                (row['Porcentagem_Prev_Real'] || '0').replace(',', '.')
              ),
              planned: parseFloat(
                (row['Porcentagem_Prev_LB'] || '0').replace(',', '.')
              ),
              subActivities: [],
            };
          } else if (nivel === '4' && currentActivity && dashboard === 'S') {
            // Subatividade com Dashboard S
            const real = parseFloat(
              (row['Porcentagem_Prev_Real'] || '0').replace(',', '.')
            );
            const planned = parseFloat(
              (row['Porcentagem_Prev_LB'] || '0').replace(',', '.')
            );

            currentActivity.subActivities.push({
              name: nome,
              real: real,
              planned: planned,
            });
          }
        });

        stream.on('end', () => {
          // Adiciona a última atividade
          if (currentActivity && currentActivity.subActivities.length > 0) {
            activities.push(currentActivity);
          }
          resolve(activities);
        });

        stream.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Erro ao processar CSV principal: ${error.message}`);
    }
  }

  /**
   * Aplica formatação e limpeza nos dados
   */
  formatActivityData(activities) {
    return activities.map((activity) => {
      // Aplica formatação similar ao format.py
      let formattedName = activity.name;

      // Remove caracteres indesejados
      formattedName = formattedName.replace(/[()\/\\|]/g, '');
      formattedName = formattedName.replace(/disponível/g, '');
      formattedName = formattedName.replace(/;\s*([A-Z]+\d+)/g, ' $1');
      formattedName = formattedName.trim();

      // Formata subatividades
      const formattedSubActivities = activity.subActivities.map((sub) => {
        let subName = sub.name;
        subName = subName.replace(/[()\/\\|]/g, '');
        subName = subName.replace(/disponível/g, '');
        subName = subName.trim();

        return {
          ...sub,
          name: subName,
        };
      });

      return {
        ...activity,
        name: formattedName,
        subActivities: formattedSubActivities,
        image:
          this.imageMapping[formattedName] ||
          '/static/images/frentes/default-placeholder.png',
      };
    });
  }

  /**
   * Separa atividades por categoria (parada, manutenção, partida)
   */
  categorizeActivities(activities) {
    const categories = {
      procedimentoParada: [],
      manutencao: [],
      procedimentoPartida: [],
    };

    let currentCategory = 'procedimentoParada';
    let categoryIndex = 0;

    // Processa atividades em ordem reversa (simulando pilha)
    const reversedActivities = [...activities].reverse();

    for (let i = 0; i < reversedActivities.length; i++) {
      const activity = reversedActivities[i];

      // Lógica similar ao desempilhar_csv.py
      if (activity.name.includes('Pátio de Alimentação')) {
        categoryIndex++;
        if (categoryIndex === 1) currentCategory = 'manutencao';
        else if (categoryIndex === 2) currentCategory = 'procedimentoPartida';
      }

      switch (currentCategory) {
        case 'procedimentoParada':
          categories.procedimentoParada.push(activity);
          break;
        case 'manutencao':
          categories.manutencao.push(activity);
          break;
        case 'procedimentoPartida':
          categories.procedimentoPartida.push(activity);
          break;
      }
    }

    // Reverte ordem para manter sequência correta
    categories.procedimentoParada.reverse();
    categories.manutencao.reverse();
    categories.procedimentoPartida.reverse();

    return categories;
  }

  /**
   * Converte atividades categorizadas para formato do projeto
   */
  convertToProjectFormat(categorizedActivities, projectMetadata = {}) {
    const createActivities = (activities, type) => {
      return activities.map((activity, index) => ({
        name: activity.name,
        type: type,
        planned: Math.min(100, activity.planned),
        real: Math.min(100, activity.real),
        progress: Math.min(100, activity.real),
        status: this.getActivityStatus(activity.real),
        priority: this.getActivityPriority(activity.real),
        image: activity.image,
        order: index,
        description: `${activity.name} - Atividade de ${type}`,
        assignedTo: projectMetadata.defaultTeam || 'Equipe Responsável',
        estimatedHours: this.calculateEstimatedHours(activity.planned),
        actualHours: this.calculateActualHours(activity.real, activity.planned),
        tags: [type, 'csv-import'],
        dependencies: [],
        subActivities: activity.subActivities.map((sub, subIndex) => ({
          name: sub.name,
          planned: Math.min(100, sub.planned),
          real: Math.min(100, sub.real),
          progress: Math.min(100, sub.real),
          status: this.getActivityStatus(sub.real),
          order: subIndex,
        })),
        efficiency: this.calculateEfficiency(activity.real, activity.planned),
        progressColor: this.getProgressColor(activity.real),
      }));
    };

    return {
      procedimentoParada: createActivities(
        categorizedActivities.procedimentoParada,
        'parada'
      ),
      manutencao: createActivities(
        categorizedActivities.manutencao,
        'manutencao'
      ),
      procedimentoPartida: createActivities(
        categorizedActivities.procedimentoPartida,
        'partida'
      ),
    };
  }

  /**
   * Método principal para processar CSV completo
   */
  async processCsvToProject(filePath, projectMetadata = {}) {
    try {
      console.log('🔄 Processando CSV para projeto...');

      // 1. Processa CSV principal
      const rawActivities = await this.processMainCsv(filePath);
      console.log(`📊 ${rawActivities.length} atividades encontradas`);

      // 2. Aplica formatação
      const formattedActivities = this.formatActivityData(rawActivities);
      console.log('✨ Formatação aplicada');

      // 3. Categoriza atividades
      const categorizedActivities =
        this.categorizeActivities(formattedActivities);
      console.log('📂 Atividades categorizadas');

      // 4. Converte para formato do projeto
      const projectActivities = this.convertToProjectFormat(
        categorizedActivities,
        projectMetadata
      );
      console.log('🏗️ Convertido para formato de projeto');

      return projectActivities;
    } catch (error) {
      throw new Error(`Erro no processamento do CSV: ${error.message}`);
    }
  }

  // Métodos auxiliares
  getActivityStatus(progress) {
    if (progress === 0) return 'not_started';
    if (progress >= 100) return 'completed';
    return 'in_progress';
  }

  getActivityPriority(progress) {
    if (progress < 30) return 'high';
    if (progress < 70) return 'medium';
    return 'low';
  }

  calculateEstimatedHours(planned) {
    return Math.max(8, Math.round(planned * 0.8)); // 8-80 horas baseado no planejado
  }

  calculateActualHours(real, planned) {
    const ratio = planned > 0 ? real / planned : 0;
    return Math.round(this.calculateEstimatedHours(planned) * ratio);
  }

  calculateEfficiency(real, planned) {
    if (planned === 0) return 100;
    return Math.min(100, Math.round((real / planned) * 100));
  }

  getProgressColor(progress) {
    if (progress < 30) return '#F44336'; // Vermelho
    if (progress < 70) return '#FF9800'; // Laranja
    return '#4CAF50'; // Verde
  }
}

module.exports = CsvProcessorService;
