# Build stage
FROM rust:latest as builder

# Install required dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Create a new directory for the app
WORKDIR /app

# Copy manifests
COPY Cargo.toml Cargo.lock ./

# Copy source code
COPY src ./src
COPY migrations ./migrations

# Build the application in release mode
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

# Install runtime dependencies including postgresql-client
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/target/release/sabyejai-backend /app/backend

# Copy migrations
COPY --from=builder /app/migrations /app/migrations

# Copy .env file (will be overridden by docker-compose environment variables)
COPY .env.docker /app/.env

# Copy entrypoint script
COPY entrypoint.sh /app/entrypoint.sh

# Make entrypoint executable and change ownership
RUN chmod +x /app/entrypoint.sh && \
    chown -R appuser:appuser /app

# Expose the port
EXPOSE 8000

# Switch to app user (entrypoint will run as appuser)
USER appuser

# Use entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
