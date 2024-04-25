import React, { useEffect, useContext, useState } from 'react';
import "comps";
import axios from 'axios';
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../../redux/selectors/usersSelectors";

export default function DbBuilder() {
  const currentUser = useSelector(getUser);
  const orgId = currentUser.currentOrgId;
  const [token, setToken] = useState(null);
  const [failed, setFailed] = useState(null);
  useEffect(()=>{
    if (!orgId){
      console.log("unable to fetch orgId");
      return 
    }
    axios.get(`node-service/api/dbBuilder/${orgId}/token`).then(data=>{
      console.log("success in apicall",data)
    })
  })
  useEffect(() => {
    axios.get(`node-service/api/dbBuilder/${orgId}/token`)
      .then((response) => {
        if (response.status == 200) {
          return response.data;
        } else {
            throw Error(response.data)
        }
      })
      .then((data) => {
        console.log(data, 'token');
        setToken(data);
      })
      .catch((err) => {
        console.log(err,err.message);
        // toast.error(err.message || 'something went wrong check console');
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const dbBUilderUrl = import.meta.env.VITE_DB_BUILDER_URL;
  console.log("this is db builder url",dbBUilderUrl);

  return (
    <>
      {failed ? (
        <div> Fetch Failed </div>
      ) : !token ? (
        <div>Loding....</div>
      ) : (
        <>
          {dbBUilderUrl ? (
            <div style={{ height: 'calc(100vh - 69px)' }}>
              <iframe
                className="w-[100%] h-[100%]"
                style={{ width: '100%', height: '100%' }}
                src={`${dbBUilderUrl}?jwt=${token}`} // Replace with the URL you want to embed
                title="Embedded Iframe"
                // width="100%"
                // height="100%"
                allowFullScreen
              />
            </div>
          ) : (
            <div style={{ height: 'calc(100vh - 64px)' }}>DbBUilder Url Not present</div>
          )}
        </>
      )}
    </>
  );
}