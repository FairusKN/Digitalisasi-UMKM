import React, { useState, useEffect } from 'react';

export interface AlertOptions {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertState extends AlertOptions {
  id: string;
  isVisible: boolean;
}

class AlertManager {
  private static instance: AlertManager;
  private alerts: AlertState[] = [];
  private listeners: ((alerts: AlertState[]) => void)[] = [];

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  show(options: AlertOptions): Promise<boolean> {
    return new Promise((resolve) => {
      const id = Date.now().toString();
      const alert: AlertState = {
        ...options,
        id,
        isVisible: true,
        onConfirm: () => {
          this.remove(id);
          options.onConfirm?.();
          resolve(true);
        },
        onCancel: () => {
          this.remove(id);
          options.onCancel?.();
          resolve(false);
        }
      };

      this.alerts.push(alert);
      this.notify();

      if (options.type !== 'confirm') {
        setTimeout(() => {
          this.remove(id);
          resolve(true);
        }, 5000);
      }
    });
  }

  remove(id: string) {
    this.alerts = this.alerts.filter(alert => alert.id !== id);
    this.notify();
  }

  subscribe(listener: (alerts: AlertState[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.alerts]));
  }
}

const alertManager = AlertManager.getInstance();

export const alert = (message: string, type: AlertOptions['type'] = 'info') => {
  return alertManager.show({ message, type });
};

export const confirm = (message: string, title?: string) => {
  return alertManager.show({
    message,
    title,
    type: 'confirm',
    confirmText: 'Ya',
    cancelText: 'Batal'
  });
};

export const success = (message: string, title?: string) => {
  return alertManager.show({ message, title, type: 'success' });
};

export const error = (message: string, title?: string) => {
  return alertManager.show({ message, title, type: 'error' });
};

export const warning = (message: string, title?: string) => {
  return alertManager.show({ message, title, type: 'warning' });
};

export const AlertContainer: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertState[]>([]);

  useEffect(() => {
    const unsubscribe = alertManager.subscribe(setAlerts);
    return unsubscribe;
  }, []);

  if (alerts.length === 0) return null;

  const getAlertIcon = (type: AlertOptions['type']) => {
    switch (type) {
      case 'success':
        return (
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'confirm':
        return (
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{
            backgroundColor: 'rgba(236, 87, 102, 0.1)'
          }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ec5766' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getAlertColors = (type: AlertOptions['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'confirm':
        return 'bg-white border-2 text-gray-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <div className="absolute top-4 left-4 right-4 sm:top-4 sm:right-4 sm:left-auto space-y-2">
        {alerts
          .filter(alert => alert.type !== 'confirm')
          .map(alert => (
            <div
              key={alert.id}
              className={`pointer-events-auto w-full sm:max-w-sm bg-white rounded-lg shadow-lg border-l-4 p-4 transform transition-all duration-300 ease-in-out ${
                alert.isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
              } ${getAlertColors(alert.type)}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="ml-3 flex-1">
                  {alert.title && (
                    <p className="text-sm font-medium">{alert.title}</p>
                  )}
                  <p className={`text-sm ${alert.title ? 'mt-1' : ''}`}>{alert.message}</p>
                </div>
                <button
                  onClick={() => alertManager.remove(alert.id)}
                  className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        }
      </div>

      {alerts
        .filter(alert => alert.type === 'confirm')
        .map(alert => (
          <div
            key={alert.id}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 pointer-events-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                alert.onCancel?.();
              }
            }}
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  {getAlertIcon(alert.type)}
                  <h3 className="ml-3 text-base sm:text-lg font-semibold text-gray-900">
                    {alert.title || 'Konfirmasi'}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{alert.message}</p>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={alert.onConfirm}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #da344d 0%, #c42348 100%)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)';
                    }}
                  >
                    {alert.confirmText || 'Ya'}
                  </button>
                  <button
                    onClick={alert.onCancel}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    {alert.cancelText || 'Batal'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      }
    </div>
  );
};

export default AlertContainer;