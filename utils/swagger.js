const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('../config');

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Swaraj API',
      version: '1.0.0',
      description: 'API documentation for Swaraj backend',
      contact: {
        name: 'API Support',
        email: 'support@yourdomain.com'
      }
    },
    servers: [
      {
        url: config.env === 'production'
          ? 'https://api.yourdomain.com/api'
          : `http://localhost:${config.server.port}/api`,
        description: config.env === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './models/*.js',
    './swagger/**/*.yaml'
  ]
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Function to setup swagger routes in express
const setupSwagger = (app) => {
  // Swagger UI route
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Swaraj API Documentation"
  }));

  // Route to serve swagger spec as JSON
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`Swagger docs available at /api/docs`);
};

module.exports = setupSwagger;