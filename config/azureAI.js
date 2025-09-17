const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');
require('dotenv').config();

const client = new OpenAIClient(
  process.env.AZURE_OPENAI_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_OPENAI_KEY)
);

const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

module.exports = {
  client,
  deployment
};