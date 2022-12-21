const methods = require("./crudController");
const endpoints = methods.crudController("WQEDCOMF");
const utilController = require('./utilController');
const {fitToColumn} = require('./utilController')
const writeXlsxFile = require('write-excel-file/node')
const adminContoller = require('./adminController')
const {getDateTime} = require('./utilController')

var sql = require("mssql");

delete endpoints["list"];
const Model = "WQEDCOMF";
const ColumnModel = "WQEDCOMFColumns"
const  exelFile = './excel/excel.xlsm'
const fs = require('fs')
var XLSX = require("xlsx");


endpoints.columns = async (req,res) => {
    try {

       
        const {id} = req.query
       
        let {recordset: columns} = await sql.query(
          `
          SELECT * from ${ColumnModel} where EMPID = ${id}
          `
      );
  
  
        return res.status(200).json({
          success: true,
          result: columns,
          message: "Successfully found all documents",
        });
      } catch (err) {
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
        const values = req.body;
       values.EMPID = req.admin.EMPID
            const {recordset: exists } = await sql.query(`SELECT * from ${ColumnModel} where EMPID = '${values.EMPID}'`)

            if (exists.length > 0) {

              // values.EMPID = +req.admin.EMPID;
              const { id } = req.params;
              let valuesQuery = "";
              for (key in values) {
          
                if (values[key] == 0) {
                  valuesQuery += "[" + key + "]='" + values[key] + "',";
          
                } else if (  values[key] == null || values[key] == "null" || values[key] == "") {
                  valuesQuery += "[" + key + "]= NULL" + ",";
                } else {
                  valuesQuery += "[" + key + "]='" + values[key] + "',";
                }
              }
          
              valuesQuery = valuesQuery.slice(0, -1);
            
              let updateQ = `update ${ColumnModel} set ${valuesQuery} where EMPID = ${values.EMPID}`
              await sql.query(updateQ);
          
              return res.status(200).json({
                success: true,
                result: {},
                message: "we update this document by this id: " + req.params.id,
              });
            } else {
                const columnsQ = "(" + Object.keys(values).map((m) => "[" + m + "]").toString() + ")"


                let valuesQuery = "";
                for (key in values) {
                      if (values[key] === "null") {
                          valuesQuery += "NULL" + ",";
                      } else {
                          valuesQuery += "'" + values[key] + "',";
                      }
                  }
                valuesQuery = "(" + valuesQuery.slice(0, -1) + ")" ;
              
                const insertQuery = `insert into ${ColumnModel} ${columnsQ} values ${valuesQuery}`
            
                await sql.query(insertQuery);
            
                return res.status(200).json({
                    success: true,
                    result: {},
                    message: "we added document" ,
                  });
               
            }
    } catch (err) {
        return res.status(500).json({
            success: false,
            result: null,
            message: "Oops there is an Error",
            error: err,
        });
    }
};

endpoints.list = async (req, res,) => {
    try {

        const ID = req.admin.EMPID;
        const First = req.admin.Nickname;
        const managementAccess = req.admin.ManagementAccess
        var page = req.body.page || 1;
        var filter = (req.body.filter);
        var sorter = (req.body.sorter);
        delete filter['sort']

        if (!filter['Archive']) {
            filter['Archive'] = [1]
        }

        var top10 = false;

        let filterQuery = "";
        let sorterQuery = "";

        for (key in filter) {
            if (filter[key]) {

                switch (key) {
                    case "Status": {
                        let values = filter[key];

                        if (values.indexOf('QA Review') > -1) {
                            values.push('')
                            valueQuery = values.map(v => ("'" + v + "'"))
                            filterQuery += +filter[key] !== null ? "(" + key + " IN (" + valueQuery + ") or " : "";
                            filterQuery += 'Status IS NULL) and '

                        } else {

                            valueQuery = values.map(v => ("'" + v + "'"))
                            if (values.length > 0) {
                                filterQuery += +filter[key] !== null ? key + " IN (" + valueQuery + ") and " : "";
                            }
                        }
                        break
                    }
                    case "UserAssigned": {
                        let values = filter[key];

                        if (values.indexOf(null) > -1) {
                            values.push('')
                            valueQuery = values.map(v => ("'" + v + "'"))
                            filterQuery += +filter[key] !== null ? "([" + key + "] IN (" + valueQuery + ") or " : "";
                            filterQuery += `[${key}] IS NULL) and `

                        } else {

                            valueQuery = values.map(v => ("'" + v + "'"))
                            if (values.length > 0) {
                                filterQuery += +filter[key] !== null ? "[" + key + "] IN (" + valueQuery + ") and " : "";
                            }
                        }

                        break
                    }


                    case "User": {
                        let values = filter[key];

                        if (values.indexOf(null) > -1) {
                            values.push('')
                            valueQuery = values.map(v => ("'" + v + "'"))
                            filterQuery += +filter[key] !== null ? "([" + key + "] IN (" + valueQuery + ") or " : "";
                            filterQuery += `[${key}] IS NULL) and `

                        } else {

                            valueQuery = values.map(v => ("'" + v + "'"))
                            if (values.length > 0) {
                                filterQuery += +filter[key] !== null ? "[" + key + "] IN (" + valueQuery + ") and " : "";
                            }
                        }

                        break
                    }


                    case "Edco Document Type": {

                        let values = filter[key];
                        valueQuery = values.map(v => ("'" + v + "'"))
                        filterQuery += +filter[key] !== null ? "([" + key + "] IN (" + valueQuery + ")  " : "";

                        if (values.indexOf("") > -1) {
                            filterQuery += `or [${key}] IS NULL) and `
                        } else {
                            filterQuery += ") and "
                        }

                        break;
                    }

                    case "Process Type": {
                        let values = filter[key];

                        if (values[0] == 'Top 10 $ Amount') {
                            filterQuery += "ID >= 0 and ";
                            sorterQuery += '[Sess Amount] DESC ,'
                            top10 = true

                        } else if (values[0] == 'Top 10 Aging Days') {
                            filterQuery += "ID >= 0 and ";
                            sorterQuery += '[Aging Days] DESC ,'
                            top10 = true


                        } else {
                            valueQuery = values.map(v => {
                                return ("'" + v + "'")
                            })

                            if (valueQuery.length > 0) {
                                filterQuery += filter[key] !== null ? "[" + key + "] IN (" + valueQuery + ") and " : "";
                            }
                        }

                        break
                    }
                    case "Comments": {

                        let values = filter[key];
                        if (values.length < 2 && values[0] == 0) {
                            filterQuery += key + " NOT IN ( '' )  and "
                        } else if ((values.length < 2 && values[0] == 1)) {
                            filterQuery += "(" + key + " IN ( '' ) or Comments IS NULL) and ";
                        }
                        break;
                    }

                    case "Error Tracking": {

                        let values = filter[key];
                        valueQuery = values.map(v => ("'" + v + "'"))
                        filterQuery += +filter[key] !== null ? "([" + key + "] IN (" + valueQuery + ")  " : "";

                        if (values.indexOf("") > -1) {
                            filterQuery += 'or [Error Tracking] IS NULL) and '
                        } else {
                            filterQuery += ") and "
                        }

                        break;
                    }

                    case "Archive": {

                        let values = filter[key];
                        if (values.length < 2 && values[0] == 0) {
                                filterQuery += key + " NOT IN ( '' )  and "
                        } else if ((values.length < 2 && values[0] == 1)) {
                            filterQuery += "(" + key + " IN ( '' ) or Archive IS NULL) and ";
                        }
                        
                        break;
                    }

                    case "Error Type": {

                        let values = filter[key];
                        valueQuery = values.map(v => ("'" + v + "'"))
                        filterQuery += +filter[key] !== null ? "([" + key + "] IN (" + valueQuery + ")  " : "";

                        if (values.indexOf("") > -1) {
                            filterQuery += 'or [Error Type] IS NULL) and '
                        } else {
                            filterQuery += ") and "
                        }

                        break;
                    }



                    case "Document Description": {

                        let values = filter[key];


                        valueQuery = values.filter(v => v != "").map(v => ("'" + v + "'"))
                        if (valueQuery.length > 0) {
                            filterQuery += +filter[key] != null ? "(Convert(varchar, [" + key + "])   IN (" + valueQuery + ")  " : "";

                            if (values.indexOf(null) > -1) {
                                filterQuery += 'or [Document Description] IS  NULL) and '
                            } else {
                                filterQuery += ") and "
                            }

                        }

                        break;
                    }

                    case "Document Type": {

                        let values = filter[key];
                        // valueQuery = values.map(v => ( "'" + v  + "'"))
                        valueQuery = values.filter(v => v != "").map(v => ("'" + v + "'"))
                        if (valueQuery.length > 0) {
                            filterQuery += +filter[key] != null ? "(Convert(varchar, [" + key + "]) IN (" + valueQuery + ")  " : "";
                            if (values.indexOf(null) > -1) {
                                filterQuery += 'or [Document Type] IS NULL) and '
                            } else {
                                filterQuery += ") and "
                            }

                        }

                        break;
                    }


                    case "Batch Type": {

                        let values = filter[key];
                        valueQuery = values.map(v => ("'" + v + "'"))
                        filterQuery += +filter[key] != null ? "(Convert(varchar, [" + key + "]) IN (" + valueQuery + ")  " : "";

                        if (values.indexOf(null) > -1) {
                            filterQuery += 'or [Batch Type] IS NULL) and '
                        } else {
                            filterQuery += ") and "
                        }

                        break;
                    }



                    case "Batch Capture Class": {

                        let values = filter[key];
                        valueQuery = values.map(v => ("'" + v + "'"))
                        filterQuery += +filter[key] != null ? "(Convert(varchar, [" + key + "]) IN (" + valueQuery + ")  " : "";

                        if (values.indexOf(null) > -1) {
                            filterQuery += 'or [Batch Capture Class] IS NULL) and '
                        } else {
                            filterQuery += ") and "
                        }

                        break;
                    }

                    case "Correct": {

                        let values = filter[key];
                        valueQuery = values.map(v => ("'" + v + "'"))
                        filterQuery += +filter[key] !== null ? "([" + key + "] IN (" + valueQuery + ")  " : "";

                        if (values.indexOf("") > -1) {
                            filterQuery += 'or [Correct] IS NULL) and '
                        } else {
                            filterQuery += ") and "
                        }

                        break;
                    }

                    case "Capture Location": {

                        let values = filter[key];

                        valueQuery = values.filter(v => v != "").map(v => ("'" + v + "'"))

                        if (valueQuery.length > 0) {
                            filterQuery += +filter[key] != null ? "(Convert(varchar, [" + key + "])  IN (" + valueQuery + ")  " : "";

                            if (values.indexOf(null) > -1) {
                                filterQuery += 'or [Capture Location] IS NULL) and '
                            } else {
                                filterQuery += ") and "
                            }

                        }

                        break;
                    }


                    default: {
                        filterQuery += filter[key] !== null ? (key.split(" ").length > 1 ? '[' + key + ']' : key) + " Like '%" + filter[key] + "%' and " : "";
                        break
                    }
                }
            }
        }

        filterQuery = filterQuery.slice(0, -4);


        if ( sorter.filter((sort) => sort.field == "Release Date").length == 0) {
            sorter.push({
                field: "Release Date",
                order: "descend"
            })
        }

        sorter.map((sort) => {
            sorterQuery += `[${sort.field}] ${sort.order == "ascend" ? "ASC" : "DESC"} ,`
        })


        let sq = sorterQuery.slice(0, -1)

        const limit = parseInt(req.query.items) || 100;
        const skip = page * limit - limit;

        var recordset;

        // if (managementAccess) { 
        //  Query the database for a list of all results
        var query = `select  * from ${Model} `;
        var totalQuery = `select count(*) from ${Model} `;

        if(filterQuery ) {
            query += "where " + filterQuery + " "
            totalQuery += "where " + filterQuery + " "
        }  
        
        if (sorterQuery) {
            query += " ORDER BY " + sq +  " OFFSET  "  + skip + " ROWS FETCH NEXT " + limit + " ROWS ONLY "  
        }

      
        console.log(query)
        
        const { recordset: result } = await sql.query(query);

        recordset = result
        
        const { recordset: coun } = await sql.query(totalQuery);
        arr = coun
        const obj = arr[0];
        var count = obj[""];

        if (top10) {
            count = 10
        }

        const pages = Math.ceil(count / limit);

        // Getting Pagination Object
        const pagination = { page, pages, count };

        const filters = filter;
        const sorters = sorter
        // Getting Pagination Object

        let colors = {}

        if (managementAccess) {
            const [{recordset: Done}, {recordset: Pending}, {recordset: Deferred}, {recordset: Returned}, {recordset: Misc} , {recordset: Review}]  = await Promise.all([
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Done') `),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Pending')  `),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Deferred')  `),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Returned')  `),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Misc')  `),
                await sql.query(`Select count(*) as count from ${Model} where (Status  IN ('QA Review', '') or Status  IS NULL)  `),
            ])    

            colors['Done'] = Done;
            colors['Pending'] = Pending;
            colors['Deferred'] = Deferred;
            colors['Returned'] = Returned;
            colors['Misc'] = Misc;
            colors['QA Review'] = Review;

        } else {
            const [{recordset: Done}, {recordset: Pending}, {recordset: Deferred}, {recordset: Returned}, {recordset: Misc} , {recordset: Review}]  = await Promise.all([
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Done') and UserAssigned IN ('${First}')  ` ),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Pending') and UserAssigned IN ('${First}')  `),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Deferred') and UserAssigned IN ('${First}')  `),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Returned') and UserAssigned IN ('${First}')  `),
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Misc') and UserAssigned IN ('${First}')  `),
                await sql.query(`Select count(*) as count from ${Model} where (Status IN ('QA Review', '') or Status  IS NULL) and UserAssigned IN ('${First}')  `),
            ])    

            colors['Done'] = Done;
            colors['Pending'] = Pending;
            colors['Deferred'] = Deferred;
            colors['Returned'] = Returned;
            colors['Misc'] = Misc;
            colors['QA Review'] = Review;

        }
        return res.status(200).json({
            success: true,
            result: recordset,
            pagination,
            filters,
            sorters,
            colors,
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

const getObject = (obj) => {
    return  obj.map((o) => {
 
        

        return {
            'UserAssigned': ( o['UserAssigned'] ? o['UserAssigned'] .toString() : ''),
            'Correct' : (o['Correct'] ? o['Correct'] .toString() : ''),
            'Error': (o['Error'] ? o['Error'] .toString() : ''),
            'Error Type': (o['Error Type'] ? o['Error Type'] .toString() : ''),
            'Error Tracking': (o['Error Tracking'] ? o['Error Tracking'] .toString() : ''),
            'Comments': (o['Comments'] ? o['Comments'] .toString() : ''),
            'Batch Id': (o['Batch Id'] ? o['Batch Id'] .toString() : ''),
            'Med Rec':(o['Med Rec'] ? o['Med Rec'] .toString() : ''),
            'Account Number': (o['Account Number'] ? o['Account Number'] .toString() : ''),
            'Patient Name':(o['Patient Name'] ? o['Patient Name'] .toString() : ''),
            'Capture Location':( o['Capture Location'] ? o['Capture Location'] .toString() : ''),
            'Batch Capture Class':(o['Batch Capture Class'] ? o['Batch Capture Class'] .toString() : ''),
            'Batch Type':(o['Batch Type'] ? o['Batch Type'] .toString() : ''),
            'Edco Document Type':( o['Edco Document Type'] ? o['Edco Document Type'] .toString() : ''),
            'Document Type':(o['Document Type'] ? o['Document Type'] .toString() : ''),
            'Document Description':( o['Document Description'] ? o['Document Description'] .toString() : ''),
            'Document Id': ( o['Document Id'] ? o['Document Id'] .toString() : ''),
            'Release Date': (o['Release Date'] ? o['Release Date'].toISOString().replace('.000Z', '') .toString() : ''),
            'Order Number': (o['Order Number'] ? o['Order Number'] .toString() : ''),
            'Order Date':(o['Order Date'] ? new Date(o['Order Date']).toISOString().split('.')[0].split('T')[0] .toString() : ''),
            'Chart Correction':( o['Chart Correction'] ? o['Chart Correction'] .toString() : ''),
            'Document Pages':( o['Document Pages'] ? o['Document Pages'] .toString() : ''),
            'Status':(o['Status'] ? o['Status'] .toString() : ''),
            'User':(o['User'] ? o['User'] .toString() : ''),
            'UploadDateTime':( o['UploadDateTime'] ? new Date(o['UploadDateTime']).toISOString().split('.')[0].split('T').join(' ')  : ''),
            'StartTimeStamp':(o['StartTimeStamp'] ? new Date(o['StartTimeStamp']).toISOString().split('.')[0].split('T').join(' ')  : ''),
            'FinishTimeStamp':( o['FinishTimeStamp'] ? new Date(o['FinishTimeStamp'] ).toISOString().split('.')[0].split('T').join(' ') : ''),
            'Duration':(o['Duration'] ? o['Duration'] .toString() : ''),
            'Archive':(o['Archive'] ? o['Archive'].toString() : ''),
        }
     })
 }



//  const getHeaders = () => {

//     return [
//         {filterButton: true, key:"Correct", name:"Correct", id: "Correct" , style : {width: 250} },
//         {filterButton: true, key:"Error", name:"Error", id: "Error",width: 100},
//         {filterButton: true, key:"Error Type", name:"Error Type", id: "Error Type",width: 150},
//         {filterButton: true, key:"Error Tracking", name:"Error Tracking", id: "Error Tracking",width: 200},
//         {filterButton: true, key:"Comments", name:"Comments", id: "Comments",width: 100},
//         {filterButton: true, key:"Batch Id", name:"Batch Id", id: "Batch Id",width: 100},
//         {filterButton: true, key:"Med Rec", name:"Med Rec", id: "Med Rec",width: 100},
//         {filterButton: true, key:"Account Number", name:"Account Number", id: "Account Number",width: 100},
//         {filterButton: true, key:"Patient Name", name:"Patient Name", id: "Patient Name",width: 100},
//         {filterButton: true, key:"Capture Location", name:"Capture Location", id: "Capture Location",width: 100},
//         {filterButton: true, key:"Batch Capture Class", name:"Batch Capture Class", id: "Batch Capture Class",width: 100},
//         {filterButton: true, key:"Batch Type", name:"Batch Type", id: "Batch Type",width: 100},
//         {filterButton: true, key:"Edco Document Type", name:"Edco Document Type", id: "Edco Document Type",width: 100},
//         {filterButton: true, key:"Document Type", name:"Document Type", id: "Document Type",width: 100},
//         {filterButton: true, key:"Document Description", name:"Document Description", id: "Document Description",width: 100},
//         {filterButton: true, key:"Release Date", name:"Release Date", id: "Release Date",width: 100},
//         {filterButton: true, key:"Document Id", name:"Document Id", id: "Document Id",width: 100},
//         {filterButton: true, key:"Order Number", name:"Order Number", id: "Order Number",width: 100},
//         {filterButton: true, key:"Order Date", name:"Order Date", id: "Order Date",width: 100},
//         {filterButton: true, key:"Chart Correction", name:"Chart Correction", id: "Chart Correction",width: 100},
//         {filterButton: true, key:"Document Pages", name:"Document Pages", id: "Document Pages",width: 100},
//         {filterButton: true, key:"User Assigned", name:"User Assigned", id: "UserAssigned",width: 100},
//         {filterButton: true, key:"Status", name:"Status", id: "Status",width: 100},
//         {filterButton: true, key:"User", name:"User", id: "User",width: 100},
//         {filterButton: true, key:"Upload Date Time", name:"Upload Date Time", id: "UploadDateTime",width: 100},
//         {filterButton: true, key:"Start Time Stamp", name:"Start Time Stamp", id: "StartTimeStamp",width: 100},
//         {filterButton: true, key:"Finish Time Stamp", name:"Finish Time Stamp", id: "FinishTimeStamp",width: 100},
//         {filterButton: true, key:"Duration", name:"Duration", id: "Duration",width: 100} ,
//         { filterButton: true, key: "Archive", name: "Archive", id: "Archive", width: 100 }

//     ]

//  }


 

 function copy(oldPath, newPath) {
	return new Promise((resolve, reject) => {
		const readStream = fs.createReadStream(oldPath);
		const writeStream = fs.createWriteStream(newPath);

		readStream.on('error', err => reject(err));
		writeStream.on('error', err => reject(err));

		writeStream.on('close', function () {
			resolve();
		});

		readStream.pipe(writeStream);
	})
}


endpoints.exports = async (req, res) => {
    try {

        const  cp_excel = `./excel/excel${Date.now()}.xlsm`
        await copy(exelFile, cp_excel)

        var workbook = XLSX.readFile(cp_excel, {bookVBA: true});
        
        await fs.unlinkSync(cp_excel)
        
        let { recordset: objects1 } = await sql.query(`select * from ${Model}  where Status IN ('QA Review') and Archive IS NULL`)

        let data = await getObject(objects1)
        let worksheet = XLSX.utils.json_to_sheet(data);
        worksheet['!autofilter']={ref:"A1:AC1"};
        worksheet['!cols'] = fitToColumn(data[0])
        await XLSX.utils.book_append_sheet(workbook, worksheet, 'All');
        
        let users = await adminContoller.getUsers()

        users = users.filter((u) => u.ManagementAccess != 1)

        let p = new Promise(async (resolve, reject) => {

            for (let i = 0; i < users.length; i++) {
                let { recordset: objects1 } = await sql.query(`select * from ${Model} where UserAssigned = '${users[i].Nickname}' and Status IN ('QA Review') `)

                if (objects1.length > 0) {  
                    data = await getObject(objects1)

                    const worksheet = XLSX.utils.json_to_sheet(data);
                    worksheet['!autofilter']={ref:"A1:AC1"};
                    worksheet['!cols'] = fitToColumn(data[0])

                    XLSX.utils.book_append_sheet(workbook, worksheet, users[i].Nickname);


                }

                if (i == users.length - 1) {


                    data = await utilController.getErrorType()
                    worksheet = XLSX.utils.json_to_sheet(data);
                    worksheet['!autofilter']={ref:"A1:A1"};
                    worksheet['!cols'] = [{width: 25}]   
                    await XLSX.utils.book_append_sheet(workbook, worksheet, 'Error Type');
                    
                    let { recordset: objects2 } = await sql.query(`select * from ${Model}  where Status IN ('QA Review') AND Archive = 'Yes'`)

                    if (objects2.length > 0) {
                        data = await getObject(objects2)
                        worksheet = XLSX.utils.json_to_sheet(data);
                        worksheet['!autofilter']={ref:"A1:AC1"};
                        worksheet['!cols'] = fitToColumn(data[0])
                        await  XLSX.utils.book_append_sheet(workbook, worksheet, 'Archive');
                       
                    }
                    

                    (workbook.Workbook.Sheets[0].Hidden = 1)
                    resolve(true)
                }

            }

        })


        await p

        
        

        let file = `WQEDCOMF_SmartApp_${utilController.getDateTime().toString().replace(/-/g, '_').replace(/:/g, '_').split('.')[0]}.xlsx`

        let filename = `./public/WQ/` + file

        // await workbook.xlsx.writeFile(filename)
        XLSX.writeFile(workbook, filename);

        return res.status(200).json({
            success: true,
            result: {
                name: file,
                file: 'https://' + (process.env.SERVER + ":" + process.env.SERVER_PORT + "/WQ/" + file)
            },
            message: "Successfully exports",
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



endpoints.fullList = async (req, res) => {

    try {
        const First = req.admin.Nickname;
        const managementAccess = req.admin.ManagementAccess

        let result1 = {}

        if (managementAccess) {
            //  Query the database for a list of all results

         

            const [
                { recordset: chargesProcessedCount },
                { recordset: chargesReviewCount }, 
                { recordset: chargesReview }, 
                { recordset: notToReview }, 
                { recordset: document }, 
                { recordset: documentPages }, 
                {recordset: pagesProcessed},
                {recordset: documentPagesProcessed}
            ] = await Promise.all([
                await sql.query(`Select count(*) as count from ${Model} where Status IN ('Done')`),
                await sql.query(`Select count(*) as count from ${Model} where Status NOT IN ('Done')`),
                await sql.query(`Select * from ${Model} where Status NOT IN ('Done')`),
                await sql.query(`Select count(*) as count from ${Model} where [Status] = 'QA Review'`),
                await sql.query(`SELECT COUNT(*) as count from ${Model} where  Status NOT IN  ('Done')`), //Documents
                await sql.query(`SELECT SUM([Document Pages]) as count from ${Model} where  Status NOT IN  ('Done')`), // documentPages
                await sql.query(`SELECT SUM([Document Pages]) as count from ${Model} where Status = 'Done' and [ActionTimeStamp] > '${utilController.getDateTime().split('T')[0]}' `), //pagesProcessed
                await sql.query(`SELECT COUNT(*) as count from ${Model} where Status = 'Done' and [ActionTimeStamp] > '${getDateTime().split('T')[0]}' `), //documentProcessed


            ])

           

            let data = {
                chargesProcessedCount,
                chargesReviewCount,
                chargesReview,
                notToReview,
                document,
                documentPages,
                pagesProcessed : pagesProcessed? pagesProcessed: 0,
                documentPagesProcessed
            }

            result1 = {
                data,
                username: First
            }



        } else {
            const [
                { recordset: chargesProcessedCount },
                { recordset: chargesReviewCount }, 
                { recordset: chargesReview }, 
                { recordset: notToReview }, 
                { recordset: document }, 
                { recordset: documentPages }, 
                {recordset: pagesProcessed},
                {recordset: documentPagesProcessed}
            ] = await Promise.all([
                await sql.query(`Select count(*) as count from ${Model} where UserAssigned IN ('${First}') and  Status IN ('Done')`),
                await sql.query(`Select count(*) as count from ${Model} where UserAssigned IN ('${First}') and Status NOT IN ('Done')`),
                await sql.query(`Select * from ${Model} where UserAssigned IN ('${First}') and Status NOT IN ('Done')`),
                await sql.query(`Select count(*) as count from ${Model} where UserAssigned IN ('${First}') and [Status] = 'QA Review'`),
                await sql.query(`SELECT COUNT(*) as count from ${Model} where  UserAssigned IN ('${First}') and Status NOT IN  ('Done')`), //Documents
                await sql.query(`SELECT SUM([Document Pages]) as count from ${Model} where UserAssigned IN ('${First}') and Status NOT IN  ('Done')`), // documentPages
                await sql.query(`SELECT SUM([Document Pages]) as count from ${Model} where [User] IN ('${First}') and Status = 'Done' and [ActionTimeStamp] > '${utilController.getDateTime().split('T')[0]}' `), //pagesProcessed
                await sql.query(`SELECT COUNT(*) as count from ${Model} where [User] IN ('${First}') and Status = 'Done' and [ActionTimeStamp] > '${getDateTime().split('T')[0]}' `), //documentProcessed


            ])



            let data = {
                chargesProcessedCount,
                chargesReviewCount,
                chargesReview,
                notToReview,
                document,
                documentPages,
                pagesProcessed: pagesProcessed ? pagesProcessed : 0,
                documentPagesProcessed
            }


            result1 = {
                data,
                username: First
            }
            result1 = {
                data,
                username: First
            }

        }

        return res.status(200).json({
            success: true,
            // result: recordset,
            result: result1,
            // pagination,
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


endpoints.fullList1 = async (req, res) => {
    try {
        const ID = req.admin.EMPID;
        const First = req.admin.Nickname;
        const managementAccess = req.admin.ManagementAccess
        const page = req.query.page || 1;

        const limit = parseInt(req.query.items) || 100;
        const skip = page * limit - limit;

        var recordset;
        var arr;

        if (managementAccess) {
            //  Query the database for a list of all results
            let result = await sql.query(
                `select * from ${Model}  OFFSET `
            );
            recordset = result.recordset
            const countList = await sql.query(
                `SELECT COUNT(*) from  ${Model}`
            );
            arr = countList.recordset
        } else {
            let result = await sql.query(
                `select * from ${Model} where UserAssigned = '${First}'`
            );
            recordset = result.recordset
            const countList = await sql.query(
                `SELECT COUNT(*) from  ${Model} where UserAssigned = '${First}'`
            );
            arr = countList.recordset

        }

        const obj = arr[0];
        const count = obj[""];

        const pages = Math.ceil(count / limit);

        // Getting Pagination Object
        const pagination = { page, pages, count };
        // Getting Pagination Object
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


endpoints.delete = async (req, res) => {
    try {

        await sql.query(`delete ${Model}`)

        return res.status(200).json({
            success: true,
            result: [],
            message: "deleted documents",
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


endpoints.filters = async (req, res) => {

    try {

        const First = req.admin.Nickname;
        const managementAccess = req.admin.ManagementAccess

        let columns = [
            { COLUMN_NAME: "Batch Capture Class" },
            { COLUMN_NAME: "Capture Location" },
            { COLUMN_NAME: "Batch Type" },
            { COLUMN_NAME: "Edco Document Type" },
            { COLUMN_NAME: "Document Type" },
            { COLUMN_NAME: "Document Description" },
            { COLUMN_NAME: "UserAssigned" },
            { COLUMN_NAME: "User" },


        ]

        columns.unshift({ COLUMN_NAME: "Total" })

        let queriesToExecute = []

        let result1 = {}

        if (managementAccess) {
            //  Query the database for a list of all results
            queriesToExecute.push(await sql.query(`Select count(*) from ${Model}`))


            for (let i = 0; i < columns.length; i++) {
                if (columns[i].COLUMN_NAME != "Total") {
                    queriesToExecute.push(await sql.query(`Select Distinct([${columns[i].COLUMN_NAME}]) from ${Model} `))
                }
            }

            const filterResult = await Promise.all(queriesToExecute)

            // filters
            let filters = (filterResult.map((result, index) => ({ column: columns[index].COLUMN_NAME, recordset: result.recordset })))

            result1 = {
                filters,
                username: First
            }

        } else {

            queriesToExecute.push(await sql.query(`Select count(*) from ${Model} `))

            for (let i = 0; i < columns.length; i++) {
                if (columns[i].COLUMN_NAME != "Total") {
                    console.log(`Select Distinct([${columns[i].COLUMN_NAME}]) from ${Model}  where UserAssigned = '${First}'`)

                    queriesToExecute.push(await sql.query(`Select Distinct([${columns[i].COLUMN_NAME}]) from ${Model}  where UserAssigned = '${First}'`))
                }
            }

            const filterResult = await Promise.all(queriesToExecute)

            // filters
            let filters = (filterResult.map((result, index) => ({ column: columns[index].COLUMN_NAME, recordset: result.recordset })))

            result1 = {
                filters,
                username: First
            }

        }


        return res.status(200).json({
            success: true,
            // result: recordset,
            result: result1,
            // pagination,
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


// endpoints.updateColor = async (req, res) => {
//     try {

//         const First = req.admin.Nickname;

//         var { selectedRows, data } = (req.body)

//         let values = { Color: data.color, Status: data.text, ActionTimeStamp: utilController.getDateTime(), User: First }


//         let valuesQuery = "";
//         for (key in values) {
//             valuesQuery += (key == 'User' ? "[User]" : key) + "='" + values[key] + "',";
//         }

//         valuesQuery = valuesQuery.slice(0, -1);
//         await sql.query(`update ${Model} set ${valuesQuery} where ID IN (${selectedRows.map((id) => "'" + id + "'")})`);

//         // await sql.query(`update ${Model} set `)

//         return res.status(200).json({
//             success: true,
//             result: [],
//             message: "Success update color",
//         });
//     } catch (err) {
//         console.log(err)
//         return res.status(500).json({
//             success: false,
//             result: [],
//             message: "Oops there is error",
//             error: err,
//         });
//     }
// }

endpoints.updateColor = async (req, res) => {
    try {

        const First = req.admin.First;

        var { items, selectedRows, data, selectedRowID } = (req.body)

        let values = { Color: data.color, Status: data.text, ActionTimeStamp: utilController.getDateTime(), User: First }

        if(data.text == 'QA Review') {
            values['StartTimeStamp'] = null
            values['FinishTimeStamp'] = null
            values['Duration'] = null
        }

        let valuesQuery = "";
        for (key in values) {
            if(values[key] == null) {
                valuesQuery += (key == 'User' ? "[User]" : key) + "= NULL,";
            } else {
                valuesQuery += (key == 'User' ? "[User]" : key) + "='" + values[key] + "',";
            }
        }

        valuesQuery = valuesQuery.slice(0, -1);
        await sql.query(`update ${Model} set ${valuesQuery} where ID IN (${selectedRows.map((id) => "'" + id + "'")})`);

        // await sql.query(`update ${Model} set `)

        return res.status(200).json({
            success: true,
            result: [],
            message: "Success update color",
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


endpoints.update = async (req,res) => {
    try {
        // Find document by id and updates with the required fields
        const values = req.body;
        const id = req['params']['id'];// please do not update this line
        let valuesQuery = "";
        for (key in values) {
          valuesQuery += (key == 'User' ? "[User]" : "[" + key + "]" )  + "='" + values[key] + "',";
        }
    
        valuesQuery = valuesQuery.slice(0, -1);
        let updateQuery = `update ${Model} set ${valuesQuery} where ID = ${id}`
        await sql.query(updateQuery);
    
        return res.status(200).json({
          success: true,
          result: {},
          message: "we update this document by this id: " + id,
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

endpoints.updatetime = async (req, res) => {
    try {
        // Find document by id and updates with the required fields
        const values = req.body;

        const id = values.id;// please do not update this line
        const mrn = values['Batch Id']
        const status = values['Status']
        const correct = values['Correct']
        const errorType = values['Error Type']
        delete values['Status']
        delete values['Batch Id']
        delete values['Correct']
        delete values['Error Type']

        let valuesQuery = "";
        for (key in values) {
            if (values[key] == null) {
                valuesQuery += key + "=" + null + ",";

            } else if (key != 'id') {
                valuesQuery += key + "='" + values[key] + "',";
            }
        }

        valuesQuery = valuesQuery.slice(0, -1);

            let q = ''
            let r = ''
            if (status.indexOf('All') > -1) {
                r  = `update ${Model} set Error='No' , Correct='Yes'  where [Batch Id]  IN ('${mrn}')   and (Status IN ('QA Review', 'Returned') or Status IS NUll)  and UserAssigned IS NOT NULL  and FinishTimeStamp IS NULL and Correct IS NULL`
                await sql.query(r);
                q = `update ${Model} set ${valuesQuery} where [Batch Id]  IN ('${mrn}')   and (Status IN ('QA Review', '') or Status IS NUll)  and UserAssigned IS NOT NULL  and FinishTimeStamp IS NULL`
                 await sql.query(q);
                
            } else {

                r  = `update ${Model} set Error='No' , Correct='Yes' where ID IN ('${id}')  and (Status IN ('QA Review', 'Returned') and Correct IS NULL)`
                await sql.query(r);
                q = `update ${Model} set ${valuesQuery} where ID IN ('${id}') and (Status IN ('QA Review', 'Pending', 'Returned', 'Misc', 'Deferred', '') or Status IS NUll) and UserAssigned IS NOT NULL `
                await sql.query(q);
                
            }


        

        return res.status(200).json({
            success: true,
            result: {},
            message: "we update this document by this id: " + id,
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
