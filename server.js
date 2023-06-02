// server.js
const express = require("express");
const bodyParser = require("body-parser");
const {initializeApp} = require("firebase/app");
const {getStorage,ref,getDownloadURL} = require("firebase/storage");

const fs = require("fs");
const puppeteer = require("puppeteer");

const resemble = require("resemblejs")

const next = require("next");


const dev = process.env.NODE_ENV !== 'production'

const app = next({dev})
const server = express()
const jsonParser = bodyParser.json()
const handle = app.getRequestHandler()


app.prepare().then(()=>{
  const firebaseConfig = initializeApp({
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID
  })
  const storage = getStorage(firebaseConfig);



  
  
  // (async ()=>{
  //   // Generate test SMTP service account from ethereal.email
  // // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();

  // // create reusable transporter object using the default SMTP transport
  // let transporter = nodemailer.createTransport({
  //   host: "smtp.ethereal.email",
  //   port: 587,
  //   secure: false, // true for 465, false for other ports
  //   auth: {
  //     user: testAccount.user, // generated ethereal user
  //     pass: testAccount.pass, // generated ethereal password
  //   },
  // });

  // // send mail with defined transport object
  // let info = await transporter.sendMail({
  //   from: '"Fred Foo 👻" <foo@example.com>', // sender address
  //   to: "bar@example.com, baz@example.com", // list of receivers
  //   subject: "Hello ✔", // Subject line
  //   text: "Hello world?", // plain text body
  //   html: "<b>Hello world?</b>", // html body
  // });

  // console.log("Message sent: %s", info.messageId);
  // // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // // Preview only available when sending through an Ethereal account
  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  // })();
  
   
  server.post("/api/compare-id-images",jsonParser,(req,res)=>{
    const idRef = ref(storage,`IdImages/${req.body.uid}`)
    let exampleIdRef;
    switch (req.body.nationality) {
      case "tc":
        exampleIdRef = ref(storage,`TR_ID/exampleId.jpg`)   
        break;
      case "kktc":
        exampleIdRef = ref(storage,`KKTC_ID/kktc_id.jpg`);
        break;
      case "uk":
        exampleIdRef = ref(storage,`UK_ID/UK_ID.jpg`);
        break;
      default:
        break;
    }

    getDownloadURL(exampleIdRef).then(url => {
      let img1 =url;
      getDownloadURL(idRef).then(url => {
        let img2=url
        var diff = resemble(img1)
            .compareTo(img2).scaleToSameSize()
            .ignoreColors().ignoreAntialiasing()
            .onComplete(function (data) {
              console.log(data)
              res.send(data);
            });
      
      })
    })
  })

  server.post("/api/compare-person-images",jsonParser,(req,res)=>{
    const idRef = ref(storage,`IdImages/${req.body.uid}`)
    let personIdRef = ref(storage,`PersonImages/${req.body.uid}`);

    getDownloadURL(personIdRef).then(url => {
      let img1 =url;
      getDownloadURL(idRef).then(url => {
        let img2=url
        var diff = resemble(img1)
            .compareTo(img2).scaleToSameSize()
            .ignoreColors().ignoreAntialiasing()
            .onComplete(function (data) {
              console.log(data)
              res.send(data);
            });
      
      })
    })
  })

  server.get("/deneme",(req,res)=>{
    res.send("OK")
  })

  server.get("*",(req,res)=>{
    return handle(req,res)
  })
  server.listen(3000, err=>{
    if(err) throw err
    console.log("server ready!")
  })

  
// Web Scraping

//puppeteer session start
const getDoctors = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  //yeni sayfa aç
  const sayfa = await browser.newPage();

  // şu https://neareasthospital.com/doctors/?lang=en sayfayı aç
  await sayfa.goto("https://neareasthospital.com/doctors/?lang=en", {
    waitUntil: "domcontentloaded",
  });

  const docCont = await sayfa.evaluate(async () => {
    const docName = document.querySelectorAll(".card-staff__content");
    // şu arraya async yazma anasını sikiyor
    return Array.from(docName).map((kimlik) => {
      const isim = kimlik.querySelector(".card-staff__title").innerText.replace(/\n/g, "");
      const brans = kimlik.querySelector(".card-staff__duty").innerText.replace(/\n/g, "").replace(/(<([^>]+)>)/gi, "");
      const numara = kimlik.querySelector('.list.is-unstyled.is-horizontal.card-staff__list a').getAttribute('href');
      return {isim,brans,numara};
    });
  });
 
  const data = docCont.map((item) => `${item.isim} - ${item.brans} - ${item.numara}`).join("\n");
  fs.writeFileSync("DoctorsNearEast.txt", data);
  console.log("Data written to file for NearEast");

  // Click on the "Next page" button
  // await page.click(".pager > .next > a")

  await browser.close();
};


//puppeteer session start
const getDoctors2 = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  //yeni sayfa aç
  const sayfa = await browser.newPage();

  // şu https://cypruscentralhospital.com/doktorlarimiz/ sayfayı aç
  await sayfa.goto("https://cypruscentralhospital.com/doktorlarimiz/", {
    waitUntil: "domcontentloaded",
  });
  

  const docCont = await sayfa.evaluate(async () => {
    const docName = document.querySelectorAll(".mkdf-team-info");
    // şu arraya async yazma anasını sikiyor
    return Array.from(docName).map((kimlik) => {
      const isim = kimlik.querySelector(".mkdf-team-name.entry-title").innerText.replace(/\n/g, "");
      const brans = kimlik.querySelector(".mkdf-team-position").innerText.replace(/\n/g, "").replace(/(<([^>]+)>)/gi, "");
      const numara = "+90 (392) 366 50 85 "
      const email = "info@cypruscentralhospital.com"
      return {isim,brans,numara,email};
    });
  });
 
  const data = docCont.map((item) => `${item.isim} - ${item.brans} - ${item.numara} - ${item.email}`).join("\n");
  fs.writeFileSync("DoctorsCyprusCentral.txt", data);
  console.log("Data written to file for CentralHospital");

  await browser.close();
};

//puppeteer session start
// const getDoctors3 = async () => {
//   const browser = await puppeteer.launch({
//     headless: false,
//     defaultViewport: null,
//   });

//   const data = [];

//   try {
//     const sayfa = await browser.newPage();

//     await sayfa.goto("https://www.kttb.org/doktorlarimiz/", {
//       waitUntil: "domcontentloaded",
//     });

//     let hasNextPage = true;
//     while (hasNextPage) {
//       const docCont = await sayfa.evaluate(() => {
//         const docName = document.querySelectorAll(".tablepress-31 > tbody > tr");
//         return Array.from(docName).map((kimlik) => {
//           const isim = kimlik.querySelector(".column-1")?.innerText?.replace(/\n/g, "") || "info is not specified";
//           const brans = kimlik.querySelector(".column-2")?.innerText?.replace(/\n/g, "").replace(/(<([^>]+)>)/gi, "") || "info is not specified";
//           const numara = kimlik.querySelector(".column-3")?.innerText?.replace(/\n/g, "").replace(/(<([^>]+)>)/gi, "") || "info is not specified";
//           const bölge = kimlik.querySelector(".column-4")?.innerText?.replace(/\n/g, "").replace(/(<([^>]+)>)/gi, "") || "info is not specified";
//           return {isim, brans, numara, bölge};
//         });
//       });

//       data.push(...docCont);

//       const nextPage = await sayfa.$(".tablepress-31_paginate > .tablepress-31_next");
//       if (nextPage !== null) {
//         await nextPage.click();
//         await sayfa.waitForNavigation();
//       } else {
//         hasNextPage = false;
//       }
//     }

//     const dataStr = data.map((item) => `${item.isim} - ${item.brans} - ${item.numara} - ${item.bölge}`).join("\n");
//     fs.writeFileSync("DoctorsAll.txt", dataStr);
//     console.log("Data written to file for All Cyprus");
//     } catch (error) {
//     console.error(error);
//     } finally {
//     await browser.close();
//     }
// };



const getDoctors4 = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

    const sayfa = await browser.newPage();

    await sayfa.goto("https://www.kttb.org/doktorlarimiz/", {
      waitUntil: "domcontentloaded",
    });
   
    let docCont = [];

    while (true) {
      const doctors = await sayfa.evaluate(() => {
        const rows = Array.from(document.querySelectorAll(".row-hover > tr"));
  
        return rows.map((row) => {
          const columns = row.querySelectorAll("td");
          const isim = columns[0]?.innerText?.replace(/\n/g, "") || "info is not specified";
          const numara = columns[1]?.innerText?.replace(/\n/g, "").replace(/(<([^>]+)>)/gi, "") || "info is not specified";
          const brans = columns[2]?.innerText?.replace(/\n/g, "").replace(/(<([^>]+)>)/gi, "") || "info is not specified";
          const bölge = columns[3]?.innerText?.replace(/\n/g, "").replace(/(<([^>]+)>)/gi, "") || "info is not specified";
          return { isim, brans, numara, bölge };
        });
      });
  
      docCont = [...docCont, ...doctors];
  
      const nextPageBtn = await sayfa.$(".paginate_button.next");
      const isDisabled = await nextPageBtn.evaluate((btn) => btn.classList.contains("disabled"));
  
      if (isDisabled) break;
  
      await nextPageBtn.click();
      await new Promise(r => setTimeout(r, 1000));
    }


      const data = docCont.map((item) => `${item.isim} - ${item.brans} - ${item.numara} - ${item.bölge}`).join("\n");
      fs.writeFileSync("DoctorsDeneme.txt", data);
      console.log(docCont);
      console.log("Data written to file for Deneme");
        


        // console.log(docCont);


        await browser.close();

};



// getDoctors();
// getDoctors2();
// getDoctors3();
// getDoctors4();

}).catch(err=>{
  console.error(err)
})
