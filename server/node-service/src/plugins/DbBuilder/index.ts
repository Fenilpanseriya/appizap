import _ from "lodash";
import { DataSourcePlugin, ConfigToType, QueryConfig, DataSourceConfig, ActionConfig, ActionArrayParamConfig } from "lowcoder-sdk/dataSource";


function getActions(data: any): ActionConfig[] {
    let tempActionItem: ActionConfig[] = [];
    data.forEach((ele: any) => {
        let CreateActionList: ActionArrayParamConfig = Object.keys(ele.schema).map(fieldKey => {
            return {
                key: fieldKey,
                type: "textInput",
                label: fieldKey,
            }
        })
        let UpdateActionList: ActionArrayParamConfig = [...CreateActionList,
        {
            key: "rowId",
            type: "textInput",
            label: "rowId",
        }]
        let actionItems: ActionConfig[] = [{
            category: [ele.name],
            actionName: "create_row_" + ele.name,
            label: "Create row",
            params: CreateActionList,
        },
        {
            actionName: "update_row_" + ele.name,
            category: [ele.name],
            label: "Update row",
            params: UpdateActionList,
        },
        {
            actionName: "delete_row_" + ele.name,
            category: [ele.name],
            label: "Delete Row",
            params: [{
                key: "rowId",
                type: "textInput",
                label: "rowId",
            },],
        },
        {
            actionName: "list_" + ele.name,
            category: [ele.name],
            label: "List",
            params: [],
        },
        {
            actionName: "custom_query_" + ele.name,
            category: [ele.name],
            label: "Custom Query",
            params: [{
                key: "query",
                type: "sqlInput",
                label: "SQL Query",
            }],
        }
        ]
        tempActionItem.push(...actionItems);
    })
    return tempActionItem;

}

const serverUrl = process.env.OWN_SERVER_HOST;
const DbBuilderPlugin: DataSourcePlugin<any, any> = {
    id: "DbBuilder",
    name: "DbBuilder",
    icon: "DbBuilder.svg",
    category: "api",
    dataSourceConfig: {
        type: "dataSource",
        params: [{
            type: "textInput",
            key: "orgId",
            label: "Organization ID",
            rules: [{ required: true }],
        },],
    } as const,
    validateDataSourceConfig: async (dataSourceConfig, context) => {
        const orgId = dataSourceConfig.orgId;
        const serverUrl = process.env.OWN_SERVER_HOST;

        return fetch(`${serverUrl}/node-service/api/dbBuilder/${orgId}/test`, {
            method: 'GET',
        }).then(async res => {
            if (res.status == 200) {
                return {
                    success: true
                }
            } else {
                let erroData = await res.text();
                throw Error(erroData);
            }
        }).catch(err => {
            throw Error(err.message);
        })
    },
    queryConfig: async (test) => {
        const orgId = test.orgId;
        const serverUrl = process.env.OWN_SERVER_HOST;

        return fetch(`${serverUrl}/node-service/api/dbBuilder/${orgId}/tableList`, {
            method: 'GET',
        }).then(async res => {
            if (res.status == 200) {
                const data = await res.json();
                let items = data.map((ele: any) => {
                    return { label: ele.name?.toUpperCase(), value: ele.name };
                }) || [];
                let actions: ActionConfig[] = getActions(data);
                let queryConfig: QueryConfig = {
                    type: "query",
                    categories: {
                        label: "Table",
                        items,
                    },
                    label: "Actions",
                    actions
                }
                return queryConfig;
            } else {
                let erroData = await res.text();
                console.log(erroData, 'error in get schema')
                throw Error(erroData);
            }
        }).catch(err => {
            console.log(err.message, "error ")
            return {
                type: "query",
                label: "Actions",
                actions: [{
                    actionName: "initiate_user_signup_with_otp",
                    label: "default",
                    params: [

                    ],
                }],

            };;
        })
    },

    run: async function (actionData, dataSourceConfig) {
        console.log({ actionData: JSON.stringify(actionData), dataSourceConfig: JSON.stringify(dataSourceConfig) });
        const actionName = actionData?.actionName;
        const orgId = dataSourceConfig?.orgId;
        const data: any = {};
        Object.keys(actionData).forEach(key=>{
            if(actionData[key]){
                data[key]=actionData[key];
            }
        })
        delete data["actionName"];
        const serverUrl=process.env.OWN_SERVER_HOST
        let tablename: string;
        if (actionName.includes("create_row_")) {
            tablename = actionName.slice("create_row_".length);
            console.log("in create",{data,tablename});
            return fetch(`${serverUrl}/node-service/api/dbBuilder/${orgId}/newRow/${tablename}`, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                  },
            }).then(checkError);
        } else if (actionName.includes("update_row_")) {
            tablename = actionName.slice("update_row_".length);
            const id=data.rowId;
            delete data["rowId"];
            console.log("in update row",{data});
            return fetch(`${serverUrl}/node-service/api/dbBuilder/${orgId}/updateRow/${tablename}/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                  },
            }).then(checkError);
        } else if (actionName.includes("delete_row_")) {
            tablename = actionName.slice("delete_row_".length);
            const id=data.rowId;
            return fetch(`${serverUrl}/node-service/api/dbBuilder/${orgId}/deleteRow/${tablename}/${id}`, {
                method: 'DELETE',
            }).then(checkError); 

        } else if (actionName.includes("list_")) {
            tablename = actionName.slice("list_".length);
            return fetch(`${serverUrl}/node-service/api/dbBuilder/${orgId}/list/${tablename}`, {
                method: 'GET',
            }).then(checkError);
        }else if(actionName.includes("custom_query_")){
            tablename = actionName.slice("custom_query_".length);
            console.log(data,"in custom_query");
            return fetch(`${serverUrl}/node-service/api/dbBuilder/${orgId}/customQuery`, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                  },
            }).then(checkError);


        }
         else {
            throw Error("Invalid option " + actionName + " selected");
        };
    },
};

async function checkError(res:globalThis.Response){
        if (Math.floor(res.status/100)==2){
            const resData=await res.json();
            return resData;
        }else{
            const errData=await res.text()
            throw Error(errData);
        }
}
export default DbBuilderPlugin;
