const logger = {
  info: (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] INFO: ${message}`;

    if (data) {
      console.log(logMessage, JSON.stringify(data, null, 2));
    } else {
      console.log(logMessage);
    }
  },

  error: (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ERROR: ${message}`;

    if (data) {
      console.error(logMessage, JSON.stringify(data, null, 2));
    } else {
      console.error(logMessage);
    }
  },

  warn: (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] WARN: ${message}`;

    if (data) {
      console.warn(logMessage, JSON.stringify(data, null, 2));
    } else {
      console.warn(logMessage);
    }
  },

  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] DEBUG: ${message}`;

      if (data) {
        console.debug(logMessage, JSON.stringify(data, null, 2));
      } else {
        console.debug(logMessage);
      }
    }
  },

  http: (req, res, responseTime) => {
    const timestamp = new Date().toISOString();
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // Red for errors, green for success
    const resetColor = '\x1b[0m';

    console.log(
      `[${timestamp}] HTTP: ${req.method} ${req.url} ${statusColor}${res.statusCode}${resetColor} - ${responseTime}ms`
    );
  },
};

module.exports = logger;
