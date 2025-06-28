const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { IMAGE_MAPPING, DEFAULT_IMAGE } = require('../config/imageMapping');
const logger = require('../utils/logger');

class FrentesService {
  // Replicar a função load_frentes_from_csv do Flask
  static async loadFrentesFromCSV(filePath) {
    return new Promise((resolve, reject) => {
      const frentes = [];

      logger.info('Carregando frentes de trabalho do CSV', {
        arquivo: filePath,
      });

      if (!fs.existsSync(filePath)) {
        logger.error(`Arquivo não encontrado: ${filePath}`);
        return resolve([]);
      }

      fs.createReadStream(filePath, { encoding: 'utf-8' })
        .pipe(csv())
        .on('data', (row) => {
          try {
            const subActivities = [];

            // Processar sub_activities se existir
            if (row.sub_activities && row.sub_activities.trim()) {
              const subActivitiesRaw = row.sub_activities.split(';');

              for (const subActivity of subActivitiesRaw) {
                try {
                  // Expressão regular CORRIGIDA do Flask para capturar números decimais com vírgula
                  const match = subActivity
                    .trim()
                    .match(/(.+):\s*([0-9,\.]+)\|([0-9,\.]+)/);

                  if (match) {
                    const name = match[1].trim();
                    const real = Math.min(
                      100,
                      parseFloat(match[2].replace(',', '.'))
                    );
                    const planned = Math.min(
                      100,
                      parseFloat(match[3].replace(',', '.'))
                    );

                    subActivities.push({
                      name: name,
                      real: real,
                      planned: planned,
                    });
                  } else {
                    logger.warn('Subatividade mal formatada', { subActivity });
                  }
                } catch (e) {
                  logger.error('Erro ao processar subatividade', {
                    subActivity,
                    error: e.message,
                  });
                }
              }
            }

            // Criar frente de trabalho (igual ao Flask)
            const frente = {
              name: row.name,
              planned: Math.min(
                100,
                parseFloat(row.baseline.replace(',', '.'))
              ),
              real: Math.min(100, parseFloat(row.value.replace(',', '.'))),
              image: IMAGE_MAPPING[row.name] || DEFAULT_IMAGE,
              sub_activities: subActivities,
            };

            frentes.push(frente);
          } catch (error) {
            logger.error('Erro ao processar linha do CSV', {
              row,
              error: error.message,
            });
          }
        })
        .on('end', () => {
          logger.info(
            `Frentes carregadas com sucesso: ${frentes.length} frentes`
          );
          resolve(frentes);
        })
        .on('error', (error) => {
          logger.error('Erro ao ler arquivo CSV', {
            arquivo: filePath,
            error: error.message,
          });
          reject(error);
        });
    });
  }

  // Carregar frentes por tipo de bloco
  static async loadFrentesByBloco(bloco) {
    const csvPath = this.getCSVPath(bloco);
    return await this.loadFrentesFromCSV(csvPath);
  }

  // Mapear blocos para arquivos CSV (como no Flask)
  static getCSVPath(bloco) {
    const basePath = path.join(__dirname, '../data/csv/');

    switch (bloco) {
      case 'procedimento_parada':
        return path.join(basePath, 'procedimento_parada.csv');
      case 'manutencao':
        return path.join(basePath, 'manutencao.csv');
      case 'procedimento_partida':
        return path.join(basePath, 'procedimento_partida.csv');
      default:
        throw new Error(`Bloco não reconhecido: ${bloco}`);
    }
  }

  // Obter todas as frentes organizadas por bloco
  static async getAllFrentes() {
    try {
      const [paradaFrentes, manutencaoFrentes, partidaFrentes] =
        await Promise.all([
          this.loadFrentesByBloco('procedimento_parada'),
          this.loadFrentesByBloco('manutencao'),
          this.loadFrentesByBloco('procedimento_partida'),
        ]);

      return {
        procedimento_parada: paradaFrentes,
        manutencao: manutencaoFrentes,
        procedimento_partida: partidaFrentes,
      };
    } catch (error) {
      logger.error('Erro ao carregar todas as frentes', {
        error: error.message,
      });
      throw error;
    }
  }

  // Calcular estatísticas das frentes (similar ao Flask mas mais detalhado)
  static calculateStatistics(frentes) {
    if (!frentes || frentes.length === 0) {
      return {
        total: 0,
        avgReal: 0,
        avgPlanned: 0,
        completed: 0,
        inProgress: 0,
      };
    }

    const total = frentes.length;
    const totalReal = frentes.reduce((sum, frente) => sum + frente.real, 0);
    const totalPlanned = frentes.reduce(
      (sum, frente) => sum + frente.planned,
      0
    );
    const completed = frentes.filter((frente) => frente.real >= 100).length;
    const inProgress = frentes.filter(
      (frente) => frente.real > 0 && frente.real < 100
    ).length;

    return {
      total,
      avgReal: Math.round((totalReal / total) * 100) / 100,
      avgPlanned: Math.round((totalPlanned / total) * 100) / 100,
      completed,
      inProgress,
      pending: total - completed - inProgress,
    };
  }
}

module.exports = FrentesService;
