@echo off
REM Generate a self-signed SSL certificate for local development
REM Output: server.cert (certificate), server.key (private key)

openssl req -nodes -new -x509 -keyout ../certs/server.key -out ../certs/server.cert -days 365 -subj "/CN=localhost"
echo SSL certificate and key generated as server.cert and server.key
