const methods = require("./crudController");
const endpoints = methods.crudController("WQEDCOMFCheckmark");
const Util = require('./utilController')

var sql = require("mssql");

const Model = "WQEDCOMFCheckmark";
const calendarModal = "CalendarStaff";
const userModal = "JWT";
const progressModel = 'WQEDCOMFProgress'
const wqModal = 'WQEDCOMF'


delete endpoints["update"];
delete endpoints['list'];


const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']


setInterval(() => {
  (async () => {


  // Badge Disappear code  
    Util.BadgeDisappearAfter48Hours(Model)

    //  ---------------------------------------  5 day set days to 0 ------------------
    Util.ResetDays(userModal, Model)
  
    //  ----------------------------------- absent code get tick mark -----------------------
    Util.Absent(calendarModal, userModal ,Model, cb => {
      clearData(cb)
    })


    
    //  ---------------------------------  Update data -------------------
    Util.UpdateDailyData(progressModel, userModal, wqModal);

    // Original userAssigned 
    // Util.UpdateOriginalUserAssigned(wqModal);

    Util.DailyCheckmark()

    Util.addDataToKPIs('JWT', 'WQEDCOMCProgress', 'WQEDCOMFProgress');
    
    Util.checkmark1(Model, 'JWT')
    //  ---------------------------------  Update data -------------------
    Util.UpdateDailyData(progressModel, userModal, wqModal)

    Util.UpdateHoursData(progressModel, userModal, wqModal)

  })()

}, 50000)

// functionality for add tick mark and weeks
async function clearData(EMPID) {

  const interval = setInterval(async () => {
    
    Util.checkmark(Model, EMPID, cb => {
      clearInterval(interval)
    })

  }, 30000)
}



endpoints.list = async (req, res) => {
  try {

    const { id } = req.params;
    const { recordset } = await sql.query(
      `select ROW_NUMBER() OVER(ORDER BY (SELECT 1)) AS SNo, * from ${Model}`
    );

    return res.status(200).json({
      success: true,
      result: recordset,
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
};

endpoints.update = async (req, res) => {
  try {

    var date = new Date();
    var utcDate = new Date(date.toUTCString());
    utcDate.setHours(utcDate.getHours() - 7);
    var usDate = new Date(utcDate)
    var timestamp = new Date(usDate.setHours(48)).toISOString();


    const { id } = req.params;
    const values = req.body;
    values.ActionTimeStamp = timestamp

    let valuesQuery = "";
    for (key in values) {
      if (values[key]) {
        valuesQuery += key + "='" + values[key] + "',";
      } else {
        valuesQuery += key + "=" + null + ",";

      }
    }

    valuesQuery = valuesQuery.slice(0, -1);
    const { recordset } = await sql.query(
      `update ${Model} set ${valuesQuery} where EMPID = ${id}`
    );

    return res.status(200).json({
      success: true,
      result: recordset,
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


endpoints.create = async (req, res) => {
  try {
    const values = req.body;
    values.EMPID = req.admin.EMPID;
    const first = req.admin.StartDay;
    const currentDay = (Object.keys(values)[0])
    let lastDay = (days[days.indexOf(first) + 4])

    let workingDays = days.slice(days.indexOf(first), days.indexOf(first) + 5)
    if (workingDays.indexOf(currentDay) < 0) {
      return res.status(200).json({
        success: true,
        result: {},
        message: "Not a working day!",
      });
    }

    const columnsQ = "(" + Object.keys(values).toString() + ")"

    let { recordsets } = await sql.query(`Select * from ${Model} where EMPID = ${values.EMPID}`);

    if (recordsets[0].length > 0) {

      if (recordsets[0][0][currentDay]) {
        return res.status(200).json({
          success: true,
          result: {},
          message: "Already has a value for " + currentDay,
        });
      }

      let valuesQuery = "";
      for (key in values) {
        valuesQuery += key + "='" + values[key] + "',";
      }

      valuesQuery = valuesQuery.slice(0, -1);

      await sql.query(`update ${Model} set ${valuesQuery} where EMPID = ${values.EMPID}`);

      if (currentDay == lastDay) {
        clearData(req.admin.EMPID)
      }

      return res.status(200).json({
        success: true,
        result: {},
        message: "we update this document by this EMPID: " + values.EMPID,
      });

    } else {

      let valuesQuery = "";
      for (key in values) {
        if (values[key] === "null") {
          valuesQuery += "NULL" + ",";
        } else {
          valuesQuery += "'" + values[key] + "',";
        }
      }
      valuesQuery = "(" + valuesQuery.slice(0, -1) + ")";

      const insertQuery = `insert into ${Model} ${columnsQ} values ${valuesQuery}`

      await sql.query(insertQuery);

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


module.exports = endpoints;


