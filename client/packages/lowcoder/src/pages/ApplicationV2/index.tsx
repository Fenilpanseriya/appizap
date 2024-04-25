import {
  ALL_APPLICATIONS_URL,
  DATASOURCE_URL,
  DBBUILDER_URL,
  FOLDER_URL,
  FOLDER_URL_PREFIX,
  FOLDERS_URL,
  MARKETPLACE_URL,
  MODULE_APPLICATIONS_URL,
  QUERY_LIBRARY_URL,
  SETTING,
  TRASH_URL,
  WORKFLOW_BUILDER,
} from "constants/routesURL";
import { getUser, isFetchingUser } from "redux/selectors/usersSelectors";
import { useDispatch, useSelector } from "react-redux";
import {
  EditPopover,
  EllipsisTextCss,
  FolderIcon,
  HomeDataSourceIcon,
  HomeIcon,
  HomeModuleIcon,
  HomeQueryLibraryIcon,
  HomeSettingIcon,
  InviteUserIcon,
  PlusIcon,
  PointIcon,
  RecyclerIcon,
  MarketplaceIcon,
  AppsIcon,
  DbBuilderIcon,
  WorkflowIcon,
  CheckoutIcon,
  AddIcon,
  CommonTextLabel,
  DropdownMenu,
  PackUpIcon,
  TextWrapper,
} from "lowcoder-design";
import SolidIcon from "icons/solidIcons";
import React, { useEffect, useState } from "react";
import { fetchAllApplications, fetchHomeData } from "redux/reduxActions/applicationActions";
import { getHomeOrg, normalAppListSelector } from "redux/selectors/applicationSelector";
import { DatasourceHome } from "../datasource";
import DbBuilder from "../DbBuilder";
import { clearStyleEval, evalStyle } from "lowcoder-core";
import { QueryLibraryEditor } from "../queryLibrary/QueryLibraryEditor";
import { ProductLoading } from "components/ProductLoading";
import { Layout } from "../../components/layout/Layout";
import { HomeView } from "./HomeView";
import styled, { css } from "styled-components";
import history from "../../util/history";
import { FolderView } from "./FolderView";
import { TrashView } from "./TrashView";
import { MarketplaceView } from "./MarketplaceView";
import { SideBarItemType } from "../../components/layout/SideBarSection";
import { RootFolderListView } from "./RootFolderListView";
import InviteDialog from "../common/inviteDialog";
import { fetchFolderElements, updateFolder } from "../../redux/reduxActions/folderActions";
import { ModuleView } from "./ModuleView";
import { useCreateFolder } from "./useCreateFolder";
import { trans } from "../../i18n";
import { foldersSelector } from "../../redux/selectors/folderSelector";
import Setting from "pages/setting";
import { TypographyText } from "../../components/TypographyText";
import { messageInstance } from "lowcoder-design";
import Workflow from "../workflow";
import { ItemType } from "antd/es/menu/hooks/useItems";
import { selectSystemConfig } from "redux/selectors/configSelectors";
import { showSwitchOrg } from "@lowcoder-ee/pages/common/customerService";
import { Org, OrgRoleInfo } from "constants/orgConstants";
import { checkIsMobile } from "util/commonUtils";
import { createOrgAction, switchOrg } from "redux/reduxActions/orgActions";
import { ORGANIZATION_SETTING } from "constants/routesURL";
import { default as Dropdown } from "antd/es/dropdown";

const TabLabel = styled.div`
  font-weight: 500;
  margin-left: 2px
`;

const FolderSectionLabel = styled.div`
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 14px;
  line-height: 14px;
  padding: 0 8px 0 26px;
  height: 30px;
`;

const FolderCountLabel = styled.span`
  margin-left: 8px;
  font-size: 14px;
  line-height: 14px;
  color: #b8b9bf;
`;

const FolderNameWrapper = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
  ${EllipsisTextCss};
  height: 100%;

  ${(props) => {
    if (props.$selected) {
      return css`
        font-weight: 500;

        svg {
          display: inline-block;
        }
      `;
    }
  }}
  .ant-typography {
    max-width: 138px;
    line-height: 16px;
  }

  &:hover {
    svg {
      display: inline-block;
    }
  }
`;

const StyledDropdown = styled(Dropdown)`
  display: flex;
  min-width: 0;
  align-items: end;
`;

const StyledWorkspace = styled(TextWrapper)`
  width : 150px;
`;

const FolderName = (props: { id: string; name: string }) => {
  const dispatch = useDispatch();
  const [folderNameEditing, setFolderNameEditing] = useState(false);

  return (
    <>
      <TypographyText
        value={props.name}
        editing={folderNameEditing}
        onChange={(value) => {
          if (!value.trim()) {
            messageInstance.warning(trans("home.nameCheckMessage"));
            return;
          }
          dispatch(updateFolder({ id: props.id, name: value }));
          setFolderNameEditing(false);
        }}
      />
      <EditPopover items={[{ text: trans("rename"), onClick: () => setFolderNameEditing(true) }]}>
        <PopoverIcon tabIndex={-1} />
      </EditPopover>
    </>
  );
};

const MoreFoldersWrapper = styled.div<{ $selected: boolean }>`
  ${(props) => {
    if (props.$selected) {
      return css`
        font-weight: 500;
      `;
    }
  }}
`;

const MoreFoldersIcon = styled(PointIcon)<{ $selected: boolean }>`
  cursor: pointer;
  flex-shrink: 0;

  g {
    fill: ${(props) => (props.$selected ? "#00aa92" : "#8b8fa3")};
  }
`;

const PopoverIcon = styled(PointIcon)`
  cursor: pointer;
  flex-shrink: 0;
  display: none;

  g {
    fill: #8b8fa3;
  }

  &:hover {
    background-color: #e1e3eb;
    border-radius: 4px;
    cursor: pointer;

    g {
      fill: #00aa92;
    }
  }
`;

const SwitchWorkspace = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  left: 10px;
  top: calc(100vh - 60px);
  padding: 12px 26px;
  font-size: 14px;
  cursor: pointer;
  width: 219px;

  &:hover {
    color: #007F73;

    svg g g {
      stroke: #007F73;
    }
  }
`;

const CreateFolderIcon = styled.div`
  margin-left: auto;
  cursor: pointer;
  height: 20px;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    g {
      stroke: #007F73;
    }

    background-color: #e1e3eb;
  }
`;

const DivStyled = styled.div`
  @media screen and (max-width: 700px) {
    .ant-layout-sider {
      visibility: hidden;
      padding: 0;
      max-width: 0 !important;
      min-width: 0 !important;
    }

    > div {
      display: none;
    }

    .ant-layout > div {
      display: none;
    }
  }
`;

const StyledPackUpIcon = styled(PackUpIcon)`
  width: 20px;
  height: 20px;
  transform: rotate(90deg);
`;

export default function ApplicationHome() {
  const dispatch = useDispatch();
  const [isPreloadCompleted, setIsPreloadCompleted] = useState(false);
  const fetchingUser = useSelector(isFetchingUser);
  const allApplications = useSelector(normalAppListSelector);
  const allFolders = useSelector(foldersSelector);
  const user = useSelector(getUser);
  const org = useSelector(getHomeOrg);
  const sysConfig = useSelector(selectSystemConfig);
  const allAppCount = allApplications.length;
  const allFoldersCount = allFolders.length;
  const orgHomeId = "root";
  const isSelfHost = window.location.host !== 'app.lowcoder.cloud';

  const handleFolderCreate = useCreateFolder();

  const handleClick = (e: any) => {
      if (e.key === "newOrganization") {
        // create new organization
        dispatch(createOrgAction(user.orgs));
        history.push(ORGANIZATION_SETTING);
      } else if (user.currentOrgId !== e.key) {
        // switch org
        dispatch(switchOrg(e.key));
      }
  };

  useEffect(() => {
    dispatch(fetchHomeData({}));
  }, [user.currentOrgId]);

  useEffect(() => {
    if (!org) {
      return;
    }
    const { applyPreloadCSSToHomePage, preloadCSS } = org.commonSettings || {};
    if (applyPreloadCSSToHomePage && preloadCSS) {
      evalStyle(orgHomeId, [preloadCSS]);
    } else {
      clearStyleEval();
    }
    setIsPreloadCompleted(true);
  }, [org, orgHomeId]);

  useEffect(() => {
    if (allAppCount !== 0) {
      return;
    }
    user.currentOrgId && dispatch(fetchAllApplications({}));
  }, [dispatch, allAppCount, user.currentOrgId]);

  useEffect(() => {
    if (allFoldersCount !== 0) {
      return;
    }
    user.currentOrgId && dispatch(fetchFolderElements({}));
  }, [dispatch, allFoldersCount, user.currentOrgId]);

  if (fetchingUser || !isPreloadCompleted) {
    return <ProductLoading />;
  }

  let folderItems: SideBarItemType[] = allFolders
    .sort((a, b) => {
      if (a.createAt === b.createAt) {
        return 0;
      }
      return a.createAt < b.createAt ? 1 : -1;
    })
    .slice(0, 5)
    .map((folder) => {
      const path = FOLDER_URL_PREFIX + `/${folder.folderId}`;
      return {
        onSelected: (_, currentPath) => currentPath === path,
        text: (props: { selected?: boolean }) => (
          <FolderNameWrapper $selected={Boolean(props.selected)}>
            <FolderName name={folder.name} id={folder.folderId} />
          </FolderNameWrapper>
        ),
        routePath: FOLDER_URL,
        routePathExact: false,
        routeComp: FolderView,
        icon: FolderIcon,
        size: "small",
        onClick: (currentPath) => currentPath !== path && history.push(path),
      };
    });

  if (allFolders.length > 5) {
    folderItems = [
      ...folderItems,
      {
        text: (props: { selected?: boolean }) => (
          <MoreFoldersWrapper $selected={Boolean(props.selected)}>{trans("more")}</MoreFoldersWrapper>
        ),
        routePath: FOLDERS_URL,
        routeComp: RootFolderListView,
        icon: MoreFoldersIcon,
        size: "small",
      },
    ];
  }

  if (folderItems.length > 0) {
    folderItems[folderItems.length - 1] = {
      ...folderItems[folderItems.length - 1],
      style: { marginBottom: "4px" },
    };
  }

  let profileDropdownMenuItems:ItemType[] = []
  const switchOrgSubMenu = user.orgs.map((org: Org) => ({
    key: org.id,
    icon: user.currentOrgId === org.id && <CheckoutIcon />,
    label: org.name
  }))

  let addWorkSpace:ItemType[] = [];
  if(!checkIsMobile(window.innerWidth)) {
    addWorkSpace = [
      { type: 'divider'},
      {
        key: 'newOrganization',
        icon: <AddIcon />,
        label: trans("profile.createOrg")
      }
    ]
  }
if(user.orgs && user.orgs.length > 0 && showSwitchOrg(user, sysConfig)) {

  profileDropdownMenuItems.push(...switchOrgSubMenu);
  profileDropdownMenuItems.push(...addWorkSpace);
}

profileDropdownMenuItems.splice(0, 0, {
  key: 'joinedOrg',
  label: (
    <CommonTextLabel style={{ margin: "8px", color: "#B8B9BF" }}>
      {trans("profile.joinedOrg")}
    </CommonTextLabel>
  ),
  disabled: true,
})
const menu = (
  <DropdownMenu
    style={{ width: "192px" }}
    onClick={handleClick}
    expandIcon={<StyledPackUpIcon />}
    items={profileDropdownMenuItems}
  />
);

  return (
    <>
    <DivStyled>
      <Layout
        sections={[
          {
            items: [
              {
                text: <TabLabel>{trans("home.allApplications")}</TabLabel>,
                routePath: ALL_APPLICATIONS_URL,
                routeComp: HomeView,
                icon: ({ selected, ...otherProps }) => selected ? <SolidIcon name={'apps'} fill='#00AA92'/> : <SolidIcon name={'apps'} />,
              },
              {
                text: <TabLabel>{trans("home.allModules")}</TabLabel>,
                routePath: MODULE_APPLICATIONS_URL,
                routeComp: ModuleView,
                icon: ({ selected, ...otherProps }) => selected ? <SolidIcon name={'menu'} fill='#00AA92'/> : <SolidIcon name={'menu'} />,
                visible: ({ user }) => user.orgDev,
              },
              {
                text: <TabLabel>{trans("home.marketplace")}</TabLabel>,
                routePath: MARKETPLACE_URL,
                routePathExact: false,
                routeComp: MarketplaceView,
                icon: ({ selected, ...otherProps }) => selected ? <SolidIcon name={'marketplace'} fill='#00AA92'/> : <SolidIcon name={'marketplace'} />,
                visible: ({ user }) => user.orgDev,
              },
              {
                text: <TabLabel>{trans("home.trash")}</TabLabel>,
                routePath: TRASH_URL,
                routeComp: TrashView,
                icon: ({ selected, ...otherProps }) => selected ? <SolidIcon name={'trash'} fill='#00AA92'/> : <SolidIcon name={'trash'} />,
                visible: ({ user }) => user.orgDev,
              },
            ],
          },
          allFolders.length > 0
            ? {
                title: (
                  <FolderSectionLabel>
                    {trans("home.folders")}
                    <FolderCountLabel>{`(${allFolders.length})`}</FolderCountLabel>
                    {user.orgDev && (
                      <CreateFolderIcon onClick={handleFolderCreate}>
                        <PlusIcon />
                      </CreateFolderIcon>
                    )}
                  </FolderSectionLabel>
                ),
                items: folderItems,
                style: { marginTop: "8px" },
              }
            : { items: [] },
          {
            items: [
              {
                text: <TabLabel>{trans("home.queryLibrary")}</TabLabel>,
                routePath: QUERY_LIBRARY_URL,
                routeComp: QueryLibraryEditor,
                icon: ({ selected, ...otherProps }) => selected ? <SolidIcon name={'globe'} fill='#00AA92'/> : <SolidIcon name={'globe'} />,
                visible: ({ user }) => user.orgDev,
              },
              {
                text: <TabLabel>{trans("home.datasource")}</TabLabel>,
                routePath: DATASOURCE_URL,
                routePathExact: false,
                routeComp: DatasourceHome,
                icon: ({ selected, ...otherProps }) => selected ? <SolidIcon name={'datasource'} fill='#00AA92'/> : <SolidIcon name={'datasource'} />,
                visible: ({ user }) => user.orgDev,
                onSelected: (_, currentPath) => currentPath.split("/")[1] === "datasource",
              },
              {
                text: <TabLabel>DbBuilder</TabLabel>,
                routePath: DBBUILDER_URL,
                routePathExact: false,
                routeComp: DbBuilder,
                icon: ({ selected, ...otherProps }) => selected ? <DbBuilderIcon {...otherProps} width={"24px"}/> : <DbBuilderIcon {...otherProps} width={"24px"}/>,
                visible: ({ user }) => user.orgDev,
                onSelected: (_, currentPath) => currentPath.split("/")[1] === "dbbuilder",
              },
              {
                text: <TabLabel>Workflow</TabLabel>,
                routePath: WORKFLOW_BUILDER,
                routePathExact: false,
                routeComp: Workflow,
                icon: ({ selected, ...otherProps }) => selected ? <WorkflowIcon {...otherProps} width={"24px"}/> : <WorkflowIcon {...otherProps} width={"24px"}/>,
                visible: ({ user }) => user.orgDev,
                onSelected: (_, currentPath) => currentPath.split("/")[1] === "workflow",
              },
              {
                text: <TabLabel>{trans("settings.title")}</TabLabel>,
                routePath: SETTING,
                routePathExact: false,
                routeComp: Setting,
                icon: ({ selected, ...otherProps }) => selected ? <SolidIcon name={'settings'} fill='#00AA92'/> : <SolidIcon name={'settings'} fill='#C1C7CD'/>,
                visible: ({ user }) => user.orgDev,
                onSelected: (_, currentPath) => currentPath.split("/")[1] === "setting",
              },
            ],
          },
        ]}
      />
      {/* {user.orgDev && (
        <InviteDialog
          trigger={
            <InviteUser>
              <InviteUserIcon style={{ marginRight: "8px" }} />
              {trans("home.inviteUser")}
            </InviteUser>
          }
          style={{ marginLeft: "auto" }}
        />
      )} */}
    </DivStyled>
      <SwitchWorkspace>
      <StyledDropdown
        dropdownRender={() => menu}
        trigger={["click"]}
      >
        <div title={org?.name}> 
          <StyledWorkspace className={"taco-edit-text-body"}>{org?.name}</StyledWorkspace>  
          <PackUpIcon style={{ marginLeft: "5px" }}/>
        </div>
      </StyledDropdown>
    </SwitchWorkspace>
    </>
  );
}