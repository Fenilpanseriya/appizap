import { ActionConfig } from "lowcoder-sdk/dataSource"
const Action:ActionConfig[]=
    [
    {
        actionName: "createNewCase",
        label: "Create Case",
        params: [{
            key: "name",
            type: "textInput",
            label: "Name*",
            placeholder:'eg. Jon Doe'
        },
        {
            key: "providerTypes",
            type: "textInput",
            label: "Provider Types*",
            placeholder:'eg. ["WATCHLIST","PASSPORT_CHECK" ,"MEDIA_CHECK", "CLIENT_WATCHLIST"]'
        },
        {
            key: "groupId",
            type: "textInput",
            label: "Group ID*",
            placeholder:'eg. 5jb8febdr1oi1gd1gms13tv8a'
        },
        {
            key: "entityType",
            type: "textInput",
            label: "Entity Type*",
            placeholder:'eg. INDIVIDUAL'
        },
        {
            key: "customFields",
            type: "jsonInput",
            label: "Custom Fields",
            placeholder:`eg. [{
                "typeId": "5jb8a2z6imev1hbgsxhc16htu",
                "value": "test123@test.com"
            }] `
        },
        {
            key: "secondaryFields",
            type: "jsonInput",
            label: "Secondary Fields",
            placeholder:`eg  [{
                "typeId": "SFCT_6",
                "value": "USA"
            }]`
        },
        ],
    },
    {
        actionName: "get_groups",
        label: "Get Groups",
        params: [],
    },
    {
        actionName: "get_ongoing_screening_updates",
        label: "Get Ongoing Screening Updates",
        params: [{
            key: "updateDate",
            type: "textInput",
            label: "Update Date*",
            placeholder:'eg. dd/mm/yyyy'
        },
        {
            key: "itemPerPage",
            type: "textInput",
            label: "Items Per Page",
            placeholder:'eg. 10'
        },
        {
            key: "order",
            type: "textInput",
            label: "Sort Order",
            placeholder:'ASCENDING/DESCENDING'
        }
    ],
    },
    {
        actionName: "get_template",
        label: "Get Template",
        params: [{
            key: "groupId",
            type: "textInput",
            label: "Group ID*",
            placeholder:'eg. 5jb8febdr1oi1gd1gms13tv8a'
        },],
    },
    {
        actionName: "get_resolution_toolkit",
        label: "Get Resolution Toolkit",
        params: [{
            key: "groupId",
            type: "textInput",
            label: "Group ID*",
            placeholder:'eg. 5jb8febdr1oi1gd1gms13tv8a'
        },],
    },
    {
        actionName: "enable_ongs",
        label: "Enable ONGS",
        params: [{
            key: "caseSystemId",
            type: "textInput",
            label: "Case System Id",
            placeholder:'5jb8hpb3bpm81ik5sg4s0fnpq'
        },],
    },
    {
        actionName: "disable_ongs",
        label: "Disable ONGS",
        params: [{
            key: "caseSystemId",
            type: "textInput",
            label: "Case System Id",
            placeholder:'5jb8hpb3bpm81ik5sg4s0fnpq'
        },],
    },
    {
        actionName: "get_results",
        label: "Get Results",
        params: [{
            key: "caseSystemId",
            type: "textInput",
            label: "Case System Id",
            placeholder:'5jb8hpb3bpm81ik5sg4s0fnpq'
        },],
    },
    {
        actionName: "resolve_results",
        label: "Resolve Results",
        params: [{
            key: "caseSystemId",
            type: "textInput",
            label: "Case System Id",
            placeholder:'eg. 5jb8hpb3bpm81ik5sg4s0fnpq'
        },
        {
            key: "statusId",
            type: "textInput",
            label: "Status Id",
            placeholder:'eg. 5jb8febdr1oi1gd1gms13tv9o'
        },
        {
            key: "riskId",
            type: "textInput",
            label: "Risk Id",
            placeholder:'eg. 5jb8febdr1oi1gd1gms13tv9k'
        },
        {
            key: "reasonId",
            type: "textInput",
            label: "Reason Id",
            placeholder:'eg. 5jb8febdr1oi1gd1gms13tv9g'
        },
        {
            key: "resultIds",
            type: "textInput",
            label: "Result Ids",
            placeholder:'eg. ["5jb85fc3absn1ik6bw11hnvtt","75fjffbdr1oi2gd1g12gs3ew9e"]'
        },
        {
            key: "remark",
            type: "textInput",
            label: "Remark ",
            placeholder:'eg. Entity matched'
        }
        ],
    },
    ]


export default Action;