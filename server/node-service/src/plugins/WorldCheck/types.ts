import exp from "constants";

export type SourceOptions = {
  api_secret: string;
  api_key: string;
};

export interface credInterface {
  apiKey: string;
  apiSecret: string;
  url: string;
  method: 'post' | 'get' | 'put' | 'delete';
}

export interface secondaryFieldsElement{
  typeId:string,
  value:string,
  dateTimeValue?:string
}
