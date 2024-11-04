FROM node:18

# Install yt-dlp dependencies
RUN apt-get update && apt-get install -y python3-pip ffmpeg
RUN pip3 install yt-dlp

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3001
CMD ["npm", "start"] 