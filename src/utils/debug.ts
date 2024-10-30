export const debugLog = (component: string, action: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${component}] ${action}`, data ? data : '');
  }
};

export const debugError = (component: string, error: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${component}] Error:`, error);
  }
}; 