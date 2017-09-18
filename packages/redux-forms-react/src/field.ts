import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  identity,
  not,
  compose,
  set,
  lensProp,
  merge,
  path,
} from 'ramda';

import { IReduxFormsState } from 'redux-forms/lib/index';
import * as containers from 'redux-forms/lib/containers';
import fieldProps, { boolField, InputProps, MetaProps } from 'redux-forms/lib/shared/fieldProps';
import getValue, { Target } from 'redux-forms/lib/shared/getValue';
import { shallowCompare } from 'redux-forms/lib/shared/helpers';
import * as actions from 'redux-forms/actions';
import connectField, { SuppliedProps } from './connectField';


export type SuppliedProps = {
  input: InputProps,
  meta: MetaProps,
};

export type Validate = (value: any) => string | null;
export type Normalize = (value: any) => any;

export type FieldProps = {
  name: string,
  normalize?: Normalize,
  defaultValue?: any,
  validate?: Validate,
};

type ConnectedProps = FieldProps & SuppliedProps;

type StateProps = {
  _field: containers.Field | null,
};

type ActionProps = {
  _addField: typeof actions.addField,
  _fieldChange: typeof actions.fieldChange,
  _fieldFocus: typeof actions.fieldFocus,
  _fieldBlur: typeof actions.fieldBlur,
};

type Props<T> = T & ConnectedProps & StateProps & ActionProps;


function field<T>(Component: React.ComponentType<T & SuppliedProps>): React.ComponentType<T & FieldProps> {
  class Field extends React.Component {
    static defaultProps = {
      normalize: identity,
      defaultValue: '',
    };

    static propTypes = {
      name: PropTypes.string.isRequired,
      normalize: PropTypes.func.isRequired,
      defaultValue: PropTypes.any.isRequired,
      validate: PropTypes.func,
    };

    props: Props<T>;

    constructor(props: Props<T>) {
      super(props);

      this.handleChange = this.handleChange.bind(this);
      this.handleFocus = this.handleFocus.bind(this);
      this.handleBlur = this.handleBlur.bind(this);
    }

    shouldComponentUpdate(nextProps: Props<T>) {
      const { _field } = this.props;

      if (!shallowCompare(boolField(this.props), boolField(nextProps))) {
        return true;
      }

      return not(_field && nextProps._field && shallowCompare(_field, nextProps._field));
    }

    componentWillMount() {
      if (!this.props._field) {
        this.newField(this.props);
      }
    }

    componentWillReceiveProps(next: Props<T>) {
      const { _fieldChange, _form, name, defaultValue } = this.props;

      if (!next._field) {
        this.newField(next);
        return;
      }

      if (defaultValue !== next.defaultValue) {
        const value = (next.normalize as Normalize)(next._field.value);
        const error = next.validate ? next.validate(value) : next._field.error;
        const dirty = next.defaultValue !== value;

        _fieldChange(_form, name, value, error, dirty);
      }
    }

    newField(props: Props<T>) {
      const value = (props.normalize as Normalize)(props.defaultValue);
      const newField = compose<containers.Field, containers.Field, containers.Field>(
        set(lensProp('value'), value),
        set(lensProp('error'), props.validate ? props.validate(value) : null),
      )(containers.field);

      props._addField(props._form, props.name, newField);
    }

    handleChange(ev: React.SyntheticEvent<Target> | any) {
      const { _fieldChange, _form, _field, name, normalize, validate, defaultValue } = this.props;

      if (!_field) {
        return;
      }

      const value = (normalize as Normalize)(getValue(ev));
      const error = validate ? validate(value) : _field.error;
      const dirty = value !== defaultValue;

      _fieldChange(_form, name, value, error, dirty);
    }

    handleFocus() {
      const { _fieldFocus, _form, name } = this.props;

      _fieldFocus(_form, name);
    }

    handleBlur(ev: React.SyntheticEvent<Target> | any) {
      const { _fieldBlur, _form, _field, name, normalize, validate, defaultValue } = this.props;

      if (!_field) {
        return;
      }

      const value = (normalize as Normalize)(getValue(ev));
      const error = validate ? validate(value) : _field.error;
      const dirty = value !== defaultValue;

      _fieldBlur(_form, name, value, error, dirty);
    }

    render() {
      const { name, _field } = this.props;

      // Wait until field is initialized
      if (!_field) {
        return null;
      }

      const props = merge(_field, {
        name,
        onChange: this.handleChange,
        onFocus: this.handleFocus,
        onBlur: this.handleBlur,
      });

      const { input, meta, rest } = fieldProps(props);

      // TODO SFC not compatibile with class... wtf TS
      return React.createElement(Component as any, merge(rest, {
        input,
        meta,
      }));
    }
  }

  const connector = connect<StateProps, ActionProps, ConnectedProps & T>(
    (state: IReduxFormsState, props: ConnectedProps & T) => ({
      _field: path<containers.Field>([props._form, 'fields', props.name], state.reduxForms),
    }),
    {
      _addField: actions.addField,
      _fieldChange: actions.fieldChange,
      _fieldFocus: actions.fieldFocus,
      _fieldBlur: actions.fieldBlur,
    },
  );

  // TODO SFC not compatibile with class... wtf TS
  const Connected = connector(Field as any);

  const Contexted = connectField(Connected);

  Contexted.displayName = `field(${Component.displayName || 'Component'})`;

  return Contexted;
}

export default field;