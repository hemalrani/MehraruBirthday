FROM node:24-slim AS frontend

WORKDIR /frontend

COPY package.json package-lock.json ./

RUN npm ci

COPY src ./src
COPY public ./public
COPY index.html .
COPY vite.config.js .
COPY eslint.config.js .

RUN npm run build


FROM python:3.14-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY backend ./backend

COPY --from=frontend /frontend/dist ./dist

ENV PYTHONUNBUFFERED=1

EXPOSE 8080

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
