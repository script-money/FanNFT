/**
 * @description NFT-Service parameters
 */
export interface CreateNFTData {
  total: number,
  name: string,
  description: string,
  content: URL,
  prerequisite: Prerequisite
}

interface Prerequisite {
  fansAmount?: number,
  createBefore?: Date
}

export interface TransferData {
  recipient: string,
  itemID: number
}