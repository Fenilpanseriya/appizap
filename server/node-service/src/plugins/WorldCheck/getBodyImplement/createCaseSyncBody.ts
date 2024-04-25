import { secondaryFieldsElement } from "../types";

export default function getBodyCreateCaseSync(queryOptions: any) {
  const body: any = {};
  if (queryOptions.name) {
    body.name = queryOptions.name;
  }
  if (queryOptions.providerTypes) {
    if (Array.isArray(queryOptions.providerTypes)){
      body.providerTypes = queryOptions.providerTypes;
    }else{
      try{
        body.providerTypes = JSON.parse(queryOptions.providerTypes);
      }catch(err){
       console.log(err);
       throw Error("error in parsing Provider Types")
      }
    }
  }
  if (queryOptions.groupId) {
    body.groupId = queryOptions.groupId;
  }
  if (queryOptions.entityType) {
    body.entityType = queryOptions.entityType;
  }
  if (queryOptions.customFields && Array.isArray(queryOptions.customFields) && queryOptions.customFields.length != 0) {
    body.customFields = [];
    queryOptions.customFields.forEach((ele:secondaryFieldsElement) => {
      body.customFields.push({ typeId: ele.typeId, value: ele.value });
    });
  }
  if (queryOptions.secondaryFields && Array.isArray(queryOptions.secondaryFields) && queryOptions.secondaryFields.length != 0) {
    body.secondaryFields = [];
    queryOptions.secondaryFields.forEach((ele:secondaryFieldsElement) => {
      console.log(ele); 
      body.secondaryFields.push({ typeId: ele.typeId, value: ele.value });
    });
  }
  return body;
}
