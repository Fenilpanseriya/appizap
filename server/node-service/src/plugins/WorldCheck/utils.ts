import CryptoJS from 'crypto-js';
import { GATEWAY_HOST, GATEWAY_URL } from '.';
import { credInterface } from './types';
interface AuthHeaderArg {
  creds: credInterface;
  headers?: {
    'content-type'?: string;
    'content-length'?: string;
  };
  body?: any;
}

function genrateAuthHeaders({ creds, headers, body }: AuthHeaderArg) {
  const { apiKey, apiSecret, url, method } = creds;
  function generateAuthHeader(dataToSign:any) {
    const hash = CryptoJS.HmacSHA256(dataToSign, apiSecret);
    return hash.toString(CryptoJS.enc.Base64);
  }

  const date = new Date().toUTCString();

  let dataToSign =
    '(request-target): ' + method + ' ' + GATEWAY_URL + url + '\n' + 'host: ' + GATEWAY_HOST + '\n' + 'date: ' + date;
  if (headers) {
    if (headers['content-type']) {
      dataToSign = dataToSign + '\ncontent-type: ' + headers['content-type'];
    }
    if (headers['content-length']) {
      dataToSign = dataToSign + '\ncontent-length: ' + headers['content-length'] + '\n' + JSON.stringify(body);
    }
  }
  const hmac = generateAuthHeader(dataToSign);

  const authorization =
    'Signature keyId="' +
    apiKey +
    '",algorithm="hmac-sha256",headers="(request-target) host date' +
    (headers
      ? (headers['content-length'] ? ' content-length' : '') + (headers?.['content-type'] ? ' content-type' : '')
      : '') +
    '"' +
    ',signature="' +
    hmac +
    '"';
  const reqHeader:HeadersInit = { Authorization: authorization, Date: date };
  if (headers) {
    if (headers['content-type']) {
      reqHeader['content-type'] = headers['content-type'];
    }
    if (headers['content-length']) {
      reqHeader['content-length'] = headers['content-length'];
    }
  }
  return reqHeader;
}

export function getHeaders(cred: credInterface, body?: any) {
  let headers;
  if (body) {
    const contentLength = Buffer.from(JSON.stringify(body)).length;

    const tempHeaders = {
      'content-type': 'application/json',
      'content-length': contentLength.toString(),
    };

    headers = genrateAuthHeaders({ creds: cred, headers: tempHeaders, body });
  } else {
    headers = genrateAuthHeaders({ creds: cred });
  }
  return headers;
}
