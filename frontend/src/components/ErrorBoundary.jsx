import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="text-center space-y-4 max-w-md bg-th-surface rounded-2xl p-10 border border-th-border">
            <div className="text-5xl">😵</div>
            <h3 className="text-xl font-bold text-th-text">Er ging iets mis</h3>
            <p className="text-th-text-dim text-sm">
              Er is een onverwachte fout opgetreden bij het laden van de wijnen.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="btn-primary"
            >
              Probeer opnieuw
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
