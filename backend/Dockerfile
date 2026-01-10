# Chef stage - prepare recipe
FROM rust:latest AS chef
RUN cargo install cargo-chef
WORKDIR /app

# Planner stage - analyze dependencies
FROM chef AS planner
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo chef prepare --recipe-path recipe.json

# Build stage - cache dependencies separately
FROM chef AS builder

# Install required dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Build dependencies (this layer is cached unless dependencies change)
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json

# Copy source code and build app (only rebuilds when code changes)
COPY Cargo.toml Cargo.lock ./
COPY src ./src
COPY migrations ./migrations
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
