# Use the official PostgreSQL image from Docker Hub
FROM postgres:13

# Set environment variables for PostgreSQL configuration
ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=root
ENV POSTGRES_DB=main

# Install dependencies for building pgvector
RUN apt-get update && \
    apt-get install -y \
    postgresql-server-dev-13 \
    build-essential \
    git && \
    git clone https://github.com/pgvector/pgvector.git && \
    cd pgvector && \
    make && \
    make install && \
    rm -rf /pgvector

# Expose the default PostgreSQL port
EXPOSE 5432
