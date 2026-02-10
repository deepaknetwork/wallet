import React, { useState, useEffect } from 'react';
import { useCustomModal } from '../hooks/useCustomModal';
import CustomModal from './CustomModal';
import { authenticatedFetch } from '../utils/authUtils';
import { getApiUrl } from '../utils/apiConfig';

const PendingTransactionsModal = ({ isOpen, onClose, onApprove, onReject, onEdit }) => {
    const [pendingTransactions, setPendingTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    
    // Get categories from localStorage
    const getCategories = () => {
        const storedCategories = localStorage.getItem("wallet.user.categories");
        return storedCategories ? JSON.parse(storedCategories) : ["Food", "Snacks", "Family", "Travel"];
    };
    const categories = getCategories();
    
    // Custom modal hook for editing
    const { modalState, closeModal, showAlert, showConfirm, showInput, handleConfirm, updateInputValue } = useCustomModal();

    // Fetch pending transactions when modal opens and handle body scroll lock
    useEffect(() => {
        if (isOpen) {
            fetchPendingTransactions();
            
            // Store current scroll position for mobile
            const scrollY = window.scrollY;
            
            // Set CSS custom property for viewport height (for iOS Safari)
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
            
            // Prevent body scrolling when modal is open
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.height = '100%';
            document.body.style.top = `-${scrollY}px`;
            
            // Also disable scrolling on html element for better mobile support
            document.documentElement.style.overflow = 'hidden';
            document.documentElement.style.position = 'relative';
            document.documentElement.style.height = '100%';
            
            // Hide overflow on home page specifically
            const homeElement = document.querySelector('.home');
            if (homeElement) {
                homeElement.style.setProperty('overflow-y', 'hidden', 'important');
            }
        } else {
            // Get the stored scroll position
            const scrollY = parseInt(document.body.style.top || '0') * -1;
            
            // Restore body scrolling when modal is closed
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
            document.body.style.top = '';
            
            document.documentElement.style.overflow = '';
            document.documentElement.style.position = '';
            document.documentElement.style.height = '';
            
            // Restore home page overflow
            const homeElement = document.querySelector('.home');
            if (homeElement) {
                homeElement.style.removeProperty('overflow-y');
            }
            
            // Restore scroll position
            window.scrollTo(0, scrollY);
        }
        
        // Cleanup on unmount
        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
            document.body.style.top = '';
            
            document.documentElement.style.overflow = '';
            document.documentElement.style.position = '';
            document.documentElement.style.height = '';
            
            // Cleanup home page overflow on unmount
            const homeElement = document.querySelector('.home');
            if (homeElement) {
                homeElement.style.removeProperty('overflow-y');
            }
        };
    }, [isOpen]);

    const fetchPendingTransactions = async () => {
        try {
            setLoading(true);
            const response = await authenticatedFetch(getApiUrl('/external/pending'), {
                method: 'GET'
            });
            
            // If response is null, it means we were logged out due to 401
            if (!response) return;
            
            if (response.ok) {
                const data = await response.json();
                setPendingTransactions(data.pendingTransactions || []);
            } else {
                console.error('Failed to fetch pending transactions');
            }
        } catch (error) {
            console.error('Error fetching pending transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (transactionId) => {
        try {
            const response = await authenticatedFetch(getApiUrl(`/external/approve/${transactionId}`), {
                method: 'POST'
            });
            
            // If response is null, it means we were logged out due to 401
            if (!response) return;
            
            const data = await response.json();
            
            if (response.ok) {
                fetchPendingTransactions();
                if (onApprove) onApprove();
            } else {
                await showAlert(`❌ Failed to approve expense: ${data.message}`, "Error");
            }
        } catch (error) {
            await showAlert("❌ Error approving expense. Please check your connection.", "Error");
            console.error('Error approving transaction:', error);
        }
    };

    const handleReject = async (transactionId, transactionItem) => {
        try {
            const response = await authenticatedFetch(getApiUrl(`/external/pending/${transactionId}`), {
                method: 'DELETE'
            });
            
            // If response is null, it means we were logged out due to 401
            if (!response) return;
            
            const data = await response.json();
            
            if (response.ok) {
                fetchPendingTransactions();
                if (onReject) onReject();
            } else {
                await showAlert(`❌ Failed to reject expense: ${data.message}`, "Error");
            }
        } catch (error) {
            await showAlert("❌ Error rejecting expense. Please check your connection.", "Error");
            console.error('Error rejecting transaction:', error);
        }
    };

    const handleEditStart = (transaction) => {
        setEditingTransaction({
            ...transaction,
            originalPrice: transaction.price,
            originalItem: transaction.item,
            originalMedium: transaction.medium,
            originalCategory: transaction.category
        });
    };

    const handleEditSave = async () => {
        if (!editingTransaction) return;

        const updatedFields = {};
        if (editingTransaction.item !== editingTransaction.originalItem) {
            updatedFields.purpose = editingTransaction.item;
        }
        if (editingTransaction.price !== editingTransaction.originalPrice) {
            updatedFields.amount = editingTransaction.price;
        }
        if (editingTransaction.medium !== editingTransaction.originalMedium) {
            updatedFields.medium = editingTransaction.medium;
        }
        if (editingTransaction.category !== editingTransaction.originalCategory) {
            updatedFields.category = editingTransaction.category;
        }

        if (Object.keys(updatedFields).length === 0) {
            setEditingTransaction(null);
            return;
        }

        try {
            const response = await authenticatedFetch(getApiUrl(`/external/pending/${editingTransaction.id}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedFields)
            });
            
            // If response is null, it means we were logged out due to 401
            if (!response) return;
            
            const data = await response.json();
            
            if (response.ok) {
                fetchPendingTransactions();
                setEditingTransaction(null);
                if (onEdit) onEdit();
            } else {
                await showAlert(`❌ Failed to update expense: ${data.message}`, "Error");
            }
        } catch (error) {
            await showAlert("❌ Error updating expense. Please check your connection.", "Error");
            console.error('Error updating transaction:', error);
        }
    };

    const handleEditCancel = () => {
        setEditingTransaction(null);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };

    if (!isOpen) return null;

    return (
        <>
            <div 
                className="custom-modal-overlay"
                onClick={(e) => {
                    // Close modal when clicking on overlay (not on modal content)
                    if (e.target === e.currentTarget) {
                        onClose();
                    }
                }}
                style={{
                    padding: '20px',
                    boxSizing: 'border-box',
                    backdropFilter: 'blur(1px)',
                    WebkitBackdropFilter: 'blur(1px)',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)'
                }}>
                <div className="custom-modal" style={{
                    width: '100%',
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    margin: 'auto'
                }}>
                    {/* Header */}
                    <div className="custom-modal-header">
                        <h3 className="custom-modal-title">Pending Expenses</h3>
                        <button
                            onClick={onClose}
                            className="custom-modal-close"
                            title="Close"
                        >
                            ×
                        </button>
                    </div>

                    {/* Content */}
                    <div className="custom-modal-body" style={{
                        overflowY: 'auto',
                        flex: 1,
                        minHeight: 0
                    }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--modal_text)' }}>
                                <div style={{ fontSize: '0.95rem' }}>Loading...</div>
                            </div>
                        ) : pendingTransactions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--modal_text)' }}>
                                <div style={{ fontSize: '0.95rem', marginBottom: '8px' }}>No pending expenses</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--modal_text)', opacity: '0.7' }}>New submissions will appear here</div>
                            </div>
                        ) : (
                            <div>
                                {pendingTransactions.map((transaction) => (
                                    <div key={transaction.id} style={{
                                        border: '1px solid var(--modal_border)',
                                        borderRadius: '6px',
                                        padding: '12px',
                                        marginBottom: '8px',
                                        backgroundColor: 'var(--modal_input_bg)'
                                    }}>
                                        {editingTransaction && editingTransaction.id === transaction.id ? (
                                            // Edit Mode
                                            <div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '8px', marginBottom: '8px' }}>
                                                    <input
                                                        type="text"
                                                        value={editingTransaction.item}
                                                        onChange={(e) => setEditingTransaction({...editingTransaction, item: e.target.value})}
                                                        placeholder="Purpose"
                                                        style={{
                                                            padding: '6px 8px',
                                                            border: '1px solid var(--modal_border)',
                                                            borderRadius: '4px',
                                                            fontSize: '0.85rem',
                                                            backgroundColor: 'var(--modal_input_bg)',
                                                            color: 'var(--modal_text)'
                                                        }}
                                                    />
                                                    <input
                                                        type="number"
                                                        value={editingTransaction.price}
                                                        onChange={(e) => setEditingTransaction({...editingTransaction, price: parseInt(e.target.value) || 0})}
                                                        placeholder="Amount"
                                                        style={{
                                                            padding: '6px 8px',
                                                            border: '1px solid var(--modal_border)',
                                                            borderRadius: '4px',
                                                            fontSize: '0.85rem',
                                                            backgroundColor: 'var(--modal_input_bg)',
                                                            color: 'var(--modal_text)'
                                                        }}
                                                    />
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                                    <select
                                                        value={editingTransaction.medium}
                                                        onChange={(e) => setEditingTransaction({...editingTransaction, medium: e.target.value})}
                                                        style={{
                                                            padding: '6px 8px',
                                                            border: '1px solid var(--modal_border)',
                                                            borderRadius: '4px',
                                                            fontSize: '0.85rem',
                                                            backgroundColor: 'var(--modal_input_bg)',
                                                            color: 'var(--modal_text)'
                                                        }}
                                                    >
                                                        <option value="Online">Online</option>
                                                        <option value="Offline">Offline</option>
                                                    </select>
                                                    <select
                                                        value={editingTransaction.category}
                                                        onChange={(e) => setEditingTransaction({...editingTransaction, category: e.target.value})}
                                                        style={{
                                                            padding: '6px 8px',
                                                            border: '1px solid var(--modal_border)',
                                                            borderRadius: '4px',
                                                            fontSize: '0.85rem',
                                                            backgroundColor: 'var(--modal_input_bg)',
                                                            color: 'var(--modal_text)'
                                                        }}
                                                    >
                                                        <option value="">No Category</option>
                                                        {categories.map((category, index) => (
                                                            <option key={index} value={category}>{category}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button
                                                        onClick={handleEditSave}
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: 'var(--modal_confirm_bg)',
                                                            color: 'var(--modal_confirm_text)',
                                                            border: '1px solid var(--modal_confirm_border)',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={handleEditCancel}
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: 'transparent',
                                                            color: 'var(--modal_cancel_text)',
                                                            border: '1px solid var(--modal_cancel_border)',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            // View Mode
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '2px', color: 'var(--modal_text)' }}>{transaction.item}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--modal_text)', opacity: '0.8' }}>
                                                        <span style={{ fontWeight: 'bold' }}>₹{transaction.price}</span>
                                                        <span> • {transaction.medium}</span>
                                                        {transaction.category && <span> • {transaction.category}</span>}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--modal_text)', opacity: '0.6', marginTop: '2px' }}>
                                                        {transaction.sourceKeyName} • {formatDate(transaction.createdAt)}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
                                                    <button
                                                        onClick={() => handleApprove(transaction.id)}
                                                        style={{
                                                            padding: '8px',
                                                            backgroundColor: '#28a745',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            minWidth: '32px',
                                                            height: '32px'
                                                        }}
                                                        title="Approve"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                            <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditStart(transaction)}
                                                        style={{
                                                            padding: '8px',
                                                            backgroundColor: '#007bff',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            minWidth: '32px',
                                                            height: '32px'
                                                        }}
                                                        title="Edit"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                                            <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(transaction.id, transaction.item)}
                                                        style={{
                                                            padding: '8px',
                                                            backgroundColor: '#dc3545',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            minWidth: '32px',
                                                            height: '32px'
                                                        }}
                                                        title="Delete"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                            <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom Modal for confirmations */}
            <CustomModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                onConfirm={handleConfirm}
                title={modalState.title}
                message={modalState.message}
                type={modalState.type}
                confirmText={modalState.confirmText}
                cancelText={modalState.cancelText}
                inputValue={modalState.inputValue}
                onInputChange={updateInputValue}
                inputPlaceholder={modalState.inputPlaceholder}
                inputType={modalState.inputType}
                onFileSelect={modalState.onFileSelect}
            />
        </>
    );
};

export default PendingTransactionsModal; 