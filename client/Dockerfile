# Build stage
FROM node:18-slim

# Set working directory
WORKDIR /usr/src/app

# First, copy only package files to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
# Exclude node_modules and other unnecessary files
COPY . .

# Remove existing node_modules if any
RUN rm -rf node_modules && npm install

# Expose port
EXPOSE 3000

# Start the development server
CMD ["npm", "start"] 