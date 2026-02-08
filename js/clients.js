// Charger et afficher les clients
async function loadClients() {
    const clients = await window.api.getClients();
    const tbody = document.getElementById('clientsTableBody');
    tbody.innerHTML = '';

    if (clients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    <i class="fas fa-info-circle me-2"></i>
                    Aucun client trouvé
                </td>
            </tr>
        `;
        return;
    }

    clients.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.numClient}</td>
            <td>${client.nom}</td>
            <td>${client.prenom || '-'}</td>
            <td>${client.email || '-'}</td>
            <td>${client.telephone || '-'}</td>
            <td>${client.ville || '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-2" onclick="editClient(${client.numClient})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(${client.numClient}, '${client.nom} ${client.prenom}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Ajouter un client
async function addClient() {
    const form = document.getElementById('addClientForm');
    const formData = new FormData(form);
    
    const clientData = {
        civilite: formData.get('civilite'),
        nom: formData.get('nom'),
        prenom: formData.get('prenom'),
        adresse: formData.get('adresse'),
        codePostal: formData.get('codePostal'),
        ville: formData.get('ville'),
        pays: formData.get('pays')
    };

    try {
        await window.api.createClient(clientData);
        form.reset();
        document.getElementById('addClientModal').querySelector('.btn-close').click();
        await loadClients();
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Préparer l'édition d'un client
async function editClient(clientId) {
    const clients = await window.api.getClients();
    const client = clients.find(c => c.numClient === clientId);
    
    if (client) {
        document.getElementById('editClientId').value = client.numClient;
        document.getElementById('editCivilite').value = client.civilite || 'M.';
        document.getElementById('editNom').value = client.nom;
        document.getElementById('editPrenom').value = client.prenom || '';
        document.getElementById('editAdresse').value = client.adresse || '';
        document.getElementById('editCodePostal').value = client.codePostal || '';
        document.getElementById('editVille').value = client.ville || '';
        document.getElementById('editPays').value = client.pays || 'France';
        
        const modal = new bootstrap.Modal(document.getElementById('editClientModal'));
        modal.show();
    }
}

// Mettre à jour un client
async function updateClient() {
    const clientId = document.getElementById('editClientId').value;
    const form = document.getElementById('editClientForm');
    const formData = new FormData(form);
    
    const clientData = {
        numClient: parseInt(clientId),
        civilite: formData.get('civilite'),
        nom: formData.get('nom'),
        prenom: formData.get('prenom'),
        adresse: formData.get('adresse'),
        codePostal: formData.get('codePostal'),
        ville: formData.get('ville'),
        pays: formData.get('pays')
    };

    try {
        await window.api.updateClient(clientId, clientData);
        document.getElementById('editClientModal').querySelector('.btn-close').click();
        await loadClients();
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Confirmer la suppression
function confirmDelete(clientId, clientName) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le client "${clientName}" ?`)) {
        deleteClient(clientId);
    }
}

// Supprimer un client
async function deleteClient(clientId) {
    try {
        await window.api.deleteClient(clientId);
        await loadClients();
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Charger les clients au démarrage
document.addEventListener('DOMContentLoaded', loadClients);