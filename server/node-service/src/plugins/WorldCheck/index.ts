import { DataSourcePlugin } from "lowcoder-sdk/dataSource";
import Action from "./Config";
import { credInterface } from "./types";
import { getHeaders } from "./utils";
import HttpClient from "./http-client";
import getResult from "./operation";

export const GATEWAY_PROTOCOL = 'https://';
export const GATEWAY_HOST = 'api-worldcheck.refinitiv.com';
export const GATEWAY_URL = '/v2/';


const WorldCheckPlugin: DataSourcePlugin<any, any> = {
    id: "WorldCheck",
    name: "WorldCheck",
    icon: "WorldCheck.svg",
    category: "api",
    dataSourceConfig: {
        type: "dataSource",
        params: [{
            type: "textInput",
            key: "api_key",
            label: "API KEY",
            rules: [{ required: true }],
        },
        {
            type: "password",
            key: "api_secret",
            label: "API SECRET",
            rules: [{ required: true }],
        }
        ],
    } as const,
    validateDataSourceConfig: async (dataSourceConfig, context) => {
        const { api_key, api_secret } = dataSourceConfig;
        console.log({ api_key, api_secret });
        const url = 'apiInfo';
        const cred: credInterface = {
            apiKey: api_key,
            apiSecret: api_secret,
            url: url,
            method: 'get',
        };
        const headers = getHeaders(cred);
        const args = {
            host: GATEWAY_PROTOCOL + GATEWAY_HOST + GATEWAY_URL + url,
            headers,
        };
        const client = new HttpClient(args);
        return client
            .get()
            .then((data: any) => {
                return {
                    success: true,
                    message: data
                };
            })
            .catch((err: any) => {
                throw new Error(JSON.stringify(err));
            });

    },
    queryConfig: {
        type: "query",
        label: "Actions",
        actions: Action
    },

    run: async function (actionData, dataSourceConfig) {
        console.log({ actionData, dataSourceConfig })
        const actionName = actionData?.actionName;
        const { api_key, api_secret } = dataSourceConfig;
        const sourceOptions={api_key,api_secret}
        let result;

        try {
            result = await getResult(actionName, sourceOptions, actionData);
        } catch (error:any) {
            console.log(error.message);
            throw new Error(`ERROR ${error.message}`);
        }

        return {
            data: result,
        };
    }
}

export default WorldCheckPlugin;
