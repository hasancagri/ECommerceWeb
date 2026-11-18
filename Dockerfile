# ECommerceWeb — multi-stage: Vite build → nginx statik serve.
# VITE_* build-arg'ları build anında gömülür (CI workflow canlı host'ları geçer).
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL
ARG VITE_OIDC_AUTHORITY
ARG VITE_OIDC_REDIRECT
ARG VITE_OIDC_POST_LOGOUT
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_OIDC_AUTHORITY=$VITE_OIDC_AUTHORITY \
    VITE_OIDC_REDIRECT=$VITE_OIDC_REDIRECT \
    VITE_OIDC_POST_LOGOUT=$VITE_OIDC_POST_LOGOUT
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
