FROM node:16.20.0-alpine as builder

WORKDIR /app
COPY . .

RUN npm config set registry https://registry.npmmirror.com/
RUN npm config set sass_binary_site=https://registry.npmmirror.com/-/binary/node-sass

RUN npm i
RUN npm run build

FROM nginx:1.20.0

COPY --from=builder /app/build /usr/share/nginx/html/dist
COPY nginx.conf /etc/nginx/

EXPOSE 3000

CMD ["nginx","-g","daemon off;"]