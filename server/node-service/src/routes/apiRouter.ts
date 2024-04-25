import express from "express";
import * as pluginControllers from "../controllers/plugins";
import jsControllers from "../controllers/runJavascript";
import * as DbBuilderControllers from '../controllers/dbbuilder'
import * as WorkflowControllers from '../controllers/workflowBuilder'

const apiRouter = express.Router();

apiRouter.post("/runJs", jsControllers.runJavascript);
apiRouter.post("/batchRunJs", jsControllers.batchRunJavascript);

apiRouter.get("/plugins", pluginControllers.listPlugins);
apiRouter.post("/runPluginQuery", pluginControllers.runPluginQuery);
apiRouter.post("/getPluginDynamicConfig", pluginControllers.getDynamicDef);
apiRouter.post("/validatePluginDataSourceConfig", pluginControllers.validatePluginDataSourceConfig);

apiRouter.get("/dbBuilder/:orgId/token",DbBuilderControllers.getToken);
apiRouter.get("/dbBuilder/:orgId/test",DbBuilderControllers.test);
apiRouter.get("/dbBuilder/:orgId/tableList",DbBuilderControllers.tableList);
apiRouter.post("/dbBuilder/:orgId/newRow/:tablename",DbBuilderControllers.newRow);
apiRouter.get("/dbBuilder/:orgId/list/:tablename",DbBuilderControllers.list)
apiRouter.patch("/dbBuilder/:orgId/updateRow/:tablename/:id",DbBuilderControllers.updateRow)
apiRouter.delete("/dbBuilder/:orgId/deleteRow/:tablename/:id",DbBuilderControllers.deleteRow)
apiRouter.post("/dbBuilder/:orgId/customQuery",DbBuilderControllers.customQuery)

apiRouter.get("/organizations/:orgId/workflowBUilder/auth",WorkflowControllers.getAuth)


export default apiRouter;
