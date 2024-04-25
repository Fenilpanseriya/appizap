import { useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";
import { MultiBaseComp, RecordConstructorToView } from "lowcoder-core";
import { styleControl } from "comps/controls/styleControl";
import _ from "lodash";
import {
  IconStyle,
  IconStyleType,
  heightCalculator,
  widthCalculator,
} from "comps/controls/styleControlConstants";
import {
  blurMethod,
  clickMethod,
  focusWithOptions,
  selectMethod,
  setRangeTextMethod,
  setSelectionRangeMethod,
} from "../utils/methodUtils";
import {
  withMethodExposing,
  refMethods,
} from "../generators/withMethodExposing";
import { UICompBuilder } from "comps/generators/uiCompBuilder";
import { withDefault } from "../generators";
import {
  NameConfigHidden,
  withExposingConfigs,
} from "comps/generators/withExposing";
import { Section, sectionNames } from "lowcoder-design";
import {
  hiddenPropertyView,
  tooltipPropertyView,
} from "comps/utils/propertyUtils";
import { trans } from "i18n";
import { NumberControl, StringControl } from "comps/controls/codeControl";
import { IconControl } from "comps/controls/iconControl";
import ReactResizeDetector from "react-resize-detector";
import { AutoHeightControl } from "../controls/autoHeightControl";
import {
  clickEvent,
  eventHandlerControl,
} from "../controls/eventHandlerControl";
import { useContext } from "react";
import { EditorContext } from "comps/editorState";
import { InputRef } from "antd/es/input";
import {
  EvalParamType,
  MethodConfig,
} from "../controls/actionSelector/executeCompTypes";
import { RefControl } from "../controls/refControl";

const Container = styled.div<{ $style: IconStyleType | undefined }>`
  display: flex;
  align-items: center;
  justify-content: center;

  ${(props) =>
    props.$style &&
    css`
      height: calc(100% - ${props.$style.margin});
      width: calc(100% - ${props.$style.margin});
      padding: ${props.$style.padding};
      margin: ${props.$style.margin};
      border: ${props.$style.borderWidth} solid ${props.$style.border};
      border-radius: ${props.$style.radius};
      background: ${props.$style.background};

      svg {
        max-width: ${widthCalculator(props.$style.margin)};
        max-height: ${heightCalculator(props.$style.margin)};
        color: ${props.$style.fill};
        object-fit: contain;
        pointer-events: auto;
        stroke-width: ${props.$style.strokeWidth} !important;
        stroke: ${props.$style.stroke};
        box-shadow: ${props.$style.boxShadow};
      }
    `}
`;

const EventOptions = [clickEvent] as const;

const childrenMap = {
  style: styleControl(IconStyle),
  icon: withDefault(IconControl, "/icon:antd/homefilled"),
  autoHeight: withDefault(AutoHeightControl, "auto"),
  iconSize: withDefault(NumberControl, 20),
  onEvent: eventHandlerControl(EventOptions),
  tooltip: StringControl,
};

const setVisibilityConfig: MethodConfig<"setVisibility"> = {
  name: "setVisibility",
  description: trans("method.setVisibility"),
  params: [
    {
      name: "Value",
      type: "boolean",
      description: "value",
    },
  ],
};

const setVisibilityMethodExecution = {
  method: setVisibilityConfig,
  execute: (comp: MultiBaseComp<any>, params: EvalParamType[]) =>
    comp.children.hidden.dispatchChangeValueAction(params[0]),
};

const IconView = (props: RecordConstructorToView<typeof childrenMap>) => {
  const conRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (height && width) {
      onResize();
    }
  }, [height, width]);

  const onResize = () => {
    const container = conRef.current;
    setWidth(container?.clientWidth ?? 0);
    setHeight(container?.clientHeight ?? 0);
  };

  return (
    <ReactResizeDetector onResize={onResize}>
      <Container
        title={props.tooltip}
        ref={conRef}
        $style={props.style}
        style={{
          fontSize: props.autoHeight
            ? `${height < width ? height : width}px`
            : props.iconSize,
          background: props.style.background,
        }}
        onClick={() => props.onEvent("click")}
      >
        {props.icon}
      </Container>
    </ReactResizeDetector>
  );
};

let IconBasicComp = (function () {
  return new UICompBuilder(childrenMap, (props) => <IconView {...props} />)
    .setPropertyViewFn((children) => (
      <>
        <Section name={sectionNames.basic}>
          {children.icon.propertyView({
            label: trans("iconComp.icon"),
            IconType: "All",
          })}
        </Section>

        {["logic", "both"].includes(
          useContext(EditorContext).editorModeStatus
        ) && (
          <Section name={sectionNames.interaction}>
            {children.onEvent.getPropertyView()}
            {tooltipPropertyView(children)}
            {hiddenPropertyView(children)}
          </Section>
        )}

        {["layout", "both"].includes(
          useContext(EditorContext).editorModeStatus
        ) && (
          <>
            <Section name={sectionNames.layout}>
              {children.autoHeight.propertyView({
                label: trans("iconComp.autoSize"),
              })}
              {!children.autoHeight.getView() &&
                children.iconSize.propertyView({
                  label: trans("iconComp.iconSize"),
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

IconBasicComp = class extends IconBasicComp {
  override autoHeight(): boolean {
    return false;
  }
};

const IconBasicComp2Comp = withMethodExposing(IconBasicComp, [
  setVisibilityMethodExecution,
]);

export const IconComp = withExposingConfigs(IconBasicComp2Comp, [
  NameConfigHidden,
]);
