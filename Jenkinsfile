# Utilise Nginx pour servir les fichiers statiques
FROM nginx:alpine

# Copie tous les fichiers HTML, CSS, JS
COPY . /usr/share/nginx/html

# Copie une configuration Nginx personnalisée (optionnel)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposition du port 80
EXPOSE 80

# Santé du conteneur
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]