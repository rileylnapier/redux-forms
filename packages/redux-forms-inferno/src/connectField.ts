import Component from 'inferno-component';
import h from 'inferno-hyperscript';
import * as R from 'ramda';

import { invariant, isString } from 'redux-forms/lib/shared/helpers';
import { Context } from './Form';


export type FormProps = {
  name: string,
};

export type ContextProps = {
  _form: string,
};

export type SFComponent = <T>(props: T) => any;

export type Connected<T> = SFComponent<T & FormProps> & {
  WrappedComponent?: Function,
};

// TODO any -> class
export default function connectField<T>(Wrapped: any): Connected<T> {
  const ConnectedField: Connected<T> = (props: T & FormProps, { reduxForms }: Context) => {
    invariant(
      isString(reduxForms),
      '[redux-forms] Field and FieldArray must be a children of the Form component.',
    );

    return h(Wrapped, R.merge(props, {
      _form: reduxForms,
    }));
  };

  ConnectedField.name = Wrapped.displayName;

  ConnectedField.WrappedComponent = Wrapped;

  return ConnectedField;
}
