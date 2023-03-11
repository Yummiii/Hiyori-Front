FROM rust:bullseye as build
COPY . /app
WORKDIR /app
RUN cargo build --release

FROM debian:11
RUN apt update && apt full-upgrade -y
COPY --from=build /app/target/release/hiyori /app/hiyori
WORKDIR /app
RUN chmod +x hiyori
ENTRYPOINT [ "./hiyori" ]