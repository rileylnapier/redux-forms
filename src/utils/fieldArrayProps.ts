import * as R from 'ramda';


const FIELD_ARRAY_PROPS = [
  'component',
  // state
  '_array',
  // actions
  '_addArray',
  '_removeArray',
  '_push',
  '_pop',
  '_unshift',
  '_shift',
  // context
  '_form',
  '_arrayId',
];


export type FunctionProps = {
  map: (fn: (arr: string[]) => any) => any,
  push: () => void,
  pop: () => void,
  unshift: () => void,
  shift: () => void,
};

const separateProps = <T>(props: T, fns: FunctionProps) => R.merge(
  R.omit(FIELD_ARRAY_PROPS, props), { fields: fns },
);

export default separateProps;
