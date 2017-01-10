/// <reference types="jest" />
import * as R from "ramda";

import fieldProps, { boolField } from '../fieldProps';


const onChange = R.identity;
const onFocus = R.identity;
const onBlur = R.identity;

const props = {
  // input
  // ---
  value: '1337',
  checked: false,
  name: 'fieldz',
  onChange,
  onFocus,
  onBlur,

  // meta
  // ---
  error: 'not enough peanuts',
  dirty: false,
  visited: false,
  touched: true,
  active: false,

  // to omit
  // ---
  component: 'input',
  defaultValue: 'kek',
  normalize: R.identity,
  validate: R.identity,
  withRef: R.identity,
  _form: 'form',
  _field: {},
  _addField: R.identity,
  _removeField: R.identity,
  _fieldChange: R.identity,
  _fieldFocus: R.identity,
  _fieldBlur: R.identity,

  // custom
  // ---
  damage: 'tons of',
  wow: 'so test',
};

const props2 = Object.assign({}, props, {
  value: true,
});

describe('#fieldProps', () => {
  it('should separate input props', () => {
    const result: any = fieldProps(props);

    expect(result.input.value).toBe('1337');
    expect(result.input.checked).toBe(false);
    expect(result.input.name).toBe('fieldz');
    expect(result.input.onChange).toBeDefined();
    expect(result.input.onFocus).toBeDefined();
    expect(result.input.onBlur).toBeDefined();
  });

  it('should separate meta props', () => {
    const result: any = fieldProps(props);

    expect(result.meta.error).toBe('not enough peanuts');
    expect(result.meta.dirty).toBe(false);
    expect(result.meta.visited).toBe(false);
    expect(result.meta.touched).toBe(true);
    expect(result.meta.active).toBe(false);
  });

  it('should omit props', () => {
    const result: any = fieldProps(props);

    expect(result.custom.component).toBeUndefined();
    expect(result.custom.defaultValue).toBeUndefined();
    expect(result.custom.normalize).toBeUndefined();
    expect(result.custom.validate).toBeUndefined();
    expect(result.custom.withRef).toBeUndefined();
    expect(result.custom._form).toBeUndefined();
    expect(result.custom._field).toBeUndefined();
    expect(result.custom._addField).toBeUndefined();
    expect(result.custom._removeField).toBeUndefined();
    expect(result.custom._fieldChange).toBeUndefined();
    expect(result.custom._fieldFocus).toBeUndefined();
    expect(result.custom._fieldBlur).toBeUndefined();
  });

  it('should separate custom props', () => {
    const result: any = fieldProps(props);

    expect(result.custom.damage).toBe('tons of');
    expect(result.custom.wow).toBe('so test');
  });

  it('should add a "checked" prop for boolean value', () => {
    const result: any = fieldProps(props2);

    expect(result.input.checked).toBe(true);
  });

  it('should turn "_field" prop to a boolean', () => {
    expect(boolField(props)).toEqual({
      ...props,
      _field: true,
    });
  });
});