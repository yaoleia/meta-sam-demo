FROM node:14.18.0

WORKDIR /app

RUN npm config set registry https://registry.npmmirror.com/
RUN npm config set sass_binary_site=https://registry.npmmirror.com/-/binary/node-sass

COPY . .

RUN /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone
RUN npm i

EXPOSE 3000

CMD [ "npm", "run", "start" ]
