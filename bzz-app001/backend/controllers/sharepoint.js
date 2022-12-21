const { SPPull } = require('sppull');

// exports.loadMF = async () => {
//   try {

//     const context = {
//       siteUrl: "https://cityofhope.sharepoint.com/sites/hims",
//       creds: {
//         user: process.env.SP_USERNAME,
//         password: process.env.SP_PASSWORD,
//         online: true
//       }
//     };

//     console.log(context)

//     const options = {
//       spRootFolder: "/DILibrary/EDCOWQ/MF",
//       dlRootFolder: "./sharepoint/EDCOWQMFExports",
//     };



//       const options1 = {
//         spRootFolder: "/DILibrary/EDCOWQ/MC",
//         dlRootFolder: "./sharepoint/EDCOWQMCExports",
//       };

//         return await  Promise.all([await SPPull.download(context, options), await SPPull.download(context, options1)])

//   } catch (err) {
//   }
// };


exports.loadMC = async () => {
  try {
    const { SPPull } = require('sppull');

    const context = {
      siteUrl: "https://cityofhope.sharepoint.com/sites/hims",
      creds: {
        username: process.env.SP_USERNAME,
        password: process.env.SP_PASSWORD,
        online: true
      }
    };


    const options = {
      spRootFolder: "/DILibrary/EDCOWQ/MC",
      dlRootFolder: "./sharepoint/EDCOWQMCExports",
    };

    return SPPull.download(context, options)


  } catch (err) {
  }
};


exports.loadMF = async () => {
  try {
    const { SPPull } = require('sppull');

    const context = {
      siteUrl: "https://cityofhope.sharepoint.com/sites/hims",
      creds: {
        username: process.env.SP_USERNAME,
        password: process.env.SP_PASSWORD,
        online: true
      }
    };


    const options = {
      spRootFolder: "/DILibrary/EDCOWQ/MF",
      dlRootFolder: "./sharepoint/EDCOWQMFExports",
    };

    return SPPull.download(context, options)

  } catch (err) {
  }
};



// exports.loadMC = async () => {
//   try {

//     const context = {
//       siteUrl: "https://cityofhope.sharepoint.com/sites/hims",
//       creds: {
//         user: process.env.SP_USERNAME,
//         password: process.env.SP_PASSWORD,
//         online: true
//       }
//     };

//     const options = {
//       spRootFolder: "/DILibrary/EDCOWQ/MC",
//       dlRootFolder: "./sharepoint/EDCOWQMCExports",
//     };

//     return await SPPull.download(context, options)

//   } catch (err) {
//   }
// };


