import NonFungibleToken from "./NonFungibleToken.cdc"

pub contract FanNFT: NonFungibleToken {

    pub var totalSupply: UInt64

    access(self) var packageDatas: {UInt32: PackageData}

    access(self) var packages: @{UInt32: Package}

    pub var nextPackageID: UInt32

    pub var nextGiftID: UInt64

    pub event ContractInitialized()

    pub event PackageCreated(packageID: UInt32)

    pub event PackageLocked(packageID: UInt32)

    pub event GiftDestroyed(id: UInt64)

    pub event GiftMinted(giftID: UInt64, packageID: UInt32, serialNumber: UInt32)

    pub event Withdraw(id: UInt64, from: Address?)

    pub event Deposit(id: UInt64, to: Address?)

    pub let GiftStoragePath: StoragePath

    pub let GiftPublicPath: PublicPath

    pub let AdminStoragePath: StoragePath

    pub let AdminPublicPath: PublicPath

    // 用于前端的礼包列表信息
    //
    pub struct PackageData {
        pub let name: String
        pub let packageID: UInt32
        pub let metadata: {String:String}    
        pub let totalNumber: UInt32
        pub var actualTotalNumber: UInt32
        pub var locked: Bool

        init(name: String, metadata:{String:String}, totalNumber: UInt32) {
            pre {
                name.length > 0: "New Package name cannot be empty"
            }
            self.name = name
            self.packageID = FanNFT.nextPackageID
            self.metadata = metadata
            self.totalNumber = totalNumber
            self.actualTotalNumber = 0
            self.locked = false

            FanNFT.nextPackageID = FanNFT.nextPackageID + (1 as UInt32)

            emit PackageCreated(packageID: self.packageID)
        }
    }

    // Package资源逻辑
    //
    pub resource Package {
      pub var packageID: UInt32
      pub var planTotalNumber: UInt32
      pub var actualTotalNumber: UInt64

      pub var numberGiftMinted: UInt32

      pub var locked: Bool

      init(name: String, metadata:{String:String}, totalNumber: UInt32) {
        self.packageID = FanNFT.nextPackageID
        self.planTotalNumber = totalNumber
        self.actualTotalNumber = 0
        self.numberGiftMinted = 0
        self.locked = false

        FanNFT.packageDatas[self.packageID] = PackageData(name: name, metadata:metadata, totalNumber: totalNumber)
      }

      access(self) fun lock(){
        if !self.locked{
          self.locked = true
          emit PackageLocked(packageID:self.packageID)
        }
      }

      pub fun setActualTotalNumber(number: UInt64){
        pre {
          self.actualTotalNumber == (0 as UInt64): "actualTotalNumber should be empty"
        }
        self.actualTotalNumber = number
      }
    
      pub fun mintGift(giftID: UInt64): @NFT{
        
        let newMoment: @NFT <- create NFT(
          packageID: self.packageID,
          serialNumber: self.numberGiftMinted + (1 as UInt32),
        )

        self.numberGiftMinted = self.numberGiftMinted + (1 as UInt32)                           
        return <-newMoment                            
      }

      pub fun batchMintGift(packageID: UInt32, quantity: UInt64): @Collection{
        let newCollection <- create Collection()

        var i: UInt64 = 0
        while i < quantity {
            newCollection.deposit(token: <-self.mintGift(giftID: i))
            i = i + (1 as UInt64)
        }
        self.setActualTotalNumber(number: quantity)
        return <-newCollection
      }
    }

    // 用于前端显示礼物的详细信息
    //
    pub struct GiftData {
        pub let packageID: UInt32

        pub let serialNumber: UInt32

        init(packageID: UInt32, serialNumber: UInt32) {
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
          self.data = GiftData(packageID: packageID, serialNumber: serialNumber)
          emit GiftMinted(giftID:self.id ,packageID: packageID, serialNumber:self.data.serialNumber)
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
      pub fun createPackage(name: String, metadata: {String: String}, totalNumber: UInt32)
    }

    // 标准接口，用于初始化存储空间来接受NFT资源
    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        post {
            result.getIDs().length == 0: "The created collection must be empty!"
        }
        return <-create FanNFT.Collection()
    }

    // Admin用于倒计时完成时mint礼物，存储在账户中等用户claim。
    //
    pub resource Admin: AdminPublic{
      pub fun borrowPackage(packageID: UInt32): &FanNFT.Package {
        pre {
          FanNFT.packages[packageID] != nil: "Cannot borrow Package: The Package doesn't exist"
        }
        return &FanNFT.packages[packageID] as &FanNFT.Package 
      }

      pub fun createPackage(name: String, metadata: {String: String}, totalNumber: UInt32){
        var newPackage <- create Package(name:name, metadata:metadata, totalNumber:totalNumber)
        FanNFT.packages[newPackage.packageID] <-! newPackage
      }
    }

    pub fun getAllPackages():[FanNFT.PackageData]{
      log(FanNFT.packageDatas.values)
      return FanNFT.packageDatas.values
    }

    init() {
      self.totalSupply = 0
      self.nextPackageID = 0
      self.nextGiftID = 0
      self.packageDatas = {}
      self.packages <- {}
      self.GiftStoragePath = /storage/FanNFTGiftCollection
      self.GiftPublicPath = /public/FanNFTGiftCollection
      self.AdminStoragePath = /storage/FanNFTAdmin
      self.AdminPublicPath = /public/FanNFTAdmin

      self.account.save<@Collection>(<- create Collection(), to: self.GiftStoragePath)
      self.account.link<&{GiftCollectionPublic}>(self.GiftPublicPath, target: self.GiftStoragePath)

      self.account.save<@Admin>(<- create Admin(), to: self.AdminStoragePath)
      self.account.link<&{AdminPublic}>(self.AdminPublicPath, target: self.AdminStoragePath)

      emit ContractInitialized()
    }
}
