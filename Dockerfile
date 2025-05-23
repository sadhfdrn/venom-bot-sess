FROM node:20-slim

# Install Chromium & dependencies
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  wget \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Set working dir
WORKDIR /app

# Copy files
COPY . .

# Install Node dependencies
RUN npm install

# Expose port
EXPOSE 3000

# Run app
CMD ["npm", "start"]
