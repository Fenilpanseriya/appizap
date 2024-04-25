import React, { useEffect, useContext, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../../redux/selectors/usersSelectors";

export default function Workflow() {
    const currentUser = useSelector(getUser);
    const organizations_id = currentUser.currentOrgId;
    const [token, setToken] = useState(null);
    const [failed, setFailed] = useState(null);

    const workflowBUilderUrl = import.meta.env.VITE_WORKFLOW_BUILDER_URL;
    const test=import.meta.env.VITE_TEST;
  console.log("this is db workflow builder url",workflowBUilderUrl);
    useEffect(() => {
        fetch(`node-service/api/organizations/${organizations_id}/workflowBUilder/auth`, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
            credentials: 'include',
        })
            .then(async (response) => {
                if (response.status == 200) {
                    return response.text();
                } else {
                    return response.text().then((messg) => {
                        console.log('This is error ', messg);
                        throw Error(messg);
                    });
                }
            })
            .then((data) => {
                setToken('token');
                console.log(data, 'token');
            })
            .catch((err) => {
                setFailed('Failed');
                console.log(err.message);
                toast.error(err.message || 'something went wrong check console');
            });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            {failed ? (
                <div> fetch Failed</div>
            ) : !token ? (
                <div>Loding....</div>
            ) : (
                <>
                    {workflowBUilderUrl ? (
                        <div style={{ height: 'calc(100vh - 64px)' }}>
                            <iframe
                                className="w-[100%] h-[100%]"
                                style={{ width: '100%', height: '100%' }}
                                src={`${workflowBUilderUrl}`} // Replace with the URL you want to embed
                                title="Embedded Iframe"
                                // width="100%"
                                // height="100%"
                                allowFullScreen
                            />
                        </div>
                    ) : (
                        <div style={{ height: 'calc(100vh - 64px)' }}>WorkflowBuilder Url Not present</div>
                    )}
                </>
            )}
        </>
    );
}
