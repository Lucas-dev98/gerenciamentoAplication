const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Configuração do diretório de upload
const uploadDir = path.join(__dirname, '../temp/uploads');

// Garantir que o diretório existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    const fileName = `${baseName}-${uniqueSuffix}${extension}`;

    cb(null, fileName);
  },
});

// Filtro para validar tipo de arquivo
const fileFilter = (req, file, cb) => {
  logger.info('Upload de arquivo iniciado', {
    originalName: file.originalname,
    mimeType: file.mimetype,
    userId: req.user?.id || 'anonymous',
  });

  // Verificar extensão
  const allowedExtensions = ['.csv'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    const error = new Error('Apenas arquivos CSV são permitidos');
    error.code = 'INVALID_FILE_TYPE';
    return cb(error, false);
  }

  // Verificar MIME type
  const allowedMimeTypes = [
    'text/csv',
    'application/csv',
    'text/plain',
    'application/vnd.ms-excel',
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    logger.warn('MIME type não permitido', {
      mimeType: file.mimetype,
      fileName: file.originalname,
    });

    // Ainda aceitar se a extensão estiver correta
    if (allowedExtensions.includes(fileExtension)) {
      logger.info('Arquivo aceito pela extensão apesar do MIME type');
      return cb(null, true);
    }

    const error = new Error('Tipo de arquivo não suportado');
    error.code = 'INVALID_MIME_TYPE';
    return cb(error, false);
  }

  cb(null, true);
};

// Configuração do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
    files: 1, // Apenas 1 arquivo por vez
  },
});

// Middleware para upload de CSV de projeto
const uploadProjectCSV = upload.single('csvFile');

// Middleware de tratamento de erros de upload
const handleUploadError = (error, req, res, next) => {
  logger.error('Erro no upload de arquivo', {
    error: error.message,
    code: error.code,
    userId: req.user?.id || 'anonymous',
  });

  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          status: 'error',
          type: 'FILE_TOO_LARGE',
          message: 'Arquivo muito grande',
          details: ['O arquivo deve ter no máximo 10MB'],
          timestamp: new Date().toISOString(),
          requestId: req.id,
        });

      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          status: 'error',
          type: 'TOO_MANY_FILES',
          message: 'Muitos arquivos enviados',
          details: ['Envie apenas 1 arquivo por vez'],
          timestamp: new Date().toISOString(),
          requestId: req.id,
        });

      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          status: 'error',
          type: 'UNEXPECTED_FILE',
          message: 'Campo de arquivo inesperado',
          details: ['Use o campo "csvFile" para enviar o arquivo'],
          timestamp: new Date().toISOString(),
          requestId: req.id,
        });

      default:
        return res.status(400).json({
          status: 'error',
          type: 'UPLOAD_ERROR',
          message: 'Erro no upload do arquivo',
          details: [error.message],
          timestamp: new Date().toISOString(),
          requestId: req.id,
        });
    }
  }

  if (
    error.code === 'INVALID_FILE_TYPE' ||
    error.code === 'INVALID_MIME_TYPE'
  ) {
    return res.status(400).json({
      status: 'error',
      type: 'INVALID_FILE_TYPE',
      message: 'Tipo de arquivo inválido',
      details: [error.message],
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }

  // Outros erros
  next(error);
};

// Middleware combinado
const uploadCSVMiddleware = (req, res, next) => {
  uploadProjectCSV(req, res, (error) => {
    if (error) {
      return handleUploadError(error, req, res, next);
    }

    logger.info('Arquivo uploaded com sucesso', {
      fileName: req.file?.originalname,
      size: req.file?.size,
      userId: req.user?.id || 'anonymous',
    });

    next();
  });
};

module.exports = {
  uploadCSVMiddleware,
  uploadProjectCSV,
  handleUploadError,
};
