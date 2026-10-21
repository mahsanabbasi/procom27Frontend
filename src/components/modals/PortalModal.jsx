import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { X, AlertTriangle, QrCode, Users, CreditCard, FileText, RefreshCw, KeyRound } from 'lucide-react';
export const PortalModal = ({ isOpen, onClose, onOpenCompetitions }) => {
  const { user, refreshUser } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  // Actions
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinMsg, setJoinMsg] = useState(null);
  // Payment form
  const [paymentTeamId, setPaymentTeamId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [paymentStatusMsg, setPaymentStatusMsg] = useState(null);
  // Resume form
  const [resumeDegree, setResumeDegree] = useState('');
  const [resumeCgpa, setResumeCgpa] = useState('');
  const [resumeYear, setResumeYear] = useState('2026');
  const [resumeSkills, setResumeSkills] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeMsg, setResumeMsg] = useState(null);
  // Password change
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState(null);
  const fetchDashboard = async () => {
    setLoading(true);
    const res = await api.getDashboard();
    if (res.success && res.data) {
      setDashboard(res.data);
      if (res.data.jobFairResume) {
        setResumeDegree(res.data.jobFairResume.degree || '');
        setResumeCgpa(res.data.jobFairResume.cgpa ? String(res.data.jobFairResume.cgpa) : '');
        setResumeYear(res.data.jobFairResume.graduationYear ? String(res.data.jobFairResume.graduationYear) : '2026');
        setResumeSkills(res.data.jobFairResume.skills?.join(', ') || '');
        setResumeUrl(res.data.jobFairResume.resumeUrl || '');
      }
    }
    setLoading(false);
  };
  useEffect(() => {
    if (isOpen) {
      fetchDashboard();
    }
  }, [isOpen]);
  if (!isOpen)
    return null;
  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim())
      return;
    setJoinMsg(null);
    const res = await api.joinTeam(joinCodeInput.trim().toUpperCase());
    if (res.success) {
      setJoinMsg({ text: 'Successfully joined team!', isError: false });
      setJoinCodeInput('');
      fetchDashboard();
    }
    else {
      setJoinMsg({ text: res.message || 'Failed to join team', isError: true });
    }
  };
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!paymentTeamId || !paymentAmount || !paymentRef) {
      setPaymentStatusMsg({ text: 'Please fill in all payment details', isError: true });
      return;
    }
    setPaymentStatusMsg(null);
    const res = await api.submitPayment({
      teamId: paymentTeamId,
      amount: Number(paymentAmount),
      transactionRef: paymentRef,
      proofSlipUrl: paymentProofUrl || 'https://assets.procom27.com/slips/demo-slip.jpg',
    });
    if (res.success) {
      setPaymentStatusMsg({ text: 'Payment submitted for Finance review!', isError: false });
      fetchDashboard();
    }
    else {
      setPaymentStatusMsg({ text: res.message || 'Payment submission failed', isError: true });
    }
  };
  const handleResumeSubmit = async (e) => {
    e.preventDefault();
    setResumeMsg(null);
    const skillsArray = resumeSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await api.submitResume({
      resumeUrl: resumeUrl || 'https://assets.procom27.com/resumes/demo-resume.pdf',
      degree: resumeDegree || undefined,
      cgpa: resumeCgpa ? parseFloat(resumeCgpa) : undefined,
      graduationYear: resumeYear ? parseInt(resumeYear, 10) : undefined,
      skills: skillsArray,
    });
    if (res.success) {
      setResumeMsg({ text: 'Resume details submitted to Job Fair book!', isError: false });
      fetchDashboard();
    }
    else {
      setResumeMsg({ text: res.message || 'Resume submission failed', isError: true });
    }
  };
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg(null);
    const res = await api.changePassword(currentPass, newPass);
    if (res.success) {
      setPassMsg({ text: 'Password successfully updated!', isError: false });
      setCurrentPass('');
      setNewPass('');
      refreshUser();
    }
    else {
      setPassMsg({ text: res.message || 'Failed to change password', isError: true });
    }
  };
  const activeTicket = dashboard?.registeredCompetitions.find((rc) => rc.gatePass?.qrDataUrl);
  return (<div style={{
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    background: 'rgba(5, 6, 12, 0.92)',
    backdropFilter: 'blur(10px)',
  }} onClick={onClose}>
    <div className="pixel-card" style={{
      width: '100%',
      maxWidth: '840px',
      maxHeight: '92vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      position: 'relative',
    }} onClick={(e) => e.stopPropagation()}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid rgba(185,149,230,.35)',
        paddingBottom: '16px',
        marginBottom: '16px',
      }}>
        <div>
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '12px',
            color: '#F4EEFF',
            textShadow: '0 0 10px rgba(185,149,230,.6)',
          }}>
            &gt;&gt; PARTICIPANT PORTAL [PLAYER 1]
          </div>
          <div style={{ marginTop: '6px', fontSize: '11px', color: 'rgba(238,240,248,.6)' }}>
            {user?.fullName} · {user?.university || 'FAST-NUCES'} · {user?.email}
          </div>
        </div>
        <button type="button" onClick={onClose} style={{
          background: 'none',
          border: 'none',
          color: 'rgba(238,240,248,.6)',
          cursor: 'pointer',
          padding: '6px',
        }}>
          <X size={20} />
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '18px',
        borderBottom: '1px dashed rgba(185,149,230,.25)',
        paddingBottom: '10px',
      }}>
        {[
          { id: 'overview', label: 'OVERVIEW', icon: null },
          { id: 'teams', label: 'MY TEAMS', icon: Users },
          { id: 'ticket', label: 'GATE PASS (QR)', icon: QrCode },
          { id: 'payment', label: 'PAYMENT', icon: CreditCard },
          { id: 'resume', label: 'JOB FAIR', icon: FileText },
          { id: 'security', label: 'PASSWORD', icon: KeyRound },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (<button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            background: isActive ? '#B995E6' : 'rgba(255,255,255,0.05)',
            color: isActive ? '#0D0B12' : 'rgba(238,240,248,.7)',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}>
            {tab.icon && <tab.icon size={12} />}
            {tab.label}
          </button>);
        })}
      </div>

      {/* Content Area with scroll */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '6px' }}>
        {loading ? (<div style={{ textAlign: 'center', padding: '40px', color: '#B995E6' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '9px' }}>
            LOADING PORTAL DATA...
          </div>
        </div>) : (<>
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (<div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Warning if temporary password */}
            {user?.mustChangePassword && (<div style={{
              padding: '14px',
              background: 'rgba(77, 243, 255, 0.12)',
              border: '1px solid #4DF3FF',
              color: '#4DF3FF',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <strong>Temporary Credentials Issued:</strong> You were auto-provisioned by your team leader.
                Please change your password.
              </div>
              <button type="button" onClick={() => setActiveTab('security')} className="pixel-btn-sm pixel-btn-primary" style={{ flexShrink: 0, marginLeft: '12px' }}>
                CHANGE
              </button>
            </div>)}

            {/* Badges / Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '16px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(185,149,230,0.3)' }}>
                <div style={{ fontSize: '9px', fontFamily: "'Press Start 2P', monospace", color: '#B995E6' }}>
                  TEAMS
                </div>
                <div style={{ fontSize: '24px', fontWeight: 600, color: '#F4EEFF', marginTop: '8px' }}>
                  {dashboard?.registeredCompetitions.length || 0}
                </div>
              </div>

              <div style={{ padding: '16px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(185,149,230,0.3)' }}>
                <div style={{ fontSize: '9px', fontFamily: "'Press Start 2P', monospace", color: '#4DF3FF' }}>
                  GATE PASS
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#F4EEFF', marginTop: '14px' }}>
                  {activeTicket ? 'ISSUED (CONFIRMED)' : 'PENDING PAYMENT'}
                </div>
              </div>

              <div style={{ padding: '16px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(185,149,230,0.3)' }}>
                <div style={{ fontSize: '9px', fontFamily: "'Press Start 2P', monospace", color: '#FF4FD1' }}>
                  AMBASSADOR
                </div>
                <div style={{ fontSize: '12px', color: '#F4EEFF', marginTop: '12px' }}>
                  {dashboard?.ambassadorStatus ? (<>
                    <div>{dashboard.ambassadorStatus.referralCode}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(238,240,248,.6)', marginTop: '4px' }}>
                      Points: {dashboard.ambassadorStatus.rewardPoints}
                    </div>
                  </>) : ('NOT ENROLLED')}
                </div>
              </div>
            </div>

            {/* Registered Competitions quick summary */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', fontFamily: "'Press Start 2P', monospace", color: '#B995E6' }}>
                  ACTIVE COMPETITIONS
                </div>
                <button type="button" onClick={onOpenCompetitions} style={{
                  background: 'none',
                  border: 'none',
                  color: '#4DF3FF',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}>
                  Browse Catalogue +
                </button>
              </div>

              {dashboard?.registeredCompetitions.length === 0 ? (<div style={{ padding: '24px', textAlign: 'center', background: 'rgba(0,0,0,0.3)', color: 'rgba(238,240,248,.6)' }}>
                No competitions registered yet. Join a team using a join code or register for an event!
              </div>) : (<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {dashboard?.registeredCompetitions.map((rc) => (<div key={rc.teamId} style={{
                  padding: '16px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(185,149,230,.25)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#EEF0F8', fontSize: '15px' }}>
                      {rc.competition.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(238,240,248,.6)', marginTop: '4px' }}>
                      Team: <strong>{rc.teamName}</strong> · Code: <code style={{ color: '#4DF3FF' }}>{rc.joinCode}</code> · You? {rc.teammates.length}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      fontSize: '9px',
                      fontFamily: "'Press Start 2P', monospace",
                      background: rc.teamStatus === 'CONFIRMED' ? 'rgba(77, 243, 255, 0.2)' : 'rgba(255, 79, 209, 0.2)',
                      color: rc.teamStatus === 'CONFIRMED' ? '#4DF3FF' : '#FF4FD1',
                    }}>
                      {rc.teamStatus}
                    </span>
                  </div>
                </div>))}
              </div>)}
            </div>
          </div>)}

          {/* TEAMS TAB */}
          {activeTab === 'teams' && (<div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Join Team Box */}
            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(185,149,230,.3)' }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '9px', color: '#B995E6', marginBottom: '12px' }}>
                JOIN AN EXISTING TEAM (ENTER CODE)
              </div>
              <form onSubmit={handleJoinTeam} style={{ display: 'flex', gap: '10px' }}>
                <input type="text" className="pixel-input" placeholder="PRO-XXXXXX" value={joinCodeInput} onChange={(e) => setJoinCodeInput(e.target.value)} style={{ textTransform: 'uppercase' }} />
                <button type="submit" className="pixel-btn-primary pixel-btn-sm" style={{ flexShrink: 0 }}>
                  JOIN
                </button>
              </form>
              {joinMsg && (<div style={{
                marginTop: '10px',
                fontSize: '12px',
                color: joinMsg.isError ? '#FF4FD1' : '#4DF3FF',
              }}>
                {joinMsg.text}
              </div>)}
            </div>

            {/* Teams List */}
            {dashboard?.registeredCompetitions.map((rc) => (<div key={rc.teamId} style={{
              padding: '18px',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(185,149,230,0.3)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#F4EEFF' }}>
                    {rc.teamName} ({rc.competition.title})
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(238,240,248,.6)', marginTop: '4px' }}>
                    Category: {rc.competition.category} · Fee: PKR {rc.competition.registrationFee}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '9px', color: '#B995E6' }}>
                    JOIN CODE: <span style={{ color: '#4DF3FF' }}>{rc.joinCode}</span>
                  </div>
                </div>
              </div>

              {/* Roster */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'rgba(238,240,248,.5)', marginBottom: '8px' }}>
                  Team Roster ({rc.teammates.length}/{rc.competition.maxTeamSize})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  {rc.teammates.map((m) => (<div key={m.id} style={{
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.04)',
                    borderLeft: m.isLeader ? '3px solid #B995E6' : '3px solid rgba(238,240,248,.2)',
                    fontSize: '12px',
                  }}>
                    <div style={{ fontWeight: 500, color: '#EEF0F8' }}>
                      {m.fullName} {m.isLeader && <span style={{ color: '#B995E6', fontSize: '10px' }}>(Leader)</span>}
                    </div>
                    <div style={{ color: 'rgba(238,240,248,.5)', fontSize: '11px' }}>{m.email}</div>
                  </div>))}
                </div>
              </div>
            </div>))}
          </div>)}

          {/* TICKET / GATE PASS TAB */}
          {activeTab === 'ticket' && (<div style={{ textAlign: 'center', padding: '20px' }}>
            {activeTicket?.gatePass?.qrDataUrl ? (<div style={{
              display: 'inline-block',
              padding: '24px',
              background: '#0B0C17',
              border: '2px solid #4DF3FF',
              boxShadow: '0 0 30px rgba(77, 243, 255, 0.3)',
            }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: '#4DF3FF', marginBottom: '14px' }}>
                FAST GATE SECURITY PASS
              </div>
              <img src={activeTicket.gatePass.qrDataUrl} alt="Security QR Gate Pass" style={{
                width: '240px',
                height: '240px',
                display: 'block',
                margin: '0 auto',
                background: '#fff',
                padding: '8px',
              }} />
              <div style={{ marginTop: '14px', fontSize: '13px', fontWeight: 600, color: '#F4EEFF' }}>
                {user?.fullName}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(238,240,248,.6)', marginTop: '4px' }}>
                Event: {activeTicket.competition.title} ({activeTicket.teamName})
              </div>
              <div style={{ fontSize: '10px', color: '#4DF3FF', marginTop: '8px', fontFamily: 'monospace' }}>
                HMAC: {activeTicket.gatePass.qrSignature.slice(0, 16)}...
              </div>
              <div style={{ marginTop: '12px', fontSize: '10px', color: 'rgba(238,240,248,.5)' }}>
                Status: {activeTicket.gatePass.isCheckedIn ? 'CHECKED IN' : 'VALID FOR ENTRY'}
              </div>
            </div>) : (<div style={{ padding: '30px', background: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(185,149,230,.3)' }}>
              <AlertTriangle size={36} color="#FF4FD1" style={{ marginBottom: '12px' }} />
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#EEF0F8', marginBottom: '8px' }}>
                No Gate Pass Ticket Issued Yet
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(238,240,248,.6)', maxWidth: '420px', margin: '0 auto' }}>
                Your team's payment must be verified by the Finance Desk before the cryptographic QR entry pass is generated.
              </p>
              <button type="button" onClick={() => setActiveTab('payment')} className="pixel-btn-primary pixel-btn-sm" style={{ marginTop: '16px' }}>
                SUBMIT PAYMENT PROOF
              </button>
            </div>)}
          </div>)}

          {/* PAYMENT TAB */}
          {activeTab === 'payment' && (<div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(185,149,230,.3)' }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '9px', color: '#B995E6', marginBottom: '12px' }}>
                SUBMIT BANK TRANSFER PROOF
              </div>
              <form onSubmit={handleSubmitPayment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: 'rgba(238,240,248,.7)' }}>
                    Select Registered Team *
                  </label>
                  <select className="pixel-input" value={paymentTeamId} onChange={(e) => {
                    setPaymentTeamId(e.target.value);
                    const t = dashboard?.registeredCompetitions.find((r) => r.teamId === e.target.value);
                    if (t)
                      setPaymentAmount(String(t.competition.registrationFee));
                  }} required>
                    <option value="">-- Choose Team --</option>
                    {dashboard?.registeredCompetitions.map((rc) => (<option key={rc.teamId} value={rc.teamId}>
                      {rc.teamName} ({rc.competition.title}) - PKR {rc.competition.registrationFee}
                    </option>))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: 'rgba(238,240,248,.7)' }}>
                      Amount (PKR) *
                    </label>
                    <input type="number" required className="pixel-input" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="e.g. 1500" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: 'rgba(238,240,248,.7)' }}>
                      Transaction Ref / Slip ID *
                    </label>
                    <input type="text" required className="pixel-input" value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} placeholder="TRX-9823471" />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: 'rgba(238,240,248,.7)' }}>
                    Cloudflare R2 Proof Slip URL / File Key
                  </label>
                  <input type="text" className="pixel-input" value={paymentProofUrl} onChange={(e) => setPaymentProofUrl(e.target.value)} placeholder="https://assets.procom27.com/slips/my-slip.jpg" />
                </div>

                <button type="submit" className="pixel-btn-primary" style={{ marginTop: '8px' }}>
                  SUBMIT SLIP FOR FINANCE APPROVAL
                </button>
              </form>

              {paymentStatusMsg && (<div style={{
                marginTop: '12px',
                fontSize: '12px',
                color: paymentStatusMsg.isError ? '#FF4FD1' : '#4DF3FF',
              }}>
                {paymentStatusMsg.text}
              </div>)}
            </div>
          </div>)}

          {/* JOB FAIR TAB */}
          {activeTab === 'resume' && (<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(185,149,230,.3)' }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '9px', color: '#B995E6', marginBottom: '12px' }}>
                CORPORATE RESUME BOOK SUBMISSION
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(238,240,248,.65)', marginBottom: '16px' }}>
                Drop your resume directly into the PROCOM'27 Tech Talent Directory reviewed by top tech firms and sponsors.
              </p>

              <form onSubmit={handleResumeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px' }}>Degree Program</label>
                    <input type="text" className="pixel-input" placeholder="BS Computer Science" value={resumeDegree} onChange={(e) => setResumeDegree(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px' }}>CGPA (Optional)</label>
                    <input type="number" step="0.01" max="4.0" min="0.0" className="pixel-input" placeholder="3.65" value={resumeCgpa} onChange={(e) => setResumeCgpa(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px' }}>Graduation Year</label>
                    <select className="pixel-input" value={resumeYear} onChange={(e) => setResumeYear(e.target.value)}>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px' }}>Cloudflare R2 Resume PDF URL</label>
                    <input type="text" className="pixel-input" placeholder="https://assets.procom27.com/resumes/my-resume.pdf" value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px' }}>Skills (comma separated)</label>
                  <input type="text" className="pixel-input" placeholder="TypeScript, Python, PyTorch, React, Cloudflare" value={resumeSkills} onChange={(e) => setResumeSkills(e.target.value)} />
                </div>

                <button type="submit" className="pixel-btn-primary pixel-btn-sm" style={{ marginTop: '8px' }}>
                  SAVE RESUME RECORD
                </button>
              </form>

              {resumeMsg && (<div style={{ marginTop: '12px', fontSize: '12px', color: resumeMsg.isError ? '#FF4FD1' : '#4DF3FF' }}>
                {resumeMsg.text}
              </div>)}
            </div>
          </div>)}

          {/* SECURITY / PASSWORD TAB */}
          {activeTab === 'security' && (<div style={{ maxWidth: '420px', margin: '0 auto', padding: '16px' }}>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '9px', color: '#B995E6', marginBottom: '14px' }}>
              CHANGE PORTAL PASSWORD
            </div>
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px' }}>Current Password *</label>
                <input type="password" required className="pixel-input" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} placeholder="••••••••" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px' }}>New Password (min 8 chars) *</label>
                <input type="password" required minLength={8} className="pixel-input" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="••••••••" />
              </div>
              <button type="submit" className="pixel-btn-primary pixel-btn-sm">
                UPDATE CREDENTIALS
              </button>
            </form>
            {passMsg && (<div style={{ marginTop: '12px', fontSize: '12px', color: passMsg.isError ? '#FF4FD1' : '#4DF3FF' }}>
              {passMsg.text}
            </div>)}
          </div>)}
        </>)}
      </div>
    </div>
  </div>);
};
