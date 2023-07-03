source ./scripts/envVar.sh 

export PATH=${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}/../config/

export ORDERER_CERTFILE=$PWD/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

export ORG1_PEER_CERTFILE=$PWD/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt

export ORG2_PEER_CERTFILE=$PWD/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt


doctor1()
{
 peer chaincode invoke \
      -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile $ORDERER_CERTFILE  \
      -C channel1 -n basic \
      --peerAddresses localhost:7051 --tlsRootCertFiles $ORG1_PEER_CERTFILE \
      --peerAddresses localhost:9051 --tlsRootCertFiles $ORG2_PEER_CERTFILE \
      -c '{"Args":["addDoctor","Sujay M","Sujay123@gmail.com","doctor123","6789012345","BDS"]}'
}
doctor2()
{ 
  peer chaincode invoke \
      -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile $ORDERER_CERTFILE  \
      -C channel1 -n basic \
      --peerAddresses localhost:7051 --tlsRootCertFiles $ORG1_PEER_CERTFILE \
      --peerAddresses localhost:9051 --tlsRootCertFiles $ORG2_PEER_CERTFILE \
      -c '{"Args":["addDoctor","Ajay K","Ajay123@gmail.com","Ajay123","4567891123","BHMS"]}'
}

doctor3()
{ 
  peer chaincode invoke \
      -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile $ORDERER_CERTFILE  \
      -C channel1 -n basic \
      --peerAddresses localhost:7051 --tlsRootCertFiles $ORG1_PEER_CERTFILE \
      --peerAddresses localhost:9051 --tlsRootCertFiles $ORG2_PEER_CERTFILE \
      -c '{"Args":["addDoctor","Vishal W","vishal123@gmail.com","Vishal123","7678901234","MBBS"]}'
}
doctor4()
{ 
  peer chaincode invoke \
      -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile $ORDERER_CERTFILE  \
      -C channel1 -n basic \
      --peerAddresses localhost:7051 --tlsRootCertFiles $ORG1_PEER_CERTFILE \
      --peerAddresses localhost:9051 --tlsRootCertFiles $ORG2_PEER_CERTFILE \
      -c '{"Args":["addDoctor","Ajit P","ajit123@gmail.com","ajit123","9812345670","MBBS"]}'
}
doctor5()
{ 
  peer chaincode invoke \
      -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile $ORDERER_CERTFILE  \
      -C channel1 -n basic \
      --peerAddresses localhost:7051 --tlsRootCertFiles $ORG1_PEER_CERTFILE \
      --peerAddresses localhost:9051 --tlsRootCertFiles $ORG2_PEER_CERTFILE \
      -c '{"Args":["addDoctor","Krishna M","krishna123@gmail.com","krishna123","9876543201","MBBS"]}'
}
doctor6()
{ 
  peer chaincode invoke \
      -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile $ORDERER_CERTFILE  \
      -C channel1 -n basic \
      --peerAddresses localhost:7051 --tlsRootCertFiles $ORG1_PEER_CERTFILE \
      --peerAddresses localhost:9051 --tlsRootCertFiles $ORG2_PEER_CERTFILE \
      -c '{"Args":["addDoctor","Prathmesh M","prathmesh123@gmail.com","prathmesh123","9023456781","MBBS"]}'
}
setGlobals 1 
doctor1
sleep 5
setGlobals 2
doctor2
sleep 5
setGlobals 1
doctor3
sleep 5
setGlobals 2
doctor4
sleep 5
setGlobals 1
doctor5
sleep 5
setGlobals 2
doctor6
sleep 5


