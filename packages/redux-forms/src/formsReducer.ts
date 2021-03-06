import {
  assocPath,
  dissocPath,
  over,
  lensPath,
  map,
  set,
  lensProp,
  inc,
  dec,
  compose,
} from 'ramda';

import { Value } from './shared/getValue';
import { form, field, Form, Field } from './containers';
import { arrayUnshift, arrayShift, arraySwap, arrayMove } from './arrays';

import {
  Action,
  ADD_FORM,
  REMOVE_FORM,
  ADD_FIELD,
  REMOVE_FIELD,
  TOUCH_ALL,
  SUBMIT_START,
  SUBMIT_STOP,

  ADD_ARRAY,
  REMOVE_ARRAY,
  ARRAY_PUSH,
  ARRAY_POP,
  ARRAY_UNSHIFT,
  ARRAY_SHIFT,
  ARRAY_INSERT,
  ARRAY_REMOVE,
  ARRAY_SWAP,
  ARRAY_MOVE,

  FIELD_CHANGE,
  FIELD_FOCUS,
  FIELD_BLUR,
} from './actions';


export type State = {
  [form: string]: Form,
};


export default function formsReducer(state: State = {}, a: Action): State {
  switch (a.type) {
    // Form
    // ---
    case ADD_FORM:
      return assocPath<Form, State>(
        [a.payload.name], form, state,
      );

    case REMOVE_FORM:
      return dissocPath<State>(
        [a.payload.name], state,
      );

    case ADD_FIELD:
      return assocPath<Field, State>(
        [a.payload.form, 'fields', a.payload.id], a.payload.field, state,
      );

    case REMOVE_FIELD:
      return dissocPath<State>(
        [a.payload.form, 'fields', a.payload.id], state,
      );

    case TOUCH_ALL:
      return over(
        lensPath([a.payload.form, 'fields']),
        map(set(lensProp('touched'), true)),
        state,
      );

    case SUBMIT_START:
      return set(lensPath([a.payload.form, 'submitting']), true, state);

    case SUBMIT_STOP:
      return set(lensPath([a.payload.form, 'submitting']), false, state);

    // Array
    // ---
    case ADD_ARRAY:
      return assocPath<number, State>(
        [a.payload.form, 'arrays', a.payload.id], 0, state,
      );

    case REMOVE_ARRAY:
      return dissocPath<State>(
        [a.payload.form, 'arrays', a.payload.id], state,
      );

    case ARRAY_PUSH:
      return over(
        lensPath([a.payload.form, 'arrays', a.payload.id]),
        inc,
        state,
      );

    case ARRAY_POP:
      return over(
        lensPath([a.payload.form, 'arrays', a.payload.id]),
        dec,
        state,
      );

    case ARRAY_UNSHIFT:
      return compose<State, State, State>(
        over(
          lensPath([a.payload.form, 'fields']),
          arrayUnshift(a.payload.id, 0),
        ),
        over(
          lensPath([a.payload.form, 'arrays', a.payload.id]),
          inc,
        ),
      )(state);

    case ARRAY_SHIFT:
      return compose<State, State, State>(
        over(
          lensPath([a.payload.form, 'fields']),
          arrayShift(a.payload.id, 0),
        ),
        over(
          lensPath([a.payload.form, 'arrays', a.payload.id]),
          dec,
        ),
      )(state);

    case ARRAY_INSERT:
      return compose<State, State, State>(
        over(
          lensPath([a.payload.form, 'fields']),
          arrayUnshift(a.payload.id, a.payload.index + 1),
        ),
        over(
          lensPath([a.payload.form, 'arrays', a.payload.id]),
          inc,
        ),
      )(state);

    case ARRAY_REMOVE:
      return compose<State, State, State>(
        over(
          lensPath([a.payload.form, 'fields']),
          arrayShift(a.payload.id, a.payload.index),
        ),
        over(
          lensPath([a.payload.form, 'arrays', a.payload.id]),
          dec,
        ),
      )(state);

    case ARRAY_SWAP:
      return over(
        lensPath([a.payload.form, 'fields']),
        arraySwap(a.payload.id, a.payload.index1, a.payload.index2),
        state,
      );

    case ARRAY_MOVE:
      return over(
        lensPath([a.payload.form, 'fields']),
        arrayMove(a.payload.id, a.payload.from, a.payload.to),
        state,
      );

    // Field
    // ---
    case FIELD_CHANGE:
      return compose<State, State, State, State>(
          assocPath<Value, State>([a.payload.form, 'fields', a.payload.field, 'value'], a.payload.value),
          assocPath<Value, State>([a.payload.form, 'fields', a.payload.field, 'error'], a.payload.error),
          assocPath<Value, State>([a.payload.form, 'fields', a.payload.field, 'dirty'], a.payload.dirty),
      )(state);

    case FIELD_FOCUS:
      return compose<State, State, State>(
          assocPath<Value, State>([a.payload.form, 'fields', a.payload.field, 'active'], true),
          assocPath<Value, State>([a.payload.form, 'fields', a.payload.field, 'visited'], true),
      )(state);

    case FIELD_BLUR:
      return compose<State, State, State, State, State, State>(
          assocPath<Value, State>([a.payload.form, 'fields', a.payload.field, 'value'], a.payload.value),
          assocPath<Value, State>([a.payload.form, 'fields', a.payload.field, 'error'], a.payload.error),
          assocPath<Value, State>([a.payload.form, 'fields', a.payload.field, 'dirty'], a.payload.dirty),
          assocPath<Value, State>([a.payload.form, 'fields', a.payload.field, 'active'], false),
          assocPath<Value, State>([a.payload.form, 'fields', a.payload.field, 'touched'], true),
      )(state);

    default:
      return state;
  }
}
