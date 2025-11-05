 # Use official Node.js runtime as base image
FROM node:18-alpine
# Set working directory in container
WORKDIR /app
# Copy package files to container
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy application code
COPY . .
# Expose port that app runs on
EXPOSE 3000
# Define the command to run the application
CMD ["npm", "start"]