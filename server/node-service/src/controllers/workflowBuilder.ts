import { Request, Response } from "express";
import { getSchema } from "./dbbuilder";


const WORKFLOW_URL = process.env.WORKFLOW_BUILDER_URL; //with slash
const SECRET_MEMBER_PASSWORD = process.env.SECRET_MEMBER_PASSWORD;
const SECRET_OWNER_PASSWORD = process.env.SECRET_OWNER_PASSWORD;
const SECRET_OWNER_USERNAME = process.env.SECRET_OWNER_USERNAME;

async function getCookie(userName:string, password:string):Promise<string> {
  return fetch(`${WORKFLOW_URL}/rest/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: userName,
      password: password,
    }),
  })
    .then(async (res) => {
      if (res.status == 200 && res.headers.get('set-cookie')) {
        return res.headers.get('set-cookie')||"";
      } else {
        // console.log("1",res)
        const errMess = { message: { status: res.status, data: await res.text() } };
        return Promise.reject(errMess);
      }
    })
    .catch((err) => {
      console.log('inerr', err.message);
      return Promise.reject(err);
    });
}

 async function Workflow(userName:string, password = SECRET_MEMBER_PASSWORD||''):Promise<string|undefined>{
  console.log('in root signin', userName, password);
  return getCookie(userName, password).catch((errObject) => {
    if (errObject?.message?.status) {
      if (errObject.message.status == 401) {
        let errJsonObj;
        try {
          errJsonObj = JSON.parse(errObject.message.data);
        } catch (err:any) {
          console.log('error in parsing json', err);
          return Promise.reject(err.message);
        }
        if (errJsonObj.message == 'Wrong username or password. Do you have caps lock on?') {
          console.log('creating new user', userName);
          return createNewUser(userName, SECRET_MEMBER_PASSWORD!)
            .then(({ inviteeId, inviterId }) => {
              return acceptNewUser({ inviteeId, inviterId }).then((res) => {
                console.log('user accepted now reinitating loggin');
                return Workflow(userName, SECRET_MEMBER_PASSWORD);
              });
            })
            .catch((err) => {
              console.log('something went wrong in creating or accepting user', err);
              throw Error('unable to create user');
            });
        }
      }
    } else {
      console.log('somethis went wrong rejecting the flow ', errObject);
      return Promise.reject(errObject);
    }
  });
}

async function getInitialOwnerCookie() {
  return fetch(`${WORKFLOW_URL}/rest/login`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => checkError(res))
    .then(async (res) => {
      if (res.status == 200 && res.headers.get('set-cookie')) {
        return res.headers.get('set-cookie');
      } else {
        throw Error('unable to create owner');
      }
    });
}

async function setUpOwner(ownerName:string, ownerPassword:string):Promise<string|undefined> {
  console.log('setting up owner');
  return getInitialOwnerCookie().then(async (cookie) => {
    return fetch(`${WORKFLOW_URL}/rest/owner/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie||"",
      },
      body: JSON.stringify({
        firstName: 'Owner',
        lastName: 'Owner',
        password: ownerPassword,
        email: ownerName,
      }),
    })
      .then((res) => checkError(res))
      .then((res) => {
        console.log('owner setup sucess');
        return getOwnerCookie();
      })
      .catch(async (err) => {
        console.log('owner setup failed', err);
        throw Error('owner setup failed');
      });
  });
}

async function getOwnerCookie() {
  return getCookie(SECRET_OWNER_USERNAME!, SECRET_OWNER_PASSWORD!).catch((err) => {
    if (err?.message?.status == 401) {
      const errData = JSON.parse(err.message.data);
      if (errData?.message == 'Wrong username or password. Do you have caps lock on?') {
        console.log('owner login failed, possible owner setup requierd');
        return setUpOwner(SECRET_OWNER_USERNAME!, SECRET_OWNER_PASSWORD!);
      }
    }
  });
}

async function checkError(res:globalThis.Response) {
  if (Math.floor(res.status / 100) == 2) {
    return Promise.resolve(res);
  } else {
    const data = await res.text();
    return Promise.reject({ message: { status: res.status, data } });
  }
}
function getInvitePrams(urlString:string) {
  const url = new URL(urlString);
  const searchParams = new URLSearchParams(url.search);
  const inviterId = searchParams.get('inviterId');
  const inviteeId = searchParams.get('inviteeId');
  console.log('in search param', inviteeId, inviterId);
  return { inviteeId, inviterId };
}
async function getInviteUrl(userName:string, cookie:string) {
  return fetch(`${WORKFLOW_URL}/rest/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
  })
    .then((res) => checkError(res))
    .then(async (res) => {
      const { data } = await res.json();
      console.log(data, 'this is data return from /users');
      const users = data.filter((ele:any) => ele.isPending && ele.email == userName?.toLowerCase());
      if (users.length != 1) {
        console.log('error in finding user', { users, data });
        throw Error('unable to find invited user');
      }
      return users[0].inviteAcceptUrl;
    });
}

async function acceptNewUser({ inviterId, inviteeId }:{inviterId:string|null,inviteeId:string|null}) {
  console.log('in acceptin user');
  return fetch(`${WORKFLOW_URL}/rest/invitations/${inviteeId}/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName: 'FirstName',
      lastName: 'LastName',
      password: SECRET_MEMBER_PASSWORD,
      inviterId,
    }),
  }).then((res) => checkError(res));
}

async function createNewUser(userName:string, password:string) {
  console.log('in create user', { userName, password });
  const ownerCookie = await getOwnerCookie();
  console.log('owner cookie  ', ownerCookie);
  // inviting user
  return fetch(`${WORKFLOW_URL}/rest/invitations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: ownerCookie||"",
    },
    body: JSON.stringify([
      {
        email: userName,
        role: 'member',
      },
    ]),
  })
    .then((res) => checkError(res))
    .then(async (res) => {
      try {
        const { data } = await res.json();
        const inviteUrl = data[0]?.user?.inviteAcceptUrl;
        console.log('this is invite url', inviteUrl);
        if (res.status == 200 && inviteUrl) {
          const { inviterId, inviteeId } = getInvitePrams(inviteUrl);
          return Promise.resolve({ inviterId, inviteeId });
        } else {
          console.log('invite url not found', data, res);
          throw Error('invite url not found');
        }
      } catch (err) {
        console.log('something went wrong in getting invite url', err);
        throw Error('Failed to get invite url Param');
      }
    })
    .catch(async (err) => {
      if (err?.message?.status == 500) {
        try {
          const inviteErrorObj = JSON.parse(err.message.data);
          console.log('this is error data from invite user', inviteErrorObj);
          if (
            inviteErrorObj.code == 500 &&
            (inviteErrorObj.message == 'An Invitation already sent' ||
              inviteErrorObj.message == 'An error occurred during user creation')
          ) {
            const inviteUrl = await getInviteUrl(userName, ownerCookie!);
            const { inviterId, inviteeId } = getInvitePrams(inviteUrl);
            return Promise.resolve({ inviterId, inviteeId });
          } else {
            throw Error('unabe to create user');
          }
        } catch (err:any) {
          console.log('something went wrong in fetching invite url', err.message);
          throw Error(err.message);
        }
      } else {
        throw Error('something went worng in inviting user');
      }
    });
}



export async function getAuth(req:Request,res:Response) {
    const organizationId=req.params.orgId;
    let userName = getSchema(organizationId);
    userName = userName + '@test.com';
    try {
      const cookie = await Workflow(userName);
      if (!cookie) {
        throw Error('unable to create cookie');
      }
      console.log('cookie created', cookie);
      res.setHeader('Set-Cookie', cookie);
      return res.status(200).send();
    } catch (err:any) {
      return res.status(500).send(err.message || 'something went wrong');
    }
  }
