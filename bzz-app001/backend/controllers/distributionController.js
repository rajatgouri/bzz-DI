const methods = require("./crudController");
const endpoints = methods.crudController("WQ1135");
const utilController = require('./utilController')
var sql = require("mssql");

delete endpoints["update"];
delete endpoints['list'];



let equalizer = (result) => {
  let data = [] // finalData
  return new Promise((resolve, reject) => {
      try {

      for(let i=0; i< result.length -1 ; i++) {
                        
        let goal = result[i].length - result[i+1].length;
         
        if(goal <= 0) {
          
          if(i == result.length -2) {
            resolve(result)
          }

          continue
        }
         
        const count = {};

        for (const element of result[i]) {
          if (count[element['Batch Id']]) {
            count[element['Batch Id']] += 1;
          } else {
            count[element['Batch Id']] = 1;
          }
        }

        let lastResult = 0
        while (result[i].length - result[i+1].length > 0 && lastResult != result[i+1].length) {
          var closest = Object.values(count).filter((item) => item  <= goal  )
          
          if(closest.length > 0) {
            closest = closest.reduce(function(prev, curr) {
              return (Math.abs(curr - goal) > Math.abs(prev - goal) ? curr : prev);
            }); 
          } else {
            closest = 1
          }
          

          let isDeleted = false          
          let calcBatchId =  Object.keys(count).filter((item, index)  => {
                
            if (count[item] == closest ) {
              if(!isDeleted) {
                delete count[item]
                isDeleted = true
              }


              return true 
            }  

          })[0]

          
  
          result[i+1] = result[i+1].concat(result[i].filter(item => item['Batch Id'] == calcBatchId))
          result[i] = result[i].filter(item => item['Batch Id'] != calcBatchId)
          
            lastResult = result[i+1].length

        }
      
        if(i == result.length -2) {
          resolve(result)
        }
            
      }
    } catch (err) {
      console.log(err)
      resolve(false)
    }

  })
}


let splitArray = (array, parts) =>  {
  let result = [];
  for (let i = parts; i > 0; i--) {
      result.push(array.splice(0, Math.ceil(array.length / i)));
  }
  return result;
}


let splitter = (splitResult) => {
  return new Promise((resolve, reject) => {
  let counter = 0

    for (let i=0; i< splitResult.length -1; i++) {
     
      splitResult[i+1].map((r,index) => {

        if (  splitResult[i].findIndex(item => item['Batch Id'] == r['Batch Id'] ) > -1) {
            splitResult[i].push(r)  	
            splitResult[i+1] = splitResult[i+1].filter(item => item != r)
        }

        counter  = counter + 1
        if(counter == splitResult.length) {

          resolve(splitResult)
        }
      })
    }
  })
}


const archiveFilters = async (model, EMPID, Management, User) => {
  try {


    const q = (`SELECT * from ${model}Filters WHERE  ( [Capture Location] IS NOT  NULL or [Document Description] IS NOT NULL or [Document Type] IS NOT NULL)`)
    let {recordset: result} = await sql.query(q)
    
    if(result.length >0 ) {
      let CaptureLocation = result.map((res) => res['Capture Location'] )
      let DocumentType = result.map((res) => res['Document Type'] )
      let DocumentDescription = result.map((res) => res['Document Description'] )


      let q = (`UPDATE ${model} set Archive = 'Yes' WHERE EMPID = ${EMPID} and ( [Capture Location] IN (${CaptureLocation.map((c) => "'" + c + "'")}) or [Document Description] IN (${DocumentDescription.map((c) => "'" + c + "'")}) or [Document Type]  IN (${DocumentType.map((c) => "'" + c + "'")})) `)
      await sql.query(q)
      

    }

  } catch (err) {
    console.log(err)
  }
}


endpoints.create = async (req, res) => {
  try {
     
      let {Distributions, Model, values1} = (req.body)
      let valuesQuery = ''
      delete values1['distributions']
      delete values1['UserLogged']

      if(!values1.UserAssigned) {
        values1['UserAssigned'] = "null"
      }

      for (key in values1) {
        if (values1[key] == null) {
            valuesQuery += "";
        } else if (key == "Status"  ) {
            let values = values1[key];

            if(values.indexOf('QA Review') > -1) {
              values.push('')
              vQ = values.map(v => ( "'" + v  + "'"))
              valuesQuery +=  values1[key] !== null ?  "(" + key + " IN (" + vQ + ") or " : "" ;
              valuesQuery += 'Status IS NULL) and '

              continue
          } else {
              
              vQ = values.map(v => ( "'" + v  + "'"))
              if(values.length > 0) {
                  valuesQuery +=  values1[key] !== null ?  key + " IN (" + vQ + ") and " : "" ;
              }
              continue
          }

        }     
        
          
        else if (key == "ReleaseDate") {
           
          let values = values1[key];
  
          valuesQuery +=  ` CAST([Release Date] as DATE) Between '${values.split('T')[0]}' and '${values.split('T')[1]}'    and `;
          continue
        }
        else if ([key] == "Batch Capture Class") {
          let values = values1[key];
          if(typeof values1[key] != 'string') {

          if(values.indexOf('') > -1) {
            values.push('')
            vQ = values.map(v => ( "'" + v  + "'"))
            valuesQuery +=  values1[key] !== null ?  "([" + key + "] IN (" + vQ + ") or " : "" ;
            valuesQuery += `[${key}] IS NULL) and `
            continue
        } else {
            
            vQ = values.map(v => ( "'" + v  + "'"))
            if(values.length > 0) {
              valuesQuery +=  values1[key] !== null ?  "([" + key + "] IN (" + vQ + ")) and " : "" ;
            }
            continue
          }
      }
      }  
      else if (values1[key] == "null") {
        valuesQuery +=  ` [${[key]}] IS NULL  and `;
        continue
      }
        else if ([key] == "UserAssigned") {
          let values = values1[key];
          if(typeof values1[key] != 'string') {

          if(values.indexOf('') > -1) {
            values.push('')
            vQ = values.map(v => ( "'" + v  + "'"))
            valuesQuery +=  values1[key] !== null ?  "([" + key + "] IN (" + vQ + ") or " : "" ;
            valuesQuery += `[${key}] IS NULL) and `
            continue
        } else if (values1[key].includes(null)) {
          values.push('')
          vQ = values.map(v => ( "'" + v  + "'"))
          valuesQuery +=  values1[key] !== null ?  "([" + key + "] IN (" + vQ + ") or " : "" ;
          valuesQuery += `[${key}] IS NULL) and `
          continue
        } else {
            
            
            vQ = values.map(v => ( "'" + v  + "'"))
            if(values.length > 0) {
              valuesQuery +=  values1[key] !== null ?  "([" + key + "] IN (" + vQ + ")) and " : "" ;
            }
          }
          continue
      }
      }
      else if ([key] == "User") {          
        valuesQuery += `([${key}] = '' or [${key}]  IS NULL) and `
        continue
      }
      
      
        else {
          valuesQuery += "["  + key + "] ='" + values1[key] + "' and ";
          continue
       } 
    }

    valuesQuery = valuesQuery.slice(0,-4)
    
    let Data = []

    console.log(`
    SELECT
    [Batch Id], COUNT([Batch Id]) as count
FROM
    ${Model}
where  ${valuesQuery}  
GROUP BY
    [Batch Id]
HAVING COUNT([Batch Id]) >= 1
ORDER BY [count] Desc
    `)
    let {recordset: result} = await sql.query(`
    SELECT
          [Batch Id], COUNT([Batch Id]) as count
      FROM
          ${Model}
      where  ${valuesQuery}  
      GROUP BY
          [Batch Id]
      HAVING COUNT([Batch Id]) >= 1
      ORDER BY [count] Desc
    `)
    

    let {recordset: rows} = await sql.query(`
        SELECT
              *
          FROM
              ${Model}
          where  ${valuesQuery}  
        `)

    if(Distributions > 1) {
        

      if(result.length == 0) {
        return res.status(200).json({
          success: false,
          result: [],
          message: "No charges found by selected criteria!",
        });
  
      }

      if(result.length < +Distributions ) {
        return res.status(200).json({
          success: false,
          result: [],
          message: "Distributions exceed the number of charges available!",
        });
      }

      let average = rows.length/ Distributions

      
     result = result.filter((item) => {
        if(item.count > average) {
            let i = rows.filter((row) => row['Batch Id'] == item['Batch Id'])
            rows = rows.filter((row) => row['Batch Id'] != item['Batch Id'])

            Data.push(i)
            Distributions = Distributions -1
            return false
        } else {
          
          return true
        }
      })

  
      

      let splitResult = (splitArray(rows, Distributions))
      let promise = await splitter(splitResult)

      if (promise.filter((p) => p.length == 0).length > 0) {
        return res.status(200).json({
          success: false,
          result: [],
          message: "Can not able to split batch ids in too many distributions!",
        });
      }  
      let response = await equalizer(splitResult) 
      response = response.concat(Data)

      if(!response) {
        return res.status(200).json({
          success: false,
          result: [],
          message: "Something went wrong!",
        });
      } else {
        return res.status(200).json({
          success: true,
          result: response,
          message: "Success",
        });
      }
      
  
    } else {
      let {recordsets: result} = await sql.query(`select * from ${Model} where ${valuesQuery} Order By [Batch Id] ASC`)

      
      if(result[0].length == 0) {
        return res.status(200).json({
          success: false,
          result: [],
          message: "Record",
        });
  
      }

      if(result[0].length < +Distributions ) {
        return res.status(200).json({
          success: false,
          result: [],
          message: "Distribution",
        });
  
      }


      return res.status(200).json({
        success: true,
        result: result,
        message: "Success",
      });          
    }
    
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


endpoints.assign = async (req, res) => {
try {
   
    
    let {Obj, filter, Model} = (req.body)

    let counter = 0
    
    let values1 = filter
    
    let valuesQuery = ''
    delete values1['distributions']
    delete values1['UserLogged']
    


    for (key in values1) {
      if (values1[key] == null) {
          valuesQuery += "";
      } else if (key == "Status"  ) {
          let values = values1[key];

          if(values.indexOf('QA Review') > -1) {
            values.push('')
            vQ = values.map(v => ( "'" + v  + "'"))
            valuesQuery +=  values1[key] !== null ?  "(" + key + " IN (" + vQ + ") or " : "" ;
            valuesQuery += 'Status IS NULL) and '

        } else {
            
            vQ = values.map(v => ( "'" + v  + "'"))
            if(values.length > 0) {
                valuesQuery +=  values1[key] !== null ?  key + " IN (" + vQ + ") and " : "" ;
            }
        }

      }     
      
        
      else if (key == "ReleaseDate") {
         
        let values = values1[key];

        valuesQuery +=  ` CAST([Release Date] as DATE) Between '${values.split('T')[0]}' and '${values.split('T')[1]}'    and `;
      }  
        
      else if ([key] == "Batch Capture Class") {
        let values = values1[key];
        if(typeof values1[key] != 'string') {

        if(values.indexOf('') > -1) {
          values.push('')
          vQ = values.map(v => ( "'" + v  + "'"))
          valuesQuery +=  values1[key] !== null ?  "([" + key + "] IN (" + vQ + ") or " : "" ;
          valuesQuery += `[${key}] IS NULL) and `

      } else {
          
          vQ = values.map(v => ( "'" + v  + "'"))
          if(values.length > 0) {
            valuesQuery +=  values1[key] !== null ?  "([" + key + "] IN (" + vQ + ")) and " : "" ;
          }
        }
    }
    } 
      else if ([key] == "UserAssigned") {
        let values = values1[key];
        if(typeof values1[key] != 'string') {

        if(values.indexOf('') > -1) {
          values.push('')
          vQ = values.map(v => ( "'" + v  + "'"))
          valuesQuery +=  values1[key] !== null ?  "([" + key + "] IN (" + vQ + ") or " : "" ;
          valuesQuery += `[${key}] IS NULL) and `

      } else if (values1[key].includes(null)) {
        values.push('')
        vQ = values.map(v => ( "'" + v  + "'"))
        valuesQuery +=  values1[key] !== null ?  "([" + key + "] IN (" + vQ + ") or " : "" ;
        valuesQuery += `[${key}] IS NULL) and `
        continue
      } else {
          
          vQ = values.map(v => ( "'" + v  + "'"))
          if(values.length > 0) {
            valuesQuery +=  values1[key] !== null ?  "([" + key + "] IN (" + vQ + ")) and " : "" ;
          }
        }
    }
      
    }

    else if ([key] == "UserAssigned") {
      let values = values1[key];
      if(typeof values1[key] != 'string') {

      if(values.indexOf('') > -1) {
        values.push('')
        vQ = values.map(v => ( "'" + v  + "'"))
        valuesQuery +=  values1[key] !== null ?  "([" + key + "] IN (" + vQ + ") or " : "" ;
        valuesQuery += `[${key}] IS NULL) and `

    } else {
        
        vQ = values.map(v => ( "'" + v  + "'"))
        if(values.length > 0) {
          valuesQuery +=  values1[key] !== null ?  "([" + key + "] IN (" + vQ + ")) and " : "" ;
        }
      }
  }
    
  }
    else if ([key] == "User") {          
      valuesQuery += `([${key}] = '' or [${key}]  IS NULL) and `
    }
    
    else if (values1[key] == "null") {
        valuesQuery +=  ` [${[key]}] IS NULL  and `;
      }
      else {
        valuesQuery += "["  + key + "] ='" + values1[key] + "' and ";
     } 
  }


   

  valuesQuery = valuesQuery.slice(0,-4)

    let promise = new Promise(async(resolve, reject) => {
      for (let i=0; i< Obj.length; i++) {
          let {recordset: User} = await sql.query(`SELECT Nickname from JWT WHERE EMPID = ${Obj[i]['UserAssigned']}`)
          
          await sql.query(`update ${Model} set UserAssigned = '${User[0].Nickname}', EMPID = '${Obj[i]['UserAssigned']}', UploadDateTime = '${utilController.getDateTime()}' where ${valuesQuery} and   [Batch Id] IN (${Obj[i]['Batch Id'].map(h => h ? "'" + h + "'": "NULL")})  and [User] IS NULL `)
          
          counter  = counter + 1
          if(counter == Obj.length) {
            resolve(true)
          }
      }
    })
    

    await promise 

  
    

    return res.status(200).json({
      success: true,
      result: [],
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
  

