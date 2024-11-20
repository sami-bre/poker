FROM node:20-slim

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Install Playwright browsers
RUN npx playwright install --with-deps

# Build the Next.js application
RUN npm run build

# Next.js runs on port 3000 by default
EXPOSE 3000

CMD ["npm", "start"] 