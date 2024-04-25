import { QueryConfig  } from "lowcoder-sdk/dataSource";

const queryConfig:any = {
  type: "query",
  label: "Options",
  actions: [{
      actionName: "initiate_user_signup_with_otp",
      label: "SignUp send OTP",
      params: [
        {
          key: "email",
          type: "textInput",
          label: "Email",
        },
      ],
    }],
  categories:{
      label: "Table",
      items: async ()=>[{ label: "Storage", value: "value_of_storage" },{ label: "Storage1", value: "value_of1_storage" }],
    },
};
export default queryConfig;
