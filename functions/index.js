const functions = require("firebase-functions");

const admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({origin:true}));

const db=admin.firestore();

// Routes
app.get('/', (req, res)=> {
    return res.status(200).send('Hai there how you doing?....');
});

// Create
app.post("/create", (req, res)=> {
    (async ()=>{
        try{
            await db.collection('userDetails').doc(req.body.id).create({
                id: req.body.id,
                email: req.body.email
            })

            return res.status(200).send({status:'Sucess', msg:'Data Saved'});
        } catch(error) {
            console.log(error)
            return res.status(500).send({status:'Failed', msg:error});
        }
    })();
})

// id값과 채팅 기록 넣기
app.post("/userChat/:id", (req, res)=>{
    const {id} = req.params;

    const chatData={
        chatId: Date.now(),
        subject: req.body.subject,
        content:req.body.content
    };
    (async () =>{
        try {
            const userRef = db.collection('userDetails').doc(id);
            const userDoc = await userRef.get();
    
            if (!userDoc.exists) {
                return res.status(404).send({ status: 'Failed', msg: 'User not found' });
            }
    
            const userData = userDoc.data();
            const updatedChats = [...(userData.chats || []), chatData]; // 추가된 부분

            await userRef.update({ chats: updatedChats }); // chats 필드 업데이트
    
            return res.status(200).send({ status: 'Success', msg: 'Chat created successfully' });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ status: 'Failed', msg: error });
        }
    })();    
});

// id값에 따라서 데이터 가져오기
app.get("/userChat/:id", (req, res) => {
    (async () => {
      try {
        const reqDoc = db.collection("userDetails").doc(req.params.id);
        let userDetail = await reqDoc.get();
        let response = userDetail.data();
  
        return res.status(200).send({ status: "Success", data: response });
      } catch (error) {
        console.log(error);
        res.status(500).send({ status: "Failed", msg: error });
      }
    })();
  });


exports.app = functions.https.onRequest(app);
