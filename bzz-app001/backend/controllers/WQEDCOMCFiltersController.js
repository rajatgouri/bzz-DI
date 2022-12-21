const methods = require("./crudController");
const endpoints = methods.crudController("WQEDCOMCFilters");
var sql = require("mssql");

const Model = "WQEDCOMCFilters";
const WQModel = 'WQEDCOMC'
delete endpoints["list"];
const EdcoMCFilterModel = 'WQEDCOMCFilters'

setInterval(async() => {

  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())

  if (hours == 23 && minutes == 50) {
    const  {recordset: result2} = await sql.query(`select * from  ${EdcoMCFilterModel}  `)

    if(result2.length<5) {
      for(let i=0 ; i< 5- result2.length ; i++) {
        await sql.query(`insert into  ${EdcoMCFilterModel} (EMPID) values  (NULL)  `)
      }
    }
  }
}, 50000)

const populateFilters = async (EMPID) => {
  const  {recordset: result1} = await sql.query(`select * from  ${Model}  where EMPID = '${EMPID}'`)

      if(result1.length<5) {
        for(let i=0 ; i< 5- result1.length ; i++) {
          await sql.query(`insert into  ${Model} (EMPID) values  ('${EMPID}')  `)
        }
      }
}

endpoints.list = async (req,res) => {

  const ID = req.admin.EMPID
  try {
    const { recordset} = await sql.query(
      `SELECT * from  ${Model} `
    );

    return res.status(200).json({
      success: true,
      result: recordset,
      pagination: 1,
      message: "Successfully found all documents",
    });

  } catch (err) {

    console.log(err)
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      error: err,
    });
  }
}

endpoints.delete = async (req, res) => {

  const { id } = req.params

  try {

    const  {recordset: result} = await sql.query(`select * from  ${Model}  where ID = ${id}`)
      let currentFilter = result[0]
      let EMPID = currentFilter['EMPID']
      let currQuery = ''
      delete currentFilter['UserID']
      delete currentFilter['EMPID']
      delete currentFilter['Archive']
      delete currentFilter['ID']

      for (key in currentFilter) {
        if (currentFilter[key] === "null" || currentFilter[key] === "" || currentFilter[key] == null) {
          // valuesQuery +=  "[" + key + "]"   + "=NULL ,";
        } else {
          currQuery += "[" + key + "]" + "='" + currentFilter[key] + "' or ";
        }
      }

      currQuery = currQuery.slice(0, -3);
    
    await sql.query(
      `delete from  ${Model} where ID = ${id}`
    );


      let updateQuery1 = `update ${WQModel} set Archive = NULL `
      if(currQuery.length > 2) {
        updateQuery1 +=  `where ${currQuery}`
      }
      if(currQuery) {
        await sql.query(updateQuery1)
      }

      populateFilters(EMPID)


    return res.status(200).json({
      success: true,
      result: [],
      pagination: 1,
      message: "Successfully delete all documents",
    });

  } catch (err) {

    console.log(err)
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      error: err,
    });
  }
}



endpoints.create = async (req, res) => {
  try {
    // Find document by id and updates with the required fields
    const values = req.body;
    let ID = values.ID
    let admin = req.admin.ManagementAccess
    let EMPID = req.admin.EMPID

    if (values.ID) {

      delete values['UserID']
      values['Archive'] = '1'

      const  {recordset: result} = await sql.query(`select * from  ${Model}  where ID = ${values.ID}`)
      let currentFilter = result[0]
      let currQuery = ''
      delete currentFilter['UserID']
      delete currentFilter['EMPID']
      delete currentFilter['Archive']
      delete currentFilter['ID']

      for (key in currentFilter) {
        if (currentFilter[key] === "null" || currentFilter[key] === "" || currentFilter[key] == null) {
          currQuery +=  "[" + key + "]"   + "=NULL or ";
        } else {
          currQuery += "[" + key + "]" + "='" + currentFilter[key] + "' or ";
        }
      }

      currQuery = currQuery.slice(0, -3);
      if(currQuery.length> 3) {
        
          let updateWQ = `update ${WQModel} set Archive = NULL where ${currQuery} `
          await sql.query(updateWQ);
  
      }
     

      let valuesQuery = "";
      delete values['ID']
      values.EMPID = EMPID

      for (key in values) {
        if (values[key] === "null" || values[key] === "" || values[key] == null) {
          valuesQuery +=  "[" + key + "]"   + "=NULL ,";
        } else {
          valuesQuery += "[" + key + "]" + "='" + values[key] + "',";
        }
      }



      // update model
      valuesQuery = valuesQuery.slice(0, -1);
      let updateQuery = `update ${Model} set ${valuesQuery} where ID = ${ID}`
      await sql.query(updateQuery);


      let wqQuery = ''
      delete values['Archive']
      delete values['EMPID']

      for (key in values) {
        if (values[key] == "null" || values[key] == "" || values[key] == null) {
          // wqQuery +=  "[" + key + "]"   + "= NULL and ";

        } else {
          wqQuery += "[" + key + "]" + "='" + values[key] + "' or ";

        }
      }

      wqQuery = wqQuery.slice(0, -3);

       if (wqQuery) {
        let updateQuery1 = `update ${WQModel} set Archive = 'Yes' where ${wqQuery} `
        await sql.query(updateQuery1)
      }


    } else {
      values.EMPID = req.admin.EMPID
      const columnsQ = "(" + Object.keys(values).map(value => "[" + value + "]").toString() + ")"

      let valuesQuery = "";
      for (key in values) {
        if (values[key] == "null" || values[key] == "" || values[key] == null) {
          valuesQuery += "NULL" + ",";
        } else {
          valuesQuery += "'" + values[key] + "',";
        }
      }
      valuesQuery = "(" + valuesQuery.slice(0, -1) + ")";

      const insertQuery = `insert into ${Model} ${columnsQ} values ${valuesQuery}`

       await sql.query(insertQuery);

      let fdQuery = ''

      for (key in values) {
        if (values[key] == "null" || values[key] == "" || values[key] == null) {
          // fdQuery += "NULL" + "and ";
        } else {
          fdQuery += `[${key}]` + "='" + values[key] + "' or ";
        }
      }
      fdQuery = fdQuery.slice(0, -3);

      const selecttQuery = `select * from ${Model} where  ${fdQuery}`
      let {recordset: currentFilter}= await sql.query(selecttQuery)

      let filterID = (currentFilter[0].ID) 

      let wqQuery = ''
      delete values['Archive']
      delete values['EMPID']
      for (key in values) {
        if (values[key] == "null" || values[key] == "" || values[key] == null) {
          // wqQuery += "[" + key + "]" + "= NULL and ";
        } else {
          wqQuery += "[" + key + "]" + "='" + values[key] + "' or ";

        }
      }


      wqQuery = wqQuery.slice(0, -3);
      

        if (wqQuery.length > 5) {
          let updateQuery1 = `update ${WQModel} set Archive = 'Yes'  where   ${wqQuery}`
          await sql.query(updateQuery1)

      }



    }


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
}

endpoints.update = async (req,res) => {
  try {
      // Find document by id and updates with the required fields
      const values = req.body;
      values.EMPID = req.admin.EMPID 
      const id = req['params']['id'];// please do not update this line
      let valuesQuery = "";
      for (key in values) {
        valuesQuery += key + "='" + values[key] + "',";
      }

      valuesQuery = valuesQuery.slice(0, -1);

      await sql.query(`update ${Model} set ${valuesQuery} where ID = ${id}`);
  
      return res.status(200).json({
        success: true,
        result: {},
        message: "we update this document by this id: " + id,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        result: null,
        message: "Oops there is an Error",
        error: err,
      });
    }
}



module.exports = endpoints;
  

