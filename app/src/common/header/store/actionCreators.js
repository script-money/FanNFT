import * as constants from './constants';
import * as fcl from '@onflow/fcl';
import { fromJS } from 'immutable';

export const userInfo = (user) => ({
  type: constants.USERINFO,
  value: fromJS(user)
});

export const connectWalletWord = (connectWallet) => ({
  type: constants.CONNECTWALLET,
  connectWallet
});

export const toggleConnectWallet = (event,connectWallet) => {
  event.preventDefault();
  return async(dispatch) => {
    if(connectWallet) {
      fcl.unauthenticate()
      } else {
      fcl.authenticate()
    }
    try {
      let user = fcl.currentUser().subscribe(connectWallet);
      await dispatch(connectWalletWord())
    } catch (err) {}
  // return async (dispatch) => {
  //   try {
  //     let user = fcl.currentUser().subscribe(connectWallet);
  //     await dispatch(userInfo(user))
  //   } catch (err) {}
  // }
}}