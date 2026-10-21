import React from 'react';
import { X, Mail, MapPin, Phone, Globe } from 'lucide-react';
export const ContactModal = ({ isOpen, onClose }) => {
  if (!isOpen)
    return null;
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
      maxWidth: '520px',
      padding: '24px',
      position: 'relative',
    }} onClick={(e) => e.stopPropagation()}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid rgba(185,149,230,.35)',
        paddingBottom: '14px',
        marginBottom: '18px',
      }}>
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '11px',
          color: '#F4EEFF',
          textShadow: '0 0 10px rgba(185,149,230,.6)',
        }}>
          &gt;&gt; PROCOM'27 SECRETARIAT
        </div>
        <button type="button" onClick={onClose} style={{
          background: 'none',
          border: 'none',
          color: 'rgba(238,240,248,.6)',
          cursor: 'pointer',
          padding: '4px',
        }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <MapPin size={18} color="#B995E6" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 600, color: '#EEF0F8' }}>FAST-NUCES Karachi Campus</div>
            <div style={{ color: 'rgba(238,240,248,.6)', marginTop: '2px' }}>
              ST-4, Sector 17-D, Shah Latif Town, National Highway, Karachi, Pakistan
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Mail size={18} color="#4DF3FF" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, color: '#EEF0F8' }}>General Inquiries & Support</div>
            <a href="mailto:info@procom.net@nu.edu.pk" style={{ color: '#4DF3FF', textDecoration: 'underline' }}>
              info@procom27.com
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Globe size={18} color="#FF4FD1" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, color: '#EEF0F8' }}>Official Portal</div>
            <span style={{ color: 'rgba(238,240,248,.7)' }}>https://procom27.com</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Phone size={18} color="#B995E6" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, color: '#EEF0F8' }}>Helpline / Helpdesk</div>
            <span style={{ color: 'rgba(238,240,248,.7)' }}>+92 336 2729348</span>
          </div>
        </div>
      </div>

      <button type="button" onClick={onClose} className="pixel-btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '22px', height: '42px', fontSize: '9px' }}>
        CLOSE
      </button>
    </div>
  </div>);
};
