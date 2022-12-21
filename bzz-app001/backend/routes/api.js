const express = require("express");

const { catchErrors } = require("../handlers/errorHandlers");

const router = express.Router();

const adminController = require("../controllers/adminController");
const WQEDCOMCController = require("../controllers/WQEDCOMCController");
const WQEDCOMFController = require("../controllers/WQEDCOMFController");
const irbController = require("../controllers/irbController");
const coverageGovermentController = require("../controllers/coverageGovermentController");
const billingCalendarStaffController = require("../controllers/billingCalendarStaffController");
const billingColorController = require("../controllers/billingColorWQEDCOMCController");
const billingColorWQEDCOMFController = require("../controllers/billingColorWQEDCOMFController");
const billingTeamListController = require("../controllers/billingTeamListController");
const billingReminderController = require('../controllers/billingReminderController');
const authController = require('../controllers/authController');
const WQEDCOMCLoggerController = require("../controllers/WQEDCOMCLoggerController");
const WQEDCOMFLoggerController = require("../controllers/WQEDCOMFLoggerController");
const feedbackController = require("../controllers/feedbackController");
const WQEDCOMCWorkController = require("../controllers/WQEDCOMCWorkController");
const WQEDCOMFWorkController = require("../controllers/WQEDCOMFWorkController");
const WQEDCOMCFiltersController = require("../controllers/WQEDCOMCFiltersController");

const WQEDCOMFProgressController = require("../controllers/WQEDCOMFProgressController");
const WQEDCOMFFiltersController = require("../controllers/WQEDCOMFFiltersController");
const WQEDCOMCProgressController = require("../controllers/WQEDCOMCProgressController");
const IntakeRequestController = require('../controllers/IntakeRequestController')

const BillingIrbBudgetStatusController = require("../controllers/billingIrbBudgetStatusController");
const BillingNoPccStudiesController = require("../controllers/billingNoPccStudiesController");
const coveragesLLoggerController = require('../controllers/coveragesGovernmentLoggerController');
const masterTaskListController = require("../controllers/masterTaskListController");
const himsteamrosterController = require("../controllers/himsTeamRosterController");
const himsTeamUserScheduleController = require("../controllers/himsTeamUserScheduleController");

const emailLoggerController = require("../controllers/emailLoggerController");
const epicProductivityController = require("../controllers/epicProductivityController");
const distributionController = require('../controllers/distributionController')
const EPICController = require('../controllers/epicController');
const performanceController = require('../controllers/performanceController')
const dailyCheckmarkController = require('../controllers/dailyCheckmarkController');
const totalKPIsController = require('../controllers/totalKpisController')
const settingsLoggerController = require('../controllers/settingsLoggerController');

const databaseController = require('../controllers/databaseController')
const avatarController = require('../controllers/avatarController')

const multer  = require('multer');


const storageMC = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'sharepoint/EDCOWQMCExports/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now()  + "_" + file.originalname 
    cb(null,  uniqueSuffix)
  }
})

const storageMF = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'sharepoint/EDCOWQMFExports/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now()  + "_" + file.originalname 
    cb(null,  uniqueSuffix)
  }
})

const uploadMC = multer({ storage: storageMC })
const uploadMF = multer({ storage: storageMF })

// ____________________________________ Upload _______________________________________________
router.route("/upload-file-WQEDCOMF/create").post(uploadMF.single('myFile'), catchErrors(EPICController.upload));
router.route("/upload-file-WQEDCOMC/create").post(uploadMC.single('myFile'), catchErrors(EPICController.upload));

//_____________________________________ API for coverages Governemt Logger __________________________
router.route("/settingsLogger/create").post(catchErrors(settingsLoggerController.create));


//_______________________________ Admin management_______________________________

router.route("/change-password/create").post(catchErrors(adminController.changePassword));

router.route("/admin/create").post(catchErrors(adminController.create));
// router.route("/admin/read/:id").get(catchErrors(adminController.read));
router.route("/admin/update/:id").patch(catchErrors(adminController.update));
router.route("/admin/delete/:id").delete(catchErrors(adminController.delete));
// router.route("/admin/search").get(catchErrors(adminController.search));
router.route("/admin/list").get(catchErrors(adminController.list));
router.route("/admin-findall/list").get(catchErrors(adminController.findALL));

router.route("/admin-one/list1").post(catchErrors(adminController.one));
router.route("/admin-avatar/update/:id").patch(catchErrors(adminController.updateImage));
router.route("/admin-fulllist/list").get(catchErrors(adminController.fullList));
router.route("/getuserbysection/list").get(catchErrors(adminController.getUserBySection));


// ______________________________ Epic Productivity 1 __________________________________
router.route("/epic-productivity1/list").get(catchErrors(epicProductivityController.list));


router.route("/performance/list").get(catchErrors(performanceController.list));

//_______________________________ Database _______________________________________
router.route("/database/query").post(catchErrors(databaseController.query));

router.route("/avatar-tabs/list").get(catchErrors(avatarController.tabs));
router.route("/avatar-images/list").get(catchErrors(avatarController.photos));



// ______________________________ Page Logger __________________________________
router.route("/emailLogger/list").get(catchErrors(emailLoggerController.list));
router.route("/emailuserfilter/list").get(catchErrors(emailLoggerController.userFilter));
router.route("/emailLogger1/list").get(catchErrors(emailLoggerController.list1));
router.route("/emailLogger-search/list").get(catchErrors(emailLoggerController.search));


// ______________________________User ___________________________________________
router.route("/admin/switch").post(catchErrors(authController.switch));

// router
//   .route("/admin/password-update/:id")
//   .patch(catchErrors(adminController.updatePassword));
// //list of admins ends here

//_____________________________________ API for wq5508 __________________________
// router.route("/wq5508/create").post(catchErrors(wq5508Controller.create));
// router.route("/wq5508/read/:id").get(catchErrors(wq5508Controller.read));
router.route("/WQEDCOMC/update/:id").patch(catchErrors(WQEDCOMCController.update));
router.route("/WQEDCOMC/delete/:id").delete(catchErrors(WQEDCOMCController.delete));
// router.route("/wq5508/search").get(catchErrors(WQEDCOMCController.search));
router.route("/WQEDCOMC/list1").post(catchErrors(WQEDCOMCController.list));
router.route("/WQEDCOMC-1/list").get(catchErrors(WQEDCOMCController.list1));

router.route("/WQEDCOMC-full-list/list").get(catchErrors(WQEDCOMCController.fullList));
router.route("/WQEDCOMC-full-list1/list").get(catchErrors(WQEDCOMCController.fullList1));

router.route("/WQEDCOMC-updatetime/create").post(catchErrors(WQEDCOMCController.updatetime));
router.route("/WQEDCOMC-color/create").post(catchErrors(WQEDCOMCController.updateColor));

// ______________________________EPIC ______________________________________________
router.route("/WQEDCOMC-epic/list").get(catchErrors(EPICController.list));
router.route("/WQEDCOMC-exports/create").post(catchErrors(EPICController.create));
router.route("/WQEDCOMF/delete/:id").delete(catchErrors(WQEDCOMFController.delete));
router.route("/WQEDCOMF-exports/list").get(catchErrors(WQEDCOMFController.exports));
router.route("/WQEDCOMC-exports/list").get(catchErrors(WQEDCOMCController.exports));


router.route("/WQEDCOMF-columns/list").get(catchErrors(WQEDCOMFController.columns));
router.route("/WQEDCOMF-columns/create").post(catchErrors(WQEDCOMFController.create));


router.route("/WQEDCOMC-columns/list").get(catchErrors(WQEDCOMCController.columns));
router.route("/WQEDCOMC-columns/create").post(catchErrors(WQEDCOMCController.create));


//_____________________________________ API for wq5508 Progress __________________________
router.route("/WQEDCOMCProgress/create").post(catchErrors(WQEDCOMCProgressController.create));
router.route("/WQEDCOMCProgress/update/:id").post(catchErrors(WQEDCOMCProgressController.update));

// ______________________________EPIC ______________________________________________
router.route("/WQEDCOMF-epic/list").get(catchErrors(EPICController.list));
router.route("/WQEDCOMF-exports/create").post(catchErrors(EPICController.create));



router.route("/totalkpis/list").get(catchErrors(totalKPIsController.list));
router.route("/totalkpis/read/:EMPID").get(catchErrors(totalKPIsController.get5Days));

router.route("/totalkpisyear/list").get(catchErrors(totalKPIsController.year));



//_____________________________________ API for Daily Checkmark __________________________
router.route("/dailycheckmark/list1").post(catchErrors(dailyCheckmarkController.list));
router.route("/dailycheckmark/create").post(catchErrors(dailyCheckmarkController.create));


//_____________________________________ API for Feedback __________________________
router.route("/feedback/list").get(catchErrors(feedbackController.list));
router.route("/feedback/create").post(catchErrors(feedbackController.create));


//_____________________________________ API for Work ______________________________
router.route("/WQEDCOMCWork/list").get(catchErrors(WQEDCOMCWorkController.list));
router.route("/WQEDCOMCWork/create").post(catchErrors(WQEDCOMCWorkController.create));
router.route("/WQEDCOMCWork/update/:id").patch(catchErrors(WQEDCOMCWorkController.update));


//_____________________________________ API for Work ______________________________
router.route("/WQEDCOMFWork/list").get(catchErrors(WQEDCOMFWorkController.list));
router.route("/WQEDCOMFWork/create").post(catchErrors(WQEDCOMFWorkController.create));
router.route("/WQEDCOMFWork/update/:id").patch(catchErrors(WQEDCOMFWorkController.update));


//_____________________________________ API for wq5508 Logger __________________________
router.route("/WQEDCOMCLogger/create").post(catchErrors(WQEDCOMCLoggerController.create));
router.route("/WQEDCOMCExportLogger/list").get(catchErrors(WQEDCOMCLoggerController.list));
router.route("/WQEDCOMCExportLogger-filters/list").get(catchErrors(WQEDCOMCLoggerController.filters));


//_____________________________________ API for WQEDCOMF Logger __________________________
router.route("/WQEDCOMFLogger/create").post(catchErrors(WQEDCOMFLoggerController.create));
router.route("/WQEDCOMFExportLogger/list").get(catchErrors(WQEDCOMFLoggerController.list));
router.route("/WQEDCOMFExportLogger-filters/list").get(catchErrors(WQEDCOMFLoggerController.filters));


// ____________________________________ Ditribution ___________________________
router.route("/distributions/create").post(catchErrors(distributionController.create));
router.route("/distributions-assigned/create").post(catchErrors(distributionController.assign));




router.route("/intake-request/list1").post(catchErrors(IntakeRequestController.list));
router.route("/intake-request/create").post(catchErrors(IntakeRequestController.create));
router.route("/intake-request/update/:id").patch(catchErrors(IntakeRequestController.update));
router.route("/intake-request-filters/list").get(catchErrors(IntakeRequestController.filters));
router.route("/intake-request/delete/:id").delete(catchErrors(IntakeRequestController.delete));




//_____________________________________ API for wq5508 Progress __________________________
router.route("/WQEDCOMCProgress/create").post(catchErrors(WQEDCOMCProgressController.create));
router.route("/WQEDCOMCProgress/list").get(catchErrors(WQEDCOMCProgressController.list));

//_____________________________________ API for WQEDCOMF Progress __________________________
router.route("/WQEDCOMFprogress/create").post(catchErrors(WQEDCOMFProgressController.create));
router.route("/WQEDCOMFprogress/list").get(catchErrors(WQEDCOMFProgressController.list));
router.route("/WQEDCOMF-full-list/list").get(catchErrors(WQEDCOMFController.fullList));
router.route("/WQEDCOMF-full-list1/list").get(catchErrors(WQEDCOMFController.fullList1));

router.route("/WQEDCOMF-updatetime/create").post(catchErrors(WQEDCOMFController.updatetime));
router.route("/WQEDCOMF-color/create").post(catchErrors(WQEDCOMFController.updateColor));


//_____________________________________ API for WQEDCOMF Filters __________________________
router.route("/WQEDCOMFfilters/create").post(catchErrors(WQEDCOMFFiltersController.create));
router.route("/WQEDCOMFfilters/list").get(catchErrors(WQEDCOMFFiltersController.list));
router.route("/WQEDCOMFfilters/delete/:id").delete(catchErrors(WQEDCOMFFiltersController.delete));
router.route("/WQEDCOMFfilters/update/:id").patch(catchErrors(WQEDCOMFFiltersController.update));


//_____________________________________ API for WQEDCOMC Filters __________________________
router.route("/WQEDCOMCfilters/create").post(catchErrors(WQEDCOMCFiltersController.create));
router.route("/WQEDCOMCfilters/list").get(catchErrors(WQEDCOMCFiltersController.list));
router.route("/WQEDCOMCfilters/delete/:id").delete(catchErrors(WQEDCOMCFiltersController.delete));
router.route("/WQEDCOMCfilters/update/:id").patch(catchErrors(WQEDCOMCFiltersController.update));


//_____________________________________ API for WQEDCOMF __________________________
// router.route("/wq5508/create").post(catchErrors(wq5508Controller.create));
// router.route("/wq5508/read/:id").get(catchErrors(wq5508Controller.read));
router.route("/WQEDCOMF/update/:id").patch(catchErrors(WQEDCOMFController.update));
// router.route("/wq5508/delete/:id").delete(catchErrors(wq5508Controller.delete));
// router.route("/wq5508/search").get(catchErrors(wq5508Controller.search));
router.route("/WQEDCOMF/list1").post(catchErrors(WQEDCOMFController.list));
// router.route("/WQEDCOMF/list").get(catchErrors(WQEDCOMFController.list));

router.route("/WQEDCOMF-filters/list").get(catchErrors(WQEDCOMFController.filters));
router.route("/WQEDCOMC-filters/list").get(catchErrors(WQEDCOMCController.filters));


// ____________________________________ API for himsteamroster __________________ 
router.route("/himsteamroster/list").get(catchErrors(himsteamrosterController.list));
router.route("/himsteamroster-department/list").get(catchErrors(himsteamrosterController.department));

router.route("/himsteamroster/update/:id").patch(catchErrors(himsteamrosterController.update));
router.route("/himsteamroster/create").post(catchErrors(himsteamrosterController.create));
router.route("/himsteamroster/delete/:id").delete(catchErrors(himsteamrosterController.delete));




// ____________________________________ API for himsUserSchedule __________________ 
router.route("/himsuserschedule/list").get(catchErrors(himsTeamUserScheduleController.list));
router.route("/himsuserschedule-filters/list").get(catchErrors(himsTeamUserScheduleController.filters));
router.route("/himsuserschedule/create").post(catchErrors(himsTeamUserScheduleController.create));
router.route("/himsuserschedule/delete/:id").delete(catchErrors(himsTeamUserScheduleController.delete));
router.route("/himsuserschedule/update/:id").patch(catchErrors(himsTeamUserScheduleController.update));

// ____________________________________ API for himsUserSchedule __________________ 
router.route("/himsmastertasklist/list").get(catchErrors(masterTaskListController.list));
router.route("/himsmastertasklist-filters/list").get(catchErrors(masterTaskListController.filters));
router.route("/himsmastertasklist/create").post(catchErrors(masterTaskListController.create));
router.route("/himsmastertasklist/delete/:id").delete(catchErrors(masterTaskListController.delete));
router.route("/himsmastertasklist/update/:id").patch(catchErrors(masterTaskListController.update));




//_____________________________________ API for irbs ___________________________
router.route("/irb/create").post(catchErrors(irbController.create));
router.route("/irb/delete/:id").delete(catchErrors(irbController.delete));
// router.route("/irb/read/:id").get(catchErrors(irbController.read));
router.route("/irb/update/:id").patch(catchErrors(irbController.update));
// router.route("/irb/search").get(catchErrors(irbController.search));
router.route("/irb/list").get(catchErrors(irbController.list));

//_____________________________________ API for billingCalendarStaffController __________________________
router.route("/billingcalendarstaff/list/:month/:year/:date_column").get(catchErrors(billingCalendarStaffController.list));
router.route("/billingcalendarstaff/create").post(catchErrors(billingCalendarStaffController.create));
router.route("/billingcalendarstaff/update/:id").patch(catchErrors(billingCalendarStaffController.update));
router.route("/billingcalendarstaff/delete/:id").delete(catchErrors(billingCalendarStaffController.delete));
router.route("/billingcalendarstaff1/list/:year/:date_column/:EMPID").get(catchErrors(billingCalendarStaffController.listYear));

//_____________________________________ API for billingColorController __________________________
router.route("/billingcolorWQEDCOMC/read/:id").get(catchErrors(billingColorController.read));
router.route("/billingcolorWQEDCOMC/create").post(catchErrors(billingColorController.create));
router.route("/billingcolorWQEDCOMC/update/:id").patch(catchErrors(billingColorController.update));

//_____________________________________ API for billingReminderController __________________________
router.route("/billingreminder/read/:id").get(catchErrors(billingReminderController.read));
router.route("/billingreminder/create").post(catchErrors(billingReminderController.create));
router.route("/billingreminder/update/:id").patch(catchErrors(billingReminderController.update));

//_____________________________________ API for billingColorWQEDCOMFController __________________________
router.route("/billingcolorWQEDCOMF/read/:id").get(catchErrors(billingColorWQEDCOMFController.read));
router.route("/billingcolorWQEDCOMF/create").post(catchErrors(billingColorWQEDCOMFController.create));
router.route("/billingcolorWQEDCOMF/update/:id").patch(catchErrors(billingColorWQEDCOMFController.update));

//_____________________________________ API for billingteamList __________________________
router.route("/billingteamlist/list").get(catchErrors(billingTeamListController.list));

//_____________________________________ API for coverageGoverments ___________________________
// router
//   .route("/coverageGoverment/create")
//   .post(catchErrors(coverageGovermentController.create));
// router
//   .route("/coverageGoverment/read/:id")
//   .get(catchErrors(coverageGovermentController.read));
router
  .route("/coverageGoverment/update/:id")
  .patch(catchErrors(coverageGovermentController.update));
// router
//   .route("/coverageGoverment/delete/:id")
//   .delete(catchErrors(coverageGovermentController.delete));
// router
//   .route("/coverageGoverment/search")
//   .get(catchErrors(coverageGovermentController.search));
router
  .route("/coverageGoverment/list")
  .get(catchErrors(coverageGovermentController.list));


  
//_____________________________________ API for coverages Governemt Logger __________________________
router.route("/coverageGovermentLogger/create").post(catchErrors(coveragesLLoggerController.create));


//_____________________________________ API for BillingIRBBudgetStatus ___________________________

router
  .route("/billingirbbudgetstatus/update/:id")
  .patch(catchErrors(BillingIrbBudgetStatusController.update));

router
  .route("/billingirbbudgetstatus/list")
  .get(catchErrors(BillingIrbBudgetStatusController.list));

router.route("/billingirbbudgetstatus/create").post(catchErrors(BillingIrbBudgetStatusController.create));
router.route("/billingirbbudgetstatus/delete/:id").delete(catchErrors(BillingIrbBudgetStatusController.delete));
router.route("/billingirbbudgetstatus-status-list/list").get(catchErrors(BillingIrbBudgetStatusController.fullList));
  

//_____________________________________ API for BillingNoPccStatus ___________________________

router
  .route("/billingnopccstudies/update/:id")
  .patch(catchErrors(BillingNoPccStudiesController.update));

router
  .route("/billingnopccstudies/list")
  .get(catchErrors(BillingNoPccStudiesController.list));

router.route("/billingnopccstudies/create").post(catchErrors(BillingNoPccStudiesController.create));
router.route("/billingnopccstudies/delete/:id").delete(catchErrors(BillingNoPccStudiesController.delete));
router.route("/billingnopccstudies-studies-list/list").get(catchErrors(BillingNoPccStudiesController.fullList));
  
module.exports = router;
