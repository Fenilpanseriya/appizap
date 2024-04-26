import { default as Button } from "antd/es/button";
import { ButtonCompWrapper, buttonRefMethods } from "comps/comps/buttonComp/buttonCompConstants";
import { BoolCodeControl, StringControl } from "comps/controls/codeControl";
import { ButtonEventHandlerControl } from "comps/controls/eventHandlerControl";
import { styleControl } from "comps/controls/styleControl";
import { LinkStyle, LinkStyleType } from "comps/controls/styleControlConstants";
import { withDefault } from "comps/generators";
import { migrateOldData } from "comps/generators/simpleGenerators";
import { UICompBuilder } from "comps/generators/uiCompBuilder";
import { Section, sectionNames } from "lowcoder-design";
import styled from "styled-components";
import { CommonNameConfig, NameConfig, withExposingConfigs } from "../../generators/withExposing";
import {
  hiddenPropertyView,
  disabledPropertyView,
  loadingPropertyView,
} from "comps/utils/propertyUtils";
import { trans } from "i18n";
import { IconControl } from "comps/controls/iconControl";
import { hasIcon } from "comps/utils";
import { RefControl } from "comps/controls/refControl";

import { EditorContext } from "comps/editorState";
import React, { useContext, useState } from "react";

const Link = styled(Button) <{ $style: LinkStyleType }>`
  ${(props) => `
    color: ${props.$style.text};
    margin: ${props.$style.margin};
    padding: ${props.$style.padding};
    font-size: ${props.$style.textSize};
    font-style:${props.$style.fontStyle};
    font-family:${props.$style.fontFamily};
    font-weight:${props.$style.textWeight};
    border: ${props.$style.borderWidth} solid ${props.$style.border};
    border-radius:${props.$style.radius ? props.$style.radius : '0px'};
    text-transform:${props.$style.textTransform ? props.$style.textTransform : ''};
    text-decoration:${props.$style.textDecoration ? props.$style.textDecoration : ''} !important;
    background-color: ${props.$style.background};
    &:hover {
      color: ${props.$style.hoverText} !important;
    }
    &:active {
      color: ${props.$style.activeText} !important;
    }
  `}

  &.ant-btn { 
    display: inline-flex;
    align-items: center;
    > span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-height: 1px;
    }
  }
`;

const IconWrapper = styled.span`
  display: flex;
`;

/**
 * compatible with old data 2022-08-26
 */
function fixOldData(oldData: any) {
  if (oldData && oldData.hasOwnProperty("color")) {
    return {
      text: oldData.color,
    };
  }
  return oldData;
}

const LinkTmpComp = (function () {
  const childrenMap = {
    text: withDefault(StringControl, trans("link.link")),
    linkTarget: withDefault(StringControl, trans("link.defaultLink")),
    linkTooltip: StringControl,
    onEvent: ButtonEventHandlerControl,
    disabled: BoolCodeControl,
    loading: BoolCodeControl,
    style: migrateOldData(styleControl(LinkStyle), fixOldData),
    prefixIcon: IconControl,
    suffixIcon: IconControl,
    viewRef: RefControl<HTMLElement>
  };
  return new UICompBuilder(childrenMap, (props) => {
    // chrome86 bug: button children should not contain only empty span
    const hasChildren = hasIcon(props.prefixIcon) || !!props.text || hasIcon(props.suffixIcon);

    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    const textDecorationStyle =
      props.style?.underline === 'always' ? 'underline' :
        props.style?.underline === 'onHover' && isHovered ? 'underline' : 'none';


    return (
      <ButtonCompWrapper disabled={props.disabled} title={props.linkTooltip}>
        <Link
          ref={props.viewRef}
          $style={props.style}
          loading={props.loading}
          disabled={props.disabled}
          onClick={() => props.onEvent("click")}
          type={"link"}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {hasChildren && (
            <span>
              {hasIcon(props.prefixIcon) && <IconWrapper>{props.prefixIcon}</IconWrapper>}
              <a href={props.linkTarget} target="_blank" style={{fontWeight:props?.style?.fontWeight, textShadow: props?.style?.textShadow, textDecoration: textDecorationStyle }}>{!!props.text && props.text}</a>
              {hasIcon(props.suffixIcon) && <IconWrapper>{props.suffixIcon}</IconWrapper>}
            </span>
          )}
        </Link>
      </ButtonCompWrapper>
    );
  })
    .setPropertyViewFn((children) => {
      return (
        <>
          <Section name={sectionNames.basic}>
            {children.text.propertyView({ label: trans("text") })}
            {children.linkTarget.propertyView({ label: trans("link.linkTarget") })}
          </Section>

          {(useContext(EditorContext).editorModeStatus === "logic" || useContext(EditorContext).editorModeStatus === "both") && (
            <><Section name={sectionNames.interaction}>
              {children.onEvent.getPropertyView()}
              {disabledPropertyView(children)}
              {hiddenPropertyView(children)}
              {loadingPropertyView(children)}
            </Section>
              <Section name={sectionNames.advanced}>
                {children.prefixIcon.propertyView({ label: trans("button.prefixIcon") })}
                {children.suffixIcon.propertyView({ label: trans("button.suffixIcon") })}
              </Section></>
          )}

          {(useContext(EditorContext).editorModeStatus === "layout" || useContext(EditorContext).editorModeStatus === "both") && (
            <>
              <Section name={sectionNames.layout}>
                {children.linkTooltip.propertyView({
                  label: trans("link.linkTooltip")
                })}
              </Section>
              <Section name={sectionNames.style}>
                {children.style.getPropertyView()}
              </Section></>
          )}
        </>
      );
    })
    .setExposeMethodConfigs(buttonRefMethods)
    .build();
})();

export const LinkComp = withExposingConfigs(LinkTmpComp, [
  new NameConfig("text", trans("link.textDesc")),
  new NameConfig("loading", trans("link.loadingDesc")),
  ...CommonNameConfig,
]);
