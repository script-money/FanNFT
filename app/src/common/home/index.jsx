import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { Button } from 'antd';
import { ReplaceAddress } from '../../config'
import { actionCreatorsHeader } from '../header/store'
import './index.less'

const createPackageTransactionSource = `\
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import FanNFT from "../../contracts/FanNFT.cdc"
transaction(metadata: String, totalNumber: UInt32, adminAccount: Address) {
  prepare(acct: AuthAccount){
    log(acct)
  }
  execute {
    let admin = getAccount(adminAccount)
    let adminRef = admin.getCapability(FanNFT.AdminPublicPath).borrow<&{FanNFT.AdminPublic}>()!
    adminRef.createPackage(metadata: metadata, totalNumber: totalNumber)
  }
}
`

const setUpAccountTransaction = ReplaceAddress(createPackageTransactionSource)

const getPackagesScriptSource = `
import FanNFT from "../../contracts/FanNFT.cdc"

// 获取所有package的数据
pub fun main(): [FanNFT.PackageData] {
    let packageDatas = FanNFT.getAllPackages()

    return packageDatas
}
`

const getPackagesScript = ReplaceAddress(getPackagesScriptSource)

class Home extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      left: 0
    }
    // this.props.handleDataInfo = this.props.handleDataInfo.bind(this)
  }

  componentDidMount() {
    this.props.handleDataInfo(getPackagesScript)
  }

  render() {
    const {
      handleDataInfo,
      packageArr,
      metaDataArr,
      totalNumberArr,
      rewardAddressArr,
      lockedArr,
      giftIDsArr,
    } = this.props
    const packageArrJS = packageArr.toJS()
    const lockedArrJS = lockedArr.toJS()
    return (
      <div className="homeBox">
        <div className="firstArea">
          {packageArrJS !== null ?
            packageArrJS.map((item, index) => {
              const metaDataArrJS = metaDataArr.toJS()
              const totalNumberArrJS = totalNumberArr.toJS()
              // const end = moment.unix((metaDataArrJS[index].deadline)).format('YYYY/MM/DD hh:mm:ss')
              const end = moment((metaDataArrJS[index].deadline)).format('YYYY/MM/DD HH:mm:ss')
              return (
                packageArr !== "" ?
                  <div className="one" key={index}>
                    <div className="title">
                      <span>{metaDataArrJS[index].title}</span>
                    </div>
                    <div className="locked">
                      <span>{lockedArrJS[index] ? "已结束" : "进行中"}</span>
                    </div>
                    <div className="contentBox">
                      <div className="contentText">转发内容{metaDataArrJS[index].content}</div>
                      <div className="deadlineText">截止日期 {end}</div>
                      <div className="imageBox">
                        <img src={metaDataArrJS[index].image} alt="" />
                      </div>
                      <div className="totalText">总量 {totalNumberArrJS[index]}</div>
                    </div>
                    {
                      lockedArrJS[index] ?
                        <div className="button">
                          <Button type="primary" shape="round" size="large">
                            查看获奖的名单
                        </Button>
                        </div>
                        :
                        <div className="button">
                          <Button type="primary" shape="round" size="large">
                            转发到我的推特
                        </Button>
                        </div>
                    }

                  </div>
                  : null
              )
            })
            : null
          }
          {/* <div className="one" onClick={(event) => handleDataInfo(event, getPackagesScript)}>
            获取进行活动的data数据
          </div> */}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  data: state.getIn(['header', 'data']),
  packageArr: state.getIn(['header', 'packageArr']),
  metaDataArr: state.getIn(['header', 'metaDataArr']),
  totalNumberArr: state.getIn(['header', 'totalNumberArr']),
  rewardAddressArr: state.getIn(['header', 'rewardAddressArr']),
  lockedArr: state.getIn(['header', 'lockedArr']),
  giftIDsArr: state.getIn(['header', 'giftIDsArr']),
})

const mapDispatchToProps = (dispatch) => {
  return {
    handleDataInfo(getPackagesScript) {
      dispatch(actionCreatorsHeader.dataInfo(getPackagesScript))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)