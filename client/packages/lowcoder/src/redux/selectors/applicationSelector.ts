import { AppState } from "redux/reducers";
import { ApplicationMeta, AppPermissionInfo } from "constants/applicationConstants";

export const normalAppListSelector = (state: AppState): ApplicationMeta[] =>
  state.ui.application.applicationList.filter((app) => app.applicationStatus === "NORMAL");

export const modulesSelector = (state: AppState): ApplicationMeta[] => state.ui.application.modules;

export const recycleListSelector = (state: AppState) => state.ui.application.recycleList;

export const marketplaceSelector = (state: AppState) => state.ui.application.marketplace;

export const getHomeOrg = (state: AppState) => state.ui.application.homeOrg;

export const isFetchingHomeData = (state: AppState) =>
  state.ui.application.loadingStatus.isFetchingHomeData;

export const isFetchHomeDataFinished = (state: AppState) =>
  state.ui.application.loadingStatus.fetchHomeDataFinished;

export const isFetchingApplications = (state: AppState) =>
  state.ui.application.loadingStatus.isFetchingHomeData;

export const isApplicationCreating = (state: AppState) =>
  state.ui.application.loadingStatus.isApplicationCreating;

export const getAppPermissionInfo = (state: AppState): AppPermissionInfo | undefined => {
  return state.ui.application.appPermissionInfo;
};

export const currentApplication = (state: AppState): ApplicationMeta | undefined => {
  return state.ui.application.currentApplication;
};

export const isFetchingAppDetail = (state: AppState): boolean => {
  return state.ui.application.loadingStatus.fetchingAppDetail;
};

export const isApplicationPublishing = (state: AppState): boolean => {
  return state.ui.application.loadingStatus.applicationPublishing;
};

export const getTemplateId = (state: AppState): any => {
  return state.ui.application.templateId;
};

// gets the folder that contains the current application
export const getParentFolderId = (state: AppState) => {
  const folders = state.ui.folder.folders;
  const currentApplication = state.ui.application.currentApplication;

  if (currentApplication) {
    for (const folder of folders) {
      // Check if the folder contains the application directly
      if (folder.subApplications && folder.subApplications.some(app => app.applicationId === currentApplication.applicationId)) {
          return folder.folderId; // Return the folder containing the application
      }
    }
  }

  return undefined;
}