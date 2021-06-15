import { FC, useEffect, useState } from 'react'

type PackageData = {
  title: string
  image: URL
  keyWord: string
  createAt: number
  deadline: number
}

interface IPackageData {
  data: PackageData[]
}

const PackagesContainer = (props: IPackageData) => {
  const [packageData, setPackageData] = useState([])

  useEffect(() => {
    console.log(props)
    if (props.data.length == 0) {
    }
  }, [])

  return (
    <>
      {/* {props.source.length > 0 &&
        props.source.forEach((packageData) => {
          // ;<p>packageData</p>
          // <PackageInfo data={packageData} />
        })} */}
    </>
  )
}

export default PackagesContainer
