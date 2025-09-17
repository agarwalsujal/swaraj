const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { auth } = require('../middlewares/authMiddleware');
const { validateSubscription } = require('../middlewares/validationMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     SubscriptionPlan:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "premium"
 *         name:
 *           type: string
 *           example: "Premium Plan"
 *         price:
 *           type: number
 *           example: 29.99
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           example: ["1000 AI queries/month", "Priority support"]
 *         queryLimit:
 *           type: integer
 *           example: 1000
 *     Subscription:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         plan:
 *           type: string
 *           example: "premium"
 *         status:
 *           type: string
 *           enum: [active, cancelled, expired]
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         autoRenew:
 *           type: boolean
 *     Usage:
 *       type: object
 *       properties:
 *         queriesUsed:
 *           type: integer
 *           example: 45
 *         queriesLimit:
 *           type: integer
 *           example: 1000
 *         resetDate:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /subscriptions/plans:
 *   get:
 *     summary: Get all available subscription plans
 *     tags: [Subscriptions]
 *     responses:
 *       200:
 *         description: List of subscription plans
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 plans:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SubscriptionPlan'
 */
router.get('/plans', subscriptionController.getPlans);

/**
 * @swagger
 * /subscriptions/my-subscription:
 *   get:
 *     summary: Get current user's subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's current subscription
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscription:
 *                   $ref: '#/components/schemas/Subscription'
 *       401:
 *         description: Unauthorized
 */
router.get('/my-subscription', auth, subscriptionController.getCurrentSubscription);

/**
 * @swagger
 * /subscriptions/subscribe:
 *   post:
 *     summary: Subscribe to a plan
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *                 example: "premium"
 *               paymentMethod:
 *                 type: string
 *                 example: "stripe_token_123"
 *     responses:
 *       201:
 *         description: Subscription created successfully
 *       400:
 *         description: Invalid plan or payment method
 *       401:
 *         description: Unauthorized
 */
router.post('/subscribe', auth, validateSubscription, subscriptionController.subscribe);

/**
 * @swagger
 * /subscriptions/cancel:
 *   put:
 *     summary: Cancel current subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *       400:
 *         description: No active subscription to cancel
 *       401:
 *         description: Unauthorized
 */
router.put('/cancel', auth, subscriptionController.cancelSubscription);

/**
 * @swagger
 * /subscriptions/upgrade:
 *   put:
 *     summary: Upgrade subscription plan
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *                 example: "enterprise"
 *     responses:
 *       200:
 *         description: Subscription upgraded successfully
 *       400:
 *         description: Invalid upgrade plan
 *       401:
 *         description: Unauthorized
 */
router.put('/upgrade', auth, validateSubscription, subscriptionController.upgradeSubscription);

/**
 * @swagger
 * /subscriptions/usage:
 *   get:
 *     summary: Get usage statistics
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usage statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usage:
 *                   $ref: '#/components/schemas/Usage'
 *       401:
 *         description: Unauthorized
 */
router.get('/usage', auth, subscriptionController.getUsage);

/**
 * @swagger
 * /subscriptions/quota:
 *   get:
 *     summary: Get remaining quota
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Remaining quota information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 remainingQueries:
 *                   type: integer
 *                   example: 955
 *                 totalQueries:
 *                   type: integer
 *                   example: 1000
 *                 resetDate:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/quota', auth, subscriptionController.getRemainingQuota);

module.exports = router;