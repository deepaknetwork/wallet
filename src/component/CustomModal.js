import React from 'react';

export default function CustomModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    type = 'alert', // 'alert', 'confirm', 'input', or 'file'
    confirmText = 'OK',
    cancelText = 'Cancel',
    inputValue = '',
    onInputChange,
    inputPlaceholder = '',
    inputType = 'text',
    onFileSelect
}) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        if (onConfirm) onConfirm(inputValue);
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <div className="custom-modal-overlay" onClick={handleCancel}>
            <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
                <div className="custom-modal-header">
                    <h3 className="custom-modal-brand">Dark Wallet</h3>
                    <button className="custom-modal-close" onClick={handleCancel}>×</button>
                </div>
                
                <div className="custom-modal-body">
                    {title && <h4 className="custom-modal-title">{title}</h4>}
                    <p className="custom-modal-message">{message}</p>
                    {type === 'input' && (
                        <input
                            type={inputType}
                            value={inputValue}
                            onChange={(e) => onInputChange && onInputChange(e.target.value)}
                            placeholder={inputPlaceholder}
                            className="custom-modal-input"
                            autoFocus
                        />
                    )}
                    {type === 'file' && (
                        <div className="custom-modal-file-container">
                            <input
                                type="file"
                                accept=".json"
                                onChange={(e) => onFileSelect && onFileSelect(e)}
                                className="custom-modal-file-input"
                                id="modal-file-input"
                            />
                            <label htmlFor="modal-file-input" className="custom-modal-file-label">
                                <span className="custom-modal-file-icon">📁</span>
                                <span className="custom-modal-file-text">Choose JSON File</span>
                            </label>
                            <p className="custom-modal-file-hint">Select a wallet backup file (.json)</p>
                        </div>
                    )}
                </div>
                
                <div className="custom-modal-footer">
                    {type === 'confirm' || type === 'input' || type === 'file' ? (
                        <>
                            <button 
                                className="custom-modal-btn custom-modal-btn-cancel" 
                                onClick={handleCancel}
                            >
                                {cancelText}
                            </button>
                            {type !== 'file' && (
                                <button 
                                    className="custom-modal-btn custom-modal-btn-confirm" 
                                    onClick={handleConfirm}
                                    disabled={type === 'input' && (!inputValue || inputValue.trim() === '')}
                                >
                                    {confirmText}
                                </button>
                            )}
                        </>
                    ) : (
                        <button 
                            className="custom-modal-btn custom-modal-btn-confirm" 
                            onClick={handleConfirm}
                        >
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
} 