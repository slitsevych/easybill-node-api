const axios = require('axios');
const Promise = require('bluebird');
const _ = require('lodash');

const rejectMissingUrl = () => Promise.reject(new Error('Missing url'));
const rejectMissingBody = () => Promise.reject(new Error('Missing body'));

module.exports = (apiKey) => {
  if (!apiKey) {
    throw new Error('Missing apiKey');
  }

  const instance = axios.create({
    baseURL: 'https://api.easybill.de/rest/v1',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  async function _request(config) {
    try {
      const response = await instance(config);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`Request failed with status code ${error.response.status}`);
      }
      throw error;
    }
  }

  return {
    get(url, params = {}, { isFile = false } = {}) {
      if (_.isEmpty(url)) {
        return rejectMissingUrl();
      }

      const responseType = isFile ? 'arraybuffer' : 'json';

      return _request({ url, method: 'GET', params, responseType });
    },

    post(url, data, { isFile = false } = {}) {
      if (_.isEmpty(url)) {
        return rejectMissingUrl();
      }

      if (_.isEmpty(data)) {
        return rejectMissingBody();
      }

      const config = { url, method: 'POST' };
      if (isFile) {
        config.data = data;
        config.headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        config.data = data;
      }

      return _request(config);
    },

    put(url, data = {}) {
      if (_.isEmpty(url)) {
        return rejectMissingUrl();
      }

      return _request({ url, method: 'PUT', data });
    },

    del(url) {
      if (_.isEmpty(url)) {
        return rejectMissingUrl();
      }

      return _request({ url, method: 'DELETE' });
    }
  };
};
