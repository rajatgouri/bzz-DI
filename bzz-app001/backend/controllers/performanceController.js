const methods = require("./crudController");
var sql = require("mssql");
const endpoints = methods.crudController("WQEDCOMCProgress");


delete endpoints["list"];
const WQ1ProgressModel = "WQEDCOMCProgress";
const WQ2ProgressModel = "WQEDCOMFProgress";
const WQ1CheckmarkModel = "WQEDCOMFCheckmark";
const WQ2CheckmarkModel = "WQEDCOMCCheckmark";
const WQFeedback = "Feedback"
const UserModel = "JWT"


endpoints.list = async (req, res,) => {
    try {

        let result =  [{recordset: WQEDCOMCProgress} , {recordset: WQEDCOMFProgress, }, {recordset: feedbackProgress}, { recordset: adminlist},{ recordset: WQEDCOMFWorkProgress}, { recordset: WQEDCOMCWorkProgress}] = await Promise.all([
            await sql.query(`select * from ${WQ1ProgressModel}`),
            await sql.query(`select * from ${WQ2ProgressModel}`),
            await sql.query(`select * from ${WQFeedback}`),
            await sql.query(`SELECT * FROM ${UserModel} where  SubSection IN ('DI', 'AD') and EMPL_STATUS NOT IN ('T', 'Archive')   order by First `),
            await sql.query(`SELECT * FROM ${WQ1CheckmarkModel} `),
            await sql.query(`SELECT * FROM ${WQ2CheckmarkModel} `)            
        ])


        let queriesToExecute = []
        let EMPID = (adminlist).map(li => {
            if(! li.ManagementAccess) {
               return  li.EMPID 
            } 
        }).filter(item => item != undefined)

        queriesToExecute.push(await sql.query(`select * from TotalKPIs where EMPID IN (${EMPID.map(id => "'" + id + "'")}) ORDER BY ActionTimeStamp DESC OFFSET  0  ROWS FETCH NEXT ${EMPID.length * 6 }  ROWS ONLY`))

        result = {
            WQEDCOMCProgress,
            WQEDCOMFProgress,
            feedbackProgress,
            adminlist,
            WQEDCOMFWorkProgress,
            WQEDCOMCWorkProgress,
            kpi: (queriesToExecute[0]['recordset'])
        }

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




 

module.exports = endpoints;