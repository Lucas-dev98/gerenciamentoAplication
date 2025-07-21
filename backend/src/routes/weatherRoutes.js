const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

console.log('🌤️  Weather routes loading...');

// Chave da API OpenWeatherMap
const OPENWEATHER_API_KEY =
  process.env.OPENWEATHER_API_KEY || '3a13a8fb98632d1c05d5aecb16a6a866';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Middleware para validar parâmetros de coordenadas
const validateCoordinates = (req, res, next) => {
  const { lat, lon } = req.query;

  if (lat && (isNaN(lat) || lat < -90 || lat > 90)) {
    return res.status(400).json({
      error: 'Latitude deve ser um número entre -90 e 90',
    });
  }

  if (lon && (isNaN(lon) || lon < -180 || lon > 180)) {
    return res.status(400).json({
      error: 'Longitude deve ser um número entre -180 e 180',
    });
  }

  next();
};

// Middleware para validar cidade
const validateCity = (req, res, next) => {
  const { q } = req.query;

  if (q && (typeof q !== 'string' || q.trim().length === 0)) {
    return res.status(400).json({
      error: 'Nome da cidade deve ser uma string não vazia',
    });
  }

  next();
};

// Rota para clima atual por coordenadas
router.get('/weather', validateCoordinates, validateCity, async (req, res) => {
  try {
    const { lat, lon, q } = req.query;
    let url = `${OPENWEATHER_BASE_URL}/weather?appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;

    if (lat && lon) {
      url += `&lat=${lat}&lon=${lon}`;
    } else if (q) {
      url += `&q=${encodeURIComponent(q)}`;
    } else {
      // Default para São Paulo se não especificar localização
      url += '&lat=-23.5505&lon=-46.6333';
    }

    console.log(
      'Fazendo requisição para OpenWeatherMap:',
      url.replace(OPENWEATHER_API_KEY, '***')
    );

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API OpenWeatherMap:', response.status, errorText);

      if (response.status === 401) {
        return res.status(500).json({
          error: 'Erro de autenticação com serviço de clima',
        });
      } else if (response.status === 404) {
        return res.status(404).json({
          error: 'Localização não encontrada',
        });
      } else {
        return res.status(500).json({
          error: 'Erro ao obter dados meteorológicos',
        });
      }
    }

    const data = await response.json();

    // Log de sucesso
    console.log('✅ Dados meteorológicos obtidos com sucesso:', data.name);

    res.json(data);
  } catch (error) {
    console.error('Erro no serviço de clima:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível obter dados meteorológicos',
    });
  }
});

// Rota para previsão do tempo por coordenadas
router.get('/forecast', validateCoordinates, validateCity, async (req, res) => {
  try {
    const { lat, lon, q } = req.query;
    let url = `${OPENWEATHER_BASE_URL}/forecast?appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;

    if (lat && lon) {
      url += `&lat=${lat}&lon=${lon}`;
    } else if (q) {
      url += `&q=${encodeURIComponent(q)}`;
    } else {
      // Default para São Paulo se não especificar localização
      url += '&lat=-23.5505&lon=-46.6333';
    }

    console.log(
      'Fazendo requisição de previsão para OpenWeatherMap:',
      url.replace(OPENWEATHER_API_KEY, '***')
    );

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        'Erro na API OpenWeatherMap (previsão):',
        response.status,
        errorText
      );

      if (response.status === 401) {
        return res.status(500).json({
          error: 'Erro de autenticação com serviço de clima',
        });
      } else if (response.status === 404) {
        return res.status(404).json({
          error: 'Localização não encontrada',
        });
      } else {
        return res.status(500).json({
          error: 'Erro ao obter previsão meteorológica',
        });
      }
    }

    const data = await response.json();

    // Log de sucesso
    console.log(
      '✅ Previsão meteorológica obtida com sucesso para:',
      data.city.name
    );

    res.json(data);
  } catch (error) {
    console.error('Erro no serviço de previsão:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível obter previsão meteorológica',
    });
  }
});

// Rota de teste da API
router.get('/test', async (req, res) => {
  try {
    const url = `${OPENWEATHER_BASE_URL}/weather?q=London&appid=${OPENWEATHER_API_KEY}&units=metric`;

    console.log('Testando conectividade com OpenWeatherMap...');

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    res.json({
      status: 'ok',
      message: 'API de clima funcionando corretamente',
      test_location: data.name,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro no teste da API de clima:', error);
    res.status(500).json({
      status: 'error',
      message: 'Falha no teste da API de clima',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

console.log('✅ Weather routes configured successfully');

module.exports = router;
module.exports = router;
