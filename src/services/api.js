const BASE_URL = 'http://127.0.0.1:8000/api';

async function fetcher(url) {
    const response = await fetch(`${BASE_URL}${url}`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // 'Authorization': `Bearer ${your_token_here}`,
        }
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
}

export async function getFolders(parentId = null) {
    const parentQuery = parentId === null ? '' : `?parent_id=${parentId}`;
    return fetcher(`/folders${parentQuery}`);
}

export async function getFolderContents(folderId) {
    return fetcher(`/folders/${folderId}/contents`);
}

export async function addMetadata(fileId, data) {
    // We need a fetcher that can handle POST/PUT/DELETE
    const response = await fetch(`${BASE_URL}/files/${fileId}/metadata`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add metadata');
    return response.json();
}

export async function updateMetadata(metadataId, data) {
    const response = await fetch(`${BASE_URL}/metadata/${metadataId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update metadata');
    return response.json();
}

export async function deleteMetadata(metadataId) {
    const response = await fetch(`${BASE_URL}/metadata/${metadataId}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
        },
    });
    if (!response.ok) throw new Error('Failed to delete metadata');
    // DELETE returns 204 No Content, so no JSON to parse
}

export async function getAncestry(folderId) {
    if (!folderId) return [];
    return fetcher(`/folders/${folderId}/ancestry`);
}