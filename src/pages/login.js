import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../data";
import { getApiUrl } from "../utils/apiConfig";

export default function Login() {
    const navigate = useNavigate();
    const { loggedin, login } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [authProcessed, setAuthProcessed] = useState(false);
    
    // Form states
    const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'verify'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        otp: ''
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (loggedin) {
            navigate('/', { replace: true });
            return;
        }

        const existingUser = localStorage.getItem("wallet.user.name");
        if (existingUser && !loggedin) {
            const userData = {
                name: localStorage.getItem("wallet.user.name"),
                email: localStorage.getItem("wallet.user.email"),
                picture: localStorage.getItem("wallet.user.picture"),
                id: localStorage.getItem("wallet.user.id")
            };
            login(userData);
            return;
        }

        const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
        const authParam = hashParams.get('auth');
        const authSuccess = authParam && authParam.startsWith('success');

        if (authSuccess && !authProcessed) {
            setAuthProcessed(true);
            handleAuthSuccess();
        }
    }, []);

    const fetchAndSyncWalletData = async () => {
        try {
            // alert("Syncing wallet data... This may take a moment.");
            const response = await fetch(getApiUrl('/wallet'), {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Wallet data fetched:', data);
                if (data.success && data.walletData) {
                    localStorage.setItem("wallet.user.onlineBalance", data.walletData.onlineBalance.toString());
                    localStorage.setItem("wallet.user.offlineBalance", data.walletData.offlineBalance.toString());
                    localStorage.setItem("wallet.user.onlineSpent", data.walletData.onlineSpent.toString());
                    localStorage.setItem("wallet.user.offlineSpent", data.walletData.offlineSpent.toString());
                    localStorage.setItem("wallet.user.saving", data.walletData.saving.toString());
                    localStorage.setItem("wallet.user.data", JSON.stringify(data.walletData.transactions || []));
                }
            }
        } catch (error) {
            // Continue with defaults if wallet sync fails
        }
    };

    const handleAuthSuccess = async () => {
        setLoading(true);
        // alert('getApiUr sususu l'+getApiUrl('/auth/user'));
        // alert("Authentication successful! Syncing your wallet data...");
        
        try {

            // alert('getApiUr sususu l'+getApiUrl('/auth/user'));   
            const response = await fetch(getApiUrl('/auth/user'), {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            console.log('Auth response:', response);
            if (!response.ok) {
                throw new Error('Authentication failed');
            }
            
            const data = await response.json();
            
            if (data.success && data.user) {
                localStorage.setItem("wallet.user.name", data.user.name);
                localStorage.setItem("wallet.user.email", data.user.email);
                localStorage.setItem("wallet.user.picture", data.user.picture);
                localStorage.setItem("wallet.user.id", data.user.id);
                localStorage.setItem("wallet.user.googleId", data.user.googleId);
                
                const walletDefaults = {
                    "wallet.user.data": "[]",
                    "wallet.user.onlineBalance": "0",
                    "wallet.user.offlineBalance": "0",
                    "wallet.user.saving": "0",
                    "wallet.user.onlineSpent": "0",
                    "wallet.user.offlineSpent": "0"
                };
                
                Object.entries(walletDefaults).forEach(([key, defaultValue]) => {
                    
                        localStorage.setItem(key, defaultValue);
                    
                });
                
                await fetchAndSyncWalletData();
                
                login(data.user);
                window.history.replaceState({}, document.title, window.location.pathname);
                navigate('/', { replace: true });
                
            } else {
                throw new Error('Invalid user data received');
            }
        } catch (error) {
            window.history.replaceState({}, document.title, window.location.pathname);
            setAuthProcessed(false);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleEmailRegister = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(getApiUrl('/auth/email/register'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (data.success) {
                setMessage(data.message || 'Registration successful! Please check your email for verification code.');
                setAuthMode('verify');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch(getApiUrl('/auth/email/login'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (data.success) {
                // Store user data
                localStorage.setItem("wallet.user.name", data.user.name);
                localStorage.setItem("wallet.user.email", data.user.email);
                localStorage.setItem("wallet.user.picture", data.user.picture || '');
                localStorage.setItem("wallet.user.id", data.user.id);
                
                // Initialize wallet defaults
                const walletDefaults = {
                    "wallet.user.data": "[]",
                    "wallet.user.onlineBalance": "0",
                    "wallet.user.offlineBalance": "0",
                    "wallet.user.saving": "0",
                    "wallet.user.onlineSpent": "0",
                    "wallet.user.offlineSpent": "0"
                };
                
                Object.entries(walletDefaults).forEach(([key, defaultValue]) => {
                    if (!localStorage.getItem(key)) {
                        localStorage.setItem(key, defaultValue);
                    }
                });

                await fetchAndSyncWalletData();
                login(data.user);
                navigate('/', { replace: true });
            } else {
                if (data.needsVerification) {
                    setAuthMode('verify');
                    setMessage('Please verify your email first.');
                } else if (data.suggestPasswordSetup) {
                    setError(data.message + ' You can also register to set up a password for this email.');
                } else {
                    setError(data.message || 'Login failed');
                }
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOTPVerification = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch(getApiUrl('/auth/email/verify-otp'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: formData.email,
                    otp: formData.otp
                })
            });

            const data = await response.json();

            if (data.success) {
                // Store user data
                localStorage.setItem("wallet.user.name", data.user.name);
                localStorage.setItem("wallet.user.email", data.user.email);
                localStorage.setItem("wallet.user.picture", data.user.picture || '');
                localStorage.setItem("wallet.user.id", data.user.id);
                
                // Initialize wallet defaults
                const walletDefaults = {
                    "wallet.user.data": "[]",
                    "wallet.user.onlineBalance": "0",
                    "wallet.user.offlineBalance": "0",
                    "wallet.user.saving": "0",
                    "wallet.user.onlineSpent": "0",
                    "wallet.user.offlineSpent": "0"
                };
                
                Object.entries(walletDefaults).forEach(([key, defaultValue]) => {
                    if (!localStorage.getItem(key)) {
                        localStorage.setItem(key, defaultValue);
                    }
                });

                await fetchAndSyncWalletData();
                login(data.user);
                navigate('/', { replace: true });
            } else {
                setError(data.message || 'Verification failed');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch(getApiUrl('/auth/email/resend-otp'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: formData.email
                })
            });

            const data = await response.json();

            if (data.success) {
                setMessage('New verification code sent to your email.');
            } else {
                setError(data.message || 'Failed to resend OTP');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = getApiUrl('/auth/google');
    };

    if (loading) {
        return (
            <div className="row login">
                <div className="col-10 col-lg-4 login_heading">
                    <span className="login_head">Dark Wallet</span>
                </div>
                <div className="col-10 col-lg-5 g-5 login_box">
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2">
                            {authMode === 'verify' ? 'Verifying...' : 'Authenticating and syncing data...'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="row login">
            <div className="col-10 col-lg-4 login_heading">
                <span className="login_head">Dark Wallet</span>
            </div>
            <div id="login_box" className="col-10 col-lg-5 g-5 login_box">
                <div className="mb-4 text-center">
                    <h4>Welcome to Dark Wallet</h4>
                    <p className="form-text">
                        {authMode === 'register' && 'Create your account'}
                        {authMode === 'login' && 'Sign in to your account'}
                        {authMode === 'verify' && 'Verify your email address'}
                    </p>
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="alert alert-success" role="alert">
                        {message}
                    </div>
                )}

                <button 
                    type="button" 
                    onClick={handleGoogleLogin} 
                    className="btn w-100 mb-3 google-oauth-btn"
                    style={{
                        background: '#ffffff !important',
                        backgroundColor: '#ffffff !important',
                        border: '2px solid #ffffff',
                        color: '#374151 !important',
                        height: '48px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = '#f9fafb !important';
                        e.target.style.backgroundColor = '#f9fafb !important';
                        e.target.style.borderColor = '#ffffff';
                        e.target.style.color = '#374151';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = '#ffffff !important';
                        e.target.style.backgroundColor = '#ffffff !important';
                        e.target.style.borderColor = '#ffffff';
                        e.target.style.color = '#374151';
                    }}
                >
                    <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 48 48" 
                        style={{ marginRight: '8px' }}
                    >
                        <path 
                            fill="#FFC107" 
                            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                        />
                        <path 
                            fill="#FF3D00" 
                            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                        />
                        <path 
                            fill="#4CAF50" 
                            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                        />
                        <path 
                            fill="#1976D2" 
                            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                        />
                    </svg>
                    Continue with Google
                </button>

                <div className="text-center mb-3">
                    <span>OR</span>
                </div>

                {authMode === 'login' && (
                    <form onSubmit={handleEmailLogin}>
                        <div className="mb-3">
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100 mb-3">
                            Sign In
                        </button>
                    </form>
                )}

                {authMode === 'register' && (
                    <form onSubmit={handleEmailRegister}>
                        <div className="mb-3">
                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                placeholder="Full name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="Password (min 6 characters)"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="password"
                                name="confirmPassword"
                                className="form-control"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100 mb-3">
                            Create Account
                        </button>
                    </form>
                )}

                {authMode === 'verify' && (
                    <form onSubmit={handleOTPVerification}>
                        <div className="mb-3">
                            <input
                                type="text"
                                name="otp"
                                className="form-control text-center"
                                placeholder="Enter 6-digit verification code"
                                value={formData.otp}
                                onChange={handleInputChange}
                                maxLength="6"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100 mb-3">
                            Verify Email
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-link w-100 mb-3" 
                            onClick={handleResendOTP}
                        >
                            Resend verification code
                        </button>
                    </form>
                )}
                
                <div className="text-center">
                    {authMode === 'login' && (
                        <button 
                            type="button" 
                            className="btn btn-link" 
                            onClick={() => setAuthMode('register')}
                        >
                            Don't have an account? Sign up
                        </button>
                    )}
                    {authMode === 'register' && (
                        <button 
                            type="button" 
                            className="btn btn-link" 
                            onClick={() => setAuthMode('login')}
                        >
                            Already have an account? Sign in
                        </button>
                    )}
                    {authMode === 'verify' && (
                        <button 
                            type="button" 
                            className="btn btn-link" 
                            onClick={() => setAuthMode('login')}
                        >
                            Back to sign in
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}