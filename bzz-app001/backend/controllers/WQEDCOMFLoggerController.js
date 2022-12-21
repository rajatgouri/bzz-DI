
  const methods = require("./crudController");
  const endpoints = methods.crudController("WQEDCOMFLogger");
  const utilController = require('./utilController')
  var sql = require("mssql");
  
  const Model = "WQEDCOMFLogger";
  const exportModel = "WQEDCOMFExportLogger"

  delete endpoints["update"];
  delete endpoints['list'];
  
  
  endpoints.create = async (req, res) => {
    try {
      const values = req.body;
      values.UserName = req.admin.Nickname; 
      values.DateTime = utilController.getDateTime()
      values.EMPID =req.admin.EMPID

      if (typeof values.IDWQEDCOMF == 'number') {
        const columnsQ = "(" + Object.keys(values).toString() + ")"
  
        let valuesQuery = "";
        for (key in values) {
              if (values[key] === "null") {
                  valuesQuery += "NULL" + ",";
              } else {
                  valuesQuery += "'" + values[key] + "',";
              }
          }
      valuesQuery = "(" + valuesQuery.slice(0, -1) + ")" ;
      
        const insertQuery = `insert into ${Model} ${columnsQ} values ${valuesQuery}`
    
        await sql.query(insertQuery);
    
        return res.status(200).json({
          success: true,
          result: {},
          message: "Success",
        });
      } else {
        const columnsQ = "(" + Object.keys(values).toString() + ")"
  
        let ids =  values.IDWQEDCOMF;
  
        if(values.status == 'Finish') {
          for (let i=0; i<ids.length ; i++) {
            let valuesQuery = "";
              for (key in values) {
                    if (values[key] === "null") {
                        valuesQuery += "NULL" + ",";
                    } else if (key ==  'IDWQEDCOMF') {
                      valuesQuery += "'" + values[key][i] + "',";
    
                    } else {
    
                        valuesQuery += "'" + values[key] + "',";
                    }
                }
            valuesQuery = "(" + valuesQuery.slice(0, -1) + ")" ;
            
            
              const insertQuery = `insert into ${Model} ${columnsQ} values ${valuesQuery}`
              await sql.query(insertQuery);
          
          }
        } else {
          for (let i=0; i<1 ; i++) {
            let valuesQuery = "";
              for (key in values) {
                    if (values[key] === "null") {
                        valuesQuery += "NULL" + ",";
                    } else if (key ==  'IDWQEDCOMF') {
                      valuesQuery += "'" + values[key][i] + "',";
    
                    } else {
    
                        valuesQuery += "'" + values[key] + "',";
                    }
                }
            valuesQuery = "(" + valuesQuery.slice(0, -1) + ")" ;
            
            
              const insertQuery = `insert into ${Model} ${columnsQ} values ${valuesQuery}`
              await sql.query(insertQuery);
          
          }
        }
        
  
     
        
        
        return res.status(200).json({
          success: true,
          result: {},
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
    

  endpoints.list = async (req, res) => {
    try {
      const page = req.query.page || 1;
  
      const limit = parseInt(req.query.items) || 99;
      var filter = JSON.parse(req.query.filter);
      var sorter = JSON.parse(req.query.sorter);
  
      let filterQuery = "";
      for (key in filter) {
        if (filter[key]) {
  
          switch (key) {
            
            default: {
              filterQuery += filter[key] !== null ? (key.split(" ").length > 1 ? '[' + key + ']' : key) + " Like '%" + filter[key] + "%' and " : "";
              break
            }
          }
        }
      }
      filterQuery = filterQuery.slice(0, -4);
      
      let sorterQuery = "";
      sorter.map((sort) => {
        sorterQuery += `[${sort.field}] ${sort.order == "ascend" ? "ASC" : "DESC"} ,`
    })
  
    
      let sq = sorterQuery.slice(0, -1)
  
  
      var query = `select  * from ${exportModel} `;
      var totalQuery = `select count(*) from ${exportModel} `;
  
        if (filterQuery) {
          query += `where UploadDateTime < CURRENT_TIMESTAMP and UploadDateTime > DATEADD(Year, -1, CURRENT_TIMESTAMP) `
          totalQuery += `where UploadDateTime < CURRENT_TIMESTAMP and UploadDateTime > DATEADD(Year, -1, CURRENT_TIMESTAMP) `
        }
  
        if (sorterQuery) {
          query += " ORDER BY " + sq + " , [UserName] asc "
        } else {
          query += ` ORDER BY UploadDateTime desc , [UserName] asc ` 
        }
  
  
      var recordset;
      var arr;
  
      const { recordset: result } = await sql.query(query);
  
      let columns = []
      recordset = result;
      
      const { recordset: coun } = await sql.query(totalQuery);
      arr = coun
     
      const obj = arr[0];
      const count = obj[""];
  
      const pages = Math.ceil(count / limit);
      const pagination = { page, pages, count };
  
  
      return res.status(200).json({
        success: true,
        result: recordset,
        pagination,
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
  };


  endpoints.filters = async (req,res) => {
    try {
  
  
    const [{recordset: EmpID}, {recordset: UserName}]  = await Promise.all([
          await sql.query(`Select DISTINCT([EmpID]) from ${exportModel}`),
          await sql.query(`Select DISTINCT([UserName]) from ${exportModel}`)
           
    ])
    
    let results = {
      EmpID,
      UserName
    }
  
  
    return res.status(200).json({
      success: true,
      result: results,
      message: "Filter Fetch Successfully",
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

  
  module.exports = endpoints;
    
  
  