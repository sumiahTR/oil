import { getCookieExpireInDays } from '../core/core_config.js'
import { getClientTimestamp } from '../core/core_utils.js';
import {
  PRIVACY_MINIMUM_TRACKING,
  OIL_PAYLOAD_PRIVACY,
  OIL_PAYLOAD_VERSION,
  OIL_PAYLOAD_LOCALE
} from '../core/core_constants.js';
import { getOilCookie, setDomainCookie } from '../core/core_cookies.js';
import { logInfo } from '../core/core_log.js';

const OIL_HUB_DOMAIN_COOKIE_NAME = 'oil_data';

/**
 * Internal Methods
 */
function getOilHubCookieName(groupName) {
  if (groupName) {
    return groupName + '_' + OIL_HUB_DOMAIN_COOKIE_NAME;
  }
  return OIL_HUB_DOMAIN_COOKIE_NAME;
}

function getHubDomainCookieConfig(groupName, oilVersion, locale) {
  return {
    name: getOilHubCookieName(groupName),
    expires: getCookieExpireInDays(),
    default_content: {
      'power_opt_in': false,
      'timestamp': getClientTimestamp(),
      'version': oilVersion,
      'locale': locale,
      'privacy': PRIVACY_MINIMUM_TRACKING
    }
  };
}

function getOilHubDomainCookie(groupName, oilVersion, locale) {
  return getOilCookie(getHubDomainCookieConfig(groupName, oilVersion, locale));
}

function getPrivacySettingsFromPayload(payload) {
  if (payload) {
    if (payload[OIL_PAYLOAD_PRIVACY]) {
      return payload[OIL_PAYLOAD_PRIVACY];
    } else { // backwards compatibility, when the payload was only the privacySettings
      return payload;
    }
  }
  return PRIVACY_MINIMUM_TRACKING;
}

function getVersionFromPayload(payload) {
  if (payload && payload[OIL_PAYLOAD_VERSION]) {
    return payload[OIL_PAYLOAD_VERSION];
  }
  return 'not recorded';
}

function getLocaleFromPayload(payload) {
  if (payload && payload[OIL_PAYLOAD_LOCALE]) {
    return payload[OIL_PAYLOAD_LOCALE];
  }
  return 'not recorded';
}

/**
 * Public Interface
 */
export function getPoiCookie(groupName = '') {
  let cookie = getOilHubDomainCookie(groupName);
  logInfo('Current Oil Hub Domain Cookie: ', cookie);
  return cookie;
}

export function setPoiOptIn(groupName = '', payload) {
  let privacySettings = getPrivacySettingsFromPayload(payload);
  let oilVersion = getVersionFromPayload(payload);
  let locale = getLocaleFromPayload(payload);

  let cookie = getOilHubDomainCookie(groupName, oilVersion, locale);
  let cookieConfig = getHubDomainCookieConfig(groupName, oilVersion, locale);
  cookie.power_opt_in = true;
  cookie.privacy = privacySettings;
  cookie.timestamp = getClientTimestamp();
  cookie.version = oilVersion;
  cookie.locale = locale;
  setDomainCookie(cookieConfig.name, cookie, cookieConfig.expires);
}
