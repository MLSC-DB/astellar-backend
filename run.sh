docker build -t astellar-backend .
docker run -d --name astellar-back -p 3001:3001 astellar-backend