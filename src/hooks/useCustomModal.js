import { useState } from 'react';

export function useCustomModal() {
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: 'alert',
        title: '',
        message: '',
        confirmText: 'OK',
        cancelText: 'No',
        onConfirm: null,
        onCancel: null,
        onFileSelect: null,
        inputValue: '',
        inputPlaceholder: '',
        inputType: 'text'
    });

    const closeModal = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
        if (modalState.onCancel) {
            modalState.onCancel();
        }
    };

    const showAlert = (message, title = '', confirmText = 'OK') => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                type: 'alert',
                title,
                message,
                confirmText,
                cancelText: 'No',
                onConfirm: () => resolve(true),
                onCancel: () => resolve(true),
                onFileSelect: null,
                inputValue: '',
                inputPlaceholder: '',
                inputType: 'text'
            });
        });
    };

    const showConfirm = (message, title = '', confirmText = 'Yes', cancelText = 'No') => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                type: 'confirm',
                title,
                message,
                confirmText,
                cancelText,
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false),
                onFileSelect: null,
                inputValue: '',
                inputPlaceholder: '',
                inputType: 'text'
            });
        });
    };

    const showInput = (message, title = '', confirmText = 'OK', cancelText = 'No', placeholder = '', inputType = 'text') => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                type: 'input',
                title,
                message,
                confirmText,
                cancelText,
                inputValue: '',
                inputPlaceholder: placeholder,
                inputType,
                onConfirm: (value) => resolve(value),
                onCancel: () => resolve(null),
                onFileSelect: null
            });
        });
    };

    const showFileUpload = (message, title = '', cancelText = 'No') => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                type: 'file',
                title,
                message,
                confirmText: '',
                cancelText,
                inputValue: '',
                inputPlaceholder: '',
                inputType: 'text',
                onConfirm: () => resolve(null),
                onCancel: () => resolve(null),
                onFileSelect: (event) => {
                    const file = event.target.files[0];
                    if (file) {
                        setModalState(prev => ({ ...prev, isOpen: false }));
                        resolve(file);
                    }
                }
            });
        });
    };

    const handleConfirm = () => {
        if (modalState.onConfirm) {
            modalState.onConfirm(modalState.inputValue);
        }
        setModalState(prev => ({ ...prev, isOpen: false }));
    };

    const updateInputValue = (value) => {
        setModalState(prev => ({ ...prev, inputValue: value }));
    };

    return {
        modalState,
        closeModal,
        showAlert,
        showConfirm,
        showInput,
        showFileUpload,
        handleConfirm,
        updateInputValue
    };
} 