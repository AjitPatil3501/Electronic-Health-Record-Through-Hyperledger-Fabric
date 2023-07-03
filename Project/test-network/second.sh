source ./scripts/envVar.sh 

export PATH=${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}/../config/

export ORDERER_CERTFILE=$PWD/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

export ORG1_PEER_CERTFILE=$PWD/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt

export ORG2_PEER_CERTFILE=$PWD/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt


approveForMyOrg1()
{
peer lifecycle chaincode approveformyorg \
      -o localhost:7050 \
      --ordererTLSHostnameOverride  orderer.example.com \
      --tls --cafile $ORDERER_CERTFILE  \
      --channelID channel1  \
      --name basic \
      --version 1 \
      --package-id $PKGID \
      --sequence 1  
}
approveForMyOrg2()
{
peer lifecycle chaincode approveformyorg \
      -o localhost:7050 \
      --ordererTLSHostnameOverride  orderer.example.com \
      --tls --cafile $ORDERER_CERTFILE  \
      --channelID channel1  \
      --name basic \
      --version 1 \
      --package-id $PKGID \
      --sequence 1  
}

commit()
{
peer lifecycle chaincode commit \
      -o localhost:7050 \
      --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile $ORDERER_CERTFILE \
      --channelID channel1  --name basic \
      --peerAddresses localhost:7051 --tlsRootCertFiles $ORG1_PEER_CERTFILE \
      --peerAddresses localhost:9051 --tlsRootCertFiles $ORG2_PEER_CERTFILE \
      --version 1 --sequence 1  
}

queryCommitted()
{ 
peer lifecycle chaincode querycommitted \
      --channelID channel1  --name basic \
      --cafile  $ORDERER_CERTFILE
}
chaincodeInvokeInit()
{
 
peer chaincode invoke \
      -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile $ORDERER_CERTFILE  \
      -C channel1 -n basic \
      --peerAddresses localhost:7051 --tlsRootCertFiles $ORG1_PEER_CERTFILE \
      --peerAddresses localhost:9051 --tlsRootCertFiles $ORG2_PEER_CERTFILE \
      -c '{"function": "initLedger", "Args": []}'
}
admin()
{
 peer chaincode invoke \
     -o localhost:7050  orderer.example.com \
     --tls --cafile $ORDERER_CERTFILE  \
     -C channel1 -n basic \
     --peerAddresses localhost:7051 --tlsRootCertFiles $ORG1_PEER_CERTFILE \
     --peerAddresses localhost:9051 --tlsRootCertFiles $ORG2_PEER_CERTFILE \
     -c '{"Args":["addAdmin","Vijay","vijay123@gmail.com","vijay123","1200560000"]}'
}
readAssets()
{
      peer chaincode query -C channel1 -n basic -c '{"Args":["readAllAssets"]}' | jq 
}
setGlobals 1 
approveForMyOrg1
setGlobals 2 
approveForMyOrg2
setGlobals 1 
commit
queryCommitted
setGlobals 1
chaincodeInvokeInit
sleep 5
admin

