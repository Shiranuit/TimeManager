FROM node:12.20.0

EXPOSE 8080

RUN  set -x \
  && apt update

WORKDIR /var/app

ADD entrypoint.sh /bin/entrypoint.sh
RUN chmod +x /bin/entrypoint.sh

ADD ./.eslintrc.js ./.eslintrc.js
ADD ./.browserslistrc ./.browserslistrc
ADD babel.config.js .
ADD vue.config.js .
ADD package-lock.json .
ADD package.json .
ADD .env.dev_local .
ADD .env.development .
ADD .env.docker_dev .

RUN npm install
ADD public ./public
ADD src ./src

ENTRYPOINT ["/bin/entrypoint.sh"]

CMD ["npm", "run", "serve"]