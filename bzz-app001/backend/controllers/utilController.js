var sql = require("mssql");
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat'];

const DailyCheckmarkModal = "DailyCheckmark"

// var date = new Date();
// date.setDate(date.getDate('2021-12-06') - 1);
// console.log(date)

exports.getDateTime = () => {
  
    var date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    var hours = (new Date(date).getHours())
    var minutes = (new Date(date).getMinutes())
    var seconds = (new Date(date).getSeconds())
    var offset = (new Date(date).getTimezoneOffset())

    var year = (new Date(date).getFullYear())
    var month = (new Date(date).getMonth())
    var currentDate = (new Date(date).getDate())

    var fullDate = year


    if (month < 10) {
      month = ('0' + (month + 1))
      fullDate += "-" + month

    } else {
      month = (month + 1)
      fullDate += "-" + month
    }

    if (hours < 10) {
      hours = ('0' + hours.toString() )
    } else {
      hours = (hours)
    }

    if (minutes < 10) {
      minutes = ('0' + minutes)
    } else {
      minutes = (minutes )
    }

    if (seconds < 10) {
      seconds = ('0' + seconds)
    } else {
      seconds = (seconds )
    }


    if (currentDate < 10) {
      currentDate = ('-0' + currentDate)
      fullDate += currentDate
    } else {
      currentDate = ('-' + currentDate)
      fullDate += currentDate
    }


    return (fullDate+ "T"+ hours + ":" + minutes + ":" + seconds  + "." +   "480Z" )

}

    
exports.checkmark =  async (Model, EMPID, cb) =>  {
  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    const hours = (new Date(date).getHours())
    const minutes = (new Date(date).getMinutes())

    if (hours == 23 && minutes == 50) {
      let { recordset: arr } = await sql.query(
        `select * from ${Model} where EMPID = ${EMPID}`
      );

      for (let i = 0; i < arr.length; i++) {
        if (arr[i].Total < 4) {

          let sum = (arr[i]['Mon'] ? arr[i]['Mon'] : 0) + (arr[i]['Tue'] ? arr[i]['Tue'] : 0) + (arr[i]['Wed'] ? arr[i]['Wed'] : 0) + (arr[i]['Thu'] ? arr[i]['Thu'] : 0) + (arr[i]['Fri'] ? arr[i]['Fri'] : 0) + (arr[i]['Sat'] ? arr[i]['Sat'] : 0) + (arr[i]['Sun'] ? arr[i]['Sun'] : 0);
          let updateQuery = `update ${Model} set Mon = 0, Tue =0, Wed=0, Thu=0, Fri=0, Sat=0, Sun=0, Week${(arr[i].Total == null || arr[i].Total == 0) ? 1 : arr[i].Total + 1}=${sum >= 5 ? 1 : 0}, Total=${((arr[i].Total == null || arr[i].Total == 0) ? 1 : arr[i].Total + 1)} where ID = ${arr[i].ID}`
          await sql.query(updateQuery);
        }

        if (arr[i].Total + 1 >= 4) {

          let { recordset: arr1 } = await sql.query(
            `select * from ${Model} where EMPID = ${EMPID}`
          );
    
          let sum = (arr1[i]['Week1'] ? arr1[i]['Week1'] : 0) + (arr1[i]['Week2'] ? arr1[i]['Week2'] : 0) + (arr1[i]['Week3'] ? arr1[i]['Week3'] : 0) + (arr1[i]['Week4'] ? arr1[i]['Week4'] : 0);
          let badge = 0
          if (sum == 4) {
            badge = 1
          }
          await sql.query(
            `update ${Model} set Mon = 0, Tue =0, Wed=0, Thu=0, Fri=0, Sat=0, Sun=0, Week1 = 0 , Week2= 0 , Week3 = 0, Week4 = 0, Total=0, Badge=${badge}  where ID = ${arr1[i].ID}`
          );
        }

      }
      cb(true)
    }
}


exports.checkmark1 =  async (Model, userModel) =>  {

    let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    const day = (new Date(date).getDay())
    const hours = (new Date(date).getHours())
    const minutes = (new Date(date).getMinutes())

    if (day == 5 && hours == 23 && minutes == 58) {

      const { recordset : result} = await sql.query(
        `select * from ${userModel} where ManagementAccess != 1`
      );

      result.map(async (user) => {

      let EMPID = user.EMPID;
      let { recordset: arr } = await sql.query(
        `select * from ${Model} where EMPID = ${EMPID}`
      );



        let firstDay = user[0].StartDay;

        let workingDays = days.slice(days.indexOf(firstDay), days.indexOf(firstDay) + 5)

        if (workingDays.indexOf(days[day]) < 0) {
          return
        }

      for (let i = 0; i < arr.length; i++) {
        if (arr[i].Total < 4) {
          
          let sum = (arr[i]['Mon'] ? arr[i]['Mon'] : 0) + (arr[i]['Tue'] ? arr[i]['Tue'] : 0) + (arr[i]['Wed'] ? arr[i]['Wed'] : 0) + (arr[i]['Thu'] ? arr[i]['Thu'] : 0) + (arr[i]['Fri'] ? arr[i]['Fri'] : 0) + (arr[i]['Sat'] ? arr[i]['Sat'] : 0) + (arr[i]['Sun'] ? arr[i]['Sun'] : 0);
          if(sum > 0) {
            let updateQuery = `update ${Model} set Mon = 0, Tue =0, Wed=0, Thu=0, Fri=0, Sat=0, Sun=0, Week${(arr[i].Total == null || arr[i].Total == 0) ? 1 : arr[i].Total + 1}=${sum >= 5 ? 1 : 0}, Total=${((arr[i].Total == null || arr[i].Total == 0) ? 1 : arr[i].Total + 1)} where ID = ${arr[i].ID}`
            await sql.query(updateQuery);
          }
          
        }

        if (arr[i].Total + 1 == 4) {
          let { recordset: arr1 } = await sql.query(
            `select * from ${Model} where EMPID = ${EMPID}`
          );
    
          let sum = (arr1[i]['Week1'] ? arr1[i]['Week1'] : 0) + (arr1[i]['Week2'] ? arr1[i]['Week2'] : 0) + (arr1[i]['Week3'] ? arr1[i]['Week3'] : 0) + (arr1[i]['Week4'] ? arr1[i]['Week4'] : 0);
          let badge = 0
          if (sum == 4) {
            badge = 1
          }
          await sql.query(
            `update ${Model} set Mon = 0, Tue =0, Wed=0, Thu=0, Fri=0, Sat=0, Sun=0, Week1 = 0 , Week2= 0 , Week3 = 0, Week4 = 0, Total=0, Badge=${badge}  where ID = ${arr1[i].ID}`
          );
        }
      }
      })
    }
}


exports.BadgeDisappearAfter48Hours = async (Model, cb) => {
  // badge disappers code
  var date1 = new Date();
  var utcDate1 = new Date(date1.toUTCString());
  utcDate1.setHours(utcDate1.getHours() - 7);
  var usDate = new Date(utcDate1)

  const { recordset: arr } = await sql.query(
    `select * from ${Model}`
  );


  for (let i = 0; i < arr.length; i++) {
    if ((usDate - arr[i].ActionTimeStamp) > 0) {
      await sql.query(
        `update ${Model} set AdminAssignedBadge = ${null}, ActionTimeStamp = ${null} where ID = ${arr[i].ID}`
      );
    }
  }
}

exports.ResetDays = async (userModel, Model) => {
    let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    const hours = (new Date(date).getHours())
    const minutes = (new Date(date).getMinutes())
    const day = (new Date(date).getDay())
    const year = (new Date(date).getFullYear())

    if (day == 5 && hours == 23 && minutes == 55) {

      const { recordset: user } = await sql.query(
        `select * from ${userModel}`
      );

      user.map(async (u) => {
        const { recordset } = await sql.query(
          `update ${Model} set Mon = 0, Tue =0, Wed=0, Thu=0, Fri=0, Sat=0, Sun=0 where EMPID = ${u.EMPID}`
        );
      })
    }
}

exports.Absent = async (calendarModel , userModel, Model, cb) => {
 
    let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    const hours = (new Date(date).getHours())
    const minutes = (new Date(date).getMinutes())
    const day = (new Date(date).getDay())
    const year = (new Date(date).getFullYear())
    var month = (new Date(date).getMonth())
    var currentDate = (new Date(date).getDate())

    var fullDate = year

    if (month < 9) {
      month = ('0' + month + 1)
    } else {
      month = (month + 1)
      fullDate += "-" + month
    }

    if (currentDate < 10) {
      currentDate = ('-0' + currentDate)
      fullDate += currentDate
    } else {
      currentDate = ('-' + currentDate)
      fullDate += currentDate
    }

    if (hours == 08 && minutes == 00) {
      const { recordset: result } = await sql.query(
        `SELECT * FROM  ${calendarModel} WHERE month(WhenPosted) = ${month} and year(WhenPosted)= ${year}`
      );

      let getTodayResults = (result.filter(res => res['WhenPosted'].toISOString().split("T")[0] == fullDate));

      getTodayResults.map(async (res) => {
        const { recordset: user } = await sql.query(
          `select * from ${userModel}  where EMPID = '${res.LoginNumber}'`
        );

        if (user[0]) {

        const EMPID = (user[0].EMPID)

        let firstDay = user[0].StartDay;
        let lastDay = (days[days.indexOf(firstDay) + 4])

        let workingDays = days.slice(days.indexOf(firstDay), days.indexOf(firstDay) + 5)

        if (workingDays.indexOf(days[day]) < 0) {
          return
        }

        await sql.query(
          `update ${Model} set ${days[day]} = 1  where EMPID = ${EMPID}`
        );

        if (days[day] == lastDay) {
          cb(EMPID)
        }
      }

      })
    }
}

exports.addWeekDataToKPIs = async (userModel= 'JWT' ) => {

  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())
  const day = (new Date(date).getDay())

  
  if(day == 6 && hours == 06 && minutes == 01) {
    const { recordset } = await sql.query(
      `select * from ${userModel} where ManagementAccess != 1 and SubSection = 'DI' and EMPL_STATUS NOT IN ('T', 'Archive')`
    );
  
    recordset.map(async (u) => {  

        await sql.query(`
        INSERT INTO WeeklyKPIs 
        
        SELECT 
        '${u.EMPID}',
        '${u.Nickname}',
        SUM([WQEDCOMCPagesProcessed]) as WQEDCOMCPagesProcessed,
		    SUM([WQEDCOMFPagesProcessed]) as WQEDCOMFPagesProcessed,
        SUM([WQEDCOMCDocumentProcessed]) as WQEDCOMCDocumentProcessed,
        SUM([WQEDCOMFDocumentProcessed]) as WQEDCOMFDocumentProcessed,
        CURRENT_TIMESTAMP as ActionTimeStamp
        from TotalKPIs where ActionTimeStamp  
        BETWEEN DATEADD(DAY, -7, GETDATE()) AND 
        DATEADD(DAY, 1, GETDATE()) AND 
        [User] = '${u.Nickname}' 
       
        `)
    

    })
  }

}


exports.addDataToKPIs = async (userModel, progressModel1, progressModel2 ) => {

 

  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())

  if(hours == 23 && minutes == 55) {
    const { recordset } = await sql.query(
      `select * from ${userModel} where ManagementAccess != 1 and EMPL_STATUS NOT IN ('T' , 'Archive')`
    );
  
    var date1 = new Date();
    date1.setDate(date1.getDate(this.getDateTime().split('T')[0]) - 1);

    let day = date1.getDay()
    date1 = date1.toISOString().split('T')[0]
      
    recordset.map(async (u) => {
  
      let workingDays = days.slice(days.indexOf(u.StartDay), days.indexOf(u.StartDay) + 5)
  
      // console.log(u)
      if (workingDays.indexOf(days[day]) < 0) {
        return 
      }

      const [{recordset: wq1}, {recordset: wq2}]= await Promise.all([
        await sql.query(`Select KPI, EMPID from ${progressModel1} where EMPID = ${u.EMPID}` ),
        await sql.query(`Select KPI, EMPID from ${progressModel2} where EMPID = ${u.EMPID}`)
      ])
  

      if(wq1.length>0 && wq2.length>0) {
        let wq1Data = wq1[0]['KPI'] ? JSON.parse(wq1[0]['KPI']) : null 
        let wq2Data = wq2[0]['KPI'] ? JSON.parse(wq2[0]['KPI']) : null
  

       let {recordset: entry } =  await sql.query(`Select EMPID from TotalKPIs where EMPID = ${u.EMPID} and ActionTimeStamp In ('${date1}')` )
        if(entry.length > 0) {
          return 
        }

        await sql.query(`Insert into TotalKPIs (EMPID, [User],  WQEDCOMCPagesProcessed, WQEDCOMFPagesProcessed, WQEDCOMCDocumentProcessed, WQEDCOMFDocumentProcessed, ActionTimeStamp) values 
        (
          '${u.EMPID}',
          '${u.Nickname}',
          '${wq1Data && wq1Data['totalProcess'] ? wq1Data['totalProcess'] : 0}',
          '${wq2Data && wq2Data['totalProcess'] ? wq2Data['totalProcess'] : 0}',
          '${wq1Data && wq1Data['totalDocProcessed'] ? wq1Data['totalDocProcessed'] : 0}',
          '${wq2Data && wq2Data['totalDocProcessed'] ? wq2Data['totalDocProcessed'] : 0}',
          '${date1}'  
        )`)
  
      }
    })
  }

}




exports.UpdateDailyData = async (progressModel, userModel, wqModel) => {

  const update =  async () => {

    const { recordset } = await sql.query(
      `select * from ${userModel} where ManagementAccess != 1`
    );


    recordset.map(async (u) => {
      const { recordset: wqList } = await sql.query(
        `select * from ${wqModel} where UserAssigned = '${u.Nickname}'`
      );

      let dP = (wqList.filter(item => item.Status != "Done" ).length / (wqList.length  == 0 ? 1 : wqList.length) );
      let pP = (wqList.filter(item => item.Status == "Done" ).length / (wqList.length  == 0 ? 1 : wqList.length));


      await sql.query(
        `update ${progressModel} set ChargesProcessed = ${(pP * 100).toFixed(2)}, ChargesToReview = ${(dP * 100).toFixed(2)} , KPI = null where EMPID = ${u.EMPID}`
      );
    })
  }

  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())

  if(hours == 00 && minutes == 15) {
    update()
  }
    
}

exports.UpdateHoursData = async (progressModel, userModel, Model) => {


  
  const update =  async () => {
    const { recordset } = await sql.query(
      `select * from ${userModel} where ManagementAccess != 1`
    );
    
   
    
    var date1 = new Date();
    date1.setDate(date1.getDate(this.getDateTime().split('T')[0]) -1);
    date1 = date1.toISOString().split('T')[0]
    
    let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    const hours = (new Date(date).getHours())


    recordset.map(async (u) => {
     
      var [
        { recordset: chargesProcessedCount },
        { recordset: chargesReviewCount }, 
        { recordset: chargesReview }, 
        { recordset: notToReview }, 
        { recordset: document }, 
        { recordset: documentPages }, 
        {recordset: pagesProcessed},
        {recordset: documentPagesProcessed}
    ] = await Promise.all([
        await sql.query(`Select count(*) as count from ${Model} where UserAssigned IN ('${u.Nickname}') and  Status IN ('Done')`),
        await sql.query(`Select count(*) as count from ${Model} where UserAssigned IN ('${u.Nickname}') and Status NOT IN ('Done')`),
        await sql.query(`Select * from ${Model} where UserAssigned IN ('${u.Nickname}') and Status NOT IN ('Done')`),
        await sql.query(`Select count(*) as count from ${Model} where UserAssigned IN ('${u.Nickname}') and [Status] = 'QA Review'`),
        await sql.query(`SELECT COUNT(*) as count from ${Model} where  UserAssigned IN ('${u.Nickname}') and Status NOT IN  ('Done')`), //Documents
        await sql.query(`SELECT SUM([Document Pages]) as count from ${Model} where UserAssigned IN ('${u.Nickname}') and Status NOT IN  ('Done')`), // documentPages
        await sql.query(`SELECT SUM([Document Pages]) as count from ${Model} where [User] IN ('${u.Nickname}') and Status = 'Done' and [ActionTimeStamp] > '${this.getDateTime().split('T')[0]}' `), //pagesProcessed
        await sql.query(`SELECT COUNT(*) as count from ${Model} where [User] IN ('${u.Nickname}') and Status = 'Done' and [ActionTimeStamp] > '${this.getDateTime().split('T')[0]}' `), //documentProcessed


    ])

   


    let data = {
        chargesProcessedCount,
        chargesReviewCount,
        chargesReview,
        notToReview,
        document,
        documentPages,
        pagesProcessed: pagesProcessed ? pagesProcessed: 0,
        documentPagesProcessed
    }
    
   chargesProcessedCount = data.chargesProcessedCount[0]["count"] == 0 ? 0 :  (data.chargesProcessedCount[0]["count"] / data.document[0]["count"] )  
    chargesToReviewCount = data.chargesReviewCount[0]["count"]
  
   
    
      await sql.query(
        `update ${progressModel} set ChargesProcessed = ${(chargesProcessedCount * 100).toFixed(2)}, ChargesToReview = ${chargesToReviewCount} , KPI = '{"totalProcess": ${pagesProcessed[0]['count'] ? pagesProcessed[0]['count']  :0}, "totalDocProcessed": ${documentPagesProcessed[0]['count'] ? documentPagesProcessed[0]['count'] :0}}'   where EMPID = ${u.EMPID}`
      );

    })
  }

  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  const minutes = (new Date(date).getMinutes())
  if( minutes % 10 == 0  ) {
    update()
  }

  
}

exports.GetSortOrder = (prop) => {    
  return function(a, b) {    
      if (a[prop] > b[prop]) {    
          return 1;    
      } else if (a[prop] < b[prop]) {    
          return -1;    
      }    
      return 0;    
  }    
}

exports.fitToColumn = (columnObject) => {

  let obj = []
  let preObj =   {
      'Account Number': 10,
      'Batch ID': 10,
      'Patient Name': 25,
      'Location': 5,
      'Capture Location': 15,
      'Document Pages':5,
      'Edco Document Type': 15,
      'Document Type': 14,
      'Document Description': 45,
      'Correct (Y?N)': 15,
      'Error Tracking': 10,
      'Document Id': 30,
      'Order Number': 10,
      'Order Date': 15,
      'Comments': 20,
      'Release Date': 15,
      'Med Rec': 10,
      'Batch Type': 10,
      'Doc Pages': 3,
      'Batch Capture Class': 10 
    }
  
  columns  = Object.keys(columnObject)
  for (let i in columns) {


    if (preObj[columns[i]]) {
      obj.push({width: preObj[columns[i]]})

    } else {
      
      obj.push({width: columns[i].length + 5})

    }
  }

  return obj
}   

exports.getErrorType = async () => {
  
  return [
    {'Error Type': 'Wrong Patient'},
    {'Error Type': 'Wrong DocType'},
    {'Error Type': 'Wrong DOS'},
    {'Error Type': 'Wrong Encounter/Visit'},
    {'Error Type': 'Wrong Order'},
  ]
}


exports.UpdateOriginalUserAssigned = async (Model) => {

  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  let day = new Date(date).getDay()

  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())

  if(hours == 7 && minutes == 05) {
    const {recordset: result} = await sql.query(`select * from ${Model} where (Status IN ('QA Review', '' ) or Status IS NULL)`);

    for (let i=0; i<result.length ; i++) {
      await sql.query(`update ${Model} set OriginalUserAssigned = '${result[i].UserAssigned}' where   OriginalUserAssigned IS NULL `);
   
    }
  }
    
}


exports.DailyCheckmark = async () => {
  let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  let day = new Date(date).getDay()

  const hours = (new Date(date).getHours())
  const minutes = (new Date(date).getMinutes())


  if(hours == 23 && minutes == 50) {
    const [{recordset: WQEDCOMCcheckmark} ,{recordset: WQEDCOMFcheckmark} ] = await  Promise.all([
      await sql.query(
        `select * from WQEDCOMCCheckmark`
      ),
      await sql.query(
        `select * from WQEDCOMFCheckmark`
      )
  
    ])
    
    var currentDate =  this.getDateTime().split('T')[0]
  
    let count = WQEDCOMCcheckmark.length
    
    
    
    for(let i=0;i<count; i++) {
      if (WQEDCOMCcheckmark[i][days[day]] && WQEDCOMFcheckmark[i][days[day]]) {
        sql.query(`insert into ${DailyCheckmarkModal} (EMPID,Date, Checked) values ('${WQEDCOMCcheckmark[i].EMPID}', '${currentDate}', 1)`);
      } else {
          sql.query(`insert into ${DailyCheckmarkModal} (EMPID,Date, Checked) values ('${WQEDCOMCcheckmark[i].EMPID}', '${currentDate}', 0)`);
      }
    
    }  
  }
  

}