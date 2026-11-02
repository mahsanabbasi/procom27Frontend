import React, { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback({ error: this.state.error, reset: this.handleReset })
          : this.props.fallback;
      }

      return (
        <div
          role="alert"
          style={{
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 16px',
            width: '100%',
          }}
        >
          <div
            className="pixel-card"
            style={{
              maxWidth: '600px',
              width: '100%',
              padding: '28px',
              border: '2px solid #FF4FD1',
              boxShadow: '0 0 24px rgba(255, 79, 209, 0.25)',
              position: 'relative',
              background: '#0E1020',
            }}
          >
            <div
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '12px',
                color: '#FF4FD1',
                textShadow: '0 0 10px rgba(255, 79, 209, 0.6)',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>[!]</span>
              <span>SYSTEM ERROR // GLITCH DETECTED</span>
            </div>

            <p style={{ color: '#EEF0F8', fontSize: '15px', lineHeight: 1.6, marginBottom: '16px' }}>
              An unexpected glitch halted this section of the system. The rest of the terminal is still operational.
            </p>

            {this.state.error && (
              <pre
                style={{
                  background: 'rgba(5, 6, 12, 0.85)',
                  border: '1px solid rgba(255, 79, 209, 0.3)',
                  padding: '12px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: '#4DF3FF',
                  overflowX: 'auto',
                  maxHeight: '140px',
                  marginBottom: '20px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {this.state.error.toString()}
              </pre>
            )}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={this.handleReset}
                className="pixel-btn-primary pixel-btn-sm"
              >
                RETRY / REBOOT
              </button>
              <a href="/" className="pixel-btn-secondary pixel-btn-sm">
                HOME TERMINAL
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
