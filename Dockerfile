# Stage 1: Build the application
FROM node:22-alpine AS build

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create the production image
FROM node:22-alpine

# Set the working directory
WORKDIR /usr/src/app

# Create a non-root user with specific UID/GID to match Kubernetes securityContext
RUN addgroup -g 1000 -S appgroup && adduser -u 1000 -S -D -h /home/appuser -G appgroup appuser

# Copy built assets from the build stage
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./

# Change ownership of the files to the non-root user
RUN chown -R appuser:appgroup /usr/src/app

# Switch to the non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]