import NonFungibleToken from "./NonFungibleToken.cdc"
// import NonFungibleToken from 0xf8d6e0586b0a20c7 // 模拟器
// import NonFungibleToken from 0x631e88ae7f1d7c20 // 测试网账户

pub contract FanNFT: NonFungibleToken {

    pub var totalSupply: UInt64

    access(self) var packageDatas: {UInt32: PackageData}

    access(self) var packages: @{UInt32: Package}

    pub var nextPackageID: UInt32

    pub var createFee:UFix64

    pub var nextGiftID: UInt64

    pub event ContractInitialized()

    pub event PackageCreated(packageID: UInt32)

    pub event PackageLocked(packageID: UInt32)

    pub event GiftDestroyed(id: UInt64)

    pub event Withdraw(id: UInt64, from: Address?)

    pub event Deposit(id: UInt64, to: Address?)

    pub event NewGiftsMinted(packageID: UInt32, amount: UInt32)

    pub let GiftStoragePath: StoragePath

    pub let GiftPublicPath: PublicPath

    pub let AdminStoragePath: StoragePath

    pub let AdminPublicPath: PublicPath

    // 用于前端的礼包列表信息，可以发script直接获取
    //
    pub struct PackageData {
        pub let packageID: UInt32
        pub let metadata: String   
        pub let totalNumber: UInt32
        pub(set) var rewardAddresses: [Address]
        pub(set) var locked: Bool
        pub(set) var giftIDs: [UInt64]

        init(metadata:String, totalNumber: UInt32) {
            self.packageID = FanNFT.nextPackageID
            self.metadata = metadata
            self.totalNumber = totalNumber
            self.locked = false
            self.rewardAddresses = []
            self.giftIDs = []
            FanNFT.nextPackageID = FanNFT.nextPackageID + (1 as UInt32)

            emit PackageCreated(packageID: self.packageID)
        }
    }

    // Package资源逻辑
    //
    pub resource Package {
      pub var packageID: UInt32
      pub var planTotalNumber: UInt32
      pub var rewardAdresses: [Address]
      pub var numberGiftMinted: UInt32

      pub var locked: Bool

      init(metadata:String, totalNumber: UInt32) {
        self.packageID = FanNFT.nextPackageID
        self.planTotalNumber = totalNumber
        self.numberGiftMinted = 0
        self.locked = false
        self.rewardAdresses = []
        FanNFT.packageDatas[self.packageID] = PackageData(metadata:metadata, totalNumber: totalNumber)
      }

      access(self) fun lock(){
        if !self.locked{
          self.locked = true
          let packageDataToModify = FanNFT.packageDatas[self.packageID]!
          packageDataToModify.locked = self.locked
          FanNFT.packageDatas[self.packageID] = packageDataToModify
          emit PackageLocked(packageID:self.packageID)
        }
      }

      pub fun addRewardAddresses(addressArray:[Address]){
        pre{
            UInt32(addressArray.length) <= self.planTotalNumber : "addresses add greater than planTotalNumber"
        }
        self.rewardAdresses.appendAll(addressArray)

        let packageDataToModify = FanNFT.packageDatas[self.packageID]!
        packageDataToModify.rewardAddresses = self.rewardAdresses
        FanNFT.packageDatas[self.packageID] = packageDataToModify
      }
    
      pub fun mintGift(): @NFT{
        let newGift: @NFT <- create NFT(
          packageID: self.packageID,
          serialNumber: self.numberGiftMinted + (1 as UInt32),
        )

        self.numberGiftMinted = self.numberGiftMinted + (1 as UInt32) 
               
        let packageDataToModify = FanNFT.packageDatas[self.packageID]!
        packageDataToModify.giftIDs.append(newGift.id)
        FanNFT.packageDatas[self.packageID] = packageDataToModify

        return <-newGift
      }

      pub fun batchMintGift(packageID: UInt32): @Collection{
        pre{
          self.locked == false: "package is locked"
        }
        var shouldMintAmount = UInt32(self.rewardAdresses.length)
        if shouldMintAmount > self.planTotalNumber{
          // 只挖planTotalNumber长度并分发给前N个地址
          shouldMintAmount = self.planTotalNumber
        }
        let newCollection <- create Collection()
        var i: UInt64 = 1
        while i <= UInt64(shouldMintAmount) {
            newCollection.deposit(token: <-self.mintGift())
            i = i + (1 as UInt64)
        }
        // gift以Collection的形式，存在合约账户的GiftStoragePath下

        emit NewGiftsMinted(packageID:self.packageID, amount:shouldMintAmount)
        self.lock()
        return <-newCollection
      }
    }

    // 用于前端显示礼物的详细信息
    //
    pub struct GiftData {
        pub let id: UInt64

        pub let packageID: UInt32

        pub let serialNumber: UInt32

        init(id: UInt64, packageID: UInt32, serialNumber: UInt32) {
            self.id = id
            self.packageID = packageID
            self.serialNumber = serialNumber
        }
    }

    // 实现标准NFT的接口，NFT==Gift
    pub resource NFT: NonFungibleToken.INFT {
        pub let id: UInt64

        pub let data: GiftData

        init(packageID: UInt32, serialNumber: UInt32){
          FanNFT.totalSupply = FanNFT.totalSupply + (1 as UInt64)
          self.id = FanNFT.totalSupply
          self.data = GiftData(id: self.id, packageID: packageID, serialNumber: serialNumber)
        }

        destroy() {
            emit GiftDestroyed(id: self.id)
        }
    }

    //  Collection 是用户拥有的NFT的集合，实现于标准NFT合约的Collection接口
    //  NFTs会存储在他们自己的账户内
    //
    pub resource Collection: GiftCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic {

        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init() {
          self.ownedNFTs <- {}
        }

        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
          let token <- self.ownedNFTs.remove(key: withdrawID) 
              ?? panic("Cannot withdraw: Gift does not exist in the collection")

          emit Withdraw(id: token.id, from: self.owner?.address)
          
          return <-token
        }

        pub fun batchWithdraw(ids: [UInt64]): @NonFungibleToken.Collection {
          var batchCollection <- create Collection()
          
          for id in ids {
              batchCollection.deposit(token: <-self.withdraw(withdrawID: id))
          }
          
          return <-batchCollection
        }

        pub fun deposit(token: @NonFungibleToken.NFT) {
          
            let token <- token as! @FanNFT.NFT

            let id = token.id

            let oldToken <- self.ownedNFTs[id] <- token

            if self.owner?.address != nil {
                emit Deposit(id: id, to: self.owner?.address)
            }

            destroy oldToken
        }

        pub fun batchDeposit(tokens: @NonFungibleToken.Collection) {

          let keys = tokens.getIDs()

          for key in keys {
              self.deposit(token: <-tokens.withdraw(withdrawID: key))
          }

          destroy tokens
        }

        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            pre {
                self.ownedNFTs[id] != nil: "NFT does not exist in the collection!"
            }
             return &self.ownedNFTs[id] as &NonFungibleToken.NFT
        }

        // 返回borrowed的引用，调用者可以用该方法读取关联的Gift的信息(packageID和seriesNumber)
        pub fun borrowGift(id: UInt64): &FanNFT.NFT? {
            if self.ownedNFTs[id] != nil {
                let ref = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT
                return ref as! &FanNFT.NFT
            } else {
                return nil
            }
        }

        destroy() {
            destroy self.ownedNFTs
        }
    }

    // 用户可以映射他们收到的礼物来允许他人deposit的接口，也用于读取账户中的礼物ID
    //
    pub resource interface GiftCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun batchDeposit(tokens: @NonFungibleToken.Collection)
        pub fun getIDs(): [UInt64]
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowGift(id: UInt64): &FanNFT.NFT? {
            post {
                (result == nil) || (result?.id == id): 
                    "Cannot borrow Gift reference: The ID of the returned reference is incorrect"
            }
        }
    }

    // 用户可以借admin来创建package
    //
    pub resource interface AdminPublic{
        pub fun createPackage(metadata: String, totalNumber: UInt32)
    }

    // 标准接口，用于初始化存储空间来接受NFT资源
    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        post {
          result.getIDs().length == 0: "The created collection must be empty!"
        }
        return <-create FanNFT.Collection()
    }

    // Admin用于倒计时完成时mint礼物，并分发
    //
    pub resource Admin: AdminPublic{
      pub fun borrowPackage(packageID: UInt32): &FanNFT.Package {
        pre {
          FanNFT.packages[packageID] != nil: "Cannot borrow Package: The Package doesn't exist"
        }
        return &FanNFT.packages[packageID] as &FanNFT.Package 
      }

      pub fun createPackage(metadata: String, totalNumber: UInt32){
        var newPackage <- create Package(metadata:metadata, totalNumber:totalNumber)
        FanNFT.packages[newPackage.packageID] <-! newPackage
      }

      pub fun cleanEmptyCollection(emptyCollection: @Collection){
        destroy(emptyCollection)
      }

      pub fun setFee(amount: UFix64){
        FanNFT.createFee = amount
      }
    }

    pub fun getAllPackages():[FanNFT.PackageData]{
      return FanNFT.packageDatas.values
    }

    pub fun getPackageDataByID(packageID:UInt32): FanNFT.PackageData? {
      if let packageData = FanNFT.packageDatas[packageID]{
        return packageData
      }else{
        return nil
      }
    }

    init() {
      self.totalSupply = 0
      self.createFee = 1.0
      self.nextPackageID = 0
      self.nextGiftID = 0
      self.packageDatas = {}
      self.packages <- {}
      self.GiftStoragePath = /storage/FanNFTGiftCollection
      self.GiftPublicPath = /public/FanNFTGiftCollection
      self.AdminStoragePath = /storage/FanNFTAdmin
      self.AdminPublicPath = /public/FanNFTAdmin

      self.account.save<@Admin>(<- create Admin(), to: self.AdminStoragePath)
      self.account.link<&{AdminPublic}>(self.AdminPublicPath, target: self.AdminStoragePath)

      emit ContractInitialized()
    }
}
