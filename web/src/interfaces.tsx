// 从链上返回的单个PackageInfo
export interface IPackageInfo {
  packageID: number
  metadata: string
  totalNumber: number
  rewardAddresses: [string]
  locked: false
  giftIDs: [number]
}

export interface IMetaData {
  title: string
  url: string
  content: string
  keyWord: string
  createAt: number
  deadline: number
}

// 用于显示需要的数据
export interface PackageInfoDisplay {
  title: string
  url: string
  retweet: string
  keyword: string
  isLocked: boolean
  totalNumber: number
  deadline: Date
}

// 用于自组件传参
export interface PackageInfoProps {
  data: PackageInfoDisplay
}

// 显示单个礼物
export interface IGiftInfo {
  title: string
  url: string
  createAt: Date
  packageID: number
  totalNumber: number
  NFTID: number
  seriesNum: number
}

// 合约返回的礼物信息
export interface GiftDataRes {
  id: number
  packageID: number
  serialNumber: number
}

// // 创建上传时的Data
// export interface Package {
//   packageID: number
//   title: string
//   url: string
//   retweet: string
//   keyword: string
//   totalNumber: number
//   createAt: Date
//   deadline: Date
//   isLocked: boolean
// }
