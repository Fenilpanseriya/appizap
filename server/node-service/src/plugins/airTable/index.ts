import { DataSourcePlugin, ConfigToType } from "lowcoder-sdk/dataSource";
import { ServiceError } from "../../common/error";
import axios from "axios";

interface ValidationResponse {
  success: boolean;
};
const dataSourceConfig = {
  type: "dataSource",
  params: [
    {
      type: "password",
      key: "api_key",
      label: "API key",
      placeholder: "Api key for airtable",
      tooltip: "For generating API key, visit: <a href='https://airtable.com/account' target='_blank' rel='noreferrer'>Airtable account page</a>",
      rules: [{ required: true }],
    },
  ],
} as const;

const queryConfig = {
  type: "query",
  label: "Action",
  actions: [
    {
      actionName: "list_records",
      label: "List records",
      params: [
        { key: "base_id", type: "textInput", label: "Base ID", placeholder : "appwKbrBctcQF9pYr" },
        { key: "table_name", type: "textInput", label: "Table name", placeholder: "Table_name" },
        { key: "page_size", type: "textInput", label: "Page size" },
        { key: "offset", type: "textInput", label: "Offset" },
      ],
    },
    {
      actionName: "retrieve_record",
      label: "Retrieve record",
      params: [
        { key: "base_id", type: "textInput", label: "Base ID", placeholder : "appwKbrBctcQF9pYr" },
        { key: "table_name", type: "textInput", label: "Table name", placeholder: "Table_name" },
        { key: "record_id", type: "textInput", label: "Record ID", placeholder: "recYLgNXdphkd68BT" },
      ],
    },
    {
      actionName: "create_record",
      label: "Create record",
      params: [
        { key: "base_id", type: "textInput", label: "Base ID", placeholder : "appwKbrBctcQF9pYr" },
        { key: "table_name", type: "textInput", label: "Table name", placeholder: "Table_name" },
        { key: "body", type: "jsonInput", label: "Records", placeholder: "[{ \"fields\": {} }]" },
      ],
    },
    {
      actionName: "update_record",
      label: "Update record",
      params: [
        { key: "base_id", type: "textInput", label: "Base ID", placeholder : "appwKbrBctcQF9pYr" },
        { key: "table_name", type: "textInput", label: "Table name", placeholder: "Table_name" },
        { key: "record_id", type: "textInput", label: "Record ID", placeholder: "recYLgNXdphkd68BT" },
        { key: "body", type: "jsonInput", label: "Body", placeholder: "{\n  \"key\": \"value\"\n}"  },
      ],
    },
    {
      actionName: "delete_record",
      label: "Delete record",
      params: [
        { key: "base_id", type: "textInput", label: "Base ID", placeholder : "appwKbrBctcQF9pYr" },
        { key: "table_name", type: "textInput", label: "Table name", placeholder: "Table_name" },
        { key: "record_id", type: "textInput", label: "Record ID", placeholder: "recYLgNXdphkd68BT" },
      ],
    },
  ],
} as const;

const airTable: DataSourcePlugin<
  ConfigToType<typeof queryConfig>,
  ConfigToType<typeof dataSourceConfig>
> = {
  id: "airtable",
  name: "AirTable",
  category: "api",
  icon: "airTable.svg",
  description: "A schema defining airtable datasource",
  dataSourceConfig,
  queryConfig,
  run: async (action: any, dataSourceConfig: any) => {
    let result = {};
    const operation = action.actionName;
    const baseId = action.base_id;
    const tableName = action.table_name;
    const apiKey = dataSourceConfig.api_key;

    try {
      switch (operation) {
        case "list_records": {
          const pageSize = action.page_size || "";
          const offset = action.offset || "";

          const response = await axios.get(
            `https://api.airtable.com/v0/${baseId}/${tableName}/?pageSize=${pageSize}&offset=${offset}`,
            {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
            }
          );

          result = response.data;
          break;
        }
        case "retrieve_record": {
          const recordId = action.record_id;

          const response = await axios.get(
            `https://api.airtable.com/v0/${baseId}/${tableName}/${recordId}`,
            {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
            }
          );

          result = response.data;
          break;
        }
        case "create_record": {
          const response = await axios.post(
            `https://api.airtable.com/v0/${baseId}/${tableName}`,
            {
              records: action.body,
            },
            {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
            }
          );

          result = response.data;
          break;
        }
        case "update_record": {
          const response = await axios.patch(
            `https://api.airtable.com/v0/${baseId}/${tableName}`,
            {
              records: [
                {
                  id: action.record_id,
                  fields: action.body,
                },
              ],
            },
            {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
            }
          );

          result = response.data;
          break;
        }
        case "delete_record": {
          const response = await axios.delete(
            `https://api.airtable.com/v0/${baseId}/${tableName}/${action.record_id}`,
            {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
            }
          );

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
  
  validateDataSourceConfig: async function (dataSourceConfig): Promise<ValidationResponse> {
    const apiKey = dataSourceConfig.api_key;

    try {
      const response = await axios.get("https://api.airtable.com/v0/meta/whoami", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data?.id) {
        return {
          success: true,
        };
      }

      return {
        success: false,
      };
    } catch (error) {
      return {
        success: false,
      };
    }
  },

};

export default airTable;