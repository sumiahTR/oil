import Cookie from 'js-cookie';
import * as HubAPI from '../../../src/scripts/hub/hub_oil';
import { resetOil } from '../../test-utils/utils_reset';
import { waitsForAndRuns } from '../../test-utils/utils_wait';
import { setupVendorListSpies } from '../../test-utils/utils_vendorlist';

describe('the hub.js', () => {

  const OLD_DEFAULT_PAYLOAD = '&payload=%7B%22p%22%3A%7B%221%22%3Atrue%2C%222%22%3Afalse%2C%223%22%3Atrue%2C%224%22%3Atrue%2C%225%22%3Atrue%7D%2C%22v%22%3A%221.1.2-SNAPSHOT%22%2C%22lvn%22%3A%22enEN_01%22%2C%22lvv%22%3A1%7D';

  const DEFAULT_PAYLOAD = '&payload=%7B%22p%22%3A%22BOO4NpHOO4NpHBQABBENAkuAAAAXyABgACAvgA%22%7D';

  const OIL_COOKIE = {
    NAME: 'oil_data'
  };

  beforeEach(() => resetOil());

  describe('in event mode', function () {

    let cookieSetSpy;

    beforeEach(() => {
      HubAPI.initOilHub('');
      cookieSetSpy = spyOn(Cookie, 'set').and.callThrough();
      setupVendorListSpies();
    });

    it('should NOT write a cookie without privacy', (done) => {
      postMessage({
        event: 'oil-poi-activate',
        origin: 'origin',
        hostconfig: {'cookie_expires_in_days': 31}
      }, '*');
      setTimeout(() => {
          let cookie = Cookie.getJSON(OIL_COOKIE.NAME);
          expect(cookie).toBeUndefined();
          done();
        }, 2000);
    });

    it('should NOT write a cookie with old privacy format', (done) => {
      postMessage({
        event: 'oil-poi-activate',
        origin: 'origin',
        hostconfig: {'cookie_expires_in_days': 31},
        payload: {p: 1}

      }, '*');
      setTimeout(() => {
          let cookie = Cookie.getJSON(OIL_COOKIE.NAME);
          expect(cookie).toBeUndefined();
          done();
        }, 2000);
    });


    it('should write a cookie', (done) => {
      postMessage({
        event: 'oil-poi-activate',
        origin: 'origin',
        hostconfig: {'cookie_expires_in_days': 31},
        payload: {p: 'BOO4NpHOO4NpHBQABBENAkuAAAAXyABgACAvgA'}
      }, '*');
      waitsForAndRuns(
        () => cookieSetSpy.calls.count() > 0,
        () => {
          let cookie = Cookie.getJSON(OIL_COOKIE.NAME);
          expect(cookie).toBeDefined();
          done();
        }, 2000);
    });

    it('should write a cookie with group_name', (done) => {
      postMessage({
        event: 'oil-poi-activate',
        origin: 'origin',
        group_name: 'lisasimpson',
        hostconfig: {'cookie_expires_in_days': 31},
        payload: {p: 'BOO4NpHOO4NpHBQABBENAkuAAAAXyABgACAvgA'}
      }, '*');
      waitsForAndRuns(
        () => cookieSetSpy.calls.count() > 0,
        () => {
          let cookie = Cookie.getJSON('lisasimpson_' + OIL_COOKIE.NAME);
          expect(cookie).toBeDefined();
          done();
        }, 2000);
    });

  });

  describe('in redirect mode', function () {
    let cookieSetSpy;

    beforeEach(() => {
      spyOn(HubAPI, 'redirectBack').and.callFake(function () {
      });
      cookieSetSpy = spyOn(Cookie, 'set').and.callThrough();
      setupVendorListSpies();
    });

    it('should write a cookie with group name', function () {
      HubAPI.initOilHub('hub.html?fallback=1&group_name=bartsimpson' + DEFAULT_PAYLOAD);

      let cookie = Cookie.getJSON('bartsimpson_' + OIL_COOKIE.NAME);
      expect(cookie).toBeDefined();
      expect(HubAPI.redirectBack).toHaveBeenCalled();
    });

    it('should write NO cookie without payload', function () {
      HubAPI.initOilHub('hub.html?fallback=1');

      let cookie = Cookie.getJSON(OIL_COOKIE.NAME);
      expect(cookie).toBeUndefined();
      expect(HubAPI.redirectBack).toHaveBeenCalled();
    });

    it('should write NO cookie with old payload/privacy format', function () {
      HubAPI.initOilHub('hub.html?fallback=1' + OLD_DEFAULT_PAYLOAD);

      let cookie = Cookie.getJSON(OIL_COOKIE.NAME);
      expect(cookie).toBeUndefined();
      expect(HubAPI.redirectBack).toHaveBeenCalled();
    });

    it('should write a cookie with default name', function () {
      HubAPI.initOilHub('hub.html?fallback=1' + DEFAULT_PAYLOAD);

      let cookie = Cookie.getJSON(OIL_COOKIE.NAME);
      expect(cookie).toBeDefined();
      expect(HubAPI.redirectBack).toHaveBeenCalled();
    });
  });

});
