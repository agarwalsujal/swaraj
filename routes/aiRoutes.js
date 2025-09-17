const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { auth } = require('../middlewares/authMiddleware');
const { checkQuota } = require('../middlewares/subscriptionMiddleware');
const { validateAIQuery } = require('../middlewares/validationMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     AIQuery:
 *       type: object
 *       required:
 *         - query
 *       properties:
 *         query:
 *           type: string
 *           description: The AI query text
 *           example: "Explain quantum computing in simple terms"
 *         context:
 *           type: string
 *           description: Context for the query
 *           example: "educational"
 *         maxTokens:
 *           type: integer
 *           description: Maximum tokens for the response
 *           example: 500
 *           minimum: 1
 *           maximum: 2000
 *     AIResponse:
 *       type: object
 *       properties:
 *         response:
 *           type: string
 *           example: "Quantum computing is a revolutionary technology that..."
 *         usage:
 *           type: object
 *           properties:
 *             promptTokens:
 *               type: integer
 *               example: 15
 *             completionTokens:
 *               type: integer
 *               example: 342
 *             totalTokens:
 *               type: integer
 *               example: 357
 *         queryId:
 *           type: string
 *           example: "query_123"
 *         timestamp:
 *           type: string
 *           format: date-time
 *     QueryLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "query_123"
 *         query:
 *           type: string
 *           example: "Explain quantum computing..."
 *         response:
 *           type: string
 *           example: "Quantum computing is..."
 *         timestamp:
 *           type: string
 *           format: date-time
 *         tokensUsed:
 *           type: integer
 *           example: 357
 *         success:
 *           type: boolean
 *           example: true
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 20
 *         total:
 *           type: integer
 *           example: 145
 *         totalPages:
 *           type: integer
 *           example: 8
 */

/**
 * @swagger
 * /ai/query:
 *   post:
 *     summary: Submit an AI query
 *     tags: [AI Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIQuery'
 *     responses:
 *       200:
 *         description: AI query processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIResponse'
 *       400:
 *         description: Invalid query or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Quota exceeded
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/query',
  auth,
  checkQuota,
  validateAIQuery,
  aiController.processQuery
);

/**
 * @swagger
 * /ai/logs:
 *   get:
 *     summary: Get AI query logs
 *     tags: [AI Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs from this date
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs until this date
 *         example: "2024-01-31"
 *     responses:
 *       200:
 *         description: Query logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/QueryLog'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 */
router.get('/logs', auth, aiController.getQueryLogs);

/**
 * @swagger
 * /ai/analysis:
 *   get:
 *     summary: Get AI query analytics
 *     tags: [AI Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Query analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalQueries:
 *                   type: integer
 *                   example: 145
 *                 successfulQueries:
 *                   type: integer
 *                   example: 142
 *                 failedQueries:
 *                   type: integer
 *                   example: 3
 *                 averageTokensPerQuery:
 *                   type: number
 *                   example: 287.5
 *                 mostCommonTopics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       topic:
 *                         type: string
 *                         example: "technology"
 *                       count:
 *                         type: integer
 *                         example: 45
 *       401:
 *         description: Unauthorized
 */
router.get('/analysis', auth, aiController.getQueryAnalysis);

/**
 * @swagger
 * /ai/incidents:
 *   get:
 *     summary: Get AI service incidents and errors
 *     tags: [AI Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Incidents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 incidents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "incident_123"
 *                       type:
 *                         type: string
 *                         enum: [error, timeout, quota_exceeded]
 *                         example: "error"
 *                       message:
 *                         type: string
 *                         example: "AI service temporarily unavailable"
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       resolved:
 *                         type: boolean
 *                         example: false
 *       401:
 *         description: Unauthorized
 */
router.get('/incidents', auth, aiController.getIncidents);

module.exports = router;