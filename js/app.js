// Charger les statistiques sur la page d'accueil
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Récupérer les données
        const [clients, produits, commandes] = await Promise.all([
            window.api.getClients(),
            window.api.getProduits(),
            window.api.getCommandes()
        ]);
        
        // Mettre à jour les compteurs
        document.getElementById('clientCount').textContent = clients.length;
        document.getElementById('produitCount').textContent = produits.length;
        document.getElementById('commandeCount').textContent = commandes.length;
        
        // Pour les paniers, on peut compter les clients actifs
        let panierCount = 0;
        for (const client of clients) {
            const panier = await window.api.getPanier(client.numClient);
            if (panier && panier.lignesPanier && panier.lignesPanier.length > 0) {
                panierCount++;
            }
        }
        document.getElementById('panierCount').textContent = panierCount;
        
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
    }
});