import { SourceOptions } from './types';
import { GATEWAY_HOST, GATEWAY_URL, GATEWAY_PROTOCOL } from '.';
import HttpClient from './http-client';
import { getHeaders } from './utils';
import { credInterface } from './types';
import getBodyCreateCaseSync from './getBodyImplement/createCaseSyncBody';
import getBodyResolveResults from './getBodyImplement/resolveCaseBody';
import getBodyOngoingScreeningUpdates from './getBodyImplement/getOngoingScreeningUpdatesBody';


export default function getResult(operation: string, sourceOptions: SourceOptions, queryOptions: any) {
  let client: HttpClient;
  let body: any = {};
  let cred: credInterface;
  let headers;
  let url: string;
  let method: 'get' | 'post' | 'put' | 'delete';
  const DOMAIN = GATEWAY_PROTOCOL + GATEWAY_HOST + GATEWAY_URL;
  const { api_secret, api_key } = sourceOptions;
  function getCred(url: string, method: 'get' | 'post' | 'put' | 'delete'): credInterface {
    return {
      apiKey: api_key,
      apiSecret: api_secret,
      url,
      method,
    };
  }

  switch (operation) {
    case 'createNewCase':
      url = 'cases/screeningRequest';
      method = 'post';
      cred = getCred(url, method);
      body = getBodyCreateCaseSync(queryOptions);
      headers = getHeaders(cred, body);
      client = new HttpClient({ host: DOMAIN + url, headers });
      console.log({body,headers})
    //   return "success";
      return client
        .post(body)
        .then((data) => {
          return data;
        })
        .catch(async (err) => {
          throw new Error(err);
        });
    case 'get_groups':
      url = 'groups';
      method = 'get';
      cred = getCred(url, method);
      headers = getHeaders(cred);
      client = new HttpClient({ host: DOMAIN + url, headers });
      return client
        .get()
        .then((data) => {
          return data;
        })
        .catch((err) => {
          throw new Error(JSON.stringify(err));
        });
    case 'get_ongoing_screening_updates':
      url = 'cases/ongoingScreeningUpdates';
      method = 'post';
      cred = getCred(url, method);
      body = getBodyOngoingScreeningUpdates(queryOptions);
      headers = getHeaders(cred, body);
      client = new HttpClient({ host: DOMAIN + url, headers });
      return client
        .post(body)
        .then((data) => {
          return data;
        })
        .catch(async (err) => {
          throw new Error(err);
        });
    case 'get_template':
      url = `groups/${queryOptions.groupId}/caseTemplate`;
      method = 'get';
      cred = getCred(url, method);
      headers = getHeaders(cred);
      client = new HttpClient({ host: DOMAIN + url, headers });
      return client
        .get()
        .then((data) => {
          return data;
        })
        .catch((err) => {
          throw new Error(JSON.stringify(err));
        });
    case 'get_resolution_toolkit':
      url = `groups/${queryOptions.groupId}/resolutionToolkit`;
      method = 'get';
      cred = getCred(url, method);
      headers = getHeaders(cred);
      client = new HttpClient({ host: DOMAIN + url, headers });
      return client
        .get()
        .then((data) => {
          return data;
        })
        .catch((err) => {
          throw new Error(JSON.stringify(err));
        });
    case 'enable_ongs':
      url = `cases/${queryOptions.caseSystemId}/ongoingScreening`;
      method = 'put';
      cred = getCred(url, method);
      headers = getHeaders(cred);
      client = new HttpClient({ host: DOMAIN + url, headers });
      return client
        .put()
        .then((data) => {
          return data;
        })
        .catch((err) => {
          throw new Error(JSON.stringify(err));
        });
    case 'disable_ongs':
      url = `cases/${queryOptions.caseSystemId}/ongoingScreening`;
      method = 'delete';
      cred = getCred(url, method);
      headers = getHeaders(cred);
      client = new HttpClient({ host: DOMAIN + url, headers });
      return client
        .delete()
        .then((data) => {
          return data;
        })
        .catch((err) => {
          throw new Error(JSON.stringify(err));
        });
    case 'resolve_results':
      console.log(queryOptions, 'in resoleve result');
      url = `cases/${queryOptions.caseSystemId}/results/resolution`;
      method = 'put';
      body = getBodyResolveResults(queryOptions);
      cred = getCred(url, method);
      headers = getHeaders(cred, body);
      console.log(headers, body, 'in body resolve');
      client = new HttpClient({ host: DOMAIN + url, headers });
      return client
        .put(body)
        .then((data) => {
          return data;
        })
        .catch(async (err) => {
          throw new Error(err);
        });
    case 'get_results':
      url = `cases/${queryOptions.caseSystemId}/results`;
      method = 'get';
      cred = getCred(url, method);
      headers = getHeaders(cred);
      client = new HttpClient({ host: DOMAIN + url, headers });
      return client
        .get()
        .then((data) => {
          return data;
        })
        .catch((err) => {
          throw new Error(JSON.stringify(err));
        });
    default:
      throw new Error('invalid operation');
  }
}
