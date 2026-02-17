let selectedClientId = null;
let selectedProduitId = null;

// Charger les clients dans le select
async function loadClientsSelect() {
    const clients = await globalThis.api.getClients();
    const select = document.getElementById('clientSelect');
    select.innerHTML = '<option value="">-- Sélectionnez un client --</option>';

    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.numClient;
        option.textContent = `${client.nom} ${client.prenom} (ID: ${client.numClient})`;
        select.appendChild(option);
    });

    select.addEventListener('change', async function() {
        selectedClientId = this.value;
        if (selectedClientId) {
            await loadPanier();
            document.getElementById('createCommandeBtn').disabled = false;
        } else {
            document.getElementById('panierContainer').innerHTML =
                '<p class="text-muted">Veuillez d\'abord sélectionner un client</p>';
            document.getElementById('createCommandeBtn').disabled = true;
        }
    });
}

// Charger les produits
async function loadProduits() {
    const produits = await globalThis.api.getProduitsAchat();
    const container = document.getElementById('produitsContainer');

    if (produits.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center text-muted">
                <i class="fas fa-info-circle fa-3x mb-3"></i>
                <p>Aucun produit disponible</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    produits.forEach(produit => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        col.innerHTML = `
            <div class="card product-card h-100">
                <div class="card-body">
                    <h5 class="card-title">${produit.nom}</h5>
                    <p class="text-muted">${produit.famille || 'Non catégorisé'}</p>
                    <p class="card-text">${produit.designation || ''}</p>
                    <div class="mt-3">
                        <span class="badge bg-success fs-6">
                            ${produit.prixTTC ? produit.prixTTC.toFixed(2) : '0.00'} € TTC
                        </span>
                    </div>
                </div>
                <div class="card-footer bg-transparent">
                    <button class="btn btn-primary w-100" onclick="openQuantiteModal(${produit.numProduit}, '${produit.nom}', ${produit.prixTTC || 0})">
                        <i class="fas fa-cart-plus me-2"></i>Ajouter au panier
                    </button>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

// Ouvrir le modal pour choisir la quantité
function openQuantiteModal(produitId, produitNom, prixTTC) {
    if (!selectedClientId) {
        globalThis.api.showNotification('Veuillez d\'abord sélectionner un client', 'warning');
        return;
    }

    selectedProduitId = produitId;
    document.getElementById('produitNom').textContent = produitNom;
    document.getElementById('produitPrix').textContent = `${prixTTC.toFixed(2)} € TTC`;
    document.getElementById('quantiteInput').value = 1;
    updateTotalProduit();

    const modal = new bootstrap.Modal(document.getElementById('quantiteModal'));
    modal.show();
}

// Mettre à jour le total dans le modal
function updateTotalProduit() {
    const quantite = Number.parseInt(document.getElementById('quantiteInput').value, 10);
    const prixText = document.getElementById('produitPrix').textContent;
    const prix = Number.parseFloat(prixText);
    const total = quantite * prix;
    document.getElementById('totalProduit').textContent = `Total: ${total.toFixed(2)} €`;
}

// Ajouter au panier
async function addToPanier() {
    const quantite = Number.parseInt(document.getElementById('quantiteInput').value, 10);

    if (!selectedClientId || !selectedProduitId || quantite < 1) {
        return;
    }

    try {
        await globalThis.api.addToPanier(selectedClientId, selectedProduitId, quantite);
        document.getElementById('quantiteModal').querySelector('.btn-close')?.click();
        await loadPanier();
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Charger le panier
async function loadPanier() {
    if (!selectedClientId) return;

    const panier = await globalThis.api.getPanier(selectedClientId);
    const container = document.getElementById('panierContainer');

    if (!panier || !panier.lignesPanier || panier.lignesPanier.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted">
                <i class="fas fa-shopping-cart fa-3x mb-3"></i>
                <p>Votre panier est vide</p>
            </div>
        `;
        updateCommandeContainer(0);
        return;
    }

    let html = `
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Produit</th>
                        <th>Prix unitaire</th>
                        <th>Quantité</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
    `;

    let totalPanier = 0;
    panier.lignesPanier.forEach(ligne => {
        const totalLigne = ligne.prixUnitaire * ligne.quantite;
        totalPanier += totalLigne;

        html += `
            <tr>
                <td>${ligne.produit.nom}</td>
                <td>${ligne.prixUnitaire.toFixed(2)} €</td>
                <td>${ligne.quantite}</td>
                <td>${totalLigne.toFixed(2)} €</td>
            </tr>
        `;
    });

    html += `
                </tbody>
                <tfoot>
                    <tr class="table-active">
                        <th colspan="3" class="text-end">Total panier:</th>
                        <th>${totalPanier.toFixed(2)} €</th>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;

    container.innerHTML = html;
    updateCommandeContainer(totalPanier);
}

// Mettre à jour le contenu de la commande
function updateCommandeContainer(total) {
    const container = document.getElementById('commandeContainer');
    container.innerHTML = `
        <div class="alert alert-info">
            <h5><i class="fas fa-info-circle me-2"></i>Résumé</h5>
            <p>Total de la commande: <strong>${total.toFixed(2)} €</strong></p>
            <p class="mb-0">En cliquant sur "Créer la Commande", le panier sera converti en commande permanente.</p>
        </div>
    `;
}

// Créer une commande
async function createCommande() {
    if (!selectedClientId) {
        globalThis.api.showNotification('Veuillez sélectionner un client', 'warning');
        return;
    }

    try {
        const commande = await globalThis.api.createCommande(selectedClientId);
        globalThis.api.showNotification(`Commande #${commande.numCommande} créée avec succès !`);

        // Réinitialiser l'interface
        document.getElementById('clientSelect').value = '';
        selectedClientId = null;
        document.getElementById('panierContainer').innerHTML =
            '<p class="text-muted">Veuillez d\'abord sélectionner un client</p>';
        document.getElementById('commandeContainer').innerHTML =
            '<p class="text-muted">Ajoutez des articles au panier pour continuer</p>';
        document.getElementById('createCommandeBtn').disabled = true;
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    await loadClientsSelect();
    await loadProduits();

    // Écouter les changements de quantité
    document.getElementById('quantiteInput').addEventListener('input', updateTotalProduit);
});