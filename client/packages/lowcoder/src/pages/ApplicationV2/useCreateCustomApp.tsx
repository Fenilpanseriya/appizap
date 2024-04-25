import { CustomModal, DatasourceForm, FormInputItem, FormSection } from "lowcoder-design";
import { RuleObject, StoreValue } from "rc-field-form/lib/interface";
import { createFolder } from "../../redux/reduxActions/folderActions";
import React, { useCallback, useMemo } from "react";
import { default as Form } from "antd/es/form";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { getUser } from "../../redux/selectors/usersSelectors";
import { trans } from "../../i18n";
import { foldersSelector } from "../../redux/selectors/folderSelector";
import { ModalFunc } from "antd/es/modal/confirm";
import { AppTypeEnum, AppUILayoutType, ApplicationDetail } from "@lowcoder-ee/constants/applicationConstants";
import { HomeResTypeEnum } from "@lowcoder-ee/types/homeRes";
import { createApplication } from "@lowcoder-ee/redux/reduxActions/applicationActions";
import history from "../../util/history";
import { buildAppRouteWithState } from "@lowcoder-ee/constants/routesURL";
import { getParentFolderId } from "@lowcoder-ee/redux/selectors/applicationSelector";

const NEW_PAGE_NAME = 'Home Page';

const CreateFolderLabel = styled.div`
  font-size: 13px;
  color: #333333;
  line-height: 13px;
  margin-bottom: 8px;
`;

export function useCreateCustomApp() {
	const dispatch = useDispatch();
	const user = useSelector(getUser);
	const allFolders = useSelector(foldersSelector);
	const folderNames = useMemo(() => allFolders.map((f) => f.name), [allFolders]);

	const [form] = Form.useForm();

	let modal: ReturnType<ModalFunc> | null = null;

	const dispatchCreateCustomApplication = (onSuccess: (res: any) => void, onFail: () => void) => {
		dispatch(
		createFolder(
			{
				name: form.getFieldValue("name"),
				orgId: user.currentOrgId,
			},
			onSuccess,
			onFail
		)
		);
	}

	const parentFolderId = useSelector(getParentFolderId);

	const onSuccess = useCallback((res: any) => {

		const {folderId} = res.data.data;

		const dsl = {
			ui: {
			compType: AppUILayoutType[AppTypeEnum.Application],
			comp: {},
			},
		};

		const applicationType = AppTypeEnum[AppTypeEnum[HomeResTypeEnum.Application] as keyof typeof AppTypeEnum];
		

		dispatch(
			createApplication({
				applicationType: applicationType || AppTypeEnum.Application,
				applicationName: NEW_PAGE_NAME,
				orgId: user.currentOrgId,
				dsl,
				folderId: folderId,
				containingFolderId: parentFolderId,
				onSuccess: (app: ApplicationDetail) => {
					history.push(
						buildAppRouteWithState(
							app.applicationInfoView.applicationId,
							!user.userStatus.newUserGuidance
						)
					);
				},
			})
		);

	}, [
		user.userStatus.newUserGuidance,
		user.currentOrgId,
		user.username,
		dispatch,
	]);



	return useCallback(() => {
		modal = CustomModal.confirm({
		title: "Create application",
		content: (
			<DatasourceForm form={form} preserve={false} style={{ gap: "12px" }}>
			<FormSection>
				<CreateFolderLabel>{"Application name:"}</CreateFolderLabel>
				<FormInputItem
				onPressEnter={() => {
					form.validateFields().then(() => {
						dispatchCreateCustomApplication(
							(res: any) => {
								onSuccess(res)
								modal?.destroy();
							},
							() => {}
						);
					});
				}}
				autoFocus={true}
				name={"name"}
				rules={[
					{
						// message: trans("home.folderAlreadyExists"),
						message: "The application already exists",
						warningOnly: false,
						validator: (_: RuleObject, value: StoreValue) => {
							if (value && folderNames.includes(value)) {
								return Promise.reject();
							}
								return Promise.resolve();
						},
					},
				]}
				/>
			</FormSection>
			</DatasourceForm>
		),
		onConfirm: () =>
			form.validateFields().then(
			() =>
				new Promise((resolve, reject) => {
					dispatchCreateCustomApplication(
					(res: any) => {
						onSuccess(res);
						resolve(true)
					},
					() => reject(false)
				);
				})
			),
		okText: trans("create"),
		});
	}, [user, allFolders, form, dispatch]);
}
