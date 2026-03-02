## Environnement de développement
Executez la commande ```sudo docker compose -f docker-compose.dev.yml up --build``` pour lancer l'environnement de développement. le site est accessible à l'adresse ```localhost```

## Environnement de production
Executez la commande ```sudo docker compose -f docker-compose.prod.yml up --build``` pour lancer l'environnement de production, avec les fichiers compilés. Le site est accessible à l'adresse ```localhost```

## Post-Scriptum
Afin de faire fonctionner le site internet, penser à remplir le fichier ```process.env```. Penser aussi à modifier les cookies afin qu'ils soient sécurisés, pour le https.
