FROM golang:1.19-bullseye as go_builder
WORKDIR /build
COPY ./ ./
RUN go mod download
RUN go build -o /kdd cmd/kdd.go


FROM node:19.4.0-bullseye as node_builder
COPY ./_ui /build
WORKDIR /build
RUN npm install



FROM golang:1.19-alpine
WORKDIR /app
COPY --from=go_builder /kdd  ./kdd
COPY --from=node_builder /build ./_ui
RUN groupadd -r kdd && useradd --no-log-init -r -g kdd kdd


EXPOSE 3333

CMD ["/app/kdd"] 