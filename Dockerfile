FROM oven/bun:1.0.25

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --production

# Copy source code
COPY . .

# Build the application
RUN npx -y bun src/scripts/deployment.js -s

# Set environment variables
ENV NODE_ENV=production
ENV PORT=80

# Expose port
EXPOSE 80

# Start the application
CMD ["bun", "dist/index.js"] 