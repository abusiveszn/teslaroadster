import React, { useEffect } from 'react';
import { api } from '../services/api';

/**
 * TawkWidget
 * Dynamically loads the official Tawk.to live chat script if configured
 * in the system settings by the administrator.
 */
export const TawkWidget = () => {
  useEffect(() => {
    let scriptElement = null;

    const loadTawkScript = async () => {
      try {
        const settings = await api.getSettings();
        const propertyId = settings?.tawkPropertyId?.trim();
        const widgetId = settings?.tawkWidgetId?.trim() || 'default';

        if (propertyId && !window.Tawk_API) {
          window.Tawk_API = window.Tawk_API || {};
          window.Tawk_LoadStart = new Date();

          scriptElement = document.createElement('script');
          scriptElement.async = true;
          scriptElement.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
          scriptElement.charset = 'UTF-8';
          scriptElement.setAttribute('crossorigin', '*');

          scriptElement.onerror = () => {
            console.warn('[Tawk.to] Failed to load widget script. Please verify Property ID and Widget ID.');
          };

          const firstScript = document.getElementsByTagName('script')[0];
          if (firstScript && firstScript.parentNode) {
            firstScript.parentNode.insertBefore(scriptElement, firstScript);
          } else {
            document.head.appendChild(scriptElement);
          }
        }
      } catch (err) {
        // Silently catch in case of offline or local network restrictions
      }
    };

    loadTawkScript();

    return () => {
      // Optional cleanup if component unmounts
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, []);

  return null;
};
