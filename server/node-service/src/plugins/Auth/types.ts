export type SourceOptions = {
    jwtSecret: string;
    accountId: string;
    authToken: string;
    serviceId: string;
    testEmail: string;
    connectionString: string;
    collectionName: string;
  };
  
  export type QueryOptions = {
    actionName: Operation;
    email?: string;
    password?: string;
    jwt?: string;
    jwtSecret?: string;
    payload?: string;
    otp?: string;
    name?: string;
    role?: string;
    newPassword?: string;
  };
  
  export enum Operation {
    CreateUser = 'create_user',
    LoginUser = 'login_user',
    CheckJwt = 'verify_jwt',
    CreateJwt = 'create_jwt',
    initiatePasswordReset = 'initiate_password_reset',
    resetPasswordWithOTP = 'reset_password_with_otp',
    loginUserWithOTP = 'login_user_with_otp',
    initiateUserLoginWithOTP = 'initiate_user_login_with_otp',
    create_user_admin = 'create_user_admin',
    update_password = 'update_password',
    update_role_admin = 'update_role_admin',
    delete_user_admin = 'delete_user_admin',
    createUserWithOTP = 'create_user_with_otp',
    initiateUserSignupWithOTP = 'initiate_user_signup_with_otp',
  }