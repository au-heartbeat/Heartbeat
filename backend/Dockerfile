FROM node:16-alpine AS builder
WORKDIR /app
COPY ./ ./
RUN yarn install
RUN yarn package
RUN chmod +x ./heartbeat-backend

FROM ubuntu:latest 
WORKDIR /app
COPY --from=builder /app/heartbeat-backend ./
CMD [ "./heartbeat-backend" ]