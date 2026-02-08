// Configuration de l'API
const API_BASE_URL = 'http://localhost:8000/api';

// Fonctions utilitaires
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show notification`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.getElementById('notification-container') || document.body;
    container.prepend(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Fonctions API pour Clients
async function getClients() {
    try {
        const response = await fetch(`${API_BASE_URL}/clients`);
        return await response.json();
    } catch (error) {
        console.error('Erreur lors de la récupération des clients:', error);
        showNotification('Erreur de connexion au serveur', 'danger');
        return [];
    }
}

async function createClient(clientData) {
    try {
        const response = await fetch(`${API_BASE_URL}/clients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clientData)
        });
        const data = await response.json();
        showNotification('Client créé avec succès');
        return data;
    } catch (error) {
        console.error('Erreur lors de la création du client:', error);
        showNotification('Erreur lors de la création', 'danger');
        throw error;
    }
}

async function updateClient(id, clientData) {
    try {
        const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clientData)
        });
        const data = await response.json();
        showNotification('Client modifié avec succès');
        return data;
    } catch (error) {
        console.error('Erreur lors de la modification du client:', error);
        showNotification('Erreur lors de la modification', 'danger');
        throw error;
    }
}

async function deleteClient(id) {
    try {
        await fetch(`${API_BASE_URL}/clients/${id}`, {
            method: 'DELETE'
        });
        showNotification('Client supprimé avec succès');
        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression du client:', error);
        showNotification('Erreur lors de la suppression', 'danger');
        throw error;
    }
}

// Fonctions API pour Produits
async function getProduits() {
    try {
        const response = await fetch(`${API_BASE_URL}/produits`);
        return await response.json();
    } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        showNotification('Erreur de connexion au serveur', 'danger');
        return [];
    }
}

async function createProduit(produitData) {
    try {
        const response = await fetch(`${API_BASE_URL}/produits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produitData)
        });
        const data = await response.json();
        showNotification('Produit créé avec succès');
        return data;
    } catch (error) {
        console.error('Erreur lors de la création du produit:', error);
        showNotification('Erreur lors de la création', 'danger');
        throw error;
    }
}

// Fonctions API pour le processus d'achat
async function getProduitsAchat() {
    try {
        const response = await fetch(`${API_BASE_URL}/achat/produits`);
        return await response.json();
    } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        return [];
    }
}

async function addToPanier(clientId, produitId, quantite) {
    try {
        console.log('🔍 Appel API addToPanier:', { clientId, produitId, quantite });

        const response = await fetch(
            `${API_BASE_URL}/achat/panier/ajouter?clientId=${clientId}&produitId=${produitId}&quantite=${quantite}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('📡 Status:', response.status);
        console.log('📡 Headers:', response.headers.get('content-type'));

        // Lisez d'abord le texte brut
        const rawText = await response.text();
        console.log('📦 Réponse brute (premiers 500 caractères):', rawText.substring(0, 500));

        let data;

        // Essayez de parser le JSON
        try {
            data = JSON.parse(rawText);
            console.log('✅ JSON parsé avec succès:', data);
        } catch (parseError) {
            console.error('❌ Erreur parsing JSON:', parseError.message);
            console.error('📄 Texte problématique:', rawText);

            // Si c'est un problème de référence circulaire, essayez de nettoyer
            if (rawText.includes('"client":}}]}}]}}]}}')) {
                console.warn('⚠️ Détection de référence circulaire dans la réponse');

                // Retournez un objet simple pour éviter l'erreur
                data = {
                    success: true,
                    message: 'Produit ajouté (réponse simplifiée due à référence circulaire)',
                    clientId: clientId,
                    produitId: produitId,
                    quantite: quantite
                };
            } else {
                // Autre erreur
                throw new Error(`Réponse API invalide: ${rawText.substring(0, 100)}...`);
            }
        }

        showNotification('Produit ajouté au panier');
        return data;

    } catch (error) {
        console.error('❌ Erreur complète addToPanier:', error);
        showNotification('Erreur lors de l\'ajout au panier: ' + error.message, 'danger');
        throw error;
    }
}
async function getPanier(clientId) {
    try {
        console.log('🔍 Récupération panier pour client:', clientId);

        const response = await fetch(`${API_BASE_URL}/achat/panier/${clientId}`);

        console.log('📡 Status panier:', response.status);

        if (response.status === 404) {
            console.log('ℹ️ Panier non trouvé pour client', clientId);
            return null;
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const rawText = await response.text();
        console.log('📦 Réponse panier brute:', rawText.substring(0, 300));

        try {
            const data = JSON.parse(rawText);
            console.log('✅ Panier parsé:', data);
            return data;
        } catch (parseError) {
            console.error('❌ Erreur parsing panier:', parseError);

            // Retournez un panier vide pour éviter l'erreur
            return {
                id: null,
                client: { numClient: clientId },
                lignesPanier: [],
                total: 0.0
            };
        }

    } catch (error) {
        console.error('❌ Erreur getPanier:', error);
        // Retournez un panier vide plutôt que null
        return {
            id: null,
            client: { numClient: clientId },
            lignesPanier: [],
            total: 0.0
        };
    }
}

async function createCommande(clientId) {
    try {
        const response = await fetch(`${API_BASE_URL}/achat/commande/creer/${clientId}`, {
            method: 'POST'
        });
        const data = await response.json();
        showNotification('Commande créée avec succès !');
        return data;
    } catch (error) {
        console.error('Erreur lors de la création de la commande:', error);
        showNotification('Erreur lors de la création', 'danger');
        throw error;
    }
}

async function finaliserCommande(commandeId) {
    try {
        const response = await fetch(`${API_BASE_URL}/achat/commande/finaliser/${commandeId}`, {
            method: 'POST'
        });
        const data = await response.text();
        showNotification('Commande finalisée avec succès !');
        return data;
    } catch (error) {
        console.error('Erreur lors de la finalisation:', error);
        showNotification('Erreur lors de la finalisation', 'danger');
        throw error;
    }
}

// Fonctions API pour Commandes
async function getCommandes() {
    try {
        const response = await fetch(`${API_BASE_URL}/commandes`);
        return await response.json();
    } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
        return [];
    }
}

// Export des fonctions
window.api = {
    // Clients
    getClients,
    createClient,
    updateClient,
    deleteClient,
    
    // Produits
    getProduits,
    createProduit,
    
    // Achat
    getProduitsAchat,
    addToPanier,
    getPanier,
    createCommande,
    finaliserCommande,
    
    // Commandes
    getCommandes,
    
    // Utilitaires
    showNotification
};