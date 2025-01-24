# Use the official Node.js 20.9.0 image
FROM node:20.9.0

# Set the working directory to the root
WORKDIR /

# Copy package.json and package-lock.json
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["node", "app.js"]