import path from "path";
import { emulator, init, getAccountAddress, shallPass, shallResolve, shallThrow, shallRevert } from "flow-js-testing";

import {
    deployFanNFT,
    setupFanNFTOnAccount,
    getFanNFTSupply,
    createPackage,
    getAllPackages,
    addRewardAddress,
    getAllGiftIdsByAddress,
    batchMintGift,
    getGiftDataByID
} from "../src/fannft";
import { getAdminAddress, toUFix64 } from "../src/common";

// We need to set timeout for a higher number, because some transactions might take up some time
jest.setTimeout(50000);

describe("FanNFT", () => {
    // Instantiate emulator and path to Cadence files
    beforeEach(async () => {
        const basePath = path.resolve(__dirname, "../../");
        const port = 8081;
        init(basePath, port);
        return emulator.start(port, false);
    });

    // Stop emulator, so it could be restarted
    afterEach(async () => {
        return emulator.stop();
    });

    const metadata_1 = JSON.stringify({
        "title": "discord gift",
        "url": "https://southportlandlibrary.com/wp-content/uploads/2020/11/discord-logo-1024x1024.jpg",
        "content": "asddd 0x01cf0e2f2f715450",
        "keyWord": "#FanNFT #discord",
        "createAt": (Date.now() / 1000) | 0,
        "deadline": (new Date(new Date().getTime() + 86400000) / 1000) | 0
    })

    const metadata_2 = JSON.stringify({
        "title": "derahack gift",
        "url": "https://hackerlink.io/_nuxt/img/qrcode_hacker.fa309ce.jpg",
        "content": "welcome hacklink 0x01cf0e2f2f715450",
        "keyWord": "#FanNFT #derahack",
        "createAt": (Date.now() / 1000) | 0,
        "deadline": (new Date(new Date().getTime() + 86400000) / 1000) | 0
    })

    const total_1 = 1
    const total_2 = 5

    it("shall deploy FanNFT contract", async () => {
        await shallPass(deployFanNFT());
    });

    it("supply shall be 0 after contract is deployed", async () => {
        await deployFanNFT();

        await shallResolve(async () => {
            const supply = await getFanNFTSupply();
            expect(supply).toBe(0);
        });
    });

    it("giver shall be create new package", async () => {
        await deployFanNFT();
        const Giver = await getAccountAddress("Giver");

        await shallPass(createPackage(Giver, metadata_1, total_1))
    })

    it("new package shall be read", async () => {
        await deployFanNFT();
        const Giver = await getAccountAddress("Giver");
        await createPackage(Giver, metadata_1, total_1)

        await shallResolve(async () => {
            const packages = await getAllPackages();
            expect(packages[0].packageID).toBe(0);
            expect(packages[0].totalNumber).toBe(total_1)
            expect(packages[0].locked).toBe(false)
        });
    })

    it("giver shall be create multiple packages", async () => {
        await deployFanNFT();
        const Giver = await getAccountAddress("Giver");

        await shallPass(createPackage(Giver, metadata_1, total_1))
        await shallPass(createPackage(Giver, metadata_2, total_2))

        await shallResolve(async () => {
            const packages = await getAllPackages();
            expect(packages[0].packageID).toBe(0);
            expect(packages[0].totalNumber).toBe(total_1)
            expect(packages[0].locked).toBe(false)
            expect(packages[1].packageID).toBe(1);
            expect(packages[1].totalNumber).toBe(total_2)
            expect(packages[1].locked).toBe(false)
        });
    })

    it("admin can add address to package", async () => {
        await deployFanNFT();
        const Giver = await getAccountAddress("Giver");
        await createPackage(Giver, metadata_1, total_1)

        const Fan1 = await getAccountAddress("Fan1");

        await shallPass(addRewardAddress([Fan1], 0))
    })

    it("admin can't add address length greater than total", async () => {
        await deployFanNFT();
        const Giver = await getAccountAddress("Giver");
        await createPackage(Giver, metadata_1, total_1)

        const Fan1 = await getAccountAddress("Fan1");
        const Fan2 = await getAccountAddress("Fan2");
        await shallRevert(addRewardAddress([Fan1, Fan2], 0))
    })

    it("fans shall be able setup account to recieve gift", async () => {
        await deployFanNFT();
        const Fan = await getAccountAddress("Fan");
        await shallPass(setupFanNFTOnAccount(Fan))
    })

    it("admin shall mint NFT to Fan account", async () => {
        await deployFanNFT();
        const Fan = await getAccountAddress("Fan");
        await setupFanNFTOnAccount(Fan)
        const Giver = await getAccountAddress("Giver");
        await createPackage(Giver, metadata_1, total_1)
        await addRewardAddress([Fan], 0)
        await shallPass(batchMintGift(0))
        await shallResolve(async () => {
            const giftIDs = await getAllGiftIdsByAddress(Fan)
            expect(giftIDs).toMatchObject([1]);
        })
    })

    it("user shall get gift data by id", async () => {
        await deployFanNFT();
        const Fan = await getAccountAddress("Fan");
        await setupFanNFTOnAccount(Fan)
        const Giver = await getAccountAddress("Giver");
        await createPackage(Giver, metadata_1, total_1)
        await addRewardAddress([Fan], 0)
        await batchMintGift(0)
        const giftIDs = await getAllGiftIdsByAddress(Fan)
        await shallResolve(async () => {
            const giftDatas = await getGiftDataByID(Fan, giftIDs)
            expect(giftDatas).toMatchObject([{ id: 1, packageID: 0, serialNumber: 1 }])
        })
    })

    it("Giver create other new package, new fan can recieve new gift", async () => {
        await deployFanNFT();
        const Fan = await getAccountAddress("Fan");
        const Fan1 = await getAccountAddress("Fan1");
        await setupFanNFTOnAccount(Fan)
        await setupFanNFTOnAccount(Fan1)
        const Giver = await getAccountAddress("Giver");
        await createPackage(Giver, metadata_1, total_1)
        await addRewardAddress([Fan], 0)
        await batchMintGift(0)
        await createPackage(Giver, metadata_2, total_2)
        await addRewardAddress([Fan1, Fan], 1)
        await batchMintGift(1)
        const giftIDsByFan = await getAllGiftIdsByAddress(Fan)
        await shallResolve(async () => {
            const giftDatas = await getGiftDataByID(Fan, giftIDsByFan)
            expect(giftDatas).toMatchObject([
                { id: 1, packageID: 0, serialNumber: 1 },
                { id: 3, packageID: 1, serialNumber: 2 }
            ])
        })
        const giftIDsByFan1 = await getAllGiftIdsByAddress(Fan1)
        await shallResolve(async () => {
            const giftDatas = await getGiftDataByID(Fan1, giftIDsByFan1)
            expect(giftDatas).toMatchObject([
                { id: 2, packageID: 1, serialNumber: 1 }
            ])
        })
    })
})