export default function getBodyResolveResults(queryOptions: any) {
  console.log(JSON.stringify(queryOptions.resultIds));
  if (!queryOptions.resultIds) {
    throw Error("Reslut Ids can't be empty");
  }else if(!Array.isArray(queryOptions.reasonId) && typeof queryOptions.reasonIds=="string"){
    try{
      queryOptions.resultIds = JSON.parse(queryOptions.resultIds);
    }catch(err:any){
      console.log(err.message);
      throw Error("Error in parsing resultIds array");
    }
  }
  const body: any = {};
  if (queryOptions.statusId) {
    body.statusId = queryOptions.statusId;
  }
  if (queryOptions.riskId) {
    body.riskId = queryOptions.riskId;
  }
  if (queryOptions.reasonId) {
    body.reasonId = queryOptions.reasonId;
  }
  if (queryOptions.remark) {
    body.resolutionRemark = queryOptions.remark;
  }
  if (queryOptions.resultIds.length != 0) {
    body.resultIds = queryOptions.resultIds;
  }
  return body;
}
