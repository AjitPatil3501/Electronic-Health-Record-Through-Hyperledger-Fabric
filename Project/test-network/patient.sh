source ./scripts/envVar.sh 

export PATH=${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}/../config/

export ORDERER_CERTFILE=$PWD/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

export ORG1_PEER_CERTFILE=$PWD/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt

export ORG2_PEER_CERTFILE=$PWD/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt


patient1()
{
 peer chaincode invoke \
      -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile $ORDERER_CERTFILE  \
      -C channel1 -n basic \
      --peerAddresses localhost:7051 --tlsRootCertFiles $ORG1_PEER_CERTFILE \
      --peerAddresses localhost:9051 --tlsRootCertFiles $ORG2_PEER_CERTFILE \
      -c '{"Args":["addPatient","Eknath Vikhe","eknath123@gmail.com","pass123","9876543210","O+","none","98.2","cough, fever"]}'

}
patient2()
{
 peer chaincode invoke \
      -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile $ORDERER_CERTFILE  \
      -C channel1 -n basic \
      --peerAddresses localhost:7051 --tlsRootCertFiles $ORG1_PEER_CERTFILE \
      --peerAddresses localhost:9051 --tlsRootCertFiles $ORG2_PEER_CERTFILE \
      -c '{"Args":["addPatient","Ajay Pawar","ajay456@gmail.com","ajay123","7654321098","AB-","dust","97.9","headache, body pain"]}'
}
patient3()
{
 peer chaincode invoke \
      -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile $ORDERER_CERTFILE  \
      -C channel1 -n basic \
      --peerAddresses localhost:7051 --tlsRootCertFiles $ORG1_PEER_CERTFILE \
      --peerAddresses localhost:9051 --tlsRootCertFiles $ORG2_PEER_CERTFILE \
      -c '{"Args":["addPatient","Rashmika Wagh","rashmika123@gmail.com","jd123","8765432109","B+","gluten","98.6","sore throat, cough"]}'

}
patient4()
{
 peer chaincode invoke \
      -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile $ORDERER_CERTFILE  \
      -C channel1 -n basic \
      --peerAddresses localhost:7051 --tlsRootCertFiles $ORG1_PEER_CERTFILE \
      --peerAddresses localhost:9051 --tlsRootCertFiles $ORG2_PEER_CERTFILE \
      -c '{"Args":["addPatient","Samantha Gore","samantha789@gmail.com","sg789","9087654321","A-","none","99.1","fever, body ache"]}'

}
patient5()
{
 peer chaincode invoke \
      -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile $ORDERER_CERTFILE  \
      -C channel1 -n basic \
      --peerAddresses localhost:7051 --tlsRootCertFiles $ORG1_PEER_CERTFILE \
      --peerAddresses localhost:9051 --tlsRootCertFiles $ORG2_PEER_CERTFILE \
      -c '{"Args":["addPatient","Chandrakant Kolhapurkar","chandrakant123@gmail.com","brown123","6543210987","O-","dairy","97.8","cough, headache"]}'

}
patient6()
{
 peer chaincode invoke \
      -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile $ORDERER_CERTFILE  \
      -C channel1 -n basic \
      --peerAddresses localhost:7051 --tlsRootCertFiles $ORG1_PEER_CERTFILE \
      --peerAddresses localhost:9051 --tlsRootCertFiles $ORG2_PEER_CERTFILE \
      -c '{"Args":["addPatient","Devendra Nagpure","devendra@gmail.com","devendra23","7890123456","AB+","peanuts","98.4","fever, fatigue"]}'
      
}
patient7()
{
 peer chaincode invoke \
      -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
      --tls --cafile $ORDERER_CERTFILE  \
      -C channel1 -n basic \
      --peerAddresses localhost:7051 --tlsRootCertFiles $ORG1_PEER_CERTFILE \
      --peerAddresses localhost:9051 --tlsRootCertFiles $ORG2_PEER_CERTFILE \
      -c '{"Args":["addPatient","Jayant Sanglikar","jayant456@gmail.com","jayant123","5678901234","A+","none","97.5","cough, body pain"]}'
}
setGlobals 1 
patient1
sleep 5
setGlobals 2
patient2
sleep 5
setGlobals 1 
patient3
sleep 5
setGlobals 2
patient4
sleep 5
setGlobals 1 
patient5
sleep 5
setGlobals 2
patient6
sleep 5
setGlobals 1 
patient7
sleep 5

