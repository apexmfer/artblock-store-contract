/* 
javascript library for NODEJS
Version 0.10
*/
import EIP712Helper from "./EIP712Helper" 
import web3utils from 'web3-utils'

import { ethers } from 'ethers'
import ethSigUtil from 'eth-sig-util'
import { string } from "hardhat/internal/core/params/argumentTypes";
  

//"BidPacket(address bidderAddress,address nftContractAddress,address currencyTokenAddress,uint256 currencyTokenAmount,uint256 expires)"
  
interface EIP721Config  {
  contractName:string
  version:number
  primaryType:string
  entries:any 
 }

export default class EIP712Utils {
 
/*
    static getBidPacket(
        bidderAddress,nftContractAddress,currencyTokenAddress,currencyTokenAmount,requireProjectId,projectId,expires,signature)
    {

      return {
        bidderAddress:bidderAddress,
        nftContractAddress: nftContractAddress,
        currencyTokenAddress: currencyTokenAddress,
        currencyTokenAmount: currencyTokenAmount,
        expires:expires,
        requireProjectId: requireProjectId,
        projectId: projectId,
        signature:signature
      }


    }*/
 
  /// "\x19\x01",
  ///  getEIP712DomainHash('BuyTheFloor','1',_chain_id,address(this)),
   /// getBidPacketHash(bidderAddress,nftContractAddress,currencyTokenAddress,currencyTokenAmount,expires)
      static getTypedDataHash(typedData:any)
      {
        var typedDatahash = ethers.utils.keccak256(
          Buffer.concat([
              Buffer.from('1901', 'hex'),
              Buffer.from(EIP712Helper.structHash('EIP712Domain', typedData.domain, typedData.types)),
              Buffer.from(EIP712Helper.structHash(typedData.primaryType, typedData.message, typedData.types)),
          ]),
      );

        
           return typedDatahash;
      }
 

      static getTypedDataHashMetamask(typedData:any)
      {
        var typedDataHash = web3utils.soliditySha3(
                "\x19\x01",
                EIP712Helper.structHash('EIP712Domain', typedData.domain, typedData.types).toString(),
                EIP712Helper.structHash(typedData.primaryType, typedData.message, typedData.types).toString(),
           
        ); 
        
         return typedDataHash;
      }


     static recoverPacketSigner(  typedData:any, signature:any){


      let payloadHash = EIP712Utils.getTypedDataHash( typedData ) 
      console.log("PayloadHash:", payloadHash);

      let result = ethers.utils.verifyMessage(ethers.utils.arrayify( payloadHash ), signature )
      console.log("Recovered:", result );

      return result 

     /* console.log('signature',signature)

       var sigHash = EIP712Utils.getTypedDataHash( typedData );
      // var msgBuf = ethUtil.toBuffer(signature)
       const res = ethUtil.fromRpcSig(signature);


       var hashBuf = ethUtil.toBuffer(sigHash)

       const pubKey  = ethUtil.ecrecover(hashBuf, res.v, res.r, res.s);
       const addrBuf = ethUtil.pubToAddress(pubKey);
       const recoveredSignatureSigner    = ethUtil.bufferToHex(addrBuf);

       var message = typedData.message

       console.log('recovered signer pub address',recoveredSignatureSigner.toLowerCase())
       //make sure the signer is the depositor of the tokens
       return recoveredSignatureSigner.toLowerCase();*/

     }




     static async signTypedData(privateKey:any, typedData:any)
    {

      const wallet = new ethers.Wallet(privateKey)

      let payload = typedData //ethers.utils.defaultAbiCoder.encode( typedData );
      console.log("Payload:", payload);

      let payloadHash = EIP712Utils.getTypedDataHash( typedData ) 
      console.log("PayloadHash:", payloadHash);

      let signature = await wallet.signMessage(ethers.utils.arrayify(payloadHash));
      let sig = ethers.utils.splitSignature(signature);
      console.log("Signature:", sig);

      return sig 

/*
      const msgHash = ethSigUtil.typedSignatureHash(typedData)
       

      var msgBuffer= ethUtil.toBuffer(msgHash)

      const sig = ethUtil.ecsign(msgBuffer, privateKey)

      return ethUtil.bufferToHex( ethUtil.toBuffer(ethSigUtil.concatSig(ethUtil.toBuffer(sig.v), sig.r, sig.s)))
*/
    }

    //"BidPacket(address bidderAddress,address nftContractAddress,address currencyTokenAddress,uint256 currencyTokenAmount,uint256 expires)"
    
    /*
      dataValues must be formatted as such:

                bidderAddress: web3utils.toChecksumAddress(bidderAddress),
                nftContractAddress: web3utils.toChecksumAddress(nftContractAddress),
                currencyTokenAddress: web3utils.toChecksumAddress(currencyTokenAddress),
                currencyTokenAmount: currencyTokenAmount,
                requireProjectId: requireProjectId,
                projectId: projectId,
                expires:expires,
    */


  

    static getTypedDataFromParams( _chainId:number,_contractAddress:string, customConfig:EIP721Config, dataValues:any)
    {



      var typedData = {
              types: {
                  EIP712Domain: [
                      { name: "contractName", type: "string" },
                      { name: "version", type: "string" },
                      { name: "chainId", type: "uint256" },
                      { name: "verifyingContract", type: "address" }
                  ]
              },
              primaryType: customConfig.primaryType,
              domain: {
                  contractName: customConfig.contractName,
                  version: customConfig.version,
                  chainId: _chainId,  
                  verifyingContract: web3utils.toChecksumAddress(_contractAddress)
              },
              message: dataValues  
          };

          (typedData.types as any)[customConfig.primaryType]  = []

          for(let [key,value] of Object.entries(customConfig.entries)){
            (typedData.types as any)[customConfig.primaryType].push( {name:key, type: value} )
          } 


        return typedData;
    }
 



      static formatAmountWithDecimals(amountRaw:number,decimals:number)
      {
      var amountFormatted = amountRaw / (Math.pow(10,decimals) * 1.0)
 
      return amountFormatted;
    }



  

        //updating to spec
        // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md

        //https://github.com/ethereum/EIPs/blob/master/assets/eip-712/Example.sol

      static getEIP712TypedData()
      {

        return {
          type: 'object',
          properties: {
            types: {
              type: 'object',
              properties: {
                EIP712Domain: {type: 'array'},
              },
              additionalProperties: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {type: 'string'},
                    type: {type: 'string'}
                  },
                  required: ['name', 'type']
                }
              },
              required: ['EIP712Domain']
            },
            primaryType: {type: 'string'},
            domain: {type: 'object'},
            message: {type: 'object'}
          },
          required: ['types', 'primaryType', 'domain', 'message']
        }



      }



      static async performOffchainSignForBidPacket(chainId:number, contractAddress:any,customConfig:any, dataValues:any, web3:any, from:string){

          
 
       const typedData = EIP712Utils.getTypedDataFromParams(
             
            chainId,  
            contractAddress,
            customConfig,
            dataValues  
       )
        
 
        var stringifiedData = JSON.stringify(  typedData );

        
        let typedDatahash = EIP712Utils.getTypedDataHash(typedData)

        console.log('typedDatahash',typedDatahash)
        let signResult = await  EIP712Helper.signTypedData( web3, from, stringifiedData  )
        
        
        
        console.log( 'signResult', signResult )  

        return signResult



  }


/*
  let sellParams = {
          
    nftTokenAddress: this.selectedBidPacket.nftTokenAddress,
    tokenId: this.ownedTokenIdToSell, 
    from: this.web3Plug.getActiveAccountAddress(),
    to:  this.selectedBidPacket.bidderAddress,
    currencyToken: this.selectedBidPacket.currencyTokenAddress,
    currencyAmount: this.selectedBidPacket.currencyTokenAmount,
    expires: this.selectedBidPacket.expires,
    buyerSignature: this.selectedBidPacket.signature


   }*/

     
}
