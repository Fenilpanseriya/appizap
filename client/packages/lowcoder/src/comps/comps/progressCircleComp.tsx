import { default as Progress } from "antd/es/progress";
import { styleControl } from "comps/controls/styleControl";
import { CircleProgressStyle, CircleProgressType, heightCalculator, widthCalculator } from "comps/controls/styleControlConstants";
import styled, { css } from "styled-components";
import { Section, sectionNames } from "lowcoder-design";
import { numberExposingStateControl, stringStateControl } from "../controls/codeStateControl";
import { UICompBuilder } from "../generators";
import { NameConfig, NameConfigHidden, withExposingConfigs } from "../generators/withExposing";
import { hiddenPropertyView } from "comps/utils/propertyUtils";
import { trans } from "i18n";

import { useContext, useEffect } from "react";
import { EditorContext } from "comps/editorState";
import { Tooltip } from "antd";

// TODO: after Update of ANTd, introduce Size attribute to ProgressCircle

const getStyle = (style: CircleProgressType) => {
  const rotation = (style.counterClockwise === "true") ? 'rotate(90deg)' : 'rotate(-90deg)';

  return css`
    width: ${widthCalculator(style.margin)};	
    height: ${heightCalculator(style.margin)};	
    margin: ${style.margin};	
    padding: ${style.padding};
    border-radius:${style.radius};
    box-shadow:${style.boxShadow};
    .ant-progress-text {
      color: ${style.text} !important;
      font-family:${style.fontFamily};
      font-style:${style.fontStyle};
      font-size:${style.textSize} !important;
      font-weight:${style.textWeight};
    }
    .ant-progress-circle-trail {
      stroke-width: ${style.strokeWidth}; 
      stroke: ${style.track};
    }
    .ant-progress-inner .ant-progress-circle-path {
      stroke: ${style.fill} !important;
      stroke-width: ${style.strokeWidth};
      transform: ${rotation} !important;
    }
    &.ant-progress-status-success {
      .ant-progress-inner .ant-progress-circle-path {
        stroke: ${style.success} !important;
      }
      .ant-progress-text {
        color: ${style.success} !important;
      }
    }
  `;
};

export const StyledProgressCircle = styled(Progress) <{ $style: CircleProgressType }>`
  width: 100%;
  height: 100%;
  padding: 2px;
  .ant-progress-inner {
    width: 100% !important;
    height: 100% !important;
  }

  .ant-progress-circle {
    width: 100%;
    height: 100%;
  }
  .ant-progress-text[title] {
    pointer-events: none !important;
  }
  ${(props) => props.$style && getStyle(props.$style)}
`;

// Styled component for tooltip wrapper
const TooltipWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

let ProgressCircleTmpComp = (function () {
  const childrenMap = {
    text: stringStateControl(""),
    tooltip: stringStateControl(""),
    value: numberExposingStateControl("value", 60),
    // borderRadius property hidden as it's not valid for progress circle
    style: styleControl(CircleProgressStyle),
  };
  return new UICompBuilder(childrenMap, (props) => {
    return (
      <TooltipWrapper title={props.tooltip.value}>
        <StyledProgressCircle
          $style={props.style}
          percent={Math.round(props.value.value)}
          type="circle"
          format={()=> props.text.value.trim() !== "" ? props.text.value : props.value.value.toString()}
        />
      </TooltipWrapper>
    );
  })
    .setPropertyViewFn((children) => {
      return (
        <>
          <Section name={sectionNames.basic}>
            {children.text.propertyView({
              label: trans("progress.text"),
            })}
            {children.value.propertyView({
              label: trans("progress.value"),
            })}
          </Section>
          <Section name={sectionNames.layout}>
            {children.tooltip.propertyView({
              label: trans("progress.tooltip"),
            })}
          </Section>

          {["logic", "both"].includes(useContext(EditorContext).editorModeStatus) && (
            <Section name={sectionNames.interaction}>
              {hiddenPropertyView(children)}
            </Section>
          )}

          {["layout", "both"].includes(useContext(EditorContext).editorModeStatus) && (
            <Section name={sectionNames.style}>
              {children.style.getPropertyView()}
            </Section>
          )}
        </>
      );
    })
    .build();
})();

ProgressCircleTmpComp = class extends ProgressCircleTmpComp {
  override autoHeight(): boolean {
    return false;
  }
};

export const ProgressCircleComp = withExposingConfigs(ProgressCircleTmpComp, [
  new NameConfig("value", trans("progress.valueDesc")),
  NameConfigHidden,
]);
