import { dropdownControl } from "comps/controls/dropdownControl";
import { stringExposingStateControl, stringStateControl } from "comps/controls/codeStateControl";
import { BoolCodeControl } from "comps/controls/codeControl";
import { AutoHeightControl } from "comps/controls/autoHeightControl";
import { Section, sectionNames } from "lowcoder-design";
import styled, { css } from "styled-components";
import { AlignCenter } from "lowcoder-design";
import { AlignLeft } from "lowcoder-design";
import { AlignRight } from "lowcoder-design";
import { UICompBuilder } from "../generators";
import { NameConfig, NameConfigHidden, withExposingConfigs } from "../generators/withExposing";
import { markdownCompCss, TacoMarkDown } from "lowcoder-design";
import { styleControl } from "comps/controls/styleControl";
import { TextStyle, TextStyleType, heightCalculator, widthCalculator } from "comps/controls/styleControlConstants";
import { hiddenPropertyView, disabledPropertyView, loadingPropertyView } from "comps/utils/propertyUtils";
import { trans } from "i18n";
import { alignWithJustifyControl } from "comps/controls/alignControl";

import _ from "lodash";
import { MultiBaseComp} from "lowcoder-core";
import { setVisibility } from "comps/utils/methodUtils";
import { EvalParamType } from "comps/controls/actionSelector/executeCompTypes";

import { MarginControl } from "../controls/marginControl";
import { PaddingControl } from "../controls/paddingControl";

import React, { useContext } from "react";
import { EditorContext } from "comps/editorState";
import { LoadingOutlined } from "@ant-design/icons";
import { default as Spin } from "antd/es/spin";

const getStyle = (style: TextStyleType) => {
  return css`
    border-radius: ${(style.radius ? style.radius : "4px")};
    border: ${(style.borderWidth ? style.borderWidth : "0px")} solid ${style.border};
    color: ${style.text};
    font-size: ${style.textSize} !important;
    font-weight: ${style.textWeight} !important;
    font-family: ${style.fontFamily} !important;
    font-style:${style.fontStyle} !important;
    text-transform:${style.textTransform} !important;
    text-decoration:${style.textDecoration} !important;
    box-shadow:${style.boxShadow};
    background-color: ${style.background};
    .markdown-body a {
      color: ${style.links};
    }
    .markdown-body {
      margin: ${style.margin} !important;	
      padding: ${style.padding};	
      width: ${widthCalculator(style.margin)};	
      // height: ${heightCalculator(style.margin)};
      h1 {
        line-height: 1.5;
      }
      h5 {
        line-height: 2.2;
      }
    }

    .markdown-body {
      &,
      p,
      div,
      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        color: ${style.text};
        line-height:${style.lineHeight};
        text-indent:${style.textIndent};
        letter-spacing:${style.letterSpacing};
        word-spacing:${style.wordSpacing};
        font-variant:${style.fontVariant};
      }
      img,
      pre {
        background-color: ${style.background};
        code {
          color: #000000;
        }
      }
    }
  `;
};

const TextContainer = styled.div<{ $type: string; $styleConfig: TextStyleType }>`
  height: 100%;
  overflow: auto;
  margin: 0;
  ${(props) =>
    props.$type === "text" && "white-space:break-spaces;line-height: 1.9;"};
  ${(props) => props.$styleConfig && getStyle(props.$styleConfig)}
  display: flex;
  font-size: 13px;
  ${markdownCompCss};
  overflow-wrap: anywhere;
  .markdown-body {
    overflow-wrap: anywhere;
  }
`;
const AlignTop = styled(AlignLeft)`
  transform: rotate(90deg);
`;
const AlignBottom = styled(AlignRight)`
  transform: rotate(90deg);
`;
const AlignVerticalCenter = styled(AlignCenter)`
  transform: rotate(90deg);
`;

const typeOptions = [
  {
    label: "Markdown",
    value: "markdown",
  },
  {
    label: trans("text"),
    value: "text",
  },
] as const;
const VerticalAlignmentOptions = [
  { label: <AlignTop />, value: "flex-start" },
  { label: <AlignVerticalCenter />, value: "center" },
  { label: <AlignBottom />, value: "flex-end" },
] as const;

const TextCompWrapper = styled.div<{ disabled: boolean }>`
  ${(props) =>
    props.disabled &&
    `
    cursor: not-allowed;
    button:disabled {
      pointer-events: none;
    }
  `};
  .ant-spin-nested-loading {
    height: 100%;
    .ant-spin-container {
      height: 100%;
    }
  }
`;

const inputRefMethods = [
  {
    method: setVisibility,
    execute: (comp: MultiBaseComp<any>, params: EvalParamType[]) =>
    comp.children.hidden.dispatchChangeValueAction(!params[0])
  },
];

const loadingIcon = <LoadingOutlined spin />;

let TextTmpComp = (function () {

  const childrenMap = {
    text: stringExposingStateControl(
      "text",
      trans("textShow.text", { name: "{{currentUser.name}}" })
    ),
    autoHeight: AutoHeightControl,
    type: dropdownControl(typeOptions, "markdown"),
    horizontalAlignment: alignWithJustifyControl(),
    verticalAlignment: dropdownControl(VerticalAlignmentOptions, "center"),
    style: styleControl(TextStyle),
    margin: MarginControl,
    padding: PaddingControl,
    tooltip: stringStateControl(""),
    disabled: BoolCodeControl,
    loading: BoolCodeControl,
  };
  return new UICompBuilder(childrenMap, (props) => {
    const value = props.text.value;
    return (
      <TextCompWrapper disabled={props.disabled}>
        <Spin
            indicator={loadingIcon}
            spinning={props.loading}
            style={{height: '100%'}}
          >
          <TextContainer
            $type={props.type}
            $styleConfig={props.style}
            style={{
              justifyContent: props.horizontalAlignment,
              alignItems: props.autoHeight ? "center" : props.verticalAlignment,
              textAlign: props.horizontalAlignment,
            }}
            title={props.tooltip.value} 
          >
            {props.type === "markdown" ? <TacoMarkDown>{value}</TacoMarkDown> : value}
          </TextContainer>
        </Spin>
      </TextCompWrapper>
    );
  })
    .setPropertyViewFn((children) => {
      return (
        <>
          <Section name={sectionNames.basic}>
            {children.type.propertyView({
              label: trans("value"),
              tooltip: trans("textShow.valueTooltip"),
              radioButton: true,
            })}
            {children.text.propertyView({})}
          </Section>

          {(useContext(EditorContext).editorModeStatus === "logic" || useContext(EditorContext).editorModeStatus === "both") && (
            <><Section name={sectionNames.interaction}>
                {disabledPropertyView(children)}
                {hiddenPropertyView(children)}
                {loadingPropertyView(children)}
              </Section>
            </>
          )}

          {["layout", "both"].includes(useContext(EditorContext).editorModeStatus) && (
            <>
              <Section name={sectionNames.layout}>
                {children.autoHeight.getPropertyView()}
                {!children.autoHeight.getView() &&
                  children.verticalAlignment.propertyView({
                    label: trans("textShow.verticalAlignment"),
                    radioButton: true,
                  })}
                {children.horizontalAlignment.propertyView({
                  label: trans("textShow.horizontalAlignment"),
                  radioButton: true,
                })}
                {children.tooltip.propertyView({
                  label: trans("textShow.tooltip"),
                })}
              </Section>
              <Section name={sectionNames.style}>
                {children.style.getPropertyView()}
              </Section>
            </>
          )}
        </>
      );
    })
    .setExposeMethodConfigs(inputRefMethods)
    .build();
})();

TextTmpComp = class extends TextTmpComp {
  override autoHeight(): boolean {
    return this.children.autoHeight.getView();
  }
};

export const TextComp = withExposingConfigs(TextTmpComp, [
  new NameConfig("text", trans("textShow.textDesc")),
  NameConfigHidden,
]);
