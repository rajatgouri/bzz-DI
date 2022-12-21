const methods = require("./crudController");
const endpoints = methods.crudController("WQ1135");
var sql = require("mssql");
const path = require('path');

const dir = path.join("./sharepoint")
const fs = require('fs');
const { getDateTime } = require("./utilController");
const CsvReadableStream = require('csv-reader');
const sharepoint = require('./sharepoint')

delete endpoints["update"];
delete endpoints['list'];


const archiveFilters = async (model) => {
  try {


    const q = (`SELECT * from ${model}Filters WHERE  ( [Capture Location] IS NOT  NULL or [Document Description] IS NOT NULL or [Document Type] IS NOT NULL)`)
    let {recordset: result} = await sql.query(q)
    
    if(result.length >0 ) {
      let CaptureLocation = result.map((res) => res['Capture Location'])
      let DocumentType = result.map((res) => res['Document Type'])
      let DocumentDescription = result.map((res) => res['Document Description'])

      let q = (`UPDATE ${model} set Archive = 'Yes' WHERE  ( [Capture Location] IN (${CaptureLocation.map((c) => "'" + c + "'")}) or [Document Description] IN (${DocumentDescription.map((c) => "'" + c + "'")}) or [Document Type]  IN (${DocumentType.map((c) => "'" + c + "'")})) `)
      await sql.query(q)
      
    }

  } catch (err) {
    console.log(err)
  }
}

let splitArray = (array, parts) => {
  let result = [];
  for (let i = parts; i > 0; i--) {
      result.push(array.splice(0, Math.ceil(array.length / i)));
  }
  return result;
}

const timer = () => new Promise(res => setTimeout(res, 2000))

const exportLogger = async  (entity, newRecords, previousRecords, user) => {
  return new Promise(async(resolve, reject) => {
    try {
      let model = entity + 'ExportLogger'

      const {recordset: result } = await sql.query(`SELECT COUNT(*) as count from ${entity}`)
    
      await sql.query(`
          INSERT INTO ${model} (NewRecords, PreviousRecords, TotalRecords, UserName, EMPID, UploadDateTime) 
          VALUES ('${newRecords}', '${previousRecords}','${result[0]['count']}', '${user.Nickname}', '${user.EMPID}', '${getDateTime()}')
      `)
  
      resolve(true)
    } catch (err) {
      resolve(false)
    }
    
  })
  


 
}

const loader =  async (file, entity,  user,cb) => {
  
 
  let rows = []

  
  let d = ''

  if(entity == 'WQEDCOMC') {
    d =  dir + `/EDCOWQMCExports/${file}`
  } else {
   d = dir + `/EDCOWQMFExports/${file}`
  }

  let inputStream = fs.createReadStream(d, 'utf8');  
    inputStream
    .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
    .on('data', function (row) {
        rows.push(row)
    })
    .on('end', async function () {


        let BatchId =   rows[0].findIndex((r) => r == 'Batch Id')
        let MecRec = rows[0].findIndex((r) => r == 'Med Rec')
        let AccountNumber = rows[0].findIndex((r) => r == 'Account Number')
        let PatientName = rows[0].findIndex((r) => r == 'Patient Name')
        let CaptureLocation = rows[0].findIndex((r) => r == 'Capture Location')
        let BatchCaptureClass = rows[0].findIndex((r) => r == 'Batch Capture Class')
        let BatchType = rows[0].findIndex((r) => r == 'Batch Type')
        let DocumentPages = rows[0].findIndex((r) => r == 'Document Pages')
        let EdcoDocumentType = rows[0].findIndex((r) => r == 'Edco Document Type')
        let DocumentType = rows[0].findIndex((r) => r == 'Document Type')
        let DocumentDescription = rows[0].findIndex((r) => r == 'Document Description')
        let ReleaseDate = rows[0].findIndex((r) => r == 'Release Date')
        let DocumentID = rows[0].findIndex((r) => r == 'Document Id')
        let OrderNumber = rows[0].findIndex((r) => r == 'Order Number')
        let OrderDate = rows[0].findIndex((r) => r == 'Order Date')
        let ChartCorrection = rows[0].findIndex((r) => r == 'Chart Correction')


        const {recordset: entries} = await sql.query(`Select * from ${entity}`)
        let Data = []
        var previousRecords = 0;
        var  newRecords = 0;
        let promise = new Promise(async (resolve, reject) => {
          for (let i = 0; i <= rows.length; i++) {

              if (!rows[i]) {
                  continue
              }

              let obj = ({
                  'Batch ID': rows[i][BatchId],
                  'Mec Rec': rows[i][MecRec],
                  'Account Number': rows[i][AccountNumber],
                  'Patient Name': rows[i][PatientName],
                  'Capture Location': rows[i][CaptureLocation],
                  'Batch Capture Class': rows[i][BatchCaptureClass],
                  'Batch Type': rows[i][BatchType],
                  'Document Pages': rows[i][DocumentPages],
                  'Edco Document Type': rows[i][EdcoDocumentType],
                  'Document Type': rows[i][DocumentType],
                  'Document Description' : rows[i][DocumentDescription],
                  'Release Date' : rows[i][ReleaseDate],
                  'Document ID' : rows[i][DocumentID],
                  'Order Number' : rows[i][OrderNumber],
                  'Order Date' : rows[i][OrderDate],
                  'Chart Correction' : rows[i][ChartCorrection]
              })

              
             
              Data.push(obj)
              if (i == rows.length - 1) {
                  resolve(Data)
              }

          }
      })

      await promise 
      let entID = []
      Data = Data.filter((d, i) =>  i > 0)


      Data = Data.map((d) => {
        if (d['Batch Id'] == '' || d['Batch Id'] == undefined) {
          d['Batch Id'] = null
        }
        if (d['Mec Rec'] == '' || d['Mec Rec'] == undefined) {
          d['Mec Rec'] = null
        }
        if (d['Account Number'] == '' || d['Account Number'] == undefined) {
          d['Account Number'] = null
        }
        if (d['Patient Name'] == '' || d['Patient Name'] == undefined) {
          d['Patient Name'] = null
        }
        if (d['Capture Location'] == '' || d['Capture Location'] == undefined) {
          d['Capture Location'] = null
        }
        if (d['Batch Capture Class'] == '' || d['Batch Capture Class'] == undefined) {
          d['Batch Capture Class'] = null
        }
        if (d['Batch Type'] == '' || d['Batch Type'] == undefined) {
          d['Batch Type'] = null
        }
        if (d['Document Pages'] == '' || d['Document Pages'] == undefined) {
          d['Document Pages'] = null
        }
        if (d['Edco Document Type'] == '' || d['Edco Document Type'] == undefined) {
          d['Edco Document Type'] = null
        }
        if (d['Document Type'] == '' || d['Document Type'] == undefined) {
          d['Document Type'] = null
        }
        if (d['Document Description'] == '' || d['Document Description'] == undefined) {
          d['Document Description'] = null
        }
        if (d['Document ID'] == '' || d['Document ID'] == undefined) {
          d['Document ID'] = null
        }
        if (d['Order Number'] == '' || d['Order Number'] == undefined) {
          d['Order Number'] = null
        }

        return d
      })


      Data = Data.filter((arr, index, self) => {
        let i = entries.findIndex((t, i) =>  {

           
        
            let match =  (
                t['Batch Id'] == arr['Batch ID'] &&
                t['Med Rec'] == arr['Mec Rec']  &&
                t['Account Number'] == arr['Account Number'] &&  
                t['Patient Name'] == arr['Patient Name'] && 
                t['Capture Location'] == arr['Capture Location'] && 
                t['Batch Capture Class'] == arr['Batch Capture Class'] &&
                t['Batch Type'] == arr['Batch Type'] &&
                t['Document Pages'] == arr['Document Pages'] &&
                t['Edco Document Type'] == arr['Edco Document Type'] &&
                t['Document Type'] == arr['Document Type'] &&
                t['Document Description'] == arr['Document Description'] &&
                t['Document Id'] == arr['Document ID'] &&
                t['Order Number'] == arr['Order Number']  &&
                (arr['Release Date'] ? new Date(arr['Release Date']).toISOString().split('T')[0] : null)  == 
                (t['Release Date'] ? new Date(t['Release Date']).toISOString().split('T')[0] : null)
                

                )

                if(match) {
                    if(t.ID) {
                        entID.push(t.ID)
                    } 
                    return true
                } else {
                    return false
                }
         })
        if( i> -1 ) {
             
             return false
         } else {
             return true
         }
    }
  
    )

    console.log('Present in Database', entID.length)
    console.log('New Records',Data.length)

    if(entID.length> 0) {
      previousRecords= entID.length;
      let parts = entID.length/300
      let result = splitArray(entID, parts)

      for(let i=0; i< result.length ;i++) {
          
          await sql.query(`UPDATE ${entity} set [Status] = 'Returned', [UploadDateTime] = '${getDateTime()}' where ID IN (${result[i].join(',')}) and [User] IS NOT NULL `)
          await timer()
      }
  }

     
      newRecords = Data.length;

      let parts = Data.length/600
      let result = splitArray(Data, parts)

     await  exportLogger(entity, newRecords, previousRecords, user)
    
      for (let i=0; i< result.length ; i++) {
        let valuesQuery = ''


        for (j = 0; j < result[i].length; j++) { // 10 

          let obj = {
            uploadDateTime: getDateTime()
          }

        
            valuesQuery += `(
              ${result[i][j]['Batch ID'] ? `${result[i][j]['Batch ID']}` : null},   
              ${result[i][j]['Mec Rec'] ?   `'${result[i][j]['Mec Rec']}'` : null},
              ${result[i][j]['Account Number'] ? `'${result[i][j]['Account Number']}'` : null},
              ${result[i][j]['Patient Name'] ? `'${result[i][j]['Patient Name'].replace(/'/g, "''")}'` : null},
              ${result[i][j]['Capture Location'] ? `'${result[i][j]['Capture Location']}'` : null},
              ${result[i][j]['Batch Capture Class'] ? `'${result[i][j]['Batch Capture Class'].replace(/'/g, "''")}'` : null},
              ${result[i][j]['Batch Type'] ? `'${result[i][j]['Batch Type'].replace(/'/g, "''")}'` : null},
              ${result[i][j]['Document Pages'] ? result[i][j]['Document Pages'] : null},
              ${result[i][j]['Edco Document Type'] ? `'${result[i][j]['Edco Document Type'].replace(/'/g, "''")}'` : null},
              ${result[i][j]['Document Type'] ? `'${result[i][j]['Document Type'].replace(/'/g, "''")}'` : null},
              ${result[i][j]['Document Description'] ? `'${result[i][j]['Document Description'].replace(/'/g, "''")}'` : null},
              ${result[i][j]['Release Date'] ?  `'${new Date(result[i][j]['Release Date'].replace('12:00 AM','')).toISOString()}'` : null},
              ${result[i][j]['Document ID'] ? `'${result[i][j]['Document ID']}'` : null},
              ${result[i][j]['Order Number'] >= 0 ? result[i][j]['Order Number'] : null},
              ${result[i][j]['Order Date'] ? `'${result[i][j]['Order Date']}'` : null},
              ${result[i][j]['Chart Correction'] ? `'${result[i][j]['Chart Correction']}'` : null},
              '${obj.uploadDateTime}',
              'QA Review',
              ${null},
              ${null},
              ${null}
              
              ) ,`
        }



    valuesQuery = valuesQuery.slice(0, -1)

    if(valuesQuery.length > 0 ) {

      let x = (`
      insert into ${entity}
      (
        [Batch Id],
        [Med Rec],
        [Account Number],
        [Patient Name],
        [Capture Location],
        [Batch Capture Class],
        [Batch Type],
        [Document Pages],
        [Edco Document Type],
        [Document Type],
        [Document Description],
        [Release Date],
        [Document ID],
        [Order Number],
        [Order Date],
        [Chart Correction],
        UploadDateTime ,
        Status,
        StartTimeStamp,
        FinishTimeStamp,
        Duration

      ) values ${valuesQuery}

      
    `)

        await sql.query(x)

        archiveFilters(entity )
        await timer()

       
      }

      }
     
    });

}


endpoints.list = async (req, res) => {
  try {

  let { entity } =(req.query)

    let d = ''

    if(entity == 'WQEDCOMC') {
      d =  dir + '/EDCOWQMCExports'

      sharepoint.loadMC().then((w) => {
        let files = []
        if(w && w.length >0) {
          files  = w.map(f => f.Name)
        }
        return res.status(200).json({
          success: true,
          result: files,
          message: "Successfully found all documents",
        });
      })
   
    } else {
     d = dir + '/EDCOWQMFExports'

     sharepoint.loadMF().then((w) => {
      let files = []
      if(w && w.length >0) {
        files  = w.map(f => f.Name)
      }
      return res.status(200).json({
        success: true,
        result: files,
        message: "Successfully found all documents",
      });
    })
    }


    
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      error: err,
    });
  }
};


endpoints.upload = async (req,res) => {
  
  let entity = ''
  if (req.file.destination == 'sharepoint/EDCOWQMFExports/') {
    entity = 'WQEDCOMF'
  } else {
    entity = 'WQEDCOMC'

  }


  loader(req.file.filename, entity, req.admin)
 
    return res.status(200).json({
      success: true,
      result: [],
      message: "Successfully upload files",
    });
    
 
 }
 


endpoints.create = async (req, res) => {
  try {
    const { file, entity } = req.body;

    const date1 = new Date(getDateTime().split('T')[0]);
    const date2 = new Date(file.split('_').reverse()[0].slice(0,-5));

    const diffTime = Math.abs(date1 - date2);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));


    if( diffDays > 0) {
      
      return res.status(200).json({
        success: false,
        result: {},
        message: "current date",
      });
    }

    loader(file, entity, req.admin)

      return res.status(200).json({
        success: true,
        result: {},
        message: "Success",
      });

    
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      result: null,
      message: "Oops there is an Error",
      error: err,
    });
  }

};



module.exports = endpoints;


