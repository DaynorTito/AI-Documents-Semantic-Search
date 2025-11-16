FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build -- --configuration production

FROM nginx:alpine

COPY --from=build /app/dist/kidney-desease-client/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost || exit 1

CMD ["nginx", "-g", "daemon off;"]
