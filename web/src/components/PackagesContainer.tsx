type PackageData = {
  title: string
  image: URL
  keyWord: string
  createAt: number
  deadline: number
}

interface IPackageData {
  source: PackageData[]
}

function PackagesContainer(packageData: IPackageData) {
  return packageData.source.forEach((packageData) => {
    <PackageInfo data={packageData} />
  })
}

export default PackagesContainer
