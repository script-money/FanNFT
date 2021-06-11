import { fromJS } from 'immutable';
import * as constants from './constants';

const defaultState = fromJS({
  user: null,
  connectWallet: false,
});

export default (state = defaultState, action) => {
  switch(action.type) {
    case constants.CONNECTWALLET:
      return state.merge({
        connectWallet: !state.get('connectWallet'),
      })
    case constants.USERINFO:
      return state.merge({
        'user': action.value,
      })
    default:
      return state;
  }
}