import { QueryOptions, SourceOptions } from "./types";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { Twilio } from "twilio";
export async function signupUser(
  db: any,
  sourceOptions: SourceOptions,
  options: QueryOptions
): Promise<object> {
  try {
    const jwtSecret = sourceOptions.jwtSecret;
    const expiresIn = "30d";
    const collectionName = sourceOptions.collectionName;

    // Check if the user already exists
    const existingUser = await db.collection(collectionName).findOne({ email: options.email });

    if (existingUser) {
      return { status: false, msg: "User already exists" };
    }

    // If there are no existing users, assume it's the first user and assign the 'admin' role
    let userRole = "user";
    const existingUsersCount = await db.collection(collectionName).countDocuments();

    if (existingUsersCount === 0) {
      userRole = "admin";
    }
    if (typeof options.password !== "string") {
      throw new Error("Payload must be a string");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(options.password, 10);

    // Create a new user
    const result = await db.collection(collectionName).insertOne({
      email: options.email,
      password: hashedPassword,
      name: options.name,
      role: userRole,
    });
    if (result.acknowledged === true) {
      const payload = { email: options.email, name: options.name, role: userRole };
      const token = jwt.sign(payload, jwtSecret, { expiresIn });
      return { status: true, token: token, msg: "User created" };
    }
    return { status: false, result: result, msg: "User not created" };
  } catch (error) {
    console.error("Error in signupUser:", error);
    return { status: false, error: error, msg: "User not created" };
  }
}

export async function loginUser(
  db: any,
  sourceOptions: SourceOptions,
  options: QueryOptions,
  expiresIn = "30d"
): Promise<object> {
  try {
    const jwtSecret = sourceOptions.jwtSecret;
    const collectionName = sourceOptions["collectionName"];

    // Find the user in the database
    const user = await db.collection(collectionName).findOne({ email: options.email });
    if (typeof options.password !== "string") {
      throw new Error("Payload must be a string");
    }
    if (user) {
      if (!user?.password) {
        return { status: false, msg: "Please reset your password" };
      }
      // Compare the entered password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(options.password, user.password);
      if (typeof options.password !== "string") {
        throw new Error("Payload must be a string");
      }
      if (passwordMatch) {
        // If the password is correct, generate and return a JWT token
        // const jwtSecret = 'your_secret_key'; // Replace with your actual secret key
        const payload = { email: user.email, name: user.name, role: user.role };
        const token = jwt.sign(payload, jwtSecret, { expiresIn });

        return { status: true, token: token, msg: "Login successful" };
      }
    }

    // If the user doesn't exist or the password is incorrect, return null
    return { status: false, msg: "User doesn't exist" };
  } catch (error) {
    console.error("Error in loginUser:", error);
    return { status: false, error: error, msg: "Login failed" };
  }
}

export async function checkJwtToken(
  db: any,
  sourceOptions: SourceOptions,
  options: QueryOptions
): Promise<object> {
  const jwtToken: any = options.jwt;
  const jwtSecret = sourceOptions.jwtSecret;

  try {
    // Verify the JWT token using the provided secret
    const decodedData: any = jwt.verify(jwtToken, jwtSecret);

    // If verification is successful, parse string properties in the payload
    const parsedData = parseStringProperties(decodedData);

    return { status: true, data: parsedData, msg: "Token verified" };
  } catch (error) {
    // If there's an error during verification, return false
    return { status: false, error: error, msg: "Token verification failed" };
  }
}

// Function to parse string properties in the payload
function parseStringProperties(data: any): any {
  if (typeof data === "object") {
    // Recursively parse string properties
    for (const key in data) {
      if (typeof data[key] === "string") {
        try {
          data[key] = JSON.parse(data[key]);
        } catch (e) {
          // Handle parsing error if needed
        }
      } else if (typeof data[key] === "object") {
        data[key] = parseStringProperties(data[key]);
      }
    }
  }

  return data;
}

export async function generateJwtToken(
  db: any,
  sourceOptions: SourceOptions,
  options: QueryOptions,
  expiresIn = "30d"
): Promise<object> {
  // Sign the JWT with the payload, secret, and optional expiration time
  const jwtSecret = sourceOptions.jwtSecret;
  let payloadObject: object;

  if (typeof options.payload !== "string") {
    throw new Error("Payload must be a string");
  }

  try {
    // Attempt to parse the payload string into an object
    payloadObject = JSON.parse(options.payload);
  } catch (error) {
    // Handle parsing error
    throw new Error("Invalid payload format");
  }

  // Sign the JWT with the payload, secret, and optional expiration time
  const token = jwt.sign(payloadObject, jwtSecret, { expiresIn });
  return { token: token, data: options, msg: "Token generated" };
}

async function twilioConnect({
  accountId,
  authToken,
}: {
  accountId: string;
  authToken: string;
}): Promise<Twilio> {
  const client = new Twilio(accountId, authToken);

  return client;
}

export async function initiatePasswordReset(
  db: any,
  sourceOptions: SourceOptions,
  options: QueryOptions
): Promise<{ status: boolean; msg?: string }> {
  try {
    // Find the user in the database
    const collectionName = sourceOptions["collectionName"];
    const user = await db.collection(collectionName).findOne({ email: options.email });
    if (!options.email || typeof options.email !== "string") {
      throw new Error("Email address is missing or invalid");
    }
    if (user) {
      const twilioClient = await twilioConnect(sourceOptions);
      await twilioClient.verify.v2
        .services(sourceOptions.serviceId)
        .verifications.create({ to: options.email, channel: "email" });

      return { status: true, msg: "OTP sent successfully" };
    } else {
      // If the user doesn't exist, return an error message
      return { status: false, msg: "User doesn't exist" };
    }
  } catch (error) {
    console.error("Error in initiatePasswordReset:", error);
    return { status: false, msg: "Error initiating password reset" };
  }
}

export async function resetPasswordWithOTP(
  db: any,
  sourceOptions: SourceOptions,
  options: QueryOptions
): Promise<{ status: boolean; msg?: string }> {
  try {
    const collectionName = sourceOptions["collectionName"];
    // Find the user in the database
    const user = await db.collection(collectionName).findOne({ email: options.email });

    if (user) {
      // If the OTP is correct, remove the OTP from the user data
      const twilioClient = await twilioConnect(sourceOptions);
      const response = await twilioClient.verify.v2
        .services(sourceOptions.serviceId)
        .verificationChecks.create({
          to: options.email,
          code: options.otp,
        });
      if (typeof options.password !== "string") {
        throw new Error("Payload must be a string");
      }
      // Hash and salt the new password before updating it in the database
      const hashedPassword = await bcrypt.hash(options.password, 10);

      if (response.status === "approved") {
        // Update the password in the user data
        await db
          .collection(collectionName)
          .updateOne({ email: options.email }, { $set: { password: hashedPassword } });
      } else {
        return { status: false, msg: "Invalid OTP" };
      }
      return { status: true, msg: "Password reset successful" };
    } else {
      // If the user doesn't exist or the OTP is incorrect, return an error message
      return { status: false, msg: "Invalid OTP" };
    }
  } catch (error) {
    console.error("Error in resetPasswordWithOTP:", error);
    return { status: false, msg: "Error resetting password" };
  }
}

export async function initiateLoginWithOTP(
  db: any,
  sourceOptions: SourceOptions,
  options: QueryOptions
): Promise<{ status: boolean; msg?: string }> {
  try {
    // Find the user in the database
    const collectionName = sourceOptions["collectionName"];
    const user = await db.collection(collectionName).findOne({ email: options.email });
    if (!options.email || typeof options.email !== "string") {
      throw new Error("Email address is missing or invalid");
    }
    if (user) {
      const twilioClient = await twilioConnect(sourceOptions);
      await twilioClient.verify.v2
        .services(sourceOptions.serviceId)
        .verifications.create({ to: options.email, channel: "email" });

      return { status: true, msg: "OTP sent successfully" };
    } else {
      // If the user doesn't exist, return an error message
      return { status: false, msg: "User doesn't exist" };
    }
  } catch (error) {
    console.error("Error in initiateLoginWithOTP:", error);
    return { status: false, msg: "Error initiating Login OTP" };
  }
}

export async function loginUserWithOTP(
  db: any,
  sourceOptions: SourceOptions,
  options: QueryOptions,
  expiresIn = "30d"
): Promise<object> {
  try {
    const jwtSecret = sourceOptions.jwtSecret;
    const collectionName = sourceOptions["collectionName"];

    // Find the user in the database
    const user = await db.collection(collectionName).findOne({ email: options.email });

    if (user) {
      const twilioClient = await twilioConnect(sourceOptions);
      const response = await twilioClient.verify.v2
        .services(sourceOptions.serviceId)
        .verificationChecks.create({
          to: options.email,
          code: options.otp,
        });

      if (response.status === "approved") {
        // If the otp is correct, generate and return a JWT token
        const payload = { email: user.email, name: user.name, role: user.role };
        const token = jwt.sign(payload, jwtSecret, { expiresIn });

        return { status: true, token: token, msg: "Login successful" };
      } else {
        return { status: false, msg: "Invalid OTP" };
      }
    }

    // If the user doesn't exist or the password is incorrect, return null
    return { status: false, msg: "User doesn't exist" };
  } catch (error) {
    console.error("Error in loginUser:", error);
    return { status: false, error: error, msg: "Error logging in, please try again" };
  }
}

export async function createUser(
  db: any,
  sourceOptions: SourceOptions,
  options: QueryOptions
): Promise<object> {
  try {
    const jwtToken: any = options.jwt;
    const jwtSecret = sourceOptions.jwtSecret;
    const decodedData: any = jwt.verify(jwtToken, jwtSecret);
    if (decodedData.role !== "admin") {
      return { status: false, msg: "Unauthorized" };
    }
    const collectionName = sourceOptions.collectionName;

    // Check if the user already exists
    const existingUser = await db.collection(collectionName).findOne({ email: options.email });

    if (existingUser) {
      return { status: false, msg: "User already exists" };
    }
    // Create a new user
    const result = await db.collection(collectionName).insertOne({
      email: options.email,
      name: options.name,
      role: options.role,
    });
    return { status: true, result: result, msg: "User created successfully" };
  } catch (error) {
    console.error("Error in signupUser:", error);
    return { status: false, error: error, msg: "Error creating user, please try again" };
  }
}

export async function updatePassword(
  db: any,
  sourceOptions: SourceOptions,
  options: QueryOptions
): Promise<object> {
  try {
    const collectionName = sourceOptions["collectionName"];

    // Find the user in the database
    const user = await db.collection(collectionName).findOne({ email: options.email });
    if (typeof options.password !== "string" || typeof options.newPassword !== "string") {
      throw new Error("Payload must be a string");
    }
    if (user) {
      // Compare the entered password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(options.password, user.password);

      if (passwordMatch) {
        // If the password is correct
        const hashedPassword = await bcrypt.hash(options.newPassword, 10);
        await db
          .collection(collectionName)
          .updateOne({ email: options.email }, { $set: { password: hashedPassword } });

        return { status: true, msg: "Password updated successfully" };
      }
      return { status: false, msg: "Invalid password" };
    }

    // If the user doesn't exist or the password is incorrect, return null
    return { status: false, msg: "User doesn't exist" };
  } catch (error) {
    console.error("Error in loginUser:", error);
    return { status: false, error: error, msg: "Error updating password, please try again" };
  }
}

export async function updateRole(
  db: any,
  sourceOptions: SourceOptions,
  options: QueryOptions
): Promise<object> {
  try {
    const jwtToken: any = options.jwt;
    const jwtSecret = sourceOptions.jwtSecret;
    const decodedData: any = jwt.verify(jwtToken, jwtSecret);
    if (decodedData.role !== "admin") {
      return { status: false, msg: "Unauthorized" };
    }
    if (decodedData.email === options.email) {
      return { status: false, msg: "Can't update role of own account" };
    }
    const collectionName = sourceOptions["collectionName"];

    // Find the user in the database
    const user = await db.collection(collectionName).findOne({ email: options.email });

    if (user) {
      await db
        .collection(collectionName)
        .updateOne({ email: options.email }, { $set: { role: options.role } });

      return { status: true, msg: "Role updated successfully" };
    }

    // If the user doesn't exist or the password is incorrect, return null
    return { status: false, msg: "User doesn't exist" };
  } catch (error) {
    console.error("Error in loginUser:", error);
    return { status: false, error: error, msg: "Error updating role, please try again" };
  }
}

export async function signUpSendOTP(
  db: any,
  sourceOptions: SourceOptions,
  options: QueryOptions
): Promise<{ status: boolean; msg?: string }> {
  try {
    // Find the user in the database
    const collectionName = sourceOptions["collectionName"];
    const user = await db.collection(collectionName).findOne({ email: options.email });
    if (!options.email || typeof options.email !== "string") {
      throw new Error("Email address is missing or invalid");
    }
    if (!user) {
      const twilioClient = await twilioConnect(sourceOptions);
      await twilioClient.verify.v2
        .services(sourceOptions.serviceId)
        .verifications.create({ to: options.email, channel: "email" });

      return { status: true, msg: "OTP sent successfully" };
    } else {
      // If the user doesn't exist, return an error message
      return { status: false, msg: "User already exist" };
    }
  } catch (error) {
    console.error("Error in sending otp:", error);
    return { status: false, msg: "Error in sending otp" };
  }
}

export async function signUpVerifyOTP(
  db: any,
  sourceOptions: SourceOptions,
  options: QueryOptions
): Promise<object> {
  try {
    const jwtSecret = sourceOptions.jwtSecret;
    const expiresIn = "30d";
    const collectionName = sourceOptions.collectionName;

    // Check if the user already exists
    const existingUser = await db.collection(collectionName).findOne({ email: options.email });

    if (existingUser) {
      return { status: false, msg: "User already exists" };
    }
    const twilioClient = await twilioConnect(sourceOptions);
    const response = await twilioClient.verify.v2
      .services(sourceOptions.serviceId)
      .verificationChecks.create({
        to: options.email,
        code: options.otp,
      });

    if (response.status === "approved") {
      let userRole = "user";
      const existingUsersCount = await db.collection(collectionName).countDocuments();

      if (existingUsersCount === 0) {
        userRole = "admin";
      }

      // Create a new user
      const result = await db.collection(collectionName).insertOne({
        email: options.email,
        name: options.name,
        role: userRole,
      });
      if (result.acknowledged === true) {
        const payload = { email: options.email, name: options.name, role: userRole };
        const token = jwt.sign(payload, jwtSecret, { expiresIn });
        return { status: true, token: token, msg: "User created successfully" };
      }

      return { status: false, msg: "Create user failed" };
    } else {
      return { status: false, msg: "Invalid OTP" };
    }
    // If there are no existing users, assume it's the first user and assign the 'admin' role
  } catch (error) {
    console.error("Error in signupUser:", error);
    return { status: false, error: error, msg: "Error in signup, please try again" };
  }
}

export async function deleteUser(
  db: any,
  sourceOptions: SourceOptions,
  options: QueryOptions
): Promise<object> {
  try {
    const jwtToken: any = options.jwt;
    const jwtSecret = sourceOptions.jwtSecret;
    const collectionName = sourceOptions.collectionName;

    const decodedData: any = jwt.verify(jwtToken, jwtSecret);
    if (decodedData.role !== "admin") {
      return { status: false, msg: "Unauthorized" };
    }
    if (decodedData.email === options.email) {
      return { status: false, msg: "Can't delete own account" };
    }
    // Check if the user exists
    const existingUser = await db.collection(collectionName).findOne({ email: options.email });

    if (!existingUser) {
      return { status: false, msg: "User not found" };
    }

    // Delete the user
    const result = await db.collection(collectionName).deleteOne({ email: options.email });

    // Check if the deletion was successful
    if (result.deletedCount !== 1) {
      return { status: false, msg: "Failed to delete user" };
    }

    // Return success status
    return { status: true, msg: "User deleted successfully" };
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return { status: false, error: error, msg: "Error in deleting user, please try again" };
  }
}
