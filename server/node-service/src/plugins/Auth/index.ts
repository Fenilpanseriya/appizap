import _ from "lodash";
import { ConfigToType, DataSourcePlugin, QueryConfig } from "lowcoder-sdk/dataSource";
const { MongoClient } = require("mongodb");
import { SourceOptions, QueryOptions, Operation } from './types';
import {
  checkJwtToken,
  generateJwtToken,
  signupUser,
  loginUser,
  initiatePasswordReset,
  resetPasswordWithOTP,
  loginUserWithOTP,
  initiateLoginWithOTP,
  createUser,
  updatePassword,
  updateRole,
  deleteUser,
  signUpSendOTP,
  signUpVerifyOTP,
} from './query_operations';
import { ServiceError } from "../../common/error";
import { Twilio } from "twilio";

const dataSourceConfig = {
  type: "dataSource",
  params: [
    {
      type: "textInput",
      key: "connectionString",
      label: "Mongo Connection string",
      placeholder:
        "mongodb+srv://tooljet:<password>@cluster0.i1vq4.mongodb.net/mydb?retryWrites=true&w=majority",
      rules: [{ required: true }],
    },
    {
      type: "password",
      key: "jwtSecret",
      label: "Jwt secret token",
      placeholder: "Enter your jwt secret token",
      rules: [{ required: true }],
    },
    {
      type: "textInput",
      key: "collectionName",
      label: "Collection name",
      placeholder: "Enter your jwt secret token",
      rules: [{ required: true }],
    },
    {
      type: "textInput",
      key: "accountId",
      label: "Twilio Account ID",
      placeholder: "Enter Account ID",
      rules: [{ required: true }],
    },
    {
      type: "password",
      key: "authToken",
      label: "Token",
      placeholder: "Enter your Auth token",
      rules: [{ required: true }],
    },
    {
      type: "textInput",
      key: "serviceId",
      label: "Service ID",
      placeholder: "Enter your ssid",
      rules: [{ required: true }],
    },
    {
      type: "textInput",
      key: "testEmail",
      label: "Test Email",
      placeholder: "Enter Email to test connection",
      rules: [{ required: true }],
    },
  ],
} as const;
let queryConfig: QueryConfig;

type DataSourceConfigType = ConfigToType<typeof dataSourceConfig>;

const authPlugin: DataSourcePlugin<any, DataSourceConfigType> = {
  id: "auth",
  name: "Auth",
  icon: "twilio.svg",
  category: "api",
  dataSourceConfig,

  queryConfig: async () => {
    if (!queryConfig) {
      queryConfig = {
        type: "query",
        label: "Action",
        actions: [
          {
            actionName: "initiate_user_signup_with_otp",
            label: "SignUp send OTP",
            params: [
              {
                key: "email",
                type: "textInput",
                label: "Email",
              },
            ],
          },
          {
            actionName: "create_user_with_otp",
            label: "SignUp verify OTP",
            params: [
              {
                key: "email",
                type: "textInput",
                label: "Email",
              },
              {
                key: "name",
                type: "textInput",
                label: "User Name",
              },
              {
                key: "otp",
                type: "textInput",
                label: "OTP",
              },
            ],
          },
          {
            actionName: "create_user",
            label: "Create User",
            params: [
              {
                key: "email",
                type: "textInput",
                label: "Email",
              },
              {
                key: "password",
                type: "textInput",
                label: "Password",
              },
              {
                key: "name",
                type: "textInput",
                label: "User Name",
              },
            ],
          },
          {
            actionName: "verify_jwt",
            label: "Verify JWT",
            params: [
              {
                key: "jwt",
                type: "textInput",
                label: "JWT",
              },
            ],
          },
          {
            actionName: "login_user",
            label: "Login User",
            params: [
              {
                key: "email",
                type: "textInput",
                label: "Email",
              },
              {
                key: "password",
                type: "textInput",
                label: "Password",
              },
            ],
          },
          {
            actionName: "initiate_password_reset",
            label: "Reset Password send OTP",
            params: [
              {
                key: "email",
                type: "textInput",
                label: "Email",
              },
            ],
          },
          {
            actionName: "reset_password_with_otp",
            label: "Reset Password Verify OTP",
            params: [
              {
                key: "email",
                type: "textInput",
                label: "Email",
              },
              {
                key: "otp",
                type: "textInput",
                label: "OTP",
              },
              {
                key: "password",
                type: "textInput",
                label: "New Password",
              },
            ],
          },
          {
            actionName: "initiate_user_login_with_otp",
            label: "Login send OTP",
            params: [
              {
                key: "email",
                type: "textInput",
                label: "Email",
              },
            ],
          },
          {
            actionName: "login_user_with_otp",
            label: "Login verify OTP",
            params: [
              {
                key: "email",
                type: "textInput",
                label: "Email",
              },
              {
                key: "otp",
                type: "textInput",
                label: "OTP",
              },
            ],
          },
          {
            actionName: "create_user_admin",
            label: "Create user -Admin",
            params: [
              {
                key: "jwt",
                type: "textInput",
                label: "JWT",
              },
              {
                key: "email",
                type: "textInput",
                label: "Email",
              },
              {
                key: "name",
                type: "textInput",
                label: "User Name",
              },
              {
                key: "role",
                type: "textInput",
                label: "User Role",
              },
            ],
          },
          {
            actionName: "update_password",
            label: "Update password",
            params: [
              {
                key: "email",
                type: "textInput",
                label: "Email",
              },
              {
                key: "password",
                type: "textInput",
                label: "Current Password",
              },
              {
                key: "newPassword",
                type: "textInput",
                label: "New Password",
              },
            ],
          },
          {
            actionName: "update_role_admin",
            label: "Update role -Admin",
            params: [
              {
                key: "jwt",
                type: "textInput",
                label: "JWT",
              },
              {
                key: "email",
                type: "textInput",
                label: "Email",
              },
              {
                key: "role",
                type: "textInput",
                label: "User Role",
              },
            ],
          },
          {
            actionName: "delete_user_admin",
            label: "Delete user -Admin",
            params: [
              {
                key: "jwt",
                type: "textInput",
                label: "JWT",
              },
              {
                key: "email",
                type: "textInput",
                label: "Email",
              },
            ],
          },
        ],
      };
    }
    return queryConfig;
  },

  run: async function (actionData, dataSourceConfig): Promise<any> {
    const { db, close } = await getConnection(dataSourceConfig);
    const operation: Operation = actionData.actionName;
    let result = {};
    try {
      switch (operation) {
        case Operation.CreateUser:
          result = await signupUser(db, dataSourceConfig, actionData );
          break;

        case Operation.LoginUser:
          result = await loginUser(db, dataSourceConfig, actionData);
          break;

        case Operation.CheckJwt:
          result = await checkJwtToken(db, dataSourceConfig, actionData);
          break;

        case Operation.CreateJwt:
          result = await generateJwtToken(db, dataSourceConfig, actionData);
          break;
        case Operation.initiatePasswordReset:
          result = await initiatePasswordReset(db, dataSourceConfig, actionData);
          break;
        case Operation.resetPasswordWithOTP:
          result = await resetPasswordWithOTP(db, dataSourceConfig, actionData);
          break;
        case Operation.initiateUserLoginWithOTP:
          result = await initiateLoginWithOTP(db, dataSourceConfig, actionData);
          break;
        case Operation.loginUserWithOTP:
          result = await loginUserWithOTP(db, dataSourceConfig, actionData);
          break;
        case Operation.create_user_admin:
          result = await createUser(db, dataSourceConfig, actionData);
          break;
        case Operation.update_password:
          result = await updatePassword(db, dataSourceConfig, actionData);
          break;
        case Operation.update_role_admin:
          result = await updateRole(db, dataSourceConfig, actionData);
          break;
        case Operation.delete_user_admin:
          result = await deleteUser(db, dataSourceConfig, actionData);
          break;
        case Operation.initiateUserSignupWithOTP:
          result = await signUpSendOTP(db, dataSourceConfig, actionData);
          break;
        case Operation.createUserWithOTP:
          result = await signUpVerifyOTP(db, dataSourceConfig, actionData);
          break;

        default:
          throw new ServiceError( 'Invalid operation', 400);
      }
    } catch (error: any) {
      throw new ServiceError(error.message, 400);
    } finally {
      await close();
    }

    return {
      status: 'ok',
      data: result,
    };
  },
 
  validateDataSourceConfig: async function (dataSourceConfig): Promise<any> {
    return validateDataSourceConfig(dataSourceConfig);
  },
};

export default authPlugin;
async function getConnection(dataSourceConfig: any) {
    let db = null;
  
    const connectionString = dataSourceConfig["connectionString"];
  
    try {
      const client = new MongoClient(connectionString);
      await client.connect();
      db = client.db();
  
      return {
        db,
        close: async () => {
          await client?.close?.();
        },
      };
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error; // Re-throw the error for handling in the calling code
    }
  }

async function validateDataSourceConfig(dataSourceConfig: any) {
  try {
    const { db, close } = await getConnection(dataSourceConfig);
    await db.listCollections().toArray();
    await close();
    const twilio: Twilio = await connect(dataSourceConfig);
    const response = await twilio.verify.v2.services(dataSourceConfig.serviceId).verifications.create({
      to: dataSourceConfig.testEmail,
      channel: 'email',
    });
    return {
      success: true,
    };
  } catch (e) {
    
      return {
        success: false,
        message: e,
      };
  }
}

async function connect(dataSourceConfig: any){
  const { accountId, authToken } = dataSourceConfig;

  const client = new Twilio(accountId, authToken);

  return client;
}