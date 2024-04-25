import { BoxShadowCodeControl } from "./codeControl";
import { controlItem, ControlPropertyViewWrapper, Right } from "lowcoder-design";
import React, { useCallback, useEffect, useState } from "react";
import { ControlParams } from "./controlParams";
import { default as Popover } from "antd/es/popover";
import styled from "styled-components";
import { Form, Slider, ColorPicker, Space, InputNumber, Button } from 'antd';
import { throttle } from "lodash";
import { changeValueAction } from "lowcoder-core";

const DEFAULT_COLOR = "#ffffff";

type PropertyViewParam = {
    label?: string;
    placeholder?: string;
};

const BoxShadowInput = styled.div`
  //position: absolute;
  outline: none;
  width: 170px;
  min-height: 30px;
`;

const PopoverContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
`;

const hsvToRgb = (h: number, s: number, v: number): [number, number, number] => {
    let r: number, g: number, b: number;
    const i: number = Math.floor(h * 6);
    const f: number = h * 6 - i;
    const p: number = v * (1 - s);
    const q: number = v * (1 - f * s);
    const t: number = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
        default: r = 0; g = 0; b = 0; break;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

const rgbToHex = (r: any, g: any, b: any) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export class BoxShadowControl extends BoxShadowCodeControl {
    propertyView(param: PropertyViewParam) {
        return controlItem(
            { filterText: param.label },
            <BoxShadowItem param={param} controlThis={this} propertyView={super.propertyView} />
        );
    }
}

interface BoxShadowInterface {
    X: number;
    Y: number;
    Blur: number;
    hexCode: string;
}


const BoxShadowItem = (props: {
    param: PropertyViewParam;
    controlThis: BoxShadowControl;
    propertyView: (param: ControlParams) => React.ReactNode;
}) => {
    const { param, controlThis, propertyView } = props;
    const [boxShadowValue, setBoxShadowValue] = useState<BoxShadowInterface>();
    const [open, setOpen] = useState(false);
    const numberInputs = [
        {
            name: 'X',
            value: 0,
            min: -20,
            max: 20,
            label: 'x-offset'
        },
        {
            name: 'Y',
            value: 0,
            min: -20,
            max: 20,
            label: 'y-offset'
        },
        {
            name: 'Blur',
            value: 0,
            min: 0,
            max: 20,
            label: 'Blur'
        },
        // {
        //     name: 'Spread',
        //     value: 0,
        //     min: 0,
        //     max: 20,
        //     label: 'Spread'
        // }
    ]
    const [numberInputArr, setNumberInputArr] = useState(numberInputs);
    const [colour, setColour] = useState(DEFAULT_COLOR);
    const input = propertyView.call(controlThis, {
        placeholder: param?.placeholder
    });

    const makeStr = (str: any) => {
        const temp = str?.split('px');
        return temp?.[0];
    }

    useEffect(() => {
        const arr = param?.placeholder?.split(" ");
        const colour = arr?.[3];
        numberInputArr?.map((obj: any) => {
            if (obj.name == 'X') {
                obj.value = makeStr(arr?.[0]);
            }
            if (obj.name == 'Y') {
                obj.value = makeStr(arr?.[1]);
            }
            if (obj.name == 'Blur') {
                obj.value = makeStr(arr?.[2]);
            }
            // if (obj.name == 'Spread') {
            //     obj.value = arr?.[3];
            // }
            setColour(colour ? colour : DEFAULT_COLOR);
        })
    }, [param?.placeholder, open])

    const hide = () => {
        setOpen(false);
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
    };

    const handleColorChange = (color: any) => {
        const hsv = {
            "h": color?.metaColor?.originalInput?.h,
            "s": color?.metaColor?.originalInput?.s,
            "v": color?.metaColor?.originalInput?.v
        };
        const [r, g, b] = hsvToRgb(hsv.h, hsv.s, hsv.v);
        const hexCode = rgbToHex(r, g, b);

        setBoxShadowValue((prev: any) => ({
            ...prev,
            hexCode
        }));
        setColour(hexCode);
    };

    const onChange = (newValue: any, item: any) => {
        const updatedNumberInputArr = numberInputArr.map(obj =>
            obj.name === item.name ? { ...obj, value: newValue } : obj
        );
        setNumberInputArr(updatedNumberInputArr);
        setBoxShadowValue((prev: any) => ({
            ...prev,
            [item.name]: newValue
        }));
    };

    const throttleChange = useCallback(
        throttle((str: any) => {
            controlThis.dispatch && controlThis.dispatch(changeValueAction(str, true));
        }, 200),
        [controlThis.dispatch])

    const handleApply = () => {
        const str = (boxShadowValue?.X ? boxShadowValue?.X : 0) + "px " + (boxShadowValue?.Y ? boxShadowValue?.Y : 0) + "px " + (boxShadowValue?.Blur ? boxShadowValue?.Blur : 0) + "px " + (boxShadowValue?.hexCode ? boxShadowValue?.hexCode : DEFAULT_COLOR);
        throttleChange(str);
        hide();
    };

    const handleReset = () => {
        const str = "0px 0px 0px " + DEFAULT_COLOR;
        throttleChange(str);
        hide();
    };

    const content = (
        <React.Fragment>
            <Form
                name="control-hooks"
                onFinish={handleApply}
            >
                {numberInputArr.map((item) => (
                    <div className="row" key={item?.name}>
                        <Space.Compact>
                            <Form.Item label={<label style={{ width: '80px', textAlign: 'left' }}>{item?.label}</label>}>
                                <InputNumber
                                    style={{ width: '60px' }}
                                    min={item.min}
                                    max={item.max}
                                    value={item?.value}
                                    onChange={(value) => onChange(value, item)} />
                            </Form.Item>
                            <Form.Item>
                                <span style={{ marginLeft: '10px' }}>px</span>
                            </Form.Item>
                            <Form.Item>
                                <Slider style={{ marginLeft: '20px', width: '100px' }}
                                    min={item.min}
                                    max={item.max}
                                    onChange={(value: any) => onChange(value, item)}
                                    value={typeof item.value === 'number' ? item.value : 0}
                                />
                            </Form.Item>
                        </Space.Compact>
                    </div>
                ))}

                <Form.Item label={<label style={{ width: '80px', textAlign: 'left' }}>Color</label>}>
                    <ColorPicker defaultValue={colour} value={colour} showText onChange={handleColorChange} />
                </Form.Item>

                <Form.Item style={{ textAlign: 'center' }}>
                    <Space>
                        <Button type="primary" htmlType="submit" style={{ background: "#00aa92", border: "#00aa92" }}>Apply</Button>
                        <Button onClick={handleReset} style={{ marginLeft: '10px' }}>Reset</Button>
                    </Space>
                </Form.Item>
            </Form>

        </React.Fragment>
    );

    return (
        <ControlPropertyViewWrapper label={param.label} labelEllipsis>
            <Popover
                content={
                    <PopoverContainer>
                        {content}
                    </PopoverContainer>
                }
                trigger="click"
                open={open}
                onOpenChange={handleOpenChange}
                placement="left"
            >
                <BoxShadowInput>
                    {input}
                </BoxShadowInput>
            </Popover>
        </ControlPropertyViewWrapper >
    );

}


