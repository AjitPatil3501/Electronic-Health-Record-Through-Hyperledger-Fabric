'use strict';

const { Contract ,Context} = require('fabric-contract-api');



// Define the participant classes
class Admin {
  constructor(id, name, email, password, mobile_no) {
    this.id = id;
    this.role = 'admin';
    this.name = name;
    this.email = email;
    this.password = password;
    this.mobile_no = mobile_no;
    this.admin_walletName = '';
    this.permissionGranted = [];
    this.acceptviewGranted = [];
    this.appendGranted = [];
    this.acceptappendGranted = [];
  }
}

class Doctor {
  constructor(id, name, email, password, mobile_no, qualification) {
    this.id = id;
    this.role = 'doctor';
    this.name = name;
    this.email = email;
    this.password = password;
    this.mobile_no = mobile_no;
    this.qualification = qualification;
    this.doctor_walletName = '';
    this.permissionGranted = [];
    this.acceptviewGranted = [];
    this.appendGranted = [];
    this.acceptappendGranted = [];
  }
}

class Patient {
  constructor(id, name, email, password, mobile_no, bloodgroup) {
    this.id = id;
    this.role = 'patient';
    this.name = name;
    this.email = email;
    this.password = password;
    this.mobile_no = mobile_no;
    this.bloodgroup = bloodgroup;
    this.allergies = [];
    this.bodyTemp = [];
    this.symptoms =[];
    this.timestamps = []; 
    this.patient_walletName = '';
    this.permissionGranted = [];
    this.acceptviewGranted = [];
    this.appendGranted = [];
    this.acceptappendGranted = [];
  }
}
class MyContext extends Context {
  constructor() {
    super();
  }
}
class EHRContract extends Contract {

  createContext() {
    return new MyContext();
  }

  async initLedger(ctx) {
    console.info('============= START : Initialize Ledger ===========');

    let admin = new Admin('admin', 'admin','admin@gmail.com' ,'password', '1234567890');
    let idInt = parseInt(admin.mobile_no)*10;
    let idString = idInt.toString();
    await ctx.stub.putState('admin' + idString, Buffer.from(JSON.stringify(admin)));

    return 'Ledger initialized with admin participant';

    }
    async addAdmin(ctx, name, email, password, mobile_no) {
      let adminId = parseInt(mobile_no) * 10;
      let idstring = 'admin'+adminId.toString();
      let admin = new Admin(adminId, name, email ,password, mobile_no);
  

      // Add the admin to the ledger
      await ctx.stub.putState(idstring, Buffer.from(JSON.stringify(admin)));
  
      return `Admin added with ID ${admin.id}`;
    }
    async addPatient(ctx, name, email, password, mobile_no, bloodgroup, allergies, bodyTemp, symptoms) {
    
      let patientId = parseInt(mobile_no) * 10;
      let idstring = 'patient'+patientId.toString();
      let patient = new Patient(patientId, name, email, password, mobile_no, bloodgroup);
  
      patient.timestamps.push(ctx.stub.getTxTimestamp());
      patient.allergies.push(allergies);
      patient.bodyTemp.push(bodyTemp);
      patient.symptoms.push(symptoms);
      // Add the admin to the ledger
      await ctx.stub.putState(idstring, Buffer.from(JSON.stringify(patient)));
  
      return `Patient added with ID ${patientId}`;
    }
    async  addDoctor(ctx, name, email, password, mobile_no, qualification) {

      let doctorId = parseInt(mobile_no) * 10;
      let idstring = 'doctor'+doctorId.toString()
      let doctor = new Doctor(doctorId, name, email, password, mobile_no, qualification);
    
      // Add the doctor to the ledger
      await ctx.stub.putState(idstring, Buffer.from(JSON.stringify(doctor)));
    
      return `Doctor added with ID ${doctorId}`;
    }
  async readAllAssets(ctx) {
    console.info('============= START : Read All Assets ===========');
    const startKey = '';
    const endKey = '';
    const allResults = [];
  
    for await (const { key, value } of ctx.stub.getStateByRange(startKey, endKey)) {
      const asset = JSON.parse(value.toString());
      allResults.push({ key, asset });
    }
  
    console.info(`Number of assets: ${allResults.length}`);
    console.info('============= END : Read All Assets ===========');
    return JSON.stringify(allResults);
  }
  async getIdAndPasswordByName(ctx, name) {
    console.info('============= START : Get Id and Password by Name ===========');
    const startKey = 'admin_1'; // assuming admin_1 is always present
    const endKey = 'patient_zzzzzzzzzz'; // assuming patient_zzzzzzzzzz is always the last participant key
    let id, password;
  
    // Search for the participant with the given name
    for await (const { key, value } of ctx.stub.getStateByRange(startKey, endKey)) {
      const participant = JSON.parse(value.toString());
  
      if (participant.name === name) {
        id = participant.id;
        password = participant.password;
        break;
      }
    }
  
    console.info(`Id and password for participant with name ${name}: ${id}, ${password}`);
    console.info('============= END : Get Id and Password by Name ===========');
    return { id, password };
  }
  async getParticipantByID(ctx, id) {
    const participantKey = id.toString();
    const participantBytes = await ctx.stub.getState(participantKey);

    if (!participantBytes || participantBytes.length === 0) {
      throw new Error(`Participant ID ${id} does not exist`);
    }


  const participant = JSON.parse(participantBytes.toString());
  return participant;
  }

  async getAdmin(ctx, adminId) {
    const adminKey = 'admin' + adminId.toString();
    const adminBytes = await ctx.stub.getState(adminKey);
    if (!adminBytes || adminBytes.length === 0) {
      throw new Error(`Admin with ID ${adminId} does not exist`);
    }
    const admin = JSON.parse(adminBytes.toString());
    return admin;
  }
  async checkCredentials(ctx, id, password) {
    const participantAsBytes = await ctx.stub.getState(id);
    if (!participantAsBytes || participantAsBytes.length === 0) {
     return false;
    }
    const participant = JSON.parse(participantAsBytes.toString());
    if (participant.password === password) {
      return true;
    }
    return false;
  }
  async getRole(ctx, id, password) {
    const participantAsBytes = await ctx.stub.getState(id);
    if (!participantAsBytes || participantAsBytes.length === 0) {
     return false;
    }
    const participant = JSON.parse(participantAsBytes.toString());
    if (participant.password === password) {
      return participant.role;
    }
    return false;
  }
  async queryCredentials(ctx, username, password) {
    const credentials = await ctx.stub.getState(username);

    if (!credentials || credentials.toString() !== password) {
      return Buffer.from('false');
    }

    return Buffer.from('true');
  }
  async GetAllAssets(ctx) {
    const allResults = [];
    // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
    const iterator = await ctx.stub.getStateByRange('', '');
    let result = await iterator.next();
    while (!result.done) {
        const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue);
        } catch (err) {
            console.log(err);
            record = strValue;
        }
        allResults.push({ Key: result.value.key, Record: record });
        result = await iterator.next();
    }
    return JSON.stringify(allResults);
  }
  async getDoctors(ctx) {
    const allResults = [];
    // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
    const iterator = await ctx.stub.getStateByRange('doctor', 'doctor~');
    let result = await iterator.next();
    while (!result.done) {
        const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue);
        } catch (err) {
            console.log(err);
            record = strValue;
        }
        const { name, email, mobile_no, qualification } = record;
        allResults.push({ Key: result.value.key, name, email, mobile_no, qualification });
        result = await iterator.next();
    }
    return JSON.stringify(allResults);
  }
  async getPatients(ctx) {
    const allResults = [];
    // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
    const iterator = await ctx.stub.getStateByRange('patient', 'patient~');
    let result = await iterator.next();
    while (!result.done) {
        const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue);
        } catch (err) {
            console.log(err);
            record = strValue;
        }
        const { name, email, mobile_no } = record;
        allResults.push({ Key: result.value.key, name, email, mobile_no});
        result = await iterator.next();
    }
    return JSON.stringify(allResults);
  }
  async getAdmins(ctx) {
    const allResults = [];
    // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
    const iterator = await ctx.stub.getStateByRange('admin', 'admin~');
    let result = await iterator.next();
    while (!result.done) {
        const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue);
        } catch (err) {
            console.log(err);
            record = strValue;
        }
        const { name, email, mobile_no } = record;
        allResults.push({ Key: result.value.key, name, email, mobile_no });
        result = await iterator.next();
    }
    return JSON.stringify(allResults);
  }
  async checkCredentials1(ctx, id, password) {
    const participant = await ctx.stub.getState(id);
    if (!participant) {
      throw new Error(`Participant ${id} does not exist`);
    }
    const record = JSON.parse(participant.toString());
    const pass = record.password;
    return pass;
  }
   
  async getAllAssets(ctx) {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('doctor', 'doctor~');
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      const key = result.value.key;
      const mobile_no = record.mobile_no;
      const property = key.substring(6) + '_' + 'mobile_no';
      const asset = { Key: key, [property]: mobile_no };
      allResults.push(asset);
      result = await iterator.next();
    }
    return JSON.stringify(allResults);
  }
  async getAllParticipantsKey(ctx) {
    const allResults = [];
    // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
    const iterator = await ctx.stub.getStateByRange('', '');
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      const role = record.role;
      if (role && ['admin', 'doctor', 'patient'].includes(role.toLowerCase())) {
        allResults.push(result.value.key);
      }
      result = await iterator.next();
    }
    return JSON.stringify(allResults);
  }
  async  grantPermission(ctx, approverId, viewerId) {
    const participantKey = approverId.toString();
    const participantBytes = await ctx.stub.getState(participantKey);

    const viewerKey= viewerId.toString();
    const viewerBytes = await ctx.stub.getState(viewerKey);

    if (!participantBytes || participantBytes.length === 0) {
      throw new Error(`Participant ID ${approverId} does not exist`);
    }
    if (!viewerBytes || viewerBytes.length === 0) {
      throw new Error(`Accepter ID ${id} does not exist`);
    }
    const participant = JSON.parse(participantBytes.toString());
    participant.permissionGranted.push(viewerId);

    const vieweracceptor = JSON.parse(viewerBytes.toString());
    vieweracceptor.acceptviewGranted.push(approverId);
  
    await ctx.stub.putState(participantKey, Buffer.from(JSON.stringify(participant)));
    await ctx.stub.putState(viewerKey, Buffer.from(JSON.stringify(vieweracceptor)));
  }
  async  revokePermission(ctx, approverId, viewerId) {
    const participantKey = approverId.toString();
    const participantBytes = await ctx.stub.getState(participantKey);
  
    
    const viewerKey= viewerId.toString();
    const viewerBytes = await ctx.stub.getState(viewerKey);

    if (!participantBytes || participantBytes.length === 0) {
      throw new Error(`Participant ID ${id} does not exist`);
    }

    if (!viewerBytes || viewerBytes.length === 0) {
      throw new Error(`Accepter ID ${id} does not exist`);
    }
    
    
    const participant = JSON.parse(participantBytes.toString());
    const vieweracceptor = JSON.parse(viewerBytes.toString());
  
    if (vieweracceptor.acceptviewGranted.includes(approverId)) {
      const viewerIndex = vieweracceptor.acceptviewGranted.indexOf(approverId);
      vieweracceptor.acceptviewGranted.splice(viewerIndex, 1); // remove viewerId from permissionGranted array
      await ctx.stub.putState(viewerKey, Buffer.from(JSON.stringify(vieweracceptor))); // update participant state
    }
  
    if (participant.permissionGranted.includes(viewerId)) {
      const viewerIndex = participant.permissionGranted.indexOf(viewerId);
      participant.permissionGranted.splice(viewerIndex, 1); // remove viewerId from permissionGranted array
      await ctx.stub.putState(participantKey, Buffer.from(JSON.stringify(participant))); // update participant state
      return "yes";
    }
  
    return "no";
  }
  
  async getViewParticipant(ctx, approverId, viewerId) {
    const approverKey = approverId.toString();
    const approverBytes = await ctx.stub.getState(approverKey);
  
    const viewerKey = viewerId.toString();
    const viewerBytes = await ctx.stub.getState(viewerKey);
  
    if (!approverBytes || approverBytes.length === 0) {
      throw new Error(`Participant ID ${id} does not exist`);
    }
  
    if (!viewerBytes || viewerBytes.length === 0) {
      throw new Error(`Accepter ID ${id} does not exist`);
    }
  
    const approver = JSON.parse(approverBytes.toString());
    const vieweracceptor = JSON.parse(viewerBytes.toString());
  
    if (vieweracceptor.acceptviewGranted.includes(approverId)) {
      const viewerIndex = vieweracceptor.acceptviewGranted.indexOf(approverId);
      vieweracceptor.acceptviewGranted.splice(viewerIndex, 1); // remove viewerId from permissionGranted array
      await ctx.stub.putState(viewerKey, Buffer.from(JSON.stringify(vieweracceptor))); // update participant state
    } else {
      return false;
    }
    
    if (approver.permissionGranted.includes(viewerId)) {
      const viewerIndex = approver.permissionGranted.indexOf(viewerId);
      approver.permissionGranted.splice(viewerIndex, 1); // remove viewerId from permissionGranted array
      await ctx.stub.putState(approverKey, Buffer.from(JSON.stringify(approver))); // update participant state
      return JSON.stringify(approver);
    } else {
      return false;
    }
  }
  
  async  appendPermission(ctx, approverId, viewerId) {
    const participantKey = approverId.toString();
    const participantBytes = await ctx.stub.getState(participantKey);

    const viewerKey= viewerId.toString();
    const viewerBytes = await ctx.stub.getState(viewerKey);

    if (!participantBytes || participantBytes.length === 0) {
      throw new Error(`Participant ID ${approverId} does not exist`);
    }
    if (!viewerBytes || viewerBytes.length === 0) {
      throw new Error(`Accepter ID ${id} does not exist`);
    }

    const participant = JSON.parse(participantBytes.toString());
    participant.appendGranted.push(viewerId);

    const vieweracceptor = JSON.parse(viewerBytes.toString());
    vieweracceptor.acceptappendGranted.push(approverId);
  
    await ctx.stub.putState(participantKey, Buffer.from(JSON.stringify(participant)));
    await ctx.stub.putState(viewerKey, Buffer.from(JSON.stringify(vieweracceptor)));
  }
  async  revokeAppendPermission(ctx, approverId, viewerId) {
    const participantKey = approverId.toString();
    const participantBytes = await ctx.stub.getState(participantKey);
  
    
    const viewerKey= viewerId.toString();
    const viewerBytes = await ctx.stub.getState(viewerKey);

    if (!participantBytes || participantBytes.length === 0) {
      throw new Error(`Participant ID ${id} does not exist`);
    }

    if (!viewerBytes || viewerBytes.length === 0) {
      throw new Error(`Accepter ID ${id} does not exist`);
    }
    
    
    const participant = JSON.parse(participantBytes.toString());
    const vieweracceptor = JSON.parse(viewerBytes.toString());
  
    if (vieweracceptor.acceptappendGranted.includes(approverId)) {
      const viewerIndex = vieweracceptor.acceptappendGranted.indexOf(approverId);
      vieweracceptor.acceptappendGranted.splice(viewerIndex, 1); // remove viewerId from permissionGranted array
      await ctx.stub.putState(viewerKey, Buffer.from(JSON.stringify(vieweracceptor))); // update participant state
    }
  
    if (participant.appendGranted.includes(viewerId)) {
      const viewerIndex = participant.appendGranted.indexOf(viewerId);
      participant.appendGranted.splice(viewerIndex, 1); // remove viewerId from permissionGranted array
      await ctx.stub.putState(participantKey, Buffer.from(JSON.stringify(participant))); // update participant state
      return "yes";
    }
  
    return "no";
  }
  async  getAppendParticipant(ctx, approverId, viewerId) {
    const participantKey = approverId.toString();
    const participantBytes = await ctx.stub.getState(participantKey);

    const viewerKey= viewerId.toString();
    const viewerBytes = await ctx.stub.getState(viewerKey);

    if (!participantBytes || participantBytes.length === 0) {
      throw new Error(`Participant ID ${id} does not exist`);
    }

    if (!viewerBytes || viewerBytes.length === 0) {
      throw new Error(`Accepter ID ${id} does not exist`);
    }

    const participant = JSON.parse(participantBytes.toString());
    const vieweracceptor = JSON.parse(viewerBytes.toString());

    if (vieweracceptor.acceptappendGranted.includes(approverId)) {
      const viewerIndex = vieweracceptor.acceptappendGranted.indexOf(approverId);
      vieweracceptor.acceptappendGranted.splice(viewerIndex, 1); // remove viewerId from permissionGranted array
      await ctx.stub.putState(viewerKey, Buffer.from(JSON.stringify(vieweracceptor))); // update participant state
    }
    else
      return false;
  
  
    if (participant.appendGranted.includes(viewerId)) {
      const viewerIndex = participant.appendGranted.indexOf(viewerId);
      participant.appendGranted.splice(viewerIndex, 1); // remove viewerId from permissionGranted array
      await ctx.stub.putState(participantKey, Buffer.from(JSON.stringify(participant))); // update participant state
    }
    else
      return false;
   
  }
  async getAllParticipants(ctx, invoker) {
    let invokerKey = invoker.toString();
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('', '');
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      if(result.value.key!==invokerKey)
      {
        if (record.role === 'admin' || record.role === 'doctor' || record.role === 'patient') {
          const { name, email, mobile_no } = record;
          allResults.push({ Key: result.value.key, name, email, mobile_no });
        }
      }
      result = await iterator.next();
    }
    return JSON.stringify(allResults);
  }
  
  async  getGrantedParticipants(ctx, approverId) {
    const participantKey = approverId.toString();
    const participantBytes = await ctx.stub.getState(participantKey);
  
    if (!participantBytes || participantBytes.length === 0) {
      throw new Error(`Participant ID ${id} does not exist`);
    }
  
    const participant = JSON.parse(participantBytes.toString());
  
    const grantedParticipants = [];
  
    for (const viewerId of participant.permissionGranted) {
      const viewerKey = viewerId.toString();

        const viewerBytes = await ctx.stub.getState(viewerKey);
        
        if (!viewerBytes || viewerBytes.length === 0) {
          throw new Error(`Viewer ID ${viewerId} does not exist`);
        }
      
        const viewer = JSON.parse(viewerBytes.toString());
        grantedParticipants.push({id: viewerId, name: viewer.name,email: viewer.email ,mobile_no: viewer.mobile_no});
   
    }
  
     return JSON.stringify(grantedParticipants);
  }
  async  acceptGrantedParticipants(ctx, approverId) {
    const participantKey = approverId.toString();
    const participantBytes = await ctx.stub.getState(participantKey);
  
    if (!participantBytes || participantBytes.length === 0) {
      throw new Error(`Participant ID ${id} does not exist`);
    }
  
    const participant = JSON.parse(participantBytes.toString());
  
    const grantedParticipants = [];
  
    for (const viewerId of participant.acceptviewGranted) {
      const viewerKey = viewerId.toString();
      const viewerBytes = await ctx.stub.getState(viewerKey);
  
      if (!viewerBytes || viewerBytes.length === 0) {
        throw new Error(`Viewer ID ${viewerId} does not exist`);
      }
  
      const viewer = JSON.parse(viewerBytes.toString());
      grantedParticipants.push({id: viewerId, name: viewer.name,email: viewer.email ,mobile_no: viewer.mobile_no});
    }
  
     return JSON.stringify(grantedParticipants);
  }
  async  getAppendGranted(ctx, approverId) {
    const participantKey = approverId.toString();
    const participantBytes = await ctx.stub.getState(participantKey);
  
    if (!participantBytes || participantBytes.length === 0) {
      throw new Error(`Participant ID ${id} does not exist`);
    }
  
    const participant = JSON.parse(participantBytes.toString());
  
    const grantedParticipants = [];
  
    for (const viewerId of participant.appendGranted) {
      const viewerKey = viewerId.toString();
      const viewerBytes = await ctx.stub.getState(viewerKey);
  
      if (!viewerBytes || viewerBytes.length === 0) {
        throw new Error(`Viewer ID ${viewerId} does not exist`);
      }
  
      const viewer = JSON.parse(viewerBytes.toString());
      grantedParticipants.push({id: viewerId, name: viewer.name,email: viewer.email ,mobile_no: viewer.mobile_no});
    }
  
     return JSON.stringify(grantedParticipants);
  }
  async  acceptAppendGranted(ctx, approverId) {
    const participantKey = approverId.toString();
    const participantBytes = await ctx.stub.getState(participantKey);
  
    if (!participantBytes || participantBytes.length === 0) {
      throw new Error(`Participant ID ${id} does not exist`);
    }
  
    const participant = JSON.parse(participantBytes.toString());
  
    const grantedParticipants = [];
  
    for (const viewerId of participant.acceptappendGranted) {
      const viewerKey = viewerId.toString();
      const viewerBytes = await ctx.stub.getState(viewerKey);
  
      if (!viewerBytes || viewerBytes.length === 0) {
        throw new Error(`Viewer ID ${viewerId} does not exist`);
      }
  
      const viewer = JSON.parse(viewerBytes.toString());
      grantedParticipants.push({id: viewerId, name: viewer.name,email: viewer.email ,mobile_no: viewer.mobile_no});
    }
  
     return JSON.stringify(grantedParticipants);
  }
  async  appendDetails(ctx, id, allergies, bodyTemp, symptoms) {
    const participantKey = id.toString();
    const participantBytes = await ctx.stub.getState(participantKey);
  
    if (!participantBytes || participantBytes.length === 0) {
      throw new Error(`Patient ID ${id} does not exist`);
    }
    
    const participant = JSON.parse(participantBytes.toString());
    participant.timestamps.push(ctx.stub.getTxTimestamp());
    participant.allergies.push(allergies);
    participant.bodyTemp.push(bodyTemp);
    participant.symptoms.push(symptoms);
  
    await ctx.stub.putState(participantKey, Buffer.from(JSON.stringify(participant)));
  }
  async  changePassword(ctx, id,oldpass,newpass) {
    const participantKey = id.toString();
    const participantBytes = await ctx.stub.getState(participantKey);
  
    if (!participantBytes || participantBytes.length === 0) {
      throw new Error(`Patient ID ${id} does not exist`);
    }
    
    const participant = JSON.parse(participantBytes.toString());
    const pass = participant.password;
    if(oldpass===pass)
    {
      participant.password = newpass;
      await ctx.stub.putState(participantKey, Buffer.from(JSON.stringify(participant)));
      return 'yes';
    }
  

    return 'no';
  }
  async Doctors(ctx) {
    const doctorIterator = await ctx.stub.getStateByPartialCompositeKey('doctor', []);
  
    const doctors = [];
  
    while (true) {
      const result = await doctorIterator.next();
      if (result.value && result.value.value.toString()) {
        const key = result.value.key;
        const splitKey = ctx.stub.splitCompositeKey(key);
        const mobile_no = splitKey.attributes[1];
        const doctor = JSON.parse(result.value.value.toString('utf8'));
        doctors.push({
          name: doctor.name,
          email: doctor.email,
          mobile_no: mobile_no,
          qualification: doctor.qualification,
        });
      }
      if (result.done) {
        await doctorIterator.close();
        return JSON.stringify(doctors);
      }
    }
  }
  
  async getqueryForCredentials(ctx, username, password) {
    const credentials = await ctx.stub.getState(username);

    if (!credentials || credentials.toString() !== password) {
      return Buffer.from('false');
    }

    return Buffer.from('true');
  }
}

module.exports = EHRContract;


