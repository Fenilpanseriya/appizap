import { DataSourcePlugin, ConfigToType, DataSourceConfig } from "lowcoder-sdk/dataSource";
import { ServiceError } from "../../common/error";
import axios from "axios";


interface CustomDataSourceConfig extends DataSourceConfig {
  extra: (data: any) => Promise<any>;
}
const dataSourceConfig: CustomDataSourceConfig = {
  type: "dataSource",
  params: [
    {
      type: "password",
      key: "api_token",
      label: "API Token",
      placeholder: "API token for Baserow",
      rules: [{ required: true }],
    },
    {
      type: "select",
      key: "host",
      label: "Host",
      options: [
        { label: "Baserow Cloud", value: "baserow_cloud" },
        { label: "Self Hosted", value: "self_hosted" },
      ],
      rules: [{ required: true }],
    },
  ],
  extra: async (data: any) => {
    if (data.host === "self_hosted") {
      return {
        data: "self_hosted",
        extraParams: [
          {
            type: "text",
            key: "base_url",
            label: "Base URL",
            placeholder: "Base URL for self hosted baserow",
          },
        ],
      };
    }
    return { data: null, extraParams: [] };
  },
} as const;

const queryConfig = {
  type: "query",
  label: "Operation",
  actions: [
    {
      actionName: "list_fields",
      label: "List Fields",
      params: [
        { key: "table_id", type: "textInput", label: "Table ID", placeholder: "Enter table ID" },
      ],
    },
    {
      actionName: "list_rows",
      label: "List Rows",
      params: [
        { key: "table_id", type: "textInput", label: "Table ID", placeholder: "Enter table ID" },
      ],
    },
    {
      actionName: "get_row",
      label: "Get Row",
      params: [
        { key: "table_id", type: "textInput", label: "Table ID", placeholder: "Enter table ID" },
        { key: "row_id", type: "textInput", label: "Row ID", placeholder: "Enter row ID" },
      ],
    },
    {
      actionName: "create_row",
      label: "Create Row",
      params: [
        { key: "table_id", type: "textInput", label: "Table ID", placeholder: "Enter table ID" },
        { key: "body", type: "jsonInput", label: "Records", placeholder: "{ \"fieldName\": \"value\" }" },
      ],
    },
    {
      actionName: "update_row",
      label: "Update Row",
      params: [
        { key: "table_id", type: "textInput", label: "Table ID", placeholder: "Enter table ID" },
        { key: "row_id", type: "textInput", label: "Row ID", placeholder: "Enter row ID" },
        { key: "body", type: "jsonInput", label: "Updated Fields", placeholder: "{ \"fieldName\": \"value\" }" },
      ],
    },
    {
      actionName: "move_row",
      label: "Move Row",
      params: [
        { key: "table_id", type: "textInput", label: "Table ID", placeholder: "Enter table ID" },
        { key: "row_id", type: "textInput", label: "Row ID", placeholder: "Enter row ID" },
        { key: "before_id", type: "textInput", label: "Before ID", placeholder: "Enter before ID where the row needs to be moved" },
      ],
    },
    {
      actionName: "delete_row",
      label: "Delete Row",
      params: [
        { key: "table_id", type: "textInput", label: "Table ID", placeholder: "Enter table ID" },
        { key: "row_id", type: "textInput", label: "Row ID", placeholder: "Enter row ID" },
      ],
    },
  ],
} as const;

const baseRow: DataSourcePlugin<
  ConfigToType<typeof queryConfig>,
  ConfigToType<typeof dataSourceConfig>
> = {
  id: "baseRow",
  name: "baseRow",
  category: "api",
  icon: "baseRow.svg",
  description: "A schema defining Baserow datasource",
  dataSourceConfig,
  queryConfig,
  run: async (action: any, dataSourceConfig: any) => {
    let result = {};
    const operation = action.actionName;
    const apiToken = dataSourceConfig.api_token;
    const host =  dataSourceConfig.host;
    const baseUrl =  host === 'baserow_cloud' ? 'https://api.baserow.io' : dataSourceConfig.dynamicParamsConfig.base_url;

    try {
      switch (operation) {
        case "list_fields": {
          const tableId = action.table_id;
          const response = await axios.get(`${baseUrl}/api/database/fields/table/${tableId}/?user_field_names=true`, {
            headers: { Authorization: `Token ${apiToken}` },
          });
          result = response.data;
          
          break;
        }
        case "list_rows": {
          const tableId = action.table_id;
          const response = await axios.get(`${baseUrl}/api/database/rows/table/${tableId}/?user_field_names=true`, {
            headers: { Authorization: `Token ${apiToken}` },
          });
          result = response.data;
          break;
        }
        case "get_row": {
          const tableId = action.table_id;
          const rowId = action.row_id;
          const response = await axios.get(`${baseUrl}/api/database/rows/table/${tableId}/${rowId}/?user_field_names=true`, {
            headers: { Authorization: `Token ${apiToken}` },
          });
          result = response.data;
          break;
        }
        case "create_row": {
          const tableId = action.table_id;
          const body = action.body;
          const response = await axios.post(`${baseUrl}/api/database/rows/table/${tableId}/?user_field_names=true`, body, {
            headers: { Authorization: `Token ${apiToken}` },
          });
          result = response.data;
          break;
        }
        case "update_row": {
          const tableId = action.table_id;
          const rowId = action.row_id;
          const body = action.body;
          const response = await axios.patch(`${baseUrl}/api/database/rows/table/${tableId}/${rowId}/?user_field_names=true`, body, {
            headers: { Authorization: `Token ${apiToken}` },
          });
          result = response.data;
          break;
        }
        case "move_row": {
          const tableId = action.table_id;
          const beforeId = action.before_id;
          const rowId = action.row_id;
          const response = await axios.patch(`${baseUrl}/api/database/rows/table/${tableId}/${rowId}/move/?user_field_names=true&before_id=${beforeId}`, {}, {
            headers: { Authorization: `Token ${apiToken}` },
          });
          result = response.data;
          break;
        }
        case "delete_row": {
          const tableId = action.table_id;
          const rowId = action.row_id;
          const response = await axios.delete(`${baseUrl}/api/database/rows/table/${tableId}/${rowId}/`, {
            headers: { Authorization: `Token ${apiToken}` },
          });
          result = response.data;
          break;
        }
        default: {
          throw new ServiceError("Invalid action", 400);
        }
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new ServiceError(error.response.data.error.message, error.response.status);
      } else if (error.message) {
        throw new ServiceError(error.message, 500);
      } else {
        throw new ServiceError("An error occurred while processing the request", 500);
      }
    }
    return {
      status: true,
      data: result,
    };
  },

  
};

export default baseRow;
