import * as constants from './constants';
import * as fcl from '@onflow/fcl';
import { fromJS } from 'immutable';

export const userInfo = (user) => ({
  type: constants.USERINFO,
  user
});

export const getDataInfo = (resdecode) => ({
  type: constants.DATAINFO,
  resdecode
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
      await dispatch(connectWalletWord())
    } catch (err) {}
}}

export const dataInfo = (event,getPackagesScript) => {
  event.preventDefault();
  return async(dispatch) => {
    try {
      let res = await fcl.send([fcl.script(getPackagesScript)])
      let resdecode = await fcl.decode(res)
      console.log('data',resdecode)
      await dispatch(getDataInfo(resdecode))
    } catch (error) {

    }
  }
}
