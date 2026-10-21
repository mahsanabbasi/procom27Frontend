import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, AlertCircle } from 'lucide-react';
export const AuthModal = ({ isOpen, initialMode = 'login', onClose, onSuccess, }) => {
    const [mode, setMode] = useState(initialMode);
    const { login, register } = useAuth();
    // Login fields
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    // Register fields
    const [fullName, setFullName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [university, setUniversity] = useState('FAST-NUCES');
    const [cnicOrStudentId, setCnicOrStudentId] = useState('');
    const [referralCode, setReferralCode] = useState('');
    // Status
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    if (!isOpen)
        return null;
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        setLoading(true);
        const res = await login(loginEmail, loginPassword);
        setLoading(false);
        if (res.success) {
            onSuccess();
            onClose();
        }
        else {
            setErrorMsg(res.message || 'Login failed. Please check your credentials.');
        }
    };
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        if (regPassword.length < 8) {
            setErrorMsg('Password must be at least 8 characters long');
            return;
        }
        setLoading(true);
        const res = await register({
            fullName,
            email: regEmail,
            password: regPassword,
            phone: phone || undefined,
            university: university || 'FAST-NUCES',
            cnicOrStudentId: cnicOrStudentId || undefined,
            referralCode: referralCode || undefined,
        });
        setLoading(false);
        if (res.success) {
            onSuccess();
            onClose();
        }
        else {
            setErrorMsg(res.message || 'Registration failed. Please check your details.');
        }
    };
    return (<div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            background: 'rgba(5, 6, 12, 0.88)',
            backdropFilter: 'blur(8px)',
        }} onClick={onClose}>
      <div className="pixel-card" style={{
            width: '100%',
            maxWidth: '480px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px 24px',
            position: 'relative',
        }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '12px',
            color: '#B995E6',
        }}>
            {mode === 'login' ? '>> PLAYER LOGIN' : '>> NEW PLAYER REGISTRATION'}
          </div>
          <button type="button" onClick={onClose} style={{
            background: 'none',
            border: 'none',
            color: 'rgba(238,240,248,.6)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
        }} onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(238,240,248,.6)')}>
            <X size={18}/>
          </button>
        </div>

        {/* Mode Toggle */}
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginBottom: '20px',
            background: 'rgba(0,0,0,0.5)',
            padding: '4px',
        }}>
          <button type="button" onClick={() => {
            setMode('login');
            setErrorMsg(null);
        }} style={{
            padding: '10px',
            background: mode === 'login' ? '#B995E6' : 'transparent',
            color: mode === 'login' ? '#0D0B12' : 'rgba(238,240,248,.7)',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '9px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
        }}>
            LOGIN
          </button>
          <button type="button" onClick={() => {
            setMode('register');
            setErrorMsg(null);
        }} style={{
            padding: '10px',
            background: mode === 'register' ? '#B995E6' : 'transparent',
            color: mode === 'register' ? '#0D0B12' : 'rgba(238,240,248,.7)',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '9px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
        }}>
            REGISTER
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (<div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px 14px',
                marginBottom: '16px',
                background: 'rgba(255, 79, 209, 0.15)',
                border: '1px solid #FF4FD1',
                color: '#FF4FD1',
                fontSize: '12px',
                lineHeight: 1.4,
            }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }}/>
            <span>{errorMsg}</span>
          </div>)}

        {/* Forms */}
        {mode === 'login' ? (<form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '10px',
                fontFamily: "'Press Start 2P', monospace",
                color: 'rgba(238,240,248,.7)',
            }}>
                EMAIL
              </label>
              <input type="email" required className="pixel-input" placeholder="player1@procom27.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}/>
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '10px',
                fontFamily: "'Press Start 2P', monospace",
                color: 'rgba(238,240,248,.7)',
            }}>
                PASSWORD
              </label>
              <input type="password" required className="pixel-input" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}/>
            </div>
            <button type="submit" disabled={loading} className="pixel-btn-primary" style={{
                width: '100%',
                justifyContent: 'center',
                marginTop: '10px',
                opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'AUTHENTICATING...' : '▶ PRESS START TO ENTER'}
            </button>
          </form>) : (<form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '9px',
                fontFamily: "'Press Start 2P', monospace",
                color: 'rgba(238,240,248,.7)',
            }}>
                FULL NAME *
              </label>
              <input type="text" required className="pixel-input" placeholder="Ali Khan" value={fullName} onChange={(e) => setFullName(e.target.value)}/>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '9px',
                fontFamily: "'Press Start 2P', monospace",
                color: 'rgba(238,240,248,.7)',
            }}>
                EMAIL *
              </label>
              <input type="email" required className="pixel-input" placeholder="k23xxxx@nu.edu.pk" value={regEmail} onChange={(e) => setRegEmail(e.target.value)}/>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '9px',
                fontFamily: "'Press Start 2P', monospace",
                color: 'rgba(238,240,248,.7)',
            }}>
                PASSWORD (MIN 8 CHARS) *
              </label>
              <input type="password" required minLength={8} className="pixel-input" placeholder="••••••••" value={regPassword} onChange={(e) => setRegPassword(e.target.value)}/>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '9px',
                fontFamily: "'Press Start 2P', monospace",
                color: 'rgba(238,240,248,.7)',
            }}>
                  UNIVERSITY
                </label>
                <input type="text" className="pixel-input" placeholder="FAST-NUCES" value={university} onChange={(e) => setUniversity(e.target.value)}/>
              </div>

              <div>
                <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '9px',
                fontFamily: "'Press Start 2P', monospace",
                color: 'rgba(238,240,248,.7)',
            }}>
                  PHONE NUMBER
                </label>
                <input type="tel" className="pixel-input" placeholder="+92 300 1234567" value={phone} onChange={(e) => setPhone(e.target.value)}/>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '9px',
                fontFamily: "'Press Start 2P', monospace",
                color: 'rgba(238,240,248,.7)',
            }}>
                  STUDENT ID / CNIC
                </label>
                <input type="text" className="pixel-input" placeholder="23K-1234" value={cnicOrStudentId} onChange={(e) => setCnicOrStudentId(e.target.value)}/>
              </div>

              <div>
                <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '9px',
                fontFamily: "'Press Start 2P', monospace",
                color: 'rgba(238,240,248,.7)',
            }}>
                  REFERRAL CODE (OPTIONAL)
                </label>
                <input type="text" className="pixel-input" placeholder="CA-HAMZA-123" value={referralCode} onChange={(e) => setReferralCode(e.target.value)}/>
              </div>
            </div>

            <button type="submit" disabled={loading} className="pixel-btn-primary" style={{
                width: '100%',
                justifyContent: 'center',
                marginTop: '10px',
                opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'CREATING ACCOUNT...' : '▶ JOIN PROCOM27 (INSERT COIN)'}
            </button>
          </form>)}
      </div>
    </div>);
};
