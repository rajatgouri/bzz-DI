const methods = require("./crudController");
const endpoints = methods.crudController("TotalKPIs");
var sql = require("mssql");

delete endpoints["list"];
const Model = "TotalKPIs";

endpoints.list = async (req, res) => {
  try {
    const page = req.query.page || 1;

    const limit = parseInt(req.query.items) || 99;
    const skip = page * limit - limit;
    const order = req.query.order || "DESC";

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


    var query = `select  * from ${Model} `;
    var totalQuery = `select count(*) from ${Model} `;

      if (filterQuery) {
        query += `where ActionTimeStamp < CURRENT_TIMESTAMP and ActionTimeStamp > DATEADD(Year, -1, CURRENT_TIMESTAMP) `
        totalQuery += `where ActionTimeStamp < CURRENT_TIMESTAMP and ActionTimeStamp > DATEADD(Year, -1, CURRENT_TIMESTAMP) `
      }

      if (sorterQuery) {
        query += " ORDER BY " + sq + " , [User] asc "
      } else {
        query += ` ORDER BY ActionTimeStamp desc , [User] asc ` 
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
  


endpoints.get5Days = async (req, res,) => {
    try {

    const {EMPID} = req.params;
    const {recordset: result} = await sql.query(`select * from ${Model} where EMPID = '${EMPID}' ORDER BY ActionTimeStamp DESC OFFSET  0  ROWS FETCH NEXT 5 ROWS ONLY`)    
    return res.status(200).json({
        success: true,
        result: result,
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


endpoints.year = async (req, res,) => {
  try {

  const {user} = req.query;

    let recordsets = [] 

    if (user == undefined) {
      const {recordset: result} = await sql.query(`
      SELECT *  FROM ${Model}
      where ActionTimeStamp < CURRENT_TIMESTAMP and ActionTimeStamp > DATEADD(Year, -1, CURRENT_TIMESTAMP) ORDER BY  ActionTimeStamp DESC , [User] Asc `)    
    
      let dates = ([...new Set(result.map(d => {
        return d['ActionTimeStamp'].toISOString().split('T')[0]
      }))])

      dates = dates.slice(0, dates.length - 1)

      let columns = []
       dates.map((date) => {
        let item  = result.filter((data) => data.ActionTimeStamp.toISOString().split('T')[0] == date)

        item.map((i) => {
        columns.push({
            WQEDCOMCPagesProcessed: i.WQEDCOMCPagesProcessed ? i.WQEDCOMCPagesProcessed : 0,
            WQEDCOMFPagesProcessed: i.WQEDCOMFPagesProcessed ? i.WQEDCOMFPagesProcessed: 0,
            WQEDCOMCDocumentProcessed: i.WQEDCOMCDocumentProcessed ? i.WQEDCOMCDocumentProcessed : 0,
            WQEDCOMFDocumentProcessed: i.WQEDCOMFDocumentProcessed ? i.WQEDCOMFDocumentProcessed: 0,
            
            User: i.User,
            ActionTimeStamp: date
          })
        })


        
      })

      recordsets = columns
    } else  if(user != 'All') {
      const {recordset: result} = await sql.query(`
      SELECT *  FROM ${Model}
      where [User] = '${user}' and ActionTimeStamp < CURRENT_TIMESTAMP and ActionTimeStamp > DATEADD(Year, -1, CURRENT_TIMESTAMP) ORDER BY ActionTimeStamp DESC`)    
      
      recordsets = result
      
      
    } 
    
    else {
      var  {recordset: result} = await sql.query(`
      SELECT *  FROM ${Model}
      where  ActionTimeStamp < CURRENT_TIMESTAMP and ActionTimeStamp > DATEADD(Year, -1, CURRENT_TIMESTAMP) ORDER BY ActionTimeStamp DESC`)    
      
      let dates = ([...new Set(result.map(d => {
        return d['ActionTimeStamp'].toISOString().split('T')[0]
      }))])


      result = dates.map((date) => {
        let item  = result.filter((data) => data.ActionTimeStamp.toISOString().split('T')[0] == date)

        let WQEDCOMCPagesProcessed = item.reduce((a,b) => a+ b['WQEDCOMCPagesProcessed'], 0)
        let WQEDCOMFPagesProcessed = item.reduce((a,b) => a+  b['WQEDCOMFPagesProcessed'], 0)

        return {
          WQEDCOMCPagesProcessed,
          WQEDCOMFPagesProcessed,
          ActionTimeStamp: date
        }
      })

      recordsets = result 
    }
  
  return res.status(200).json({
      success: true,
      result: recordsets,
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
 

module.exports = endpoints;
