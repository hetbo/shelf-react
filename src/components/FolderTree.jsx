import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';

// --- API functions remain the same ---
const api = {
    async getFolders(parentId = null) {
        // Use an empty string for the query parameter if parentId is null
        const parentQuery = parentId === null ? '' : `?parent_id=${parentId}`;
        const response = await fetch(`http://127.0.0.1:8000/api/folders${parentQuery}`, {
            headers: {
                // 'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.data;
    },

    async getFolderContents(folderId) {
        const response = await fetch(`http://127.0.0.1:8000/api/folders/${folderId}/contents`, {
            headers: {
                // 'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.data;
    }
};


// --- Corrected FolderNode Component ---
// Note: The `children` prop and internal recursion have been removed.
// It is now a pure presentational component.
const FolderNode = ({
                        folder,
                        level = 0,
                        onToggle,
                        onSelect,
                        isExpanded,
                        isSelected,
                        isLoading
                    }) => {
    // The `has_children` prop from the API is now the single source of truth.
    const hasChildren = folder.has_children;

    return (
        <div className="select-none">
            <div
                className={`flex items-center py-1 px-2 hover:bg-gray-700 cursor-pointer rounded transition-colors ${
                    isSelected ? 'bg-blue-900 text-blue-200' : 'text-gray-200'
                }`}
                style={{ paddingLeft: `${level * 20 + 8}px` }}
            >
                <div
                    className="flex items-center flex-1"
                    onClick={() => onSelect(folder)}
                >
                    {hasChildren ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent onSelect from firing
                                onToggle(folder.id);
                            }}
                            className="mr-1 p-1 hover:bg-gray-600 rounded transition-colors"
                        >
                            {isLoading ? (
                                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : isExpanded ? (
                                <ChevronDown size={14} />
                            ) : (
                                <ChevronRight size={14} />
                            )}
                        </button>
                    ) : (
                        // A placeholder for alignment if there are no children
                        <div className="w-6"></div>
                    )}

                    {isExpanded ? (
                        <FolderOpen size={16} className="mr-2 text-yellow-400" />
                    ) : (
                        <Folder size={16} className="mr-2 text-yellow-400" />
                    )}

                    <span className="text-sm font-medium">{folder.name}</span>
                </div>
            </div>
        </div>
    );
};


// --- Corrected FolderTree Component ---
// This component now handles all rendering logic, including recursion.
const FolderTree = () => {
    const [folders, setFolders] = useState([]); // Only for top-level folders
    const [expandedFolders, setExpandedFolders] = useState(new Set());
    const [loadingFolders, setLoadingFolders] = useState(new Set());
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [folderContents, setFolderContents] = useState({ data: null, isLoading: false });
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [folderChildren, setFolderChildren] = useState({}); // Stores children for all folders by ID

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

    useEffect(() => {
        loadTopLevelFolders();
    }, [loadTopLevelFolders]);

    const toggleFolder = useCallback(async (folderId) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(folderId)) {
            // Collapse
            newExpanded.delete(folderId);
        } else {
            // Expand
            newExpanded.add(folderId);
            // Load children if they haven't been fetched yet
            if (!folderChildren[folderId]) {
                setLoadingFolders(prev => new Set(prev).add(folderId));
                try {
                    const children = await api.getFolders(folderId);
                    setFolderChildren(prev => ({
                        ...prev,
                        [folderId]: children
                    }));
                } catch (error) {
                    console.error(`Error loading children for folder ${folderId}:`, error);
                } finally {
                    setLoadingFolders(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(folderId);
                        return newSet;
                    });
                }
            }
        }
        setExpandedFolders(newExpanded);
    }, [expandedFolders, folderChildren]);

    const selectFolder = useCallback(async (folder) => {
        setSelectedFolder(folder);
        setFolderContents({ data: null, isLoading: true });
        try {
            const contents = await api.getFolderContents(folder.id);
            setFolderContents({ data: contents, isLoading: false });
        } catch (error) {
            console.error(`Error loading contents for folder ${folder.id}:`, error);
            setFolderContents({ data: null, isLoading: false });
        }
    }, []);

    // **KEY CHANGE**: Recursive rendering function inside the main component
    const renderFolderTree = (folderList, level = 0) => {
        return folderList.map(folder => (
            <React.Fragment key={folder.id}>
                <FolderNode
                    folder={folder}
                    level={level}
                    onToggle={toggleFolder}
                    onSelect={selectFolder}
                    // Props are now correctly derived from the central state
                    isExpanded={expandedFolders.has(folder.id)}
                    isSelected={selectedFolder?.id === folder.id}
                    isLoading={loadingFolders.has(folder.id)}
                />
                {/* Recursively render children if the folder is expanded and children exist */}
                {expandedFolders.has(folder.id) && folderChildren[folder.id] && (
                    renderFolderTree(folderChildren[folder.id], level + 1)
                )}
            </React.Fragment>
        ));
    };

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

    return (
        <div className="bg-gray-900 text-gray-200 p-4 rounded-lg border border-gray-700 font-mono">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Folder Tree */}
                <div>
                    <h3 className="text-lg font-semibold mb-3 text-green-400 border-b border-gray-700 pb-2">
                        📁 Folder Tree
                    </h3>
                    <div className="bg-gray-800 rounded border border-gray-600 p-2 max-h-96 overflow-y-auto">
                        {folders.length === 0 ? (
                            <div className="text-gray-400 text-center py-4">No folders found</div>
                        ) : (
                            renderFolderTree(folders)
                        )}
                    </div>
                </div>

                {/* Folder Contents */}
                <div>
                    <h3 className="text-lg font-semibold mb-3 text-green-400 border-b border-gray-700 pb-2">
                        📄 Contents
                    </h3>
                    <div className="bg-gray-800 rounded border border-gray-600 p-3 max-h-96 overflow-y-auto">
                        {selectedFolder ? (
                            <div>
                                <div className="text-yellow-400 font-semibold mb-3">
                                    {selectedFolder.name}/
                                </div>
                                {folderContents.isLoading ? (
                                    <div className="flex items-center text-gray-400">
                                        <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Loading contents...
                                    </div>
                                ) : folderContents.data ? (
                                    <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto">
                                        {JSON.stringify(folderContents.data, null, 2)}
                                    </pre>
                                ) : (
                                    <div className="text-gray-400">No contents found or failed to load.</div>
                                )}
                            </div>
                        ) : (
                            <div className="text-gray-400 text-center py-8">
                                Select a folder to view its contents
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status bar */}
            <div className="mt-4 text-xs text-gray-500 border-t border-gray-700 pt-2">
                {selectedFolder ? `Selected: ${selectedFolder.name}` : 'No folder selected'} |
                Folders loaded: {folders.length} |
                Expanded: {expandedFolders.size}
            </div>
        </div>
    );
};

export default FolderTree;