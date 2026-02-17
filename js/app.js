// Charger les statistiques sur la page d'accueil
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Récupérer les données
        const [clients, produits, commandes] = await Promise.all([
            globalThis.api?.getClients() ?? Promise.resolve([]),
            globalThis.api?.getProduits() ?? Promise.resolve([]),
            globalThis.api?.getCommandes() ?? Promise.resolve([])
        ]);

        // Mettre à jour les compteurs
        const clientCountEl = document.getElementById('clientCount');
        const produitCountEl = document.getElementById('produitCount');
        const commandeCountEl = document.getElementById('commandeCount');

        if (clientCountEl) clientCountEl.textContent = clients.length;
        if (produitCountEl) produitCountEl.textContent = produits.length;
        if (commandeCountEl) commandeCountEl.textContent = commandes.length;

        // Pour les paniers, on peut compter les clients actifs
        let panierCount = 0;
        for (const client of clients) {
            const panier = await globalThis.api?.getPanier(client.numClient);
            if (panier?.lignesPanier?.length > 0) {
                panierCount++;
            }
        }
        const panierCountEl = document.getElementById('panierCount');
        if (panierCountEl) panierCountEl.textContent = panierCount;

    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
    }
});