import Component from 'inferno-component';
import h from 'inferno-hyperscript';
import { connect } from 'inferno-redux';
import * as R from 'ramda';

import * as containers from 'redux-forms/lib/containers';
import fieldProps, { boolField, InputProps, MetaProps } from 'redux-forms/lib/shared/fieldProps';
import getValue, { Value, Target } from 'redux-forms/lib/shared/getValue';
import { shallowCompare, isString } from 'redux-forms/lib/shared/helpers';
import * as actions from 'redux-forms/actions';
import connectField, { ContextProps } from './connectField';


export type SuppliedProps = {
  input: InputProps,
  meta: MetaProps,
};

export type SFComponent = (props: any) => VNode;

export type FieldProps<T> = T & {
  name: string,
  component: SFComponent | string,  // TODO: Add component class
  validate?: Validate,
  normalize?: Normalize,
  defaultValue?: string,
  withRef?: (el: HTMLElement) => void,
};

export type Validate = (value: Value) => string | null;

export type Normalize = (value: Value) => Value;


class Field<T> extends Component<Props<T>, void> {
  // Must contain all props of 'StateProps & ActionProps'
  static defaultProps = {
    validate: () => null,
    normalize: R.identity,
    defaultValue: '',
    // state
    _field: null,
    // actions
    _addField: R.identity,
    _removeField: R.identity,
    _fieldChange: R.identity,
    _fieldFocus: R.identity,
    _fieldBlur: R.identity,
  };

  static displayName = 'Field';

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

    return R.not(_field && nextProps._field && shallowCompare(_field, nextProps._field));
  }

  componentWillMount() {
    if (!this.props._field) {
      this.newField(this.props);
    }
  }

  componentWillReceiveProps(next: Props<T>) {
    const { _fieldChange, _form, name, normalize, validate, defaultValue } = this.props;

    if (!next._field) {
      this.newField(next);
      return;
    }

    if (defaultValue !== next.defaultValue) {
      const value = next.normalize(next._field.value);
      const error = next.validate(value);
      const dirty = next.defaultValue !== value;

      _fieldChange(_form, name, value, error, dirty);
    }
  }

  componentWillUnmount() {
    const { _removeField, _form, name } = this.props;

    _removeField(_form, name);
  }

  newField(props: Props<T>) {
    const value = props.normalize(props.defaultValue);
    const newField = R.compose<containers.Field, containers.Field, containers.Field>(
      R.set(R.lensProp('value'), value),
      R.set(R.lensProp('error'), props.validate(value)),
    )(containers.field);

    props._addField(props._form, props.name, newField);
  }

  handleChange(ev: React.SyntheticEvent<Target> | Value) {
    const { _fieldChange, _form, name, normalize, validate, defaultValue } = this.props;

    const value = normalize(getValue(ev));
    const error = validate(value);
    const dirty = value !== defaultValue;

    _fieldChange(_form, name, value, error, dirty);
  }

  handleFocus() {
    const { _fieldFocus, _form, name } = this.props;

    _fieldFocus(_form, name);
  }

  handleBlur(ev: React.SyntheticEvent<Target> | Value) {
    const { _fieldBlur, _form, name, normalize, validate, defaultValue } = this.props;

    const value = normalize(getValue(ev));
    const error = validate(value);
    const dirty = value !== defaultValue;

    _fieldBlur(_form, name, value, error, dirty);
  }

  render() {
    const { component, withRef, _field } = this.props;

    // Wait until field is initialized
    if (!_field) {
      return null;
    }

    const props = R.mergeAll<T & InputProps & MetaProps>([this.props, { ref: withRef }, _field, {
      onChange: this.handleChange,
      onFocus: this.handleFocus,
      onBlur: this.handleBlur,
    }]);

    const { input, meta, custom } = fieldProps(props);

    if (isString(component)) {
      return h(component, R.merge(custom, input));
    }

    return h(component, R.merge(custom, { input, meta }));
  }
}


type ConnectedProps<T> = FieldProps<T> & ContextProps;

type DefaultProps = {
  validate: Validate,
  normalize: Normalize,
  defaultValue: string,
};

type StateProps = {
  _field: containers.Field | null,
};

type ActionProps = {
  _addField: actions.AddFieldCreator,
  _removeField: actions.RemoveFieldCreator,
  _fieldChange: actions.FieldChangeCreator,
  _fieldFocus: actions.FieldFocusCreator,
  _fieldBlur: actions.FieldBlurCreator,
};

type Props<T> = ConnectedProps<T> & StateProps & ActionProps & DefaultProps;


const bindActions = {
  _addField: actions.addField,
  _removeField: actions.removeField,
  _fieldChange: actions.fieldChange,
  _fieldFocus: actions.fieldFocus,
  _fieldBlur: actions.fieldBlur,
};

const Connected = connect<StateProps, ActionProps, ConnectedProps<{}>>((state, props: ConnectedProps<{}>) => ({
  _field: R.path<containers.Field>([props._form, 'fields', props.name], state.reduxForms),
}), bindActions)(Field);

const Contexted = connectField(Connected);

Contexted.displayName = Field.displayName;

export default Contexted;
