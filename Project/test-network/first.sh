export PATH=${PWD}/../bin:${PWD}:$PATH

export FABRIC_CFG_PATH=${PWD}/../config/

peer lifecycle chaincode package basic.tar.gz \
   --path ../smartcontract \
   --lang node \
   --label basic_1.0 


 
source ./scripts/envVar.sh 

setGlobals 1 

export ORDERER_CERTFILE=$PWD/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

export ORG1_PEER_CERTFILE=$PWD/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt

export ORG2_PEER_CERTFILE=$PWD/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt

peer lifecycle chaincode install basic.tar.gz 

setGlobals 2
peer lifecycle chaincode install basic.tar.gz 