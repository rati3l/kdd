FROM golang:1.19-alpine as go_builder
RUN apk add build-base
WORKDIR /build
COPY ./ ./
RUN go mod download
RUN go build -o /kdd cmd/kdd.go


FROM node:19.4.0-bullseye as node_builder
ENV NODE_ENV=production
COPY ./_ui /build
WORKDIR /build
RUN npm install



FROM golang:1.19-alpine
WORKDIR /app
COPY --from=go_builder /kdd  ./kdd
COPY --from=node_builder /build/build ./_ui
RUN addgroup -S kdd && adduser -S kdd -G kdd

# USER kdd

EXPOSE 3333

CMD ["/app/kdd"] 