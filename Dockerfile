FROM node:20-bookworm AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
# Remove the packaged default site
RUN rm -f /etc/nginx/conf.d/default.conf
# Copy YOUR config in as the only site
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy the build output
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]