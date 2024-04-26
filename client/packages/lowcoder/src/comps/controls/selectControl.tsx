import { SelectCodeControl } from "./codeControl";
import { controlItem, ControlPropertyViewWrapper } from "lowcoder-design";
import React, { useCallback, useEffect, useState } from "react";
import { ControlParams } from "./controlParams";
import styled from "styled-components";
import { Select } from 'antd';
import { throttle } from "lodash";
import { changeValueAction } from "lowcoder-core";


type PropertyViewParam = {
    label?: string;
    placeholder?: string;
};

const TextDecorationStyle = styled.div`
  outline: none;
  width: 200px;
  min-height: 30px;
  margin: 5px 0px;
`;

export class SelectControl extends SelectCodeControl {
    propertyView(param: PropertyViewParam) {
        return controlItem(
            { filterText: param.label },
            <SelectItem param={param} controlThis={this} propertyView={super.propertyView} />
        );
    }
}

const SelectItem = (props: {
    param: PropertyViewParam;
    controlThis: SelectControl;
    propertyView: (param: ControlParams) => React.ReactNode;
}) => {

    const { param, controlThis, propertyView } = props;
    const [selectedValue, setSelectedValue] = useState('never');

    const items: Array<Object> = [
        {
            label: 'Never',
            value: 'never',
        },
        {
            label: 'On Hover',
            value: 'onHover',
        },
        {
            label: 'Always',
            value: 'always',
        }
    ];

    useEffect(() => {
        setSelectedValue(param.placeholder || 'never')
    }, [param.placeholder])

    const throttleChange = useCallback(
        throttle((str: any) => {
            controlThis.dispatch && controlThis.dispatch(changeValueAction(str, true));
        }, 200),
        [controlThis.dispatch])

    const handleChange = (value: string) => {
        setSelectedValue(value);
        throttleChange(value);
    };

    return (
        <ControlPropertyViewWrapper label={param.label} labelEllipsis>
            <TextDecorationStyle>
                <Select
                    value={selectedValue}
                    style={{ width: 120 }}
                    onChange={handleChange}
                    options={items}
                />
            </TextDecorationStyle>
        </ControlPropertyViewWrapper >
    );

}


export class SelectControlForFontWeight extends SelectCodeControl {
    propertyView(param: PropertyViewParam) {
        return controlItem(
            { filterText: param.label },
            <SelectItemForFontWeight param={param} controlThis={this} propertyView={super.propertyView} />
        );
    }
}

const SelectItemForFontWeight = (props: {
    param: PropertyViewParam;
    controlThis: SelectControl;
    propertyView: (param: ControlParams) => React.ReactNode;
}) => {

    const { param, controlThis, propertyView } = props;
    const [selectedValue, setSelectedValue] = useState(100);

    const itemsForFontWeight: Array<Object> = [
        {
            label: '100',
            value: 100,
        },
        {
            label: '200',
            value: 200,
        },
        {
            label: '300',
            value: 300,
        },
        {
            label: '400',
            value: 400,
        },
        {
            label: '500',
            value: 500,
        },
        {
            label: '600',
            value: 600,
        },
        {
            label: '700',
            value: 700,
        },
        {
            label: '800',
            value: 800,
        },
        {
            label: '900',
            value: 900,
        }

    ];

    useEffect(() => {
        setSelectedValue(Number(param.placeholder )|| 100)
    }, [param.placeholder])

    const throttleChange = useCallback(
        throttle((str: any) => {
            controlThis.dispatch && controlThis.dispatch(changeValueAction(str, true));
        }, 200),
        [controlThis.dispatch])

    const handleChangeitemsForFontWeight = (value: string) => {
        setSelectedValue(Number(value));
        throttleChange(Number(value));
    };

    return (
        <ControlPropertyViewWrapper label={param.label} labelEllipsis>
            <TextDecorationStyle>
                <Select
                    value={selectedValue.toString()}
                    style={{ width: 120 }}
                    onChange={handleChangeitemsForFontWeight}
                    options={itemsForFontWeight}
                />
            </TextDecorationStyle>
        </ControlPropertyViewWrapper >
    );

}


