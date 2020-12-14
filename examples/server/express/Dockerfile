#######
# THIS NEEDS TO BE RUN FROM REPO ROOT TO HAVE PASSPORT DIST IN CONTEXT
#######

ARG PORT=3333

FROM node:14-alpine AS node

FROM node AS final

# Set node environment to production
ENV NODE_ENV production

# Update the system
RUN apk --no-cache -U upgrade && apk add python make g++

# Prepare destination directory and ensure user node owns it
RUN mkdir -p /home/node/app/dist
RUN mkdir -p /home/node/app/examples/server/express
RUN chown -R node:node /home/node/app

# Copy the passport strategy code
WORKDIR /home/node/app
COPY --chown=node:node /dist ./dist
COPY --chown=node:node package*.json ./

# Install libraries as user node
RUN npm i --only=production

# Set CWD
WORKDIR /home/node/app/examples/server/express

# Install PM2
RUN npm i -g pm2

# Copy package.json, package-lock.json and process.yml
COPY --chown=node:node examples/server/express/. ./

# Switch to user node
USER node

# Install libraries as user node
RUN npm i --only=production

# Open desired port
EXPOSE ${PORT}

# Use PM2 to run the application as stated in config file
ENTRYPOINT ["pm2-runtime", "./process.yml"] 