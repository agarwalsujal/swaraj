FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Bundle app source
COPY . .

# Create logs directory
RUN mkdir -p logs

# Create a non-root user and switch to it
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001 -G nodejs

# Change ownership of the working directory
RUN chown -R nodejs:nodejs /usr/src/app

USER nodejs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose the port the app will run on
EXPOSE 8080

# Start the application
CMD ["npm", "start"]