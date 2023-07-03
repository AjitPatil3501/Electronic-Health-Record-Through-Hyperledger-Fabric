const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');
const { Wallets, Gateway } = require('fabric-network');

const ccpPathOrg1 = path.resolve(__dirname, '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
const ccpOrg1 = JSON.parse(fs.readFileSync(ccpPathOrg1, 'utf8'));
const ccpPathOrg2 = path.resolve(__dirname, '..', 'test-network', 'organizations', 'peerOrganizations', 'org2.example.com', 'connection-org2.json');
const ccpOrg2 = JSON.parse(fs.readFileSync(ccpPathOrg2, 'utf8'));
const walletPath = path.resolve(__dirname, '..', 'wallet');
const app = express();

const swal = require('sweetalert');
const PDFDocument = require('pdfkit');
app.set('view engine','ejs');
app.use(express.static('public'));
const port = 3000;
app.use(session({
  secret: 'mySecret',
  resave: false,
  saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
let gateway;
let setConnectedUser;
let setccpOrg;
let setrole;
let sethospital;
let setAdmin;
let network;
let contract;

// Body parser middleware

/*app.get("/",(req,res)=>{
    res.render('login');
})*/
app.get("/master",(req,res)=>{
  res.render('master');
  
});
app.get('/', (req, res) => {
  res.redirect('/login');
});
// Define the url() function in your Express routes


app.get('/page1', function(req, res) {

  if(req.session.user)
  {
    console.log("Hii....");
    if(gateway)
    {
      console.log("Gateway Connected....");
    }
    const username = req.session.username;
    const hospital = req.session.hospital;
    
    res.render('page1',{ username, hospital });
  }
  else
  {
    res.redirect('/login');
  }
});
/*app.get("/page2",(req,res)=>{
  res.render('page2');
});*/
app.get("/login",(req,res)=>{
  res.render('login');
});
app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    console.log("Hii....");
    if (gateway) {
      const user = gateway.getIdentity().identity;
      console.log(`Current user ID: ${user}`);
      console.log("Gateway Connected....");
    }
    const username = req.session.username;
    const hospital = req.session.hospital;
    const notification = req.session.notification; // check if a message exists in session
    req.session.notification = null;
    res.render('dashboard', { notification:notification,username: username, hospital: hospital });
  } else {
    res.redirect('/login');
  }
});
app.get('/doctordashboard', (req, res) => {
  if (req.session.user) {
    console.log("Hii....");
    if (gateway) {
      const user = gateway.getIdentity().identity;
      console.log(`Current user ID: ${user}`);
      console.log("Gateway Connected....");
    }
    const username = req.session.username;
    const hospital = req.session.hospital;
    const notification = req.session.notification; // check if a message exists in session
    req.session.notification = null;
    res.render('doctordashboard', { notification:notification,username: username, hospital: hospital });
  } else {
    res.redirect('/login');
  }
});
app.get('/patientdashboard', (req, res) => {
  if (req.session.user) {
    console.log("Hii....");
    if (gateway) {
      const user = gateway.getIdentity().identity;
      console.log(`Current user ID: ${user}`);
      console.log("Gateway Connected....");
    }
    const username = req.session.username;
    const hospital = req.session.hospital;
    const notification = req.session.notification; // check if a message exists in session
    req.session.notification = null;
    res.render('patientdashboard', { notification:notification,username: username, hospital: hospital });
  } else {
    res.redirect('/login');
  }
});
app.post("/login",async(req,res)=>{
    
    try
    {   
      
        let adminUsername;
        let useridentity;
        const username = req.body.username;
        const password = req.body.password;
        const hospital = req.body.hospital;

        console.log(`${username} and password is ${password} , hospital is ${hospital} `);
        try {
        const walletPath1 = path.resolve(__dirname, '..', 'wallet');
        const wallet1 = await Wallets.newFileSystemWallet(walletPath1);
        const identity = await wallet1.get('admin');
        const identity2 = await wallet1.get('adminorg2');
        if (!identity) {
            await createAdmin();
        }
        if (!identity2) {
          await createAdmin2();
        } 
        gateway = new Gateway();
        if(hospital == 'hospital1')
        {
          await gateway.connect(ccpOrg1, {
            wallet: wallet1,
            identity: 'admin',
            discovery: { enabled: true, asLocalhost: true },
          });
            adminUsername ='admin';
            setccpOrg = ccpOrg1;
            setAdmin = 'admin';
        }
        else if(hospital == 'hospital2')
        {
          await gateway.connect(ccpOrg2, {
            wallet: wallet1,
            identity: 'adminorg2',
            discovery: { enabled: true, asLocalhost: true },
          });
            adminUsername = 'adminorg2';
            setccpOrg = ccpOrg2;
            setAdmin = 'adminorg2';
        }
   

        network = await gateway.getNetwork('channel1');
        contract = network.getContract('basic');
        // Call readAllAssets function
        const role = await contract.evaluateTransaction('getRole',username,password);
        const result = role.toString();
        console.log(`${role} `);
        
        // Send response

        if(result === 'admin' || result === 'doctor' || result === 'patient' ) 
        { 
          console.log(`Enter`);
          useridentity = await wallet1.get(username);
          if (!useridentity) {
            await registerUserHosp(username, adminUsername, role.toString() ,hospital);
            console.log(`Wallet created successfully  for ${username}`);
            useridentity = await wallet1.get(username); 
          }
          const identities = await wallet1.list();
          console.log(identities);
          req.session.username = username;
          req.session.user = username;
          req.session.hospital = hospital;
          req.session.role = role;
          req.session.adminUsername = adminUsername;
          req.session.loggedIn = true;
          gateway.disconnect();
         
          await gateway.connect(setccpOrg, {
            wallet: wallet1,
            identity: useridentity,
            discovery: { enabled: true, asLocalhost: true },
          });
          network = await gateway.getNetwork('channel1');
          contract = network.getContract('basic');
          setConnectedUser = username; 
          setrole = result;
          sethospital = hospital;
          console.log(`Connected to ${username} `);

          if(result === 'admin')
          {
            res.redirect(`/dashboard`);
          }
          else if(result === 'doctor')
          {
            console.log(`Connected to doctor ${username} `);
            res.redirect(`/doctordashboard`);
          }
          else 
          {
            console.log(`Connected to ${username} `);
            res.redirect(`/patientdashboard`);
          }
          
        }
       // res.send(result.toString());
      } catch (error) {
        console.error(`Failed to read assets: ${error}`);
        res.status(500).send('Failed to read assets');
      }

    }
    catch(error)
    {
       res.status(400).send("invalid email");
    }
});
// Routes
app.get('/api/login', async (req, res) => {
  try {
    const walletPath1 = path.resolve(__dirname, '..', 'wallet');
    const wallet1 = await Wallets.newFileSystemWallet(walletPath1);
    const identity = await wallet1.get('admin');
    if (!identity) {
        await createAdmin();
    }

    const gateway = new Gateway();
    
    await gateway.connect(ccp, {
      wallet: wallet1,
      identity: 'admin',
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork('channel1');
    const contract = network.getContract('basic');

    // Call readAllAssets function
    const result = await contract.evaluateTransaction('addAdmin',"abc","12","1236547890");
    console.log(`${result} `);
    // Send response
    res.send(result.toString());
  } catch (error) {
    console.error(`Failed to read assets: ${error}`);
    res.status(500).send('Failed to read assets');
  }
});
app.get('/create', async (req, res) => {
  try {
    const walletPath1 = path.resolve(__dirname, '..', 'wallet');
    const wallet1 = await Wallets.newFileSystemWallet(walletPath1);
    const identity = await wallet1.get('admin');
    if (!identity) {
        await createAdmin();
    }

    const gateway = new Gateway();
    
    await gateway.connect(ccp, {
      wallet: wallet1,
      identity: 'admin',
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork('channel1');
    const contract = network.getContract('basic');

    // Call readAllAssets function
    const result = await contract.submitTransaction('CreateAsset',"asset12","White","3","Lav","30000");
    console.log(`${result} `);
    // Send response
    res.send(result.toString());
  } catch (error) {
    console.error(`Failed to read assets: ${error}`);
    res.status(500).send('Failed to read assets');
  }
});

app.get('/assets', async (req, res) => {
    try {
      // Connect to Fabric network
      const walletPath1 = path.resolve(__dirname, '..', 'wallet');
      const wallet1 = await Wallets.newFileSystemWallet(walletPath1);
      const identity = await wallet1.get('admin');
      if (!identity) {
          await createAdmin();
      }
  
      const gateway = new Gateway();
      
      await gateway.connect(ccp, {
        wallet: wallet1,
        identity: 'admin',
        discovery: { enabled: true, asLocalhost: true },
      });
      const network = await gateway.getNetwork('channel1');
      const contract = network.getContract('basic');
  
      // Call readAllAssets function
      const result = await contract.evaluateTransaction('readAllAssets');
  
      // Send response
      res.send(result.toString());
    } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });
  app.get('/doctor', async (req, res) => {
    try {
      // Connect to Fabric network
      if (req.session.user)
      {
        await setUserProfile();
      
        const queryResponse = await contract.evaluateTransaction('getDoctors');
        const doctors = JSON.parse(queryResponse.toString());

        // Render the page2.ejs template with the doctors data
        res.render('page2', { doctors });
      }
      else 
      {
        res.redirect('/login');
      }
    } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });
  app.get('/admin', async (req, res) => {
    try {
      if (req.session.user){
          await setUserProfile();

        
          const queryResponse = await contract.evaluateTransaction('getAdmins');
          const participants = JSON.parse(queryResponse.toString());

          // Render the page2.ejs template with the doctors data
          res.render('table', { participants });
          
      }
      else {
        res.redirect('/login');
      }
     } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });
  app.get('/patient', async (req, res) => {
    try 
    {
        // Connect to Fabric network
        if (req.session.user){
        await setUserProfile();
        
        const queryResponse = await contract.evaluateTransaction('getPatients');
        const participants = JSON.parse(queryResponse.toString());

        // Render the page2.ejs template with the doctors data
        res.render('table', { participants });
      }
      else {
        res.redirect('/login');
      }
     } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });
  app.get('/addadmin', async (req, res) => {
    res.render('addadmin');
  });
  app.post('/addadmin', async (req, res) => {
    try 
    {
      const name = req.body.name;
      const email = req.body.email;
      const password = req.body.password;
      const mobile_no = req.body.mobile_no;  
      await setUserProfile();
      console.log(`${name} ${email} ${password} ${mobile_no}`);
      console.log(`addadmin function....execution in progress`);
      req.session.message = 'Admin added successfully!'; // set the message in session
      await contract.submitTransaction('addAdmin',name,email,password,mobile_no);
      req.session.notification = {
        message: 'Admin inserted successfully',
        alertType: 'success'
      };
      console.log('Admin added successfully!');
      res.redirect('/dashboard');  // redirect back to the dashboard


   
       
      //res.render('addadmin');

     } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });
  app.get('/addpatient', async (req, res) => {
    res.render('addpatient');
  });
  app.post('/addpatient', async (req, res) => {
    try 
    {
      const name = req.body.name;
      const email = req.body.email;
      const password = req.body.password;
      const mobile_no = req.body.mobile_no;   
      const bloodgroup = req.body.bloodgroup;
      const allergies = req.body.allergies;
      const bodyTemp = req.body.bodyTemp;
      const symptoms = req.body.symptoms;
      await setUserProfile();
      console.log(`${name} ${email} ${password} ${mobile_no}`);
      console.log(`addpatient function....execution in progress`);
      req.session.message = 'Patient added successfully!'; // set the message in session
      await contract.submitTransaction('addpatient',name,email,password,mobile_no,bloodgroup, allergies, bodyTemp, symptoms);
      req.session.notification = {
        message: 'Patient inserted successfully',
        alertType: 'success'
      };
   
      res.redirect('/dashboard');  // redirect back to the dashboard

     console.log('Patient added successfully!');
       
       
      //res.render('addadmin');

     } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });
  app.get('/adddoctor', async (req, res) => {
    res.render('adddoctor');
  });
  app.post('/adddoctor', async (req, res) => {
    try 
    {
      const name = req.body.name;
      const email = req.body.email;
      const password = req.body.password;
      const mobile_no = req.body.mobile_no;  
      const qualification = req.body.qualification;  

       //bloodgroup, allergies, bodyTemp, symptoms
      await setUserProfile();
      console.log(`${name} ${email} ${password} ${mobile_no}`);
      console.log(`adddoctor function....execution in progress`);
      req.session.message = 'Doctor added successfully!'; // set the message in session
      await contract.submitTransaction('addDoctor',name,email,password,mobile_no,qualification);
      req.session.notification = {
        message: 'Doctor inserted successfully',
        alertType: 'success'
      };
      console.log('Doctor added successfully!');
      if(setrole ==='admin')
      res.redirect('/dashboard');  // redirect back to the dashboard
      else if(setrole ==='doctor')
      res.redirect('/doctordashboard'); 
      else if(setrole ==='patient')
      res.redirect('/patientdashboard'); 
       
      //res.render('addadmin');

     } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });

  app.get('/viewowndetails', async (req, res) => {
    try 
    {


       //bloodgroup, allergies, bodyTemp, symptoms
      await setUserProfile();
      const userclientname =  req.session.username;
      const queryResponse = await contract.evaluateTransaction('getParticipantByID',userclientname);
      const participants = JSON.parse(queryResponse.toString());
      //console.log(`${participants.name} ${participants.role} ${participants.email} ${participants.password} ${participants.mobile_no}`);
      if(participants.role === 'admin')
      {
        res.render('viewadmin',{participants});
      }

      else if(participants.role === 'doctor')
      {
        res.render('viewdoctor',{participants});
      }
      else if(participants.role === 'patient')
      {
        const timestamp = participants.timestamps[0].array[0]; // get the first timestamp

        // convert the Unix timestamp to a date and time string
        const date = new Date(timestamp * 1000); // multiply by 1000 to convert to milliseconds
        const dateString = date.toLocaleString();

        console.log(`${participants.name} ${participants.role} ${participants.email} ${participants.password} ${participants.mobile_no} ${dateString}`);
        console.log(`${participants.name} ${participants.role} ${participants.email} ${participants.password} ${participants.mobile_no} ${participants.timestamps}` );
        res.render('viewpatient',{participants});
      }
       
       
      //res.render('addadmin');

     } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });

  app.get('/getPatientDetails', async (req, res) => {
    try 
    {


       //bloodgroup, allergies, bodyTemp, symptoms
      await setUserProfile();
      const userclientname =  req.session.username;
      const queryResponse = await contract.evaluateTransaction('getParticipantByID',userclientname);
      const participants = JSON.parse(queryResponse.toString());
      console.log(`${participants.name} ${participants.role} ${participants.email} ${participants.password} ${participants.mobile_no} ${participants.timestamps}` );
   
        res.render('viewpatient',{participants});
      
       

     } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });
  app.get('/granttable', async (req, res) => {
    await setUserProfile();
    const invoker =  req.session.username;
    const queryResponse = await contract.evaluateTransaction('getAllParticipants',invoker);
    const participants = JSON.parse(queryResponse.toString());
    res.render('granttable',{ participants });
  });
  app.post('/granttable', async (req, res) => {
    try 
    {
      const approverId =  req.session.username;
      const viewerId =  req.body.key;
     
    
       //bloodgroup, allergies, bodyTemp, symptoms
      await setUserProfile();
      console.log(`ApproverId : ${approverId} ViewerId : ${viewerId}`);
      console.log(`Grant permission function....execution in progress`);
      
      await contract.submitTransaction('grantPermission',approverId,viewerId);
      req.session.notification = {
        message: 'Granted successfully',
        alertType: 'success'
      };
      console.log('Grant permission function completed successfully!');
      if(setrole === 'admin')
      res.redirect('/dashboard');  // redirect back to the dashboard
      else if(setrole === 'doctor')
      res.redirect('/doctordashboard'); 
      else if(setrole === 'patient')
      res.redirect('/patientdashboard'); 


       
       
      //res.render('addadmin');

     } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });
  app.get('/grantedparticipants', async (req, res) => {
    try 
    {


  
      await setUserProfile();//getGrantedParticipants
      const userclientname =  req.session.username;
      const queryResponse = await contract.evaluateTransaction('getGrantedParticipants',userclientname);
      const participants = JSON.parse(queryResponse.toString());

      // Render the page2.ejs template with the doctors data
      res.render('grantedparticipants', { participants });

     } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });
  app.get('/removegranted', async (req, res) => {
    await setUserProfile();
    const userclientname =  req.session.username;
    const queryResponse = await contract.evaluateTransaction('getGrantedParticipants',userclientname);
    const participants = JSON.parse(queryResponse.toString());
    res.render('removegrantedtable',{ participants });
  });
  app.post('/removegranted', async (req, res) => {
    try 
    {
      const approverId =  req.session.username;
      const viewerId =  req.body.key;
     
    
       //bloodgroup, allergies, bodyTemp, symptoms
      await setUserProfile();
      console.log(`ApproverId : ${approverId} ViewerId : ${viewerId}`);
      console.log(`Remove Granted permission function....execution in progress`);
      
      await contract.submitTransaction('revokePermission',approverId,viewerId);
      req.session.notification = {
        message: 'Revoke Granted permission successfully',
        alertType: 'success'
      };
      console.log('Remove Granted permission function completed successfully!');
      if(setrole === 'admin')
        res.redirect('/dashboard');  // redirect back to the dashboard
      else if(setrole === 'doctor')
        res.redirect('/doctordashboard'); 
      else if(setrole === 'patient')
        res.redirect('/patientdashboard'); 


       
       
      //res.render('addadmin');

     } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });
  app.get('/currentrequest', async (req, res) => {
    try 
    {

      await setUserProfile();//acceptGrantedParticipants
      const userclientname =  req.session.username;
      const queryResponse = await contract.evaluateTransaction('acceptGrantedParticipants',userclientname);
      const participants = JSON.parse(queryResponse.toString());

      // Render the page2.ejs template with the doctors data
      res.render('currentrequest', { participants });

     } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });

  app.post('/currentrequest', async (req, res) => {
    try {
      await setUserProfile();
      const viewerId = req.session.username;
      const approverId = req.body.id;
      const queryResponse = await contract.submitTransaction('getViewParticipant', approverId, viewerId);
     console.log(`approverId: ${approverId}, viewerId: ${viewerId}`);
     const username = req.session.username;
     const hospital = req.session.hospital;
     const participants = JSON.parse(queryResponse.toString());
     const role =  participants.role;
      if(role === 'admin')
        res.render('viewadmin', { participants });  // redirect back to the dashboard
      else if(role === 'doctor')
        res.render('viewdoctor', { participants }); 
      else if(role === 'patient')
        res.render('viewpatient', { participants });
     //res.send(participants.toString());
     // Render the page2.ejs template with the doctors data
     //res.send('grantedparticipants', { participants });
    // res.render('page1',{ username, hospital });
    } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });
  
 

  app.get('/appendtable', async (req, res) => {
    await setUserProfile();
    const invoker =  req.session.username;
    const queryResponse = await contract.evaluateTransaction('getAllParticipants',invoker);
    const participants = JSON.parse(queryResponse.toString());
    res.render('appendtable',{ participants });
  });
  app.post('/appendtable', async (req, res) => {
    try 
    {
      const approverId =  req.session.username;
      const viewerId =  req.body.key;
     
    
       //bloodgroup, allergies, bodyTemp, symptoms
      await setUserProfile();
      console.log(`ApproverId : ${approverId} ViewerId : ${viewerId}`);
      console.log(`Grant permission function....execution in progress`);
      
      await contract.submitTransaction('appendPermission',approverId,viewerId);
      req.session.notification = {
        message: 'Granted successfully',
        alertType: 'success'
      };
      console.log('Grant permission function completed successfully!');
      if(setrole === 'admin')
        res.redirect('/dashboard');  // redirect back to the dashboard
      else if(setrole === 'doctor')
        res.redirect('/doctordashboard'); 
      else if(setrole === 'patient')
        res.redirect('/patientdashboard'); 


       
       
      //res.render('addadmin');

     } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });
  app.get('/removeappend', async (req, res) => {
    await setUserProfile();
    const userclientname =  req.session.username;
    const queryResponse = await contract.submitTransaction('getAppendGranted',userclientname);
    const participants = JSON.parse(queryResponse.toString());
    res.render('removeappendtable',{ participants });
  });
  app.post('/removeappend', async (req, res) => {
    try 
    {
      const approverId =  req.session.username;
      const viewerId =  req.body.key;
     
    
       //bloodgroup, allergies, bodyTemp, symptoms
      await setUserProfile();
      console.log(`ApproverId : ${approverId} ViewerId : ${viewerId}`);
      console.log(`Remove Append Granted permission function....execution in progress`);
      
      await contract.submitTransaction('revokeAppendPermission',approverId,viewerId);
      req.session.notification = {
        message: 'Revoke Append Granted permission successfully',
        alertType: 'success'
      };
      console.log('Remove Append Granted permission function completed successfully!');
      if(setrole === 'admin')
        res.redirect('/dashboard');  // redirect back to the dashboard
      else if(setrole === 'doctor')
        res.redirect('/doctordashboard'); 
      else if(setrole === 'patient')
        res.redirect('/patientdashboard'); 


       
       
      //res.render('addadmin');

     } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });
  app.get('/appendrequest', async (req, res) => {
    try 
    {

      await setUserProfile();//acceptGrantedParticipants
      const userclientname =  req.session.username;

      const queryResponse = await contract.evaluateTransaction('acceptAppendGranted',userclientname);
      const participants = JSON.parse(queryResponse.toString());

      // Render the page2.ejs template with the doctors data
      res.render('appendrequest', { participants });

     } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });

  app.post('/appendrequest', async (req, res) => {
    try {
      await setUserProfile();
      const appendId = req.session.username;
      const approverId = req.body.id;
      const queryResponse = await contract.submitTransaction('getViewParticipant', approverId, appendId);
     console.log(`approverId: ${approverId}, appenderId: ${appendId}`);
     const username = req.session.username;
     const hospital = req.session.hospital;
     const participants = JSON.parse(queryResponse.toString());
     res.render('appendform',{approverId : approverId});
     
     //res.send(participants.toString());
     // Render the page2.ejs template with the doctors data
     //res.send('grantedparticipants', { participants });
    // res.render('page1',{ username, hospital });
    } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });
 
  app.post('/appendform', async (req, res) => {
    try {
      const user = req.session.username;
      const allergies = req.body.allergies;
      const bodyTemp = req.body.bodyTemp;
      const symptoms = req.body.symptoms;
      const approverId = req.body.approverId; // get approverId from hidden input field
      console.log(`approverId : ${approverId} `);
      await setUserProfile();
      const queryResponse = await contract.submitTransaction('appendDetails',approverId,allergies,bodyTemp,symptoms);
      console.log(`user : ${user} Allergies : ${allergies} Body Temp : ${bodyTemp}  Symptoms : ${symptoms} `);
      console.log(`queryResponse : ${queryResponse.toString()} `);
      const result = queryResponse.toString();
      console.log(`result : ${result.toString()} `);

      req.session.notification = {
        message: 'Append Details Successfully',
        alertType: 'success'
       };
      }
     catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });

  app.get('/changepassword', async (req, res) => {
    res.render('changepassword');
  });
  app.post('/changepassword', async (req, res) => {
    try 
    {
      const user = req.session.username;
      const oldpassword = req.body.oldpassword;
      const newpassword = req.body.newpassword;
      const matchnewpassword = req.body.matchnewpassword;
      await setUserProfile();

      console.log(`user : ${user} Old Password : ${oldpassword}  New Password : ${newpassword} Match Password : ${matchnewpassword}`);
      if(newpassword === matchnewpassword)
      {
        const queryResponse = await contract.submitTransaction('changePassword',user,oldpassword,newpassword);
        console.log(`queryResponse : ${queryResponse.toString()} `);
        const result = queryResponse.toString();
        console.log(`result : ${result.toString()} `);
        if(result === 'yes')
        {
          req.session.notification = {
            message: 'Password Change Successfully',
            alertType: 'success'
          };
          if(setrole === 'admin')
            res.redirect('/dashboard');  // redirect back to the dashboard
          else if(setrole === 'doctor')
            res.redirect('/doctordashboard'); 
          else if(setrole === 'patient')
            res.redirect('/patientdashboard'); 
        }
        else
        {
          req.session.notification = {
            message: 'Old Password Does not  Match',
            alertType: 'error'
          };
          if(setrole === 'admin')
            res.redirect('/dashboard');  // redirect back to the dashboard
          else if(setrole === 'doctor')
            res.redirect('/doctordashboard'); 
          else if(setrole === 'patient')
            res.redirect('/patientdashboard'); 
        }
      }
      else
      {
        req.session.notification = {
          message: 'New Password and Match Password Does not  Match',
          alertType: 'error'
        };
        if(setrole === 'admin')
            res.redirect('/dashboard');  // redirect back to the dashboard
          else if(setrole === 'doctor')
            res.redirect('/doctordashboard'); 
          else if(setrole === 'patient')
            res.redirect('/patientdashboard'); 
      }
      /*console.log(`${name} ${email} ${password} ${mobile_no}`);
      console.log(`addadmin function....execution in progress`);
      req.session.message = 'Admin added successfully!'; // set the message in session
   
      req.session.notification = {
        message: 'Password Change Successfully',
        alertType: 'error'
      };
      console.log('Password Change Successfully!');
      res.redirect('/dashboard');  // redirect back to the dashboard*/


   
       
      //res.render('addadmin');

     } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });
  app.get('/getpdf', async (req, res) => {
    try 
    {


       //bloodgroup, allergies, bodyTemp, symptoms
      await setUserProfile();
      const userclientname =  req.session.username;
      const queryResponse = await contract.evaluateTransaction('getParticipantByID',userclientname);
      const participants = JSON.parse(queryResponse.toString());
      //console.log(`${participants.name} ${participants.role} ${participants.email} ${participants.password} ${participants.mobile_no}`);
 
        const timestamp = participants.timestamps[0].array[0]; // get the first timestamp

        // convert the Unix timestamp to a date and time string
        const date = new Date(timestamp * 1000); // multiply by 1000 to convert to milliseconds
        const dateString = date.toLocaleString();

        console.log(`${participants.name} ${participants.role} ${participants.email} ${participants.password} ${participants.mobile_no} ${dateString}`);
        console.log(`${participants.name} ${participants.role} ${participants.email} ${participants.password} ${participants.mobile_no} ${participants.timestamps}` );


        // Create a new PDF document
        const doc = new PDFDocument();

        // Set the filename for the PDF
        const filename = 'participant-details.pdf';

        // Create a write stream to save the PDF
        const writeStream = fs.createWriteStream(filename);

        // Set up the document properties
        doc.info.Title = 'Participant Details';
        doc.info.Author = 'Your Organization';

        // Define the font to be used for the headings
        doc.font('Helvetica-Bold');

        // Add the participant details to the PDF
        doc.fontSize(18).text('Participant Details', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Name: ${participants.name}`);
        doc.fontSize(14).text(`Email: ${participants.email}`);
        doc.fontSize(14).text(`Mobile Number: ${participants.mobile_no}`);
        doc.fontSize(14).text(`Blood Group: ${participants.bloodgroup}`);

        doc.moveDown();

        // Add the timestamps and details to the PDF
        doc.fontSize(18).text('Timestamps and Details', { align: 'center' });
        doc.moveDown();

        for (let i = 0; i < participants.timestamps.length; i++) {
          const timestamp = new Date(participants.timestamps[i].array[0] * 1000).toLocaleString();
          doc.fontSize(14).text(`Timestamp: ${timestamp}`);
        
          if (participants.allergies[i]) {
            doc.fontSize(14).text(`Allergies: ${participants.allergies[i]}`);
          }
        
          if (participants.bodyTemp[i]) {
            doc.fontSize(14).text(`Body Temp: ${participants.bodyTemp[i]}`);
          }
        
          if (participants.symptoms[i]) {
            doc.fontSize(14).text(`Symptoms: ${participants.symptoms[i]}`);
          }
        
          doc.moveDown();
        }

        // Finalize the PDF and save it
        doc.pipe(writeStream);
        doc.end();

        res.render('viewpatient',{participants});
   
       
       
      //res.render('addadmin');

     } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });
  app.get('/asset', async (req, res) => {
    try {
      // Connect to Fabric network
      const walletPath1 = path.resolve(__dirname, '..', 'wallet');
      const wallet1 = await Wallets.newFileSystemWallet(walletPath1);
      console.log("000");
      const identity = await wallet1.get('admin');
      console.log("001");
      if (!identity) {
          await createAdmin();
      }
      const Identity = await registerUser("admin98745612300",'admin');
      const name = 'admin98745612300';
      console.log("01");
      const gateway = new Gateway();
      console.log("02");
      await gateway.connect(ccp, {
        wallet: wallet1,
        identity: name,
        discovery: { enabled: true, asLocalhost: true },
      });
      console.log("03");
      const network = await gateway.getNetwork('channel1');
      const contract = network.getContract('basic');
      console.log("04");
      // Call readAllAssets function
      const result = await contract.evaluateTransaction('GetAllAssets');
  
      // Send response
      res.send(result.toString());
    } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });
  app.get('/check', async (req, res) => {
    try {
      // Connect to Fabric network
      const walletPath1 = path.resolve(__dirname, '..', 'wallet');
      const wallet1 = await Wallets.newFileSystemWallet(walletPath1);
      const username = 'admin';
      const identity = await wallet1.get(username);
     
      const gateway = new Gateway();
      await gateway.connect(ccpOrg1 , {
        wallet: wallet1,
        identity: username,
        discovery: { enabled: true, asLocalhost: true },
      });
      network = await gateway.getNetwork('channel1');
      contract = network.getContract('basic');
      // Call readAllAssets function
      const userclientname = 'admin12345678900';
      const queryResponse = await contract.evaluateTransaction('getParticipantByID',userclientname);
      const participants = JSON.parse(queryResponse.toString());
      console.log(`${participants.name} ${participants.role} ${participants.email} ${participants.password} ${participants.mobile_no}`);
      if(participants.role==='admin')
      {
        const name = participants.name ;
        const role = participants.role ;
        const email = participants.email ;
        const password = participants.password;
        const mobile_no = participants.mobile_no ;
        res.render('viewAdminDetails',{name:name, role:role,email:email,password:password,mobile_no:mobile_no });
      }
      // Send response
      res.send(participants.toString());
    } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });
  app.get('/getdoc', async (req, res) => {
    try {
        try {
        const walletPath1 = path.resolve(__dirname, '..', 'wallet');
        const wallet1 = await Wallets.newFileSystemWallet(walletPath1);
        const identity = await wallet1.get('admin');
        const identity2 = await wallet1.get('adminorg2');
        if (!identity) {
            await createAdmin();
        }
        if (!identity2) {
          await createAdmin2();
        } 
    
        const gateway = new Gateway();
        
        await gateway.connect(ccp, {
          wallet: wallet1,
          identity: 'admin',
          discovery: { enabled: true, asLocalhost: true },
        });
        const network = await gateway.getNetwork('channel1');
        const contract = network.getContract('basic');
    
        // Call readAllAssets function
        const result = await contract.evaluateTransaction('getAllDoctors');
        console.log(`${result} `);
        // Send response
        const buffer = Buffer.from([91, 93]);
        const string = buffer.toString();
        console.log(string);
        const resultString = result.toString('utf8');
        const resultJSON = JSON.parse(resultString);
        console.log(resultJSON);

        res.send(result.toString());
      } catch (error) {
        console.error(`Failed to read assets: ${error}`);
        res.status(500).send('Failed to read assets');
      }
    } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });
  app.get('/check2', async (req, res) => {
    try {
      // Connect to Fabric network
      const walletPath1 = path.resolve(__dirname, '..', 'wallet');
      const wallet1 = await Wallets.newFileSystemWallet(walletPath1);
      console.log("000");
      const identity = await wallet1.get('adminorg2');
      console.log("001");
      if (!identity) {
          await createAdmin2();
      }
     
      const Identity = await registerUserHosp("admin78911123456",'adminorg2','admin','hospital2');
      const name = 'admin78911123456';
      console.log("01");
      const gateway = new Gateway();
      console.log("02");
      await gateway.connect(ccp, {
        wallet: wallet1,
        identity: name,
        discovery: { enabled: true, asLocalhost: true },
      });
      console.log("03");
      const network = await gateway.getNetwork('channel1');
      const contract = network.getContract('basic');
      console.log("04");
      // Call readAllAssets function
      const result = await contract.evaluateTransaction('GetAllAssets');
  
      // Send response
      res.send(result.toString());
    } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });
  app.get('/check3', async (req, res) => {
    try {
      // Connect to Fabric network
      const walletPath1 = path.resolve(__dirname, '..', 'wallet');
      const wallet1 = await Wallets.newFileSystemWallet(walletPath1);
      const identity = await wallet1.get('admin');
      if (!identity) {
          await createAdmin();
      }
  
      const gateway = new Gateway();
      
      await gateway.connect(ccp, {
        wallet: wallet1,
        identity: 'admin',
        discovery: { enabled: true, asLocalhost: true },
      });
      const network = await gateway.getNetwork('channel1');
      const contract = network.getContract('basic');
  
      // Call readAllAssets function
      const result = await contract.evaluateTransaction('getRole',"admin12345678900","password");
  
      // Send response
      res.send(result.toString());
    } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });
  app.get('/add', async (req, res) => {
    try {
      // Connect to Fabric network
      const walletPath1 = path.resolve(__dirname, '..', 'wallet');
      const wallet1 = await Wallets.newFileSystemWallet(walletPath1);
      const identity = await wallet1.get('admin');
      if (!identity) {
          await createAdmin();
      }
  
      const gateway = new Gateway();
      
      await gateway.connect(ccp, {
        wallet: wallet1,
        identity: 'admin',
        discovery: { enabled: true, asLocalhost: true },
      });
      const network = await gateway.getNetwork('channel1');
      const contract = network.getContract('basic');
  
      // Call readAllAssets function
      const result = await contract.submitTransaction('addAdmin',"Ajay","admin123","ajay123@gmail.com","6789012345");
  
      // Send response
      res.send(result.toString());
    } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });

  app.get('/view', async (req, res) => {
    try {
      // Connect to Fabric network
      const walletPath1 = path.resolve(__dirname, '..', 'wallet');
      const wallet1 = await Wallets.newFileSystemWallet(walletPath1);
      const identity = await wallet1.get('admin');
      if (!identity) {
          await createAdmin();
      }
  
      const gateway = new Gateway();
      
      await gateway.connect(ccp, {
        wallet: wallet1,
        identity: 'admin',
        discovery: { enabled: true, asLocalhost: true },
      });
      const network = await gateway.getNetwork('channel1');
      const contract = network.getContract('basic');
  
      // Call readAllAssets function
      const result = await contract.submitTransaction('addAdmin',"Ajay","admin123","ajay123@gmail.com","6789012345");
  
      // Send response
      res.send(result.toString());
    } catch (error) {
      console.error(`Failed to read assets: ${error}`);
      res.status(500).send('Failed to read assets');
    }
  });

  async function createAdmin() {
    try {
      // Create a new CA client for interacting with the CA.
      const caInfo = ccpOrg1.certificateAuthorities['ca.org1.example.com'];
      const caTLSCACerts = caInfo.tlsCACerts.pem;
      const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
  
      // Create a new file system based wallet for managing identities.
      const walletPath = path.resolve(__dirname, '..', 'wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      console.log(`Wallet path: ${walletPath}`);
  
      // Check to see if we've already enrolled the admin user.
      const identity = await wallet.get('admin');
      if (identity) {
        console.log('An identity for the admin user "admin" already exists in the wallet');
        return;
      }
  
      // Enroll the admin user, and import the new identity into the wallet.
      const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
      const x509Identity = {
        credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes(),
        },
        mspId: 'Org1MSP',
        type: 'X.509',
      };
      await wallet.put('admin', x509Identity);
      console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
    } catch (error) {
      console.error(`Failed to enroll admin user "admin": ${error}`);
      process.exit(1);
    }
  }


async function registerUserHosp(userUsername, adminUsername, role ,hospital) {

  try {
      // load the network configuration
      let ca1;
      let secret1;
      let caURL1;
      let MSPid;
      var affiliation_value;
      if(hospital === 'hospital1')
      {
          // Create a new CA client for interacting with the CA.
          caURL1 = ccpOrg1.certificateAuthorities['ca.org1.example.com'].url;
          ca1 = new FabricCAServices(caURL1);
          MSPid = 'Org1MSP';
          affiliation_value = 'org1';
          affiliation_value = affiliation_value.toString();
          console.log(affiliation_value);
      }
      else if(hospital === 'hospital2')
      {
          // Create a new CA client for interacting with the CA.
           caURL1 = ccpOrg2.certificateAuthorities['ca.org2.example.com'].url;
           ca1 = new FabricCAServices(caURL1);
           MSPid = 'Org2MSP';
           affiliation_value = 'org2';
           affiliation_value = affiliation_value.toString();
           console.log(affiliation_value);
      }
      const ca = ca1;
      // Create a new file system based wallet for managing identities.
      const walletPath = path.resolve(__dirname, '..', 'wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      console.log(`Wallet path: ${walletPath}`);

      // Check to see if we've already enrolled the user.
      const userIdentity = await wallet.get(userUsername);
      if (userIdentity) {
          console.log(`An identity for the user "${userUsername}" already exists in the wallet`);
          return;
      }
      console.log("1");
         // Check to see if we've already enrolled the admin user.
      const adminIdentity = await wallet.get(adminUsername);
      if (!adminIdentity) {
          console.log('An identity for the admin user "admin" does not exist in the wallet');
          console.log('Run the enrollAdmin.js application before retrying');
                 return;
      }
      console.log("2");
      // build a user object for authenticating with the CA
      const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
      const adminUser = await provider.getUserContext(adminIdentity, adminUsername);
      console.log("3");

      if(role ==='admin')
      { console.log("Hii1");

          secret1 = await ca.register({
          affiliation: affiliation_value,
          enrollmentID: userUsername,
          role: role
          }, adminUser);
          console.log("Hii2");
      }
      else if(role ==='patient')
      {  console.log("patientHii1");
          secret1 = await ca.register({
          affiliation: affiliation_value,
          enrollmentID: userUsername,
          role: 'client'
          }, adminUser);
          console.log("patientHii2");
      }
      else if(role ==='doctor')
      {   console.log("DoctorHii1");
          secret1 = await ca.register({
          affiliation: affiliation_value,
          enrollmentID: userUsername,
          role: 'client'
          }, adminUser);
          console.log("DoctorHii2");
      }
    
      console.log("4");
      const secret = secret1;
      const enrollment = await ca.enroll({
          enrollmentID: userUsername,
          enrollmentSecret: secret
      });
      console.log("5");
      const x509Identity = {
          credentials: {
              certificate: enrollment.certificate,
              privateKey: enrollment.key.toBytes(),
          },
          mspId: MSPid ,
          type: 'X.509',
      };
      //const walletkey = role+'-'+userUsername;
      await wallet.put(userUsername, x509Identity);
      console.log("6");
      console.log(userUsername +' '+adminUsername +' '+ role +' '+ hospital); 
      console.log('Successfully registered and enrolled user ${userUsername} ${adminUsername} ${role} ${hospital} and imported it into the wallet');
      
      } catch (error) {
          console.error(`Failed to register user "appUser": ${error}`);
          process.exit(1);
      }
  }
async function setUserProfile()
{
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  const identity = await wallet.get(setConnectedUser);
  if (!identity) {
    await registerUserHosp(setConnectedUser, setAdmin, setrole ,sethospital);
    console.log(`Connected to ${setConnectedUser} `);
    await gateway.connect(setccpOrg , {
      wallet: wallet,
      identity: setConnectedUser,
      discovery: { enabled: true, asLocalhost: true },
    });
    network = await gateway.getNetwork('channel1');
    contract = network.getContract('basic');
  }
}

async function registerUser(userUsername, adminUsername) {
  try {
      // load the network configuration
      const ccpPath = path.resolve(__dirname, '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
      const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

      // Create a new CA client for interacting with the CA.
      const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
      const ca = new FabricCAServices(caURL);

      // Create a new file system based wallet for managing identities.
      const walletPath = path.resolve(__dirname, '..', 'wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      console.log(`Wallet path: ${walletPath}`);

      // Check to see if we've already enrolled the user.
      const userIdentity = await wallet.get(userUsername);
      if (userIdentity) {
          console.log(`An identity for the user "${userUsername}" already exists in the wallet`);
          return;
      }
      console.log("1");
         // Check to see if we've already enrolled the admin user.
      const adminIdentity = await wallet.get(adminUsername);
      if (!adminIdentity) {
          console.log('An identity for the admin user "admin" does not exist in the wallet');
          console.log('Run the enrollAdmin.js application before retrying');
                 return;
      }
      console.log("2");
      // build a user object for authenticating with the CA
      const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
      const adminUser = await provider.getUserContext(adminIdentity, adminUsername);
      console.log("3");
      // Register the user, enroll the user, and import the new identity into the wallet.
      const secret = await ca.register({
        affiliation: 'org1.department1',
        enrollmentID: userUsername,
        role: 'client'
      }, adminUser);
      console.log("4");
      const enrollment = await ca.enroll({
          enrollmentID: userUsername,
           enrollmentSecret: secret
      });
      console.log("5");
      const x509Identity = {
          credentials: {
              certificate: enrollment.certificate,
              privateKey: enrollment.key.toBytes(),
          },
          mspId: 'Org1MSP',
          type: 'X.509',
      };
      await wallet.put(userUsername, x509Identity);
      console.log("6");
      console.log('Successfully registered and enrolled user "appUser" and imported it into the wallet');

      } catch (error) {
          console.error(`Failed to register user "appUser": ${error}`);
          process.exit(1);
      }
  }
  async function createAdmin2() {
    try {
      // Create a new CA client for interacting with the CA.
      const caInfo = ccpOrg2.certificateAuthorities['ca.org2.example.com'];
      const caTLSCACerts = caInfo.tlsCACerts.pem;
      const ca2 = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
  
      // Create a new file system based wallet for managing identities.
      const walletPath = path.resolve(__dirname, '..', 'wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      console.log(`Wallet path: ${walletPath}`);
  
      // Check to see if we've already enrolled the admin user.
      const identity = await wallet.get('adminorg2');
      if (identity) {
        console.log('An identity for the admin user "admin" already exists in the wallet');
        return;
      }
      console.log(`in 1`);
      // Enroll the admin user, and import the new identity into the wallet.
      const enrollment = await ca2.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
      console.log(`in 2`);
      const x509Identity = {
        credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes(),
        },
        mspId: 'Org2MSP',
        type: 'X.509',
      };
      console.log(`in 3`);
      await wallet.put('adminorg2', x509Identity);
      console.log(`in 4`);
      console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
    } catch (error) {
      console.error(`Failed to enroll admin user "admin": ${error}`);
      process.exit(1);
    }
  }
  app.get('/logout', (req, res) => {
    // Destroy the session and redirect to login page
    var isLoggedIn = req.session.user !== null;
    req.session.destroy();
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.setHeader('Expires', '-1');
   
    // Render the logout page with the JavaScript snippet to reload the login page
    res.render('logout'); // Adjust delay time as needed
    
    // Use window.history.pushState() to manipulate browser history
  });
async function showMessage(message)
{
  swal({
    icon: 'success',
    title: 'Success!',
    text: message,
    button: 'OK',
  });

}
app.get('/finallogout', (req, res) => {

  res.render('finallogout');

});

  
app.listen(port,()=>{
    console.log("http://localhost:3000");
});