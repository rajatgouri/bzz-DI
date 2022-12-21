

import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import { DashboardLayout } from "@/layout";
import { request } from "@/request";
import TopCard from "@/components/TopCard";
import Socket from "../../socket";
import PageLoader from "@/components/PageLoader";
import { selectAuth } from "@/redux/auth/selectors";
import { useSelector } from "react-redux";



export default function Cards() {
  const [reminders, setReminders] = useState("");
  const [cardData, setCardData] = useState([]);
  const [admins, setAdmins] = useState([])
  const { current } = useSelector(selectAuth);

  useEffect(() => {
    Socket.on('updated-wqs', () => {
      load();
    });

    load();
  }, [])

  const load = () => {
    (async () => {


      const performance = await request.list('performance');

      let {WQEDCOMCProgress, WQEDCOMFProgress, feedbackProgress, adminlist, WQEDCOMFWorkProgress =  [], WQEDCOMCWorkProgress = [], kpi} = performance.result

      let WQEDCOMC = WQEDCOMCProgress;
      let WQEDCOMF = WQEDCOMFProgress;
      let feedback = feedbackProgress;
      let WQEDCOMCWork = WQEDCOMCWorkProgress;
      let WQEDCOMFWork = WQEDCOMFWorkProgress;
      let admin = adminlist;

      let liAdmin = (admin.filter(list => list.ManagementAccess == 1 && list.First != "Admin" && list.First != "Jason" && list.SpecialAccess != 1))
      let user  =  admin.filter(list => list.ManagementAccess != 1 )

      let b = liAdmin[liAdmin.findIndex((li) => li.Nickname == "Carmen")];
      liAdmin[liAdmin.findIndex((li) => li.Nickname == "Carmen")] = liAdmin[liAdmin.findIndex((li) => li.Nickname == "Ashleigh")];
      liAdmin[liAdmin.findIndex((li) => li.Nickname == "Ashleigh")] = b;

      setAdmins(liAdmin)

      let merged = [];

      WQEDCOMC = (WQEDCOMC.sort((a,b) => {
        return a.First.localeCompare(b.First)
      }))      

      if (current.managementAccess == 0) {
        let emp = user.filter((u) => u.EMPID == current.EMPID)[0]
        user =user.filter((u) => u.EMPID != current.EMPID)
  
        user.unshift(emp)
      }
   


      for (let i = 0; i < user.length; i++) {
        let KPI = kpi.filter(k => k.EMPID == user[i].EMPID)
      
       let obj = {
        WQEDCOMCKPI: (KPI.map(res => ({
          value: res.WQEDCOMCPagesProcessed,
          year: res.ActionTimeStamp.split('T')[0].substr(5,10).replace('-', '/') 
        }))).splice(0,5), 
        WQEDCOMFKPI: (KPI.map(res => ({
          value: res.WQEDCOMFPagesProcessed,
          year: res.ActionTimeStamp.split('T')[0].substr(5,10).replace('-', '/') 
        }))).splice(0,5),
        WQEDCOMCDOCKPI: (KPI.map(res => ({
          value: res.WQEDCOMCDocumentProcessed,
          year: res.ActionTimeStamp.split('T')[0].substr(5,10).replace('-', '/') 
        }))).splice(0,5), 
        WQEDCOMFDOCKPI: (KPI.map(res => ({
          value: res.WQEDCOMFDocumentProcessed,
          year: res.ActionTimeStamp.split('T')[0].substr(5,10).replace('-', '/') 
        }))).splice(0,5),
        
       }  

      console.log(obj)

        merged.push({
          EMPID: user[i].EMPID,
          WQEDCOMC: WQEDCOMC.filter(w=> w.EMPID == user[i].EMPID)[0],

          WQEDCOMCKPI: obj.WQEDCOMCKPI.reverse(),
          WQEDCOMFKPI: obj.WQEDCOMFKPI.reverse(),
          WQEDCOMCDOCKPI: obj.WQEDCOMCDOCKPI.reverse(),
          WQEDCOMFDOCKPI: obj.WQEDCOMFDOCKPI.reverse(),
          user: user[i],
          WQEDCOMF: WQEDCOMF.filter(wq => wq.EMPID == user[i].EMPID)[0],
          feedback: feedback.filter(f => f.EMPID == user[i].EMPID)[0],
          WQEDCOMCWork: WQEDCOMCWork.filter(w => w.EMPID == user[i].EMPID)[0],
          WQEDCOMFWork: WQEDCOMFWork.filter(w => w.EMPID == user[i].EMPID)[0],

        });
      }

      setCardData(merged)


    })()
  }

  const ratingChanged = async (id, rating) => {
    const feedback = await request.create("feedback", { EMPID: id, Stars: rating });
    if (feedback.success) {
      notification.success({ message: "Feedback given successfully!" })
    }
  }


  const dashboardStyles = {
    content: {
      "boxShadow": "none",
      "padding": "35px",
      "width": "100%",
      "overflow": "auto",
      "background": "#eff1f4"
    },
    section: {
      minHeight: "100vh",
      maxHeight: "100vh",
      minWidth: "1300px"
    }

  }

  return (
    <DashboardLayout style={dashboardStyles}>
      {
        cardData.length > 0 ?
          <Row gutter={[20, 20]}style={{ width: "100%", display: "block", marginLeft: "0px" }}>
            <Col className="" style={{ width: "100%", textAlign: "left", padding: "0px"  }}>
              <div
                className="whiteBox shadow"
                style={{ color: "#595959", fontSize: 13 }}
              >

                <Row gutter={[24, 24]} className="texture">
                  {
                    admins && admins.map((admin) => {
                      return <Col style={{ width: "20%", height: "142px" }}>
                        <div
                          className="pad5 strong"
                          style={{ textAlign: "left" }}
                        >
                          <h3 style={{ color: "#22075e", margin: "3px auto", fontSize: "10px !important", textAlign: "center" }} className="header">

                            {admin.Nickname}

                          </h3>

                          <div style={{ textAlign: "center", height: "55px", marginBottom: "7px" }}>
                            {
                              admin && admin.Avatar && admin.Avatar != "null"  ?
                                <img src={admin.Avatar} className="user-avatar scale2"></img>
                                : null
                            }
                          </div>

                        </div>
                      </Col>
                    })
                  }


                  
                <Col  style={{ width: "260px", position: "absolute", right: "0px", display: "flex" ,height: "142px"}}>
                      <span  className="topbar-header">Management</span>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
          : null
      }

      <div className="space30"></div>

      <Row gutter={[20, 20]}>

        {
          cardData.length > 0 ?
            cardData.map((data) => {
              return <TopCard
                EMPID={data.EMPID}
                user={data.user}
                KPI= {{
                  WQEDCOMF :data.WQEDCOMFKPI,
                  WQEDCOMC : data.WQEDCOMCKPI,
                  WQEDCOMCDOC: data.WQEDCOMCDOCKPI,
                  WQEDCOMFDOC: data.WQEDCOMFDOCKPI 
                }}
                feedback={data.feedback}
                WQEDCOMCWorkDone={data.WQEDCOMCWork}
                showCalendar={false}
                WQEDCOMFWorkDone={data.WQEDCOMFWork}
                title={data?.user?.Nickname}
                kpi1={data?.WQEDCOMC?.KPI}
                kpi2={data?.WQEDCOMF?.KPI}
                percent1={data?.WQEDCOMC?.ChargesProcessed}
                percent2={data?.WQEDCOMF?.ChargesProcessed}
                amountWQEDCOMF={data?.WQEDCOMF?.Amount ? JSON.parse(data.WQEDCOMF.Amount) : []}
                amountWQEDCOMC={data?.WQEDCOMC?.Amount ? JSON.parse(data.WQEDCOMC.Amount) : []}
                agingDaysWQEDCOMF={data?.WQEDCOMF?.AgingDays ? JSON.parse(data.WQEDCOMF.AgingDays) : []}
                agingDaysWQEDCOMC={data?.WQEDCOMC?.AgingDays ? JSON.parse(data.WQEDCOMC.AgingDays) : []}
                onRatingChanged={(id, rating) => ratingChanged(id, rating)}
                notes={() => { }}
              />
            })

            :
            <PageLoader />
        }
      </Row>
    </DashboardLayout>
  );
}
