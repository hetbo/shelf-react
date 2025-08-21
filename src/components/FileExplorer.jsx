import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import FolderTreeView from './TreeView/FolderTreeView';
import FolderContentView from './ContentView/FoldreContentView.jsx';
import DetailsSidebar from './DetailsView/DetailsSidebar';
import StatusBar from './StatusBar/StatusBar';

// A helper function to recursively add children to the tree
const addChildrenToTree = (folders, parentId, children) => {
    return folders.map(folder => {
        if (folder.id === parentId) {
            return { ...folder, children };
        }
        if (folder.children) {
            return { ...folder, children: addChildrenToTree(folder.children, parentId, children) };
        }
        return folder;
    });
};

const FileExplorer = () => {
    // --- All State Hooks ---
    const [folders, setFolders] = useState([]);
    const [expandedFolders, setExpandedFolders] = useState(new Set());
    const [loadingFolders, setLoadingFolders] = useState(new Set());
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [folderContents, setFolderContents] = useState({ data: null, isLoading: false });
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [breadcrumbPath, setBreadcrumbPath] = useState([]);

    // --- All Callback and Effect Hooks ---
    const loadTopLevelFolders = useCallback(async () => {
        try {
            setIsInitialLoading(true);
            const topLevelFolders = await api.getFolders();
            setFolders(topLevelFolders);
        } catch (error) {
            console.error('Error loading top-level folders:', error);
        } finally {
            setIsInitialLoading(false);
        }
    }, []);

    useEffect(() => { loadTopLevelFolders(); }, [loadTopLevelFolders]);

    const toggleFolder = useCallback(async (folderId, forceOpen = false) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(folderId) && !forceOpen) {
            newExpanded.delete(folderId);
        } else {
            newExpanded.add(folderId);
            setLoadingFolders(prev => new Set(prev).add(folderId));
            try {
                const children = await api.getFolders(folderId);
                setFolders(currentFolders => addChildrenToTree(currentFolders, folderId, children));
            } catch (error) {
                console.error(`Error loading children for folder ${folderId}:`, error);
            } finally {
                setLoadingFolders(prev => { const newSet = new Set(prev); newSet.delete(folderId); return newSet; });
            }
        }
        setExpandedFolders(newExpanded);
    }, [expandedFolders]);

// INSIDE FileExplorer.jsx

    const selectFolder = useCallback(async (folder) => {
        // V-- THIS IS THE FIX --V
        // Force expand the folder in the tree whenever it's selected.
        toggleFolder(folder.id, true);

        // The rest of the function remains exactly the same
        setSelectedFolder(folder);
        setSelectedItem({ ...folder, type: 'folder' });
        setFolderContents({ data: null, isLoading: true });
        try {
            const contents = await api.getFolderContents(folder.id);
            setFolderContents({ data: contents, isLoading: false });
        } catch (error) {
            console.error(`Error loading contents for folder ${folder.id}:`, error);
            setFolderContents({ data: null, isLoading: false });
        }
    }, [toggleFolder]); // <-- IMPORTANT: Add toggleFolder to the dependency array


    const handleOpenFolderFromContent = useCallback(async (folder) => {
        // 1. Fetch the full path from the root to the clicked folder
        const path = await api.getAncestry(folder.id);
        const pathIds = path.map(p => p.id);

        // 2. Expand all folders in the path to ensure visibility
        setExpandedFolders(prev => new Set([...prev, ...pathIds]));

        // 3. Select the folder to load its content and update the highlight
        selectFolder(folder);
    }, [selectFolder]); // selectFolder is the only dependency needed



    const handleSelectItemFromContent = useCallback((item) => {
        const itemType = item.filename ? 'file' : 'folder';
        setSelectedItem({ ...item, type: itemType });
        // When a file is selected, the folder highlight in the tree should remain
        // on its parent, which is the currently selectedFolder. This logic is implicitly correct.
    }, []);

// INSIDE FileExplorer.jsx

    useEffect(() => {
        const fetchPath = async () => {
            // If nothing is selected, the path is empty.
            if (!selectedItem) {
                setBreadcrumbPath([]);
                return;
            }

            // Determine the ID of the parent folder whose ancestry we need.
            const folderIdForPath = selectedItem.type === 'folder'
                ? selectedItem.id
                : selectedItem.folder_id;

            // If we have a folder ID, fetch its ancestry.
            if (folderIdForPath) {
                const ancestry = await api.getAncestry(folderIdForPath);

                // If the selected item is a file, add it to the end of the ancestry path.
                // If it's a folder, the ancestry already includes it, so we don't need to add it again.
                if (selectedItem.type === 'file') {
                    setBreadcrumbPath([...ancestry, selectedItem]);
                } else {
                    setBreadcrumbPath(ancestry);
                }
            } else if (selectedItem.type === 'folder' && selectedItem.parent_id === null) {
                // Handle the edge case where a root folder is selected (no folder_id)
                setBreadcrumbPath([selectedItem]);
            }
        };

        fetchPath();
    }, [selectedItem]); // This effect ONLY depends on the selectedItem


    const handleBreadcrumbClick = useCallback((folder) => {
        selectFolder(folder);
    }, [selectFolder]);


    const handleAddMetadata = useCallback(async (fileId, data) => {
        try {
            const newMetadata = await api.addMetadata(fileId, data);
            setFolderContents(currentContents => {
                let newlyUpdatedFile = null;
                const updatedFiles = currentContents.data.files.map(file => {
                    if (file.id === fileId) {
                        const updatedFile = { ...file, metadata: [...file.metadata, newMetadata] };
                        newlyUpdatedFile = updatedFile; // Capture the new file object
                        return updatedFile;
                    }
                    return file;
                });

                // If the selected item was the one that changed, update it from our new source of truth
                if (newlyUpdatedFile) {
                    setSelectedItem({ ...newlyUpdatedFile, type: 'file' });
                }

                return { ...currentContents, data: { ...currentContents.data, files: updatedFiles } };
            });
        } catch (error) {
            console.error("Failed to add metadata:", error);
        }
    }, []);


    const handleUpdateMetadata = useCallback(async (metadataId, data) => {
        try {
            const updatedMetadata = await api.updateMetadata(metadataId, data);
            setFolderContents(currentContents => {
                const updatedFiles = currentContents.data.files.map(file => {
                    if (file.id === updatedMetadata.file_id) {
                        const newMeta = file.metadata.map(m => m.id === metadataId ? updatedMetadata : m);
                        return { ...file, metadata: newMeta };
                    }
                    return file;
                });
                if (selectedItem?.id === updatedMetadata.file_id) {
                    const newMeta = selectedItem.metadata.map(m => m.id === metadataId ? updatedMetadata : m);
                    setSelectedItem(prev => ({ ...prev, metadata: newMeta }));
                }
                return {
                    ...currentContents,
                    data: { ...currentContents.data, files: updatedFiles }
                };
            });
        } catch (error) {
            console.error("Failed to update metadata:", error);
        }
    }, [selectedItem]);
    const handleDeleteMetadata = useCallback(async (metadataId) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.deleteMetadata(metadataId);
            setFolderContents(currentContents => {
                let fileId = null;
                const updatedFiles = currentContents.data.files.map(file => {
                    const metaIndex = file.metadata.findIndex(m => m.id === metadataId);
                    if (metaIndex > -1) {
                        fileId = file.id;
                        const newMeta = file.metadata.filter(m => m.id !== metadataId);
                        return { ...file, metadata: newMeta };
                    }
                    return file;
                });
                if (selectedItem?.id === fileId) {
                    const newMeta = selectedItem.metadata.filter(m => m.id !== metadataId);
                    setSelectedItem(prev => ({ ...prev, metadata: newMeta }));
                }
                return {
                    ...currentContents,
                    data: { ...currentContents.data, files: updatedFiles }
                };
            });
        } catch (error) {
            console.error("Failed to delete metadata:", error);
        }
    }, [selectedItem]);
    // --- **CORRECTED POSITION FOR EARLY RETURN** ---
    // All hooks have been called. Now we can safely check the loading state.
    if (isInitialLoading) {
        return (
            <div className="bg-gray-900 text-gray-200 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-3"></div>
                    <span>Loading folders...</span>
                </div>
            </div>
        );
    }

    // --- Final Render ---
    return (
        <div className="bg-gray-900 text-gray-200 p-4 rounded-lg border border-gray-700 font-mono">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                    <h3 className="text-lg font-semibold mb-3 text-green-400 border-b border-gray-700 pb-2">📁 Folder Tree</h3>
                    <FolderTreeView
                        folders={folders}
                        expandedFolders={expandedFolders}
                        selectedFolder={selectedFolder}
                        loadingFolders={loadingFolders}
                        onToggle={toggleFolder}
                        onSelect={selectFolder}
                    />
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-3 text-green-400 border-b border-gray-700 pb-2">📄 Contents</h3>
                    {selectedFolder ? (
                        folderContents.isLoading ? (
                            <div className="flex items-center text-gray-400 p-4">...Loading</div>
                        ) : (
                            <FolderContentView
                                content={folderContents.data}
                                onFolderOpen={handleOpenFolderFromContent}
                                onItemSelected={handleSelectItemFromContent}
                                selectedItem={selectedItem}
                            />
                        )
                    ) : (
                        <div className="text-gray-400 text-center py-8">Select a folder</div>
                    )}
                </div>
                <DetailsSidebar
                    item={selectedItem}
                    onAddMetadata={handleAddMetadata}
                    onUpdateMetadata={handleUpdateMetadata}
                    onDeleteMetadata={handleDeleteMetadata}
                />
            </div>
            <StatusBar
                selectedFolder={selectedFolder}
                selectedItem={selectedItem}
                breadcrumbPath={breadcrumbPath}
                onBreadcrumbClick={handleBreadcrumbClick}
            />
        </div>
    );
};

export default FileExplorer;