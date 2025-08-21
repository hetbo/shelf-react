// In src/components/StatusBar/StatusBar.jsx
import React from 'react';
import { ChevronRight } from 'lucide-react';

const StatusBar = ({ selectedFolder, selectedItem, breadcrumbPath, onBreadcrumbClick }) => {
    return (
        <div className="flex items-center justify-between mt-4 text-xs text-gray-500 border-t border-gray-700 pt-2">
            {/* Left Side: Status Info */}
            <div>
                <span>{selectedFolder ? `Viewing: ${selectedFolder.name}` : 'No folder selected'}</span>
                <span className="mx-2">|</span>
                <span>{selectedItem ? `Selected: ${selectedItem.name || selectedItem.filename}` : 'No item selected'}</span>
            </div>

            {/* Right Side: Breadcrumbs */}
            <div className="flex items-center">
                {breadcrumbPath.map((item, index) => (
                    <React.Fragment key={item.id}>
                        {/* Don't make the last item in the path a link */}
                        {index < breadcrumbPath.length - 1 ? (
                            <button
                                onClick={() => onBreadcrumbClick(item)}
                                className="hover:text-green-400 hover:underline"
                            >
                                {item.name}
                            </button>
                        ) : (
                            <span className="text-gray-300">{item.name || item.filename}</span>
                        )}

                        {index < breadcrumbPath.length - 1 && (
                            <ChevronRight size={14} className="mx-1 text-gray-600" />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default StatusBar;