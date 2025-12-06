import ReactGA from 'react-ga4';

let isInitialized = false;

export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  if (!measurementId) {
    console.warn('⚠️  GA Measurement ID not found. Analytics disabled.');
    return;
  }

  if (isInitialized) {
    return;
  }

  try {
    ReactGA.initialize(measurementId, {
      gaOptions: {
        siteSpeedSampleRate: 100,
        debug_mode: true, // Enable debug mode
      },
      gtagOptions: {
        send_page_view: false, // We'll send manually
        debug_mode: true,
      },
    });
    
    isInitialized = true;
    console.log('✅ Google Analytics initialized');
    console.log('📊 GA Measurement ID:', measurementId);
  } catch (error) {
    console.error('❌ Failed to initialize GA:', error);
  }
};

export const logPageView = (path, title) => {
  if (!isInitialized) return;
  
  ReactGA.send({
    hitType: 'pageview',
    page: path || window.location.pathname,
    title: title || document.title,
  });
};

export const logEvent = (category, action, label, value) => {
  if (!isInitialized) return;
  
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
};

export const logException = (description, fatal = false) => {
  if (!isInitialized) return;
  
  ReactGA.event({
    category: 'Exception',
    action: description,
    label: fatal ? 'Fatal' : 'Non-Fatal',
  });
};

export const setUserId = (userId) => {
  if (!isInitialized) return;
  
  ReactGA.set({ userId });
};
