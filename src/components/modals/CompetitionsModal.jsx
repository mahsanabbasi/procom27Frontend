import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { X, Search, Plus } from 'lucide-react';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
const CATEGORIES = [
    { id: 'ALL', label: 'ALL EVENTS' },
    { id: 'CS_AI', label: 'CS & AI' },
    { id: 'CYBERSECURITY', label: 'CYBERSECURITY' },
    { id: 'ROBOTICS', label: 'ROBOTICS' },
    { id: 'BUSINESS_MEDIA', label: 'BUSINESS & MEDIA' },
    { id: 'GAMING', label: 'GAMING' },
    { id: 'GENERAL', label: 'GENERAL' },
];
// Fallback competitions matching PROCOM'27 roster if DB is unseeded locally
const DEFAULT_COMPETITIONS = [
    {
        id: 'speed-programming',
        title: 'Speed Programming Competition',
        slug: 'speed-programming',
        category: 'CS_AI',
        description: 'Solve algorithmic challenges against the clock in C++, Java, or Python. 3 hours, 8 intense problems.',
        minTeamSize: 1,
        maxTeamSize: 3,
        registrationFee: 1500,
        maxTeams: 60,
    },
    {
        id: 'ai-hackathon',
        title: 'Generative AI & LLM Hackathon',
        slug: 'ai-hackathon',
        category: 'CS_AI',
        description: 'Build production-ready agentic workflows or vision-language models within 24 hours of live campus hacking.',
        minTeamSize: 2,
        maxTeamSize: 4,
        registrationFee: 2000,
        maxTeams: 40,
    },
    {
        id: 'capture-the-flag',
        title: 'FAST Cyber CTF (Jeopardy Style)',
        slug: 'capture-the-flag',
        category: 'CYBERSECURITY',
        description: 'Binary exploitation, web vulnerabilities, reverse engineering, and cryptographic key extraction challenges.',
        minTeamSize: 1,
        maxTeamSize: 3,
        registrationFee: 1500,
        maxTeams: 50,
    },
    {
        id: 'robo-wars',
        title: 'RoboWars & Combat Robotics',
        slug: 'robo-wars',
        category: 'ROBOTICS',
        description: 'Weight-classed battle bots battle in an enclosed bulletproof polycarbonate arena until knockdown or knockout.',
        minTeamSize: 2,
        maxTeamSize: 5,
        registrationFee: 2500,
        maxTeams: 30,
    },
    {
        id: 'line-following-robot',
        title: 'Autonomous Line Following Robot (LFR)',
        slug: 'line-following-robot',
        category: 'ROBOTICS',
        description: 'Precision PID sensor navigation over high-speed hairpin curves, intersections, and obstacle bypass tracks.',
        minTeamSize: 1,
        maxTeamSize: 3,
        registrationFee: 1200,
        maxTeams: 40,
    },
    {
        id: 'startup-pitch',
        title: 'PROCOM Venture Pitch Arena',
        slug: 'startup-pitch',
        category: 'BUSINESS_MEDIA',
        description: 'Present your tech startup business model, market size, and unit economics to top venture capital investors.',
        minTeamSize: 2,
        maxTeamSize: 4,
        registrationFee: 1500,
        maxTeams: 25,
    },
    {
        id: 'fifa-championship',
        title: 'FC 27 / FIFA Esports Championship',
        slug: 'fifa-championship',
        category: 'GAMING',
        description: '1v1 tournament on PlayStation 5 consoles. Single elimination bracket up to the grand auditorium final.',
        minTeamSize: 1,
        maxTeamSize: 1,
        registrationFee: 800,
        maxTeams: 64,
    },
    {
        id: 'tekken-showdown',
        title: 'Tekken 8 Arena Showdown',
        slug: 'tekken-showdown',
        category: 'GAMING',
        description: 'Double elimination fighting game bracket played on tournament-standard arcade monitors and sticks.',
        minTeamSize: 1,
        maxTeamSize: 1,
        registrationFee: 800,
        maxTeams: 64,
    },
];
export const CompetitionsModal = ({ isOpen, onClose, onOpenAuth, onOpenPortal, }) => {
    const { modalRef } = useModalAccessibility(isOpen, onClose);
    const { isAuthenticated } = useAuth();
    const [competitions, setCompetitions] = useState(DEFAULT_COMPETITIONS);
    const [selectedCat, setSelectedCat] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    // Quick Team creation modal inside
    const [creatingForComp, setCreatingForComp] = useState(null);
    const [teamName, setTeamName] = useState('');
    const [teamError, setTeamError] = useState(null);
    const [teamSuccess, setTeamSuccess] = useState(null);
    const [teamSubmitting, setTeamSubmitting] = useState(false);
    useEffect(() => {
        if (!isOpen)
            return;
        const fetchCompetitions = async () => {
            setLoading(true);
            const res = await api.getCompetitions(selectedCat === 'ALL' ? undefined : selectedCat);
            if (res.success && res.data && res.data.length > 0) {
                setCompetitions(res.data);
            }
            else {
                // Keep fallback data if database is not seeded yet
                setCompetitions(selectedCat === 'ALL'
                    ? DEFAULT_COMPETITIONS
                    : DEFAULT_COMPETITIONS.filter((c) => c.category === selectedCat));
            }
            setLoading(false);
        };
        fetchCompetitions();
    }, [isOpen, selectedCat]);
    if (!isOpen)
        return null;
    const filtered = competitions.filter((c) => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });
    const handleCreateTeamSubmit = async (e) => {
        e.preventDefault();
        if (!creatingForComp || !teamName.trim())
            return;
        setTeamError(null);
        setTeamSuccess(null);
        setTeamSubmitting(true);
        const res = await api.createTeam({
            name: teamName.trim(),
            competitionId: creatingForComp.id,
        });
        setTeamSubmitting(false);
        if (res.success) {
            setTeamSuccess(`Team "${teamName}" created! Join Code: ${res.data?.team?.joinCode || 'PRO-NEW'}`);
            setTimeout(() => {
                setCreatingForComp(null);
                setTeamName('');
                setTeamSuccess(null);
                onOpenPortal();
            }, 1800);
        }
        else {
            setTeamError(res.message || 'Failed to create team.');
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
            background: 'rgba(5, 6, 12, 0.92)',
            backdropFilter: 'blur(10px)',
        }} onClick={onClose}>
      <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="competitions-modal-title" className="pixel-card" style={{
            width: '100%',
            maxWidth: '960px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            position: 'relative',
        }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2px solid rgba(185,149,230,.35)',
            paddingBottom: '16px',
            marginBottom: '16px',
        }}>
          <div>
            <div id="competitions-modal-title" style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '12px',
            color: '#F4EEFF',
            textShadow: '0 0 10px rgba(185,149,230,.6)',
        }}>
              &gt;&gt; STAGE 01: EVENT CATALOGUE
            </div>
            <div style={{ marginTop: '6px', fontSize: '11px', color: 'rgba(238,240,248,.6)' }}>
              Official technical and non-technical categories of PROCOM'27
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" style={{
            background: 'none',
            border: 'none',
            color: 'rgba(238,240,248,.6)',
            cursor: 'pointer',
            padding: '6px',
        }}>
            <X size={20}/>
          </button>
        </div>

        {/* Filter bar and search */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(238,240,248,.4)' }}/>
            <input type="text" className="pixel-input" placeholder="Search competitions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ paddingLeft: '34px' }}/>
          </div>

          {/* Categories pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {CATEGORIES.map((cat) => {
            const active = selectedCat === cat.id;
            return (<button key={cat.id} type="button" onClick={() => setSelectedCat(cat.id)} style={{
                    padding: '6px 10px',
                    fontSize: '8px',
                    fontFamily: "'Press Start 2P', monospace",
                    border: 'none',
                    cursor: 'pointer',
                    background: active ? '#B995E6' : 'rgba(255,255,255,0.06)',
                    color: active ? '#0D0B12' : 'rgba(238,240,248,.7)',
                    transition: 'all 0.15s ease',
                }}>
                  {cat.label}
                </button>);
        })}
          </div>
        </div>

        {/* Competitions Grid */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {creatingForComp ? (
        /* Create Team Sub-view */
        <div style={{ padding: '20px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(185,149,230,.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: '#B995E6' }}>
                  FORM TEAM FOR: {creatingForComp.title}
                </div>
                <button type="button" onClick={() => setCreatingForComp(null)} style={{ background: 'none', border: 'none', color: 'rgba(238,240,248,.6)', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>

              {teamError && (<div style={{ padding: '10px', background: 'rgba(255, 79, 209, 0.15)', color: '#FF4FD1', fontSize: '12px', marginBottom: '12px' }}>
                  {teamError}
                </div>)}
              {teamSuccess && (<div style={{ padding: '10px', background: 'rgba(77, 243, 255, 0.15)', color: '#4DF3FF', fontSize: '12px', marginBottom: '12px' }}>
                  {teamSuccess}
                </div>)}

              <form onSubmit={handleCreateTeamSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: 'rgba(238,240,248,.8)' }}>
                    Team Name *
                  </label>
                  <input type="text" required className="pixel-input" placeholder="e.g. ByteRunners" value={teamName} onChange={(e) => setTeamName(e.target.value)}/>
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(238,240,248,.6)' }}>
                  Team limits: {creatingForComp.minTeamSize} to {creatingForComp.maxTeamSize} members. As team leader, a unique join code will be generated for your squad.
                </div>
                <button type="submit" disabled={teamSubmitting} className="pixel-btn-primary pixel-btn-sm" style={{ width: 'fit-content' }}>
                  {teamSubmitting ? 'GENERATING CODE...' : '▶ CONFIRM & CREATE SQUAD'}
                </button>
              </form>
            </div>) : loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#B995E6', fontFamily: "'Press Start 2P', monospace", fontSize: '11px' }}>
                FETCHING ARENAS...
              </div>
            ) : (<div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                gap: '12px',
            }}>
              {filtered.map((comp) => (<div key={comp.id} className="pixel-card" style={{
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '9px', fontFamily: "'Press Start 2P', monospace", color: '#B995E6' }}>
                        {comp.category}
                      </span>
                      <span style={{ fontSize: '11px', color: '#4DF3FF', fontWeight: 600 }}>
                        PKR {comp.registrationFee}
                      </span>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#EEF0F8' }}>{comp.title}</div>
                    <p style={{ margin: '8px 0 0', fontSize: '13px', lineHeight: 1.55, color: 'rgba(238,240,248,.65)' }}>
                      {comp.description}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px dashed rgba(185,149,230,.2)',
                    paddingTop: '12px',
                }}>
                    <div style={{ fontSize: '11px', color: 'rgba(238,240,248,.5)' }}>
                      Team: {comp.minTeamSize}-{comp.maxTeamSize} members
                    </div>
                    {isAuthenticated ? (<button type="button" onClick={() => {
                        setCreatingForComp(comp);
                        setTeamName('');
                        setTeamError(null);
                    }} className="pixel-btn-primary pixel-btn-sm" style={{ height: '32px', padding: '0 10px', fontSize: '8px' }}>
                        <Plus size={12}/> FORM TEAM
                      </button>) : (<button type="button" onClick={() => onOpenAuth('register')} className="pixel-btn-secondary" style={{ height: '32px', padding: '0 10px', fontSize: '8px' }}>
                        REGISTER
                      </button>)}
                  </div>
                </div>))}
            </div>)}
        </div>
      </div>
    </div>);
};
