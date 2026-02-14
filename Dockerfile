# Créez le Dockerfile avec le contenu correct
cat > Dockerfile << 'EOF'
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Vérifiez le contenu
cat Dockerfile