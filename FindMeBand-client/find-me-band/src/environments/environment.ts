const apiBaseUrl = 'http://localhost:5251/api';

export const environment = {
  apiBaseUrl,
  /** Korijen s kojeg poslužitelj servira prenesene datoteke (avatari, slike objava). */
  mediaBaseUrl: apiBaseUrl.replace(/\/api\/?$/, ''),
};
