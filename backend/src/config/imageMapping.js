// Mapeamento de imagens das frentes de trabalho (baseado no app.py Flask)
const IMAGE_MAPPING = {
  'Pátio de Alimentação': '/static/images/frentes/patioAlimentação.png',
  Secagem: '/static/images/frentes/secagem.png',
  'Torre de Resfriamento': '/static/images/frentes/TorreResfriamento.png',
  Mistura: '/static/images/frentes/mistura.png',
  Briquetagem: '/static/images/frentes/briquetagem.png',
  Forno: '/static/images/frentes/forno.png',
  Ventiladores: '/static/images/frentes/ventilador.png',
  Precipitadores: '/static/images/frentes/precipitador.png',
  Peneiramento: '/static/images/frentes/peneiramento.png',
  'Pátio de Briquete': '/static/images/frentes/patioBriquete.png',
  'Retorno da Mistura': '/static/images/frentes/retornoMistura.png',
  'Retorno da Produção': '/static/images/frentes/retornoProducao.png',
  'Teste Operacional dos Ventiladores':
    '/static/images/frentes/testeOperacionalVentiladores.png',
  'Torre de Refriamento': '/static/images/frentes/TorreResfriamento.png',
};

const DEFAULT_IMAGE = '/static/images/frentes/default-placeholder.png';

module.exports = {
  IMAGE_MAPPING,
  DEFAULT_IMAGE,
};
