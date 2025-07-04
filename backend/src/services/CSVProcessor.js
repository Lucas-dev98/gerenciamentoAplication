/**
 * CSV Processor Service - Single Responsibility CSV Handler
 *
 * Responsabilidade única: Processamento de arquivos CSV
 * - Leitura e parsing de CSV
 * - Validação de dados CSV
 * - Transformação de dados
 * - Exportação para CSV
 *
 * @version 4.0.0
 * @architecture Clean Architecture - Application Layer
 */

const fs = require('fs');
const csv = require('csv-parser');
const chardet = require('chardet');
const logger = require('../utils/logger');

class CSVProcessor {
  constructor() {
    this.supportedEncodings = ['utf8', 'latin1', 'iso-8859-1'];
  }

  /**
   * Processa um arquivo CSV
   */
  async processFile(filePath) {
    try {
      if (!filePath || !fs.existsSync(filePath)) {
        throw new Error('Invalid file path');
      }

      // Detecta a codificação do arquivo
      const encoding = await this.detectEncoding(filePath);

      // Lê e processa o CSV
      const data = await this.parseCSV(filePath, encoding);

      // Valida e transforma os dados
      const processedData = await this.transformCSVData(data);

      logger.info(`CSV file processed successfully: ${filePath}`);
      return processedData;
    } catch (error) {
      logger.error(`Error processing CSV file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Exporta dados para formato CSV
   */
  async exportProject(project) {
    try {
      if (!project) {
        throw new Error('Project data is required');
      }

      const csvData = await this.convertProjectToCSV(project);
      return csvData;
    } catch (error) {
      logger.error('Error exporting project to CSV:', error);
      throw error;
    }
  }

  /**
   * Detecta a codificação do arquivo
   */
  async detectEncoding(filePath) {
    try {
      const buffer = fs.readFileSync(filePath);
      const detected = chardet.detect(buffer);

      logger.info(`Encoding detected: ${detected}`);

      // Mapeia para codificações suportadas pelo Node.js
      if (detected) {
        const normalized = detected.toLowerCase();

        if (normalized.includes('utf-8') || normalized.includes('utf8')) {
          return 'utf8';
        } else if (
          normalized.includes('iso-8859-1') ||
          normalized.includes('latin1')
        ) {
          return 'latin1';
        }
      }

      // Fallback para latin1
      return 'latin1';
    } catch (error) {
      logger.warn('Error detecting encoding, using latin1 as fallback:', error);
      return 'latin1';
    }
  }

  /**
   * Faz parsing do arquivo CSV
   */
  async parseCSV(filePath, encoding = 'latin1') {
    return new Promise((resolve, reject) => {
      const results = [];

      fs.createReadStream(filePath, { encoding })
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
          results.push(row);
        })
        .on('end', () => {
          logger.info(
            `CSV parsing completed: ${results.length} rows processed`
          );
          resolve(results);
        })
        .on('error', (error) => {
          logger.error('Error parsing CSV:', error);
          reject(error);
        });
    });
  }

  /**
   * Transforma dados do CSV em estrutura padronizada
   */
  async transformCSVData(rawData) {
    try {
      const transformedData = {
        projects: [],
        frentes: [],
        activities: [],
      };

      for (const row of rawData) {
        const transformed = await this.transformCSVRow(row);

        if (transformed.type === 'project') {
          transformedData.projects.push(transformed.data);
        } else if (transformed.type === 'frente') {
          transformedData.frentes.push(transformed.data);
        } else if (transformed.type === 'activity') {
          transformedData.activities.push(transformed.data);
        }
      }

      return transformedData;
    } catch (error) {
      logger.error('Error transforming CSV data:', error);
      throw error;
    }
  }

  /**
   * Transforma uma linha do CSV
   */
  async transformCSVRow(row) {
    try {
      const nome = row['Nome'] || '';
      const nivel =
        row['Nível_da_estrutura_de_tópicos'] ||
        row['N�vel_da_estrutura_de_t�picos'] ||
        '';
      const dashboard = row['Dashboard'] || '';
      const percentReal = parseFloat(row['Porcentagem_Prev_Real'] || '0');
      const percentLB = parseFloat(row['Porcentagem_Prev_LB'] || '0');

      // Determina o tipo baseado no nível
      let type = 'activity';
      let data = {};

      if (nivel === '1') {
        // Projeto principal
        type = 'project';
        data = {
          name: nome,
          progress: percentReal,
          baseline: percentLB,
          level: parseInt(nivel),
        };
      } else if (nivel === '2') {
        // Frente de trabalho
        type = 'frente';
        data = {
          name: nome,
          progress: percentReal,
          baseline: percentLB,
          level: parseInt(nivel),
          hasDashboard: dashboard === 'S',
        };
      } else if (nivel === '3' || nivel === '4') {
        // Atividade ou subatividade
        type = 'activity';
        data = {
          name: nome,
          progress: percentReal,
          baseline: percentLB,
          level: parseInt(nivel),
          hasDashboard: dashboard === 'S',
          isSubActivity: nivel === '4',
        };
      }

      return { type, data };
    } catch (error) {
      logger.error('Error transforming CSV row:', error);
      throw error;
    }
  }

  /**
   * Converte projeto para formato CSV
   */
  async convertProjectToCSV(project) {
    try {
      const rows = [];

      // Cabeçalho
      rows.push([
        'Nome',
        'Nível_da_estrutura_de_tópicos',
        'Dashboard',
        'Porcentagem_Prev_Real',
        'Porcentagem_Prev_LB',
      ]);

      // Projeto principal
      rows.push([
        project.name,
        '1',
        'S',
        project.progress || 0,
        project.baseline || 0,
      ]);

      // Frentes (se existirem)
      if (project.frentes) {
        for (const frente of project.frentes) {
          rows.push([
            frente.name,
            '2',
            frente.hasDashboard ? 'S' : 'N',
            frente.progress || 0,
            frente.baseline || 0,
          ]);

          // Atividades da frente
          if (frente.activities) {
            for (const activity of frente.activities) {
              rows.push([
                activity.name,
                '3',
                activity.hasDashboard ? 'S' : 'N',
                activity.progress || 0,
                activity.baseline || 0,
              ]);

              // Subatividades
              if (activity.subActivities) {
                for (const subActivity of activity.subActivities) {
                  rows.push([
                    subActivity.name,
                    '4',
                    subActivity.hasDashboard ? 'S' : 'N',
                    subActivity.progress || 0,
                    subActivity.baseline || 0,
                  ]);
                }
              }
            }
          }
        }
      }

      // Converte para string CSV
      const csvString = rows.map((row) => row.join(';')).join('\n');
      return csvString;
    } catch (error) {
      logger.error('Error converting project to CSV:', error);
      throw error;
    }
  }

  /**
   * Valida dados do CSV
   */
  validateCSVData(data) {
    const errors = [];

    if (!data || !Array.isArray(data.projects)) {
      errors.push('Invalid CSV data structure');
      return { valid: false, errors };
    }

    // Valida projetos
    for (const project of data.projects) {
      if (!project.name || project.name.trim().length === 0) {
        errors.push('Project name is required');
      }

      if (project.progress < 0 || project.progress > 100) {
        errors.push(`Invalid progress value for project ${project.name}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Aplica formatação específica aos dados
   */
  formatCSVText(text) {
    if (!text) return text;

    let formattedText = text;

    // Substitui `;` dentro de parênteses por espaços
    formattedText = formattedText.replace(
      /\(([^()]+?)\)/g,
      (match, content) => {
        return `(${content.replace(/;/g, ' ')})`;
      }
    );

    // Remove caracteres especiais problemáticos
    formattedText = formattedText.replace(/[^\w\s\(\)\-\.\,\;\:]/g, '');

    return formattedText.trim();
  }
}

// Exporta uma instância única (singleton)
module.exports = new CSVProcessor();
