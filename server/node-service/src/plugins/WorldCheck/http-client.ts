const HttpVerb = {
    Get: 'GET',
    Post: 'POST',
    Put: 'PUT',
    Patch: 'PATCH',
    Delete: 'DELETE',
  };
  interface HttpClientArg {
    host: string;
    headers: any;
  }
  class HttpClient {
    private host: string;
    private headers: any;
    constructor(args: HttpClientArg) {
      this.host = args.host;
      this.headers = {
        ...args.headers,
      };
    }
  
    extractResponseHeaders(response:globalThis.Response) {
      const object:any = {};
      response.headers.forEach((value, key) => {
        object[key] = value;
      });
      return object;
    }
  
    async request(method: string, data?: any) {
      console.log('in request', { method, data });
      const endpoint = this.host;
      console.log(endpoint, 'this is url', method, this.host, '#', '#');
      const options: any = {
        method,
        headers: this.headers,
      };
      if (data) {
        options.body = JSON.stringify(data);
      }
      console.log({ endpoint, options });
      const request = new Request(endpoint, options);
      console.log('this is request', request);
  
      return fetch(request)
        .then(async (res) => {
          const payload = {
            status: res.status,
            statusText: res.statusText,
            headers: this.extractResponseHeaders(res),
          };
          console.log('in then', payload);
          if (Math.floor(res.status / 100) == 2) {
            if (res.status == 204) {
              return Promise.resolve(' Success ');
            }
            return res.json();
          } else {
            console.log({ status: res.status, statusText: res.statusText });
            const errMess = await res.text();
            return Promise.reject({ status: res.status, text: res.statusText, message: errMess });
          }
        })
        .catch(async (err) => {
          console.log(err, err.message, 'this is final error');
          return Promise.reject(err.message || err);
        });
    }
  
    get() {
      return this.request(HttpVerb.Get);
    }
  
    post(data?: any) {
      return this.request(HttpVerb.Post, data);
    }
  
    put(data?: any) {
      return this.request(HttpVerb.Put, data);
    }
  
    patch(data?: any) {
      return this.request(HttpVerb.Patch, data);
    }
  
    delete() {
      return this.request(HttpVerb.Delete);
    }
  }
  
  export default HttpClient;
  