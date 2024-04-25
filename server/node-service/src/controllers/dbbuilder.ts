import { Request, Response } from "express";
import { AES } from 'crypto-js';


const PG_PASSWORD = process.env.PG_PASSWORD;
const PG_PORT = process.env.PG_PORT;
const supabaseGateway = process.env.SUPABASE_GATEWAY;
const supabaseApiKey = process.env.SUPABASE_API_KEY;
const SECRET = 'secretPass';
console.log({ supabaseApiKey, supabaseGateway, PG_PORT, PG_PASSWORD })
export function getSchema(schema: string) {
    return 'appizap_' + schema?.replace(/-/g, '_');
};


async function runQuery(query: string, schema = '') {
    const body = { query };
    if (!supabaseGateway) {
        return Promise.reject('no gateway url present');
    }
    if (!supabaseApiKey) {
        return Promise.reject('no api key present');
    }
    console.log('in query', { body });
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        apikey: supabaseApiKey,
    };
    if (schema) {
        const str = `postgresql://${schema}:${PG_PASSWORD}@db:${PG_PORT}/postgres`;

        console.log(str);
        const encryptedConnString = AES.encrypt(str, 'SAMPLE_KEY').toString();
        console.log('encryped', encryptedConnString);
        headers['x-connection-encrypted'] = encryptedConnString;
    }
    return fetch(`${supabaseGateway}/pg/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    }).then(async (data) => {
        if (data.status != 200) {
            const errorBody = await data.json();
            console.log('Error in running query', query, errorBody.error);
            return Promise.reject(errorBody);
        }
        return data.json();
    });
};

async function getId(schema: string) {
    return fetch(`${supabaseGateway}/auth/v1/admin/users`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            apikey: process.env.SUPABASE_API_KEY || "",
            Authorization: `Bearer ${process.env.SUPABASE_API_KEY}`,
        },
    }).then(async (data) => {
        if (data.status == 200) {
            console.log('list of user recieved');
            const listOfUser = JSON.parse(await data.text());
            console.log({ listOfUser });
            const foundUser = listOfUser.users.find((user: any) => user.email == `${schema}@example.com`);
            console.log('this is found user', foundUser);
            return foundUser.id;
        } else {
            const mess = await data.text();
            return Promise.reject(mess);
        }
    });
};


async function giveGrant(id: string, schema: string): Promise<{ user: any; status: number }> {
    if (!id) {
        return Promise.reject('no id given to grant privlage');
    }
    console.log('in grant');
    const grant = {
        email_confirm: true,
        role: schema,
    };
    return fetch(`${supabaseGateway}/auth/v1/admin/users/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            apikey: process.env.SUPABASE_API_KEY || "",
            Authorization: `Bearer ${process.env.SUPABASE_API_KEY}`,
        },
        body: JSON.stringify(grant),
    }).then(async (data) => {
        if (data.status == 200) {
            console.log('user granted succesfully');
            return { user: await data.json(), status: 200 };
        } else {
            const mess = await data.text();
            console.log(mess, 'this is message', data);
            return Promise.reject(mess);
        }
    });
};

async function runOneQuery(query: string, proceedCheck?: { status: number; message_regex: RegExp }) {
    return runQuery(query).catch(async (data) => {
        const dataObject = await data.json();
        if (proceedCheck && proceedCheck.status == data.status && dataObject.error.match(proceedCheck.message_regex)) {
            return Promise.resolve(dataObject);
        } else {
            return Promise.reject(dataObject);
        }
    });
};

const createAuthUser = async (schema: string): Promise<{ status: number; noGrantUser: any }> => {
    const cred = {
        email: `${schema}@example.com`,
        password: SECRET,
    };
    return fetch(`${supabaseGateway}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: process.env.SUPABASE_API_KEY || "",
            Authorization: `Bearer ${process.env.SUPABASE_API_KEY}`,
        },
        body: JSON.stringify(cred),
    }).then(async (data) => {
        if (data.status != 200) {
            const error_data = await data.text();
            console.log('ERROR', error_data);
            return Promise.reject(error_data);
        }
        const user = JSON.parse(await data.text());
        console.log(user.id);
        return { status: 200, noGrantUser: user };
    });
};

async function createUser(schema: string): Promise<{ status: number; noGrantUser: any }> {
    try {
        return runOneQuery(`CREATE USER ${schema} WITH PASSWORD '${PG_PASSWORD}';`, {
            status: 400,
            message_regex: /^role (.+) already exists$/,
        })
            .then((data) => {
                console.log(data);
                return runOneQuery(`create schema ${schema} authorization ${schema};`, {
                    status: 400,
                    message_regex: /^schema (.+) already exists$/,
                });
            })
            .then((data) => {
                console.log(data);
                return runOneQuery(
                    `SELECT n.nspname AS schema_name,u.rolname AS owner_name FROM pg_namespace n JOIN pg_roles u ON n.nspowner = u.oid WHERE n.nspname = '${schema}';`
                );
            })
            .then((data) => {
                console.log(data);
                const role_schema = Array.isArray(data) && data[0];
                if (
                    !role_schema ||
                    data.length != 1 ||
                    !role_schema.schema_name ||
                    !role_schema.owner_name ||
                    role_schema.schema_name != role_schema.owner_name ||
                    role_schema.schema_name != schema
                ) {
                    throw Error('role or schema not created');
                }
                return createAuthUser(schema);
            });
    } catch (err: any) {
        throw Error(err.message || 'something went wrong while creating user');
    }
};

async function checkIfUserExist(schema: string): Promise<string> {
    const cred = {
        email: `${schema}@example.com`,
        password: SECRET,
    };
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        apikey: process.env.SUPABASE_API_KEY || "",
    }
    return await fetch(`${supabaseGateway}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers,
        body: JSON.stringify(cred),
    })
        .then(async (data) => {
            if (data.status == 200) {
                const user = await data.json();
                console.log(user);
                return user?.access_token || '';
            } else {
                const error_data = await data.json();
                if (error_data.error_description == 'Email not confirmed') {
                    const grantRes = await getId(schema).then((id) => giveGrant(id, schema));
                    if (grantRes.status == 200) {
                        return checkIfUserExist(schema);
                    } else {
                        return '';
                    }
                } else if (error_data.error_description == 'Invalid login credentials') {
                    const { status, noGrantUser } = await createUser(schema);
                    if (status == 200) {
                        return checkIfUserExist(schema);
                    } else {
                        console.log('error in creating user', { status, noGrantUser, schema });
                        return '';
                    }
                } else {
                    console.log('this is error from checkIfUserExist', error_data);
                    return '';
                }
            }
        })
        .catch((err) => {
            console.log('this is check user uncaught error', err || err.message || err.data);
            return '';
        });
};

function checkIfRole(error: string): boolean {
    return /^password authentication failed for user/.test(error);
};

async function checkIfPostgreUser(userName: string) {
    const body = `select current_role`;
    runQuery(body, userName)
        .then((data) => {
            console.log('success pg user found', data);
        })
        .catch(async (err) => {
            console.log('err in logging pg user');
            if (checkIfRole(err?.error)) {
                try {
                    const result = await runQuery(`ALTER ROLE ${userName} WITH LOGIN PASSWORD '${PG_PASSWORD}';`);
                    console.log('pg user created succesfully', result);
                } catch (err) {
                    console.log(err);
                }
            } else {
                console.log(err);
            }
        });
}

export async function getToken(req: Request, res: Response) {
    const orgId = req.params.orgId;
    console.log("success", orgId)
    const supabaseOrgVal = getSchema(orgId);
    try {
        const token = await checkIfUserExist(supabaseOrgVal);
        checkIfPostgreUser(supabaseOrgVal); // just to have backward compatibility, will be removed later
        if (!token) {
            throw Error('unable to create token');
        }
        console.log(token, 'this is token send ');
        return res.status(200).send(token);
    } catch (err: any) {
        console.log('error occ', err);
        return res.status(500).send(err.message || err || err.data || 'something went wrong');
    }
}

export async function test(req: Request, res: Response) {
    const orgId = req.params.orgId;
    console.log("success", orgId)
    const schema = getSchema(orgId);
    try {
        const cred = {
            email: `${schema}@example.com`,
            password: SECRET,
        };
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            apikey: process.env.SUPABASE_API_KEY || "",
        }
        return await fetch(`${supabaseGateway}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers,
            body: JSON.stringify(cred),
        })
            .then(async (data) => {
                if (data.status == 200) {
                    return res.status(200).send();
                } else {
                    throw Error("errro");
                }
            })
    } catch (err: any) {
        console.log('error occ', err);
        return res.status(500).send(err.message || err || err.data || 'something went wrong');
    }
}

export async function tableList(req: Request, res: Response) {
    const orgId = req.params.orgId;
    let schema = getSchema(orgId);
    try {
        if (!schema) {
            schema = 'public';
        }
        const body = `SELECT table_name AS name, jsonb_object_agg(column_name , data_type) AS schema FROM information_schema.columns WHERE table_schema = '${schema}' GROUP BY table_name;`;
        let result = await runQuery(body);
        result = result ? result : 'no list returned';
        return res.status(200).send(result);
    } catch (err: any) {
        return res.status(500).send(err.message || err || err.data || 'something went wrong');
    }
}

export async function newRow(req: Request, res: Response) {
    const organizationId = req.params.orgId
    const row = req.body;
    const tablename = req.params.tablename;
    const supabaseOrgVal = getSchema(organizationId);
    console.log("in new row server", { row })
    try {
        const colNames = Object.keys(row).join();
        if (!tablename) {
            return { message: 'no tablename found' };
        }
        let body: string;
        if (!Object.keys(row).length) {
            const fieldNames = await runQuery(
                `SELECT column_name FROM information_schema.columns WHERE table_name = '${tablename}' and table_schema='${supabaseOrgVal}';`
            );
            console.log(fieldNames, 'this is field names');
            let defaultObj: any = {};
            fieldNames.forEach((element: any) => {
                defaultObj[element?.column_name] = 'default';
            });
            console.log(defaultObj);
            body = `INSERT INTO ${getSchema(organizationId)}.${tablename} (${Object.keys(
                defaultObj
            ).join()})  VALUES (${Object.values(defaultObj).join()});`;
        } else {
            body = `INSERT INTO ${supabaseOrgVal}.${tablename} (${colNames})
        SELECT ${colNames} FROM jsonb_populate_recordset(NULL::${supabaseOrgVal}.${tablename}, '[${JSON.stringify(
                row
            )}]');
        `;
        }
        let result = await runQuery(body);
        result = result ? { data: result } : { data: 'no list returnedsdf' };
        return res.status(200).send(result);
    } catch (err: any) {
        return res.status(500).send(err.message || err || err.data || 'something went wrong');
    }
}

export async function list(req: Request, res: Response) {
    const organizationId = req.params.orgId;
    const tablename = req.params.tablename;
    const supabaseOrgVal = getSchema(organizationId);
    console.log("in list", { organizationId, tablename, supabaseOrgVal })
    try {
        if (!tablename) {
            return { message: 'no tablename found' };
        }
        const body = `SELECT * FROM ${supabaseOrgVal}.${tablename} LIMIT 50;`;
        let result = await runQuery(body);

        result = result ? { data: result } : { data: 'no list returnedsdf' };
        return res.status(200).send(result);
    } catch (err: any) {
        return res.status(500).send(err.message || err || err.data || 'something went wrong');
    }
}

export async function updateRow(req: Request, res: Response) {
    const organizationId=req.params.orgId;
    const tablename=req.params.tablename;
    const row=req.body;
    const id=req.params.id;
    const supabaseOrgVal = getSchema(organizationId);
    try {
        let body: string;
        const colNames = Object.keys(row).join();
        if (!tablename) {
            throw Error('no table selected');
        }
        console.log(id, 'this is id ', typeof id);
        if (!id || id == 'undefined') {
            throw Error('no id found, please select id');
        }
        if (!Object.keys(row).length) {
            const fieldNames = await runQuery(
                `SELECT column_name FROM information_schema.columns WHERE table_name = '${tablename}' and table_schema='${supabaseOrgVal}';`
            );
            console.log(fieldNames, 'this is field names');
            const defaultObj:any = {};
            fieldNames.forEach((element:any) => {
                defaultObj[element.column_name] = 'default';
            });
            console.log(defaultObj);
            body = `update  ${supabaseOrgVal}.${tablename} set (${Object.keys(defaultObj).join()})  = (${Object.values(
                defaultObj
            ).join()});`;
        } else {
            body = `update ${supabaseOrgVal}.${tablename} set (${colNames}) = (select ${colNames} from json_populate_record(null::${supabaseOrgVal}.${tablename}, '${JSON.stringify(
                row
            )}')) where id = ${id} returning *;
      `;
        }
        let result = await runQuery(body);
        result = result ? { data: result } : { data: 'no list returnedsdf' };
        return res.status(200).send(result);
    } catch (err:any) {
        return res.status(500).send(err.message || err.data || err || 'something went wrong');
    }
}

export async function deleteRow(req: Request, res: Response) {
    const organizationId=req.params.orgId;
    const tablename=req.params.tablename;
    const id=req.params.id;
    const supabaseOrgVal = getSchema(organizationId);
    try {
        if (!tablename) {
          throw Error('no table selected');
        }
        if (!id || id == 'undefined') {
          throw Error('no id found, please select id');
        }
        const body = `delete from ${supabaseOrgVal}.${tablename} where id = ${id};`;
        let result = await runQuery(body);
        result = result ? { data: result } : { data: 'no list returnedsdf' };
        return res.status(200).send(result);
      } catch (err:any) {
        return res.status(500).send(err.message || err || err.data || 'something went wrong');
      }
}

export async  function customQuery(req:Request,res: Response) {
    const organizationId=req.params.orgId;
    const sqlQuery=req.body;
    const supabaseOrgVal = getSchema(organizationId);
    let body = sqlQuery.query;
    body = `set search_path to ${supabaseOrgVal}; ` + body;
    try {
      let result = await runQuery(body, supabaseOrgVal);
      result = result ? { data: result } : { data: 'no list returned' };
      return res.status(200).send(result);
    } catch (err:any) {
      console.log(err.error, 'in sensjelsjljfls');
      if (checkIfRole(err?.error)) {
        try {
          let result = await runQuery(`ALTER ROLE ${supabaseOrgVal} WITH LOGIN PASSWORD '${PG_PASSWORD}';`).then(() =>
            runQuery(body, supabaseOrgVal)
          );
          result = result ? { data: result } : { data: 'no list returnedsdf' };
          return res.status(200).send(result);
        } catch (err) {
          console.log(err);
        }
      }
      return res.status(500).send(err.message || err || err.data || 'something went wrong');
    }
  }