FROM golang:1.19-alpine as go_builder
# ENV CGO_ENABLED=0
RUN apk add build-base gcc musl-dev
WORKDIR /build
COPY ./ ./
RUN go mod download
RUN  go build -o /kdd cmd/kdd.go


FROM node:19.4.0-bullseye as node_builder
ENV NODE_ENV=production
COPY ./_ui /build
WORKDIR /build
RUN npm install



FROM alpine:3.17.1

RUN addgroup -S kdd && adduser -S kdd -G kdd
USER kdd

WORKDIR /app
# RUN apk add gcc musl
COPY --from=go_builder /kdd  ./kdd
COPY --from=node_builder /build/build ./_ui

EXPOSE 3333

CMD ["/app/kdd"] 