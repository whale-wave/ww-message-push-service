import _ from 'lodash';

export * from './logger';
export * from './webhook';
export * from './response';

const mergeOption = (objValue: any, srcValue: any) => {
  if (_.isArray(objValue)) {
    return _.uniq(objValue.concat(srcValue));
  }
};

export const merge = (a: any, b: any) => {
  return _.mergeWith(a, b, mergeOption);
};
