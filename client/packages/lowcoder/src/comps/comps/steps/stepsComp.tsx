import React, { useState, useContext } from "react";
import { Steps } from 'antd';
import {
  CompAction,
  RecordConstructorToView,
  wrapDispatch,
  wrapChildAction,
  deleteCompAction,
  CompActionTypes
} from "lowcoder-core";
import { trans } from "i18n";
import {
  ContainerBaseProps,
  gridItemCompToGridItems,
  InnerGrid,
} from "../containerComp/containerView";
import { IContainer } from "../containerBase/iContainer";
import { SimpleContainerComp } from "../containerBase/simpleContainerComp";
import { addMapChildAction } from "comps/generators/sameTypeMap";
import { JSONObject, JSONValue } from "util/jsonTypes";
import { messageInstance } from "lowcoder-design";
import { NameGenerator } from "comps/utils";
import { CompTree, mergeCompTrees } from "../containerBase/utils";
import * as _ from 'lodash'
import styled, { css } from "styled-components";
import { default as ConfigProvider } from "antd/es/config-provider";


// withDefault is used for default property
import { UICompBuilder, withDefault, sameTypeMap } from "../../generators";
import { Section, sectionNames, HintPlaceHolder } from "lowcoder-design";
import { hiddenPropertyView } from "comps/utils/propertyUtils";

import { stringExposingStateControl } from "comps/controls/codeStateControl";

// Used in properties ( Inspector in ToolJet )
import { dropdownControl } from "comps/controls/dropdownControl";
import { styleControl } from "comps/controls/styleControl";
import {
  clickEvent,
  eventHandlerControl,
} from "comps/controls/eventHandlerControl";
import {
  NumberControl,
  jsonControl,
} from "comps/controls/codeControl";
import {
  heightCalculator,
  widthCalculator,
  StepsStyle
} from "comps/controls/styleControlConstants";
import { stateComp, valueComp } from "comps/generators/simpleGenerators";
import {
  NameConfig,
  NameConfigHidden,
  withExposingConfigs,
} from "comps/generators/withExposing";
import { stepsDefaultData, stepsNode, StepsDataTooltip } from "./stepsConstants";
import { convertStepsData } from "./stepsUtils";

import { EditorContext } from "comps/editorState";

// Events Used for Event Manager
const EventOptions = [
  clickEvent,
] as const;

// Options for Property named Mode which is a Dropdown
const modeOptions = [
  { label: trans("steps.vertical"), value: "vertical" },
  { label: trans("steps.horizontal"), value: "horizontal" },
] as const;

// Used to show properties - similar to inspector in Tooljet
const childrenMap = {
  steps: jsonControl(convertStepsData, stepsDefaultData),
  mode: dropdownControl(modeOptions, "vertical"),
  initialStep: withDefault(NumberControl, 0),
  containers: withDefault(sameTypeMap(SimpleContainerComp), {
    0: { layout: {}, items: {} },
    1: { layout: {}, items: {} },
    2: { layout: {}, items: {} },
    3: { layout: {}, items: {} },
    4: { layout: {}, items: {} },
    5: { layout: {}, items: {} },
  }),
  selectedStepsKey: stringExposingStateControl("key", "0"),
  onEvent: eventHandlerControl(EventOptions),
  style: styleControl(StepsStyle),
};


// withDefault(NumberControl, 0)


const StepStyled = styled(Steps) <{
  $mode: 'vertical' | 'horizontal';
}>`
  width: 100%;
  min-height: 32px;
`;

const ContainerInSteps = (props: ContainerBaseProps) => {
  return (
    <InnerGrid {...props} emptyRows={15} bgColor={"white"} hintPlaceholder={HintPlaceHolder} />
  );
};

// Component structure created using antD
const StepsComponent = (
  props: RecordConstructorToView<typeof childrenMap> & {
    dispatch: (action: CompAction) => void;
  }
) => {

  const { steps, dispatch, style, onEvent, mode, containers, selectedStepsKey, initialStep } = props;
  const [current, setCurrent] = useState(0);

  const onChange = (value: number) => {
    setCurrent(value);
    if (String(value) !== selectedStepsKey.value) {
      props.selectedStepsKey.onChange(String(value));
    }
  };

  const stepItems = steps.map((value: stepsNode, index: number) => {
    return {
      key: index,
      title: value.name,
    }
  });

  const id = selectedStepsKey.value;
  const childDispatch = wrapDispatch(wrapDispatch(dispatch, "containers"), id);
  const containerProps = containers[id].children;
  return (
    <div
      style={{
        margin: style.margin ?? '3px',
        padding: style.padding !== '3px' ? style.padding : '20px 10px 0px 10px',
        width: widthCalculator(style.margin ?? '3px'),
        height: heightCalculator(style.margin ?? '3px'),
        background: style.background,
        overflow: "auto",
        overflowX: "hidden",
        borderRadius: style.radius,
      }}
    >
      <ConfigProvider
        theme={{
          components: {
            Steps: {
              finishIconBorderColor: style.completedBorderColor
            },
          },
        }}
      >
        <StepStyled
          $mode={mode}
          current={current}
          onChange={onChange}
          direction={mode}
          size='small'
          items={stepItems}
          initial={initialStep}
        />
        <ContainerInSteps
          layout={containerProps.layout.getView()}
          items={gridItemCompToGridItems(containerProps.items.getView())}
          positionParams={containerProps.positionParams.getView()}
          dispatch={childDispatch}
          autoHeight={true}
        // containerPadding={[paddingWidth, 20]}
        />
      </ConfigProvider>

    </div>
  );
};

// Using Generator to connect component structure with all events and properties
let StepsBasicComp = (function () {
  return new UICompBuilder(childrenMap, (props, dispatch) => (
    <StepsComponent {...props} dispatch={dispatch} />
  ))

    // Used to Filtering Properties to shows based on Header on Top
    .setPropertyViewFn((children) => (
      <>
        <Section name={sectionNames.basic}>
          {children.steps.propertyView({
            label: trans("steps.value"),
            tooltip: StepsDataTooltip,
            placeholder: "[]",
          })}
        </Section>

        {["logic", "both"].includes(useContext(EditorContext).editorModeStatus) && (
          <Section name={sectionNames.interaction}>
            {children.onEvent.getPropertyView()}
            {hiddenPropertyView(children)}
          </Section>
        )}

        {["layout", "both"].includes(useContext(EditorContext).editorModeStatus) && (
          <><Section name={sectionNames.layout}>
            {children.mode.propertyView({
              label: trans("steps.mode"),
              tooltip: trans("steps.modeTooltip"),
            })}
            {children.initialStep.propertyView({
              label: trans("steps.initialStep"),
              tooltip: trans("steps.initialStepTooltip"),
            })}
          </Section>
            <Section name={sectionNames.style}>
              {children.style.getPropertyView()}
            </Section>
          </>
        )}
      </>
    ))
    .build();
})();


class StepsImplComp extends StepsBasicComp implements IContainer {
  private syncContainers(): this {
    const steps = this.children.steps.getView();
    const ids: Set<string> = new Set(steps.map((step) => String(step.id)));
    let containers = this.children.containers.getView();
    // delete
    const actions: CompAction[] = [];
    Object.keys(containers).forEach((id) => {
      if (!ids.has(id)) {
        // log.debug("syncContainers delete. ids=", ids, " id=", id);
        actions.push(wrapChildAction("containers", wrapChildAction(id, deleteCompAction())));
      }
    });
    // new
    ids.forEach((id) => {
      if (!containers.hasOwnProperty(id)) {
        // log.debug("syncContainers new containers: ", containers, " id: ", id);
        actions.push(
          wrapChildAction("containers", addMapChildAction(id, { layout: {}, items: {} }))
        );
      }
    });

    // log.debug("syncContainers. actions: ", actions);
    let instance = this;
    actions.forEach((action) => {
      instance = instance.reduce(action);
    });
    return instance;
  }

  override reduce(action: CompAction): this {
    if (action.type === CompActionTypes.CUSTOM) {
      const value = action.value as JSONObject;
      if (value.type === "push") {
        const itemValue = value.value as JSONObject;
        if (_.isEmpty(itemValue.key)) itemValue.key = itemValue.label;
        action = {
          ...action,
          value: {
            ...value,
            value: { ...itemValue },
          },
        } as CompAction;
      }
      if (value.type === "delete" && this.children.steps.getView().length <= 1) {
        messageInstance.warning(trans("tabbedContainer.atLeastOneTabError"));
        // at least one tab
        return this;
      }
    }
    // log.debug("before super reduce. action: ", action);
    let newInstance = super.reduce(action);
    if (action.type === CompActionTypes.UPDATE_NODES_V2) {
      // Need eval to get the value in StringControl
      newInstance = newInstance.syncContainers();
    }
    // log.debug("reduce. instance: ", this, " newInstance: ", newInstance);
    return newInstance;
  }

  realSimpleContainer(key?: string): SimpleContainerComp | undefined {
    let selectedStepKey = this.children.selectedStepsKey.getView().value;
    const steps = this.children.steps.getView();
    const selectedTab = steps.find((step) => step.id === Number(selectedStepKey)) ?? steps[0];
    const id = String(selectedTab.id);
    if (_.isNil(key)) return this.children.containers.children[id];
    return Object.values(this.children.containers.children).find((container) =>
      container.realSimpleContainer(key)
    );
  }

  getCompTree(): CompTree {
    const containerMap = this.children.containers.getView();
    const compTrees = Object.values(containerMap).map((container) => container.getCompTree());
    return mergeCompTrees(compTrees);
  }

  findContainer(key: string): IContainer | undefined {
    const containerMap = this.children.containers.getView();
    for (const container of Object.values(containerMap)) {
      const foundContainer = container.findContainer(key);
      if (foundContainer) {
        return foundContainer === container ? this : foundContainer;
      }
    }
    return undefined;
  }

  getPasteValue(nameGenerator: NameGenerator): JSONValue {
    const containerMap = this.children.containers.getView();
    const containerPasteValueMap = _.mapValues(containerMap, (container) =>
      container.getPasteValue(nameGenerator)
    );

    return { ...this.toJsonValue(), containers: containerPasteValueMap };
  }

  override autoHeight(): boolean {
    return false;
  }
};

// Used to Expose the specific configs
export const StepsComp = withExposingConfigs(StepsImplComp, [
  new NameConfig("steps", trans("steps.valueDesc")),
  new NameConfig("selectedStepsKey", trans("steps.selectedStepsKey")),
  NameConfigHidden,
]);