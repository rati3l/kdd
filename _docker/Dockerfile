FROM golang:1.19-alpine as go_builder
# ENV CGO_ENABLED=0
RUN apk add build-base gcc musl-dev
WORKDIR /build
COPY ./ ./
RUN go mod download
RUN go build -ldflags="-s -w" -o /kdd cmd/kdd.go


FROM node:19.4.0-bullseye as node_builder
ENV NODE_ENV=production
COPY ./_ui /build
WORKDIR /build
RUN npm install


FROM alpine:3.17.1

# RUN apk add gcc musl
WORKDIR /app
COPY --from=go_builder /kdd  ./bin/kdd
COPY --from=go_builder /build/kdd.yaml  ./kdd.yaml
COPY --from=node_builder /build/build ./_ui/build

RUN addgroup -S kdd && adduser -S kdd -G kdd
RUN chown -R kdd:kdd /app
USER kdd

WORKDIR /app/bin

EXPOSE 3333

CMD ["./kdd"] 