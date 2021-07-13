---
title: 'Skynet在应用开发中的作用'
excerpt: "Skynet是一个去中心化的存储托管平台，你可以把各种类型的文件存放到上面。本文介绍Skynet的两个用法，如何用Skynet SDK来存放NFT资源，和如何通过Github Action自动部署网站并用handshake链接。"
coverImage: '/assets/blog/Skynet/cover.png'
date: '2021-07-13T22:00:00.000Z'
ogImage:
  url: '/assets/blog/Skynet/cover.png'
---

Skynet是一个去中心化的存储托管平台，你可以把各种类型的文件存放到上面。本文介绍Skynet的其中两个用法：1.如何用Skynet SDK来存放NFT资源 2. 如何通过Github Action自动部署网站并用handshake链接。

## 如何用Skynet SDK来存放NFT资源

我的应用有一个功能：让用户能上传图片，随后生成NFT，NFT的URL指向图片的存放路径。

这儿有2种解决方案，一是转化成base64直接存放到合约中，优点是容易实现，资源不易丢失。缺点是链上存储昂贵，且每次请求都会获取完整数据，客户端无法使用缓存导致加载慢。

二是采用去中心化存储，常见的有IPFS和Arweave，Skynet也有同样的功能。

我的应用存储NFT采取第二种方式来做。

全部的代码在 [app/src/common/createpackage/index.jsx](https://github.com/script-money/FanNFT/blob/develop/app/src/common/createpackage/index.jsx)，Skynet的核心部分如下。

这是一个js的react组件，有一个按钮，点击后上传文件存放到Skynet，并返回Skylink（访问文件的URL）。

DOM部分代码：

```jsx
  <div className="input">
    <Upload
      listType="picture"
      maxCount={1}
      beforeUpload={this.beforeUpload}
      onChange={this.handleChange}
    >
      <Button icon={<UploadOutlined />}>
        <FormattedMessage
          id='UploadPng'
          defaultMessage="Upload png only"
        />
      </Button>
    </Upload>
  </div>
```

[Upload](https://ant.design/components/upload/) 是antd的上传文件的组件，beforeUpload是上传前的钩子函数，进行了简单的文件格式检查。

onChange是上传后的回调函数。主要的Skynet相关代码编写在onChange中。

```js
import { SkynetClient } from "Skynet-js";
const client = new SkynetClient("https://siasky.net")

/* 省略部分 */

   async handleChange(file) {
    console.log(file.file)
    try {
      // upload
      const fileString = file.file
      const { skylink } = await client.uploadFile(fileString);
      const portalUrl = await client.getSkylinkUrl(skylink);
      await this.props.handleChangeNFT(portalUrl)
    } catch (error) {
      console.log(error)
    }
  }
```

最重要的代码只有4行，很方便就能获取到文件上传到Skynet后的Url。

```js
impo
rt { SkynetClient } from "Skynet-js";
const client = new SkynetClient("https://siasky.net")

const { skylink } = await client.uploadFile(fileString);
const portalUrl = await client.getSkylinkUrl(skylink);
```

拿到Url后发送到构建NFT的函数即可。在中国大陆的速度是3秒左右就能读到图片。

## 如何通过 Github Action 自动部署网站并用 handshake 链接

Web应用根据不同的框架，有不同的build指令，运行后会生成一个有静态资源的文件夹。部署静态资源可以托管在vercel、GitHub Page、Fleek等平台。也可以用Akash启动一个nginx容器来运行。Skynet也有类似的功能，下面介绍具体流程。

本网站是由 [Next](https://nextjs.org/) 编写的，通过 `next build && next export` 指令可以生成一个out文件夹，包含网页的所有静态文件。

访问[https://siasky.net/](https://siasky.net/)，首页有个 *Do you want to upload a web app or directory?*，把 *out* 文件夹上传，就可以直接通过生成的 skylink链接[https://vg77obdspdidkveoc1f5h525rksqcs2vegn502prmapt2vsq42taii8.siasky.net/](https://vg77obdspdidkveoc1f5h525rksqcs2vegn502prmapt2vsq42taii8.siasky.net/) 访问页面了。

![Upload](/assets/blog/skynet/upload.png)

当然也可以把该过程自动化，使用 GitHub Action，代码上传后自动build并上传到Skynet。

参考 [kwypchlo/deploy-to-Skynet-action](https://github.com/kwypchlo/deploy-to-Skynet-action) 进行设置。

1. 在项目根目录创建 .github/workflow 的文件夹，在该文件下新建一个.yaml文件
2. 打开GitHub的代码库页面，选择Settings/Secrets，新建一个名为REGISTRY_SEED的密码。
3. 填写以下代码到yaml中

```yaml
name: FanNFT to Skynet
on:
  pull_request:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v1
        with:
          node-version: 14.x

      - name: Install dependencies
        run: yarn
        working-directory: guide

      - name: Build webapp
        run: yarn build
        working-directory: guide

      - name: Deploy to Skynet
        uses: kwypchlo/deploy-to-Skynet-action@main
        with:
          upload-dir: guide/out
          github-token: ${{ secrets.GITHUB_TOKEN }}
          registry-seed: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' && secrets.REGISTRY_SEED || '' }}
```

其中 *name, branches, working-directory, upload-dir* 根据你的实际情况进行设置。

完成后commit并push代码，在网页的Action界面就能看到Build的情况，并获取skylink和skyns entry。

![build](/assets/blog/skynet/ci.png)

因为 Skylink是根据文件内容生成的，类似md5，如果你改动了文件，链接就会变。如果绑定了域名，需要修改域名指向的地址才能正常访问。

但skyns是不会变的，所以需要把hns域名绑到Skyns，每次更新才能用同样链接访问。具体介绍见[handshake-names](https://support.siasky.net/key-concepts/handshake-names)

![dns](/assets/blog/skynet/dns.png)

我的hns域名是*scriptmoney*，绑定完成后就能通过 [https://scriptmoney.hns.siasky.net/](https://scriptmoney.hns.siasky.net/) 访问。

Skynet还有一个 [skydb](https://siasky.net/docs/#skydb)功能，你可以看做是一个去中心化的键值存储数据库，value指向各Skylink。另外还有个叫[FileBase](https://filebase.com/)的生态项目，底层使用了Skynet，可以当高可用的云数据库用。都是传统应用开发可能会用到的功能，有了类似 Skynet 这样的项目，能很容易迁移到 dWeb 上。
