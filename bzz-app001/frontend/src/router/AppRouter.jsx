import React, { lazy, Suspense } from "react";
import { Redirect, Route, Switch, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import PageLoader from "@/components/PageLoader";
import WQEDCOMF from "@/pages/WQEDCOMF";
import Reminder from "@/pages/Reminder";
import { selectAuth } from "@/redux/auth/selectors";
import { useSelector, useDispatch } from "react-redux";
import SearchPreparation from "@/pages/SearchPreparation";







const DIReminders = lazy(() =>
  import(/*webpackChunkName:'DashboardPage'*/ "@/pages/DIDashboard/Reminders")
);

const DICards = lazy(() =>
  import(/*webpackChunkName:'DashboardPage'*/ "@/pages/DIDashboard/Cards")
);

const DICalendar = lazy(() =>
  import(/*webpackChunkName:'DashboardPage'*/ "@/pages/DIDashboard/Calendar")
);

const DIAvatars = lazy(() =>
  import(/*webpackChunkName:'DashboardPage'*/ "@/pages/DIDashboard/Avatars")
);


const ChangePassword = lazy(() =>
  import(
    /*webpackChunkName:'ManagementDashboardPage'*/ "@/pages/ChangePassword"
  )
);

const ProductivityGraphs = lazy(() =>
  import(
    /*webpackChunkName:'ManagementDashboardPage'*/ "@/pages/ManagementDashboard/ProductivityGraphs"
  )
);

const PerformanceCards = lazy(() =>
  import(
    /*webpackChunkName:'ManagementDashboardPage'*/ "@/pages/ManagementDashboard/PerformanceCards"
  )
);

const ProductivityTables = lazy(() =>
  import(
    /*webpackChunkName:'ManagementDashboardPage'*/ "@/pages/ManagementDashboard/ProductivityTables"
  )
);


const ManagementMilestones = lazy(() =>
  import(/*webpackChunkName:'DashboardPage'*/ "@/pages/ManagementMilestones")
);

const ManagementRoadmap = lazy(() =>
  import(/*webpackChunkName:'DashboardPage'*/ "@/pages/ManagementRoadmap")
);

const MilestonesAndRoadmap = lazy(() =>
  import(/*webpackChunkName:'Wq5508Page'*/ "@/pages/MilestonesAndRoadmap")
);


const EpicProductivity = lazy(() =>
  import(
    /*webpackChunkName:'ManagementDashboardPage'*/ "@/pages/EpicProductivity"
  )
);

const ManagementDashboard = lazy(() =>
  import(
    /*webpackChunkName:'ManagementDashboardPage'*/ "@/pages/ManagementDashboard"
  )
);

const CalendarBoard = lazy(() =>
  import(/*webpackChunkName:'CalendarBoardPage'*/ "@/pages/CalendarBoard")
);
const TaskCalendar = lazy(() =>
  import(/*webpackChunkName:'CalendarBoardPage'*/ "@/pages/TaskCalendar")
);
const Admin = lazy(() =>
  import(/*webpackChunkName:'AdminPage'*/ "@/pages/Admin")
);

const WQEDCOMC = lazy(() =>
  import(/*webpackChunkName:'WQEDCOMCPage'*/ "@/pages/WQEDCOMC")
);

const Irb = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/Irb"));

const NoPccStudies = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/NoPccStudies"));

const Overview = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/Overview"));

const WorkAssignments = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/workAssignments"));

const IRBBudgetStatus = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/IRBBudgetStatus"));

const Iframe = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/iframe"));

const IntakeRequest = lazy(() =>
  import(/*webpackChunkName:'Denials'*/ "@/pages/IntakeRequests")
);
const Documentation = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/Documentation"));

const PredictiveBilling = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/PredictiveBilling"));

const NLPRouting = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/NLPRouting"));

const UsefulChanges = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/UsefulChanges"));

const HIMSMasterTaskList = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/HIMSMasterTaskList"));

const Pages = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/Pages"));

const CoverageGovernment = lazy(() =>
  import(
    /*webpackChunkName:'CoverageGovernmentPage'*/ "@/pages/CoverageGovernment"
  )
);

const HIMSTeamRoster = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/HIMSTeamRoster"));

const HIMSCalendarSchedule = lazy(() => import(/*webpackChunkName:'IrbPage'*/ "@/pages/HIMSUserSchedule"));


const Logout = lazy(() =>
  import(/*webpackChunkName:'LogoutPage'*/ "@/pages/Logout")
);
const NotFound = lazy(() =>
  import(/*webpackChunkName:'NotFoundPage'*/ "@/pages/NotFound")
);

const EmailLogger = lazy(() =>
  import(/*webpackChunkName:'DashboardPage'*/ "@/pages/EmailLogger")
);
    

export default function AppRouter() {

  const { current } = useSelector(selectAuth);

  const location = useLocation();
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence exitBeforeEnter initial={false}>
        {
          current.managementAccess ? 
          <Switch location={location} key={location.pathname}>
         
             <PrivateRoute path="/di-team-dashboard-reminders" component={DIReminders} exact />
              <PrivateRoute path="/di-team-dashboard-cards" component={DICards} exact />
              <PrivateRoute path="/di-team-dashboard-calendar" component={DICalendar} exact />
              <PrivateRoute path="/di-team-dashboard-avatars" component={DIAvatars} exact />

          <PrivateRoute
            path="/my-di-team"
            component={ManagementDashboard}
            exact
          />
          <PrivateRoute path="/professionals-center" component={Iframe} exact />
          <PrivateRoute path="/documentation" component={Documentation} exact />
          <PrivateRoute path="/team-calendar" component={CalendarBoard} exact />
          <PublicRoute path="/taskcalendar" component={TaskCalendar} exact />
          <PrivateRoute component={WQEDCOMF} path="/WQEDCOMF" exact />
          <PrivateRoute component={WQEDCOMC} path="/WQEDCOMC" exact />
          <PrivateRoute component={Irb} path="/irb" exact />
          <PrivateRoute component={Overview} path="/overview" exact />
          <PrivateRoute component={IRBBudgetStatus} path="/irbbudgetstatus" exact />
          <PrivateRoute component={WorkAssignments} path="/work-assignments" exact />
          <PrivateRoute component={Reminder} path="/reminders" exact />
          <PrivateRoute component={Pages} path="/pages" exact />
          <PrivateRoute component={PredictiveBilling} path="/predictive-billing" exact />
          <PrivateRoute component={NLPRouting} path="/nlp-routing" exact />
          <PrivateRoute component={UsefulChanges} path="/useful-change" exact />
          <PrivateRoute component={NoPccStudies} path="/no-pcc-studies" exact />
          <PrivateRoute component={ManagementMilestones} path="/management-milestones" exact />
          <PrivateRoute component={ManagementRoadmap} path="/management-roadmap" exact />
          <PrivateRoute component={HIMSMasterTaskList} path="/hims-master-task-list" exact />
          <PrivateRoute path="/performance-cards" component={PerformanceCards} exact/>
          <PrivateRoute path="/intake-request" component={IntakeRequest} exact />
          
          <PrivateRoute path="/productivity-metrics/graphs" component={ProductivityGraphs} exact/>
          <PrivateRoute path="/productivity-metrics/tables" component={ProductivityTables} exact/>
          <PrivateRoute component={ChangePassword} path="/change-password" exact />

          <PrivateRoute path="/epic-productivity" component={EpicProductivity} exact />

          <PrivateRoute path="/master-staff-list" component={HIMSTeamRoster} exact />
          <PrivateRoute path="/hims-calendar-schedule" component={HIMSCalendarSchedule} exact />

          <PrivateRoute path="/milestones-and-roadmap" component={MilestonesAndRoadmap} exact />
          <PrivateRoute path="/emaillogger" component={EmailLogger} exact />
          
          <PrivateRoute path="/search-preparation" component={SearchPreparation} exact />
          
          <PrivateRoute
            component={CoverageGovernment}
            path="/coverage"
            exact
          />
          
          <PrivateRoute component={Admin} path="/team-members" exact />
          <PrivateRoute component={Logout} path="/logout" exact />
          <PublicRoute path="/login" render={() => <Redirect to="/" />} />
          {/* <PublicRoute path="/" render={() => <Redirect to="/di-team-dashboard" />} /> */}
          <PublicRoute path="/" render={() => <Redirect to="/di-team-dashboard-cards" />} />

          <Route
            path="*"
            component={NotFound}
            render={() => <Redirect to="/notfound" />}
          />
        </Switch>
        :
         
        (
      <Switch location={location} key={location.pathname}>
        {/* <PrivateRoute path="/" component={} exact /> */}
        {/* <PrivateRoute path="/di-team-dashboard" component={Dashboard} exact /> */}
        <PrivateRoute path="/di-team-dashboard-reminders" component={DIReminders} exact />
              <PrivateRoute path="/di-team-dashboard-cards" component={DICards} exact />
              <PrivateRoute path="/di-team-dashboard-calendar" component={DICalendar} exact />
              <PrivateRoute path="/di-team-dashboard-avatars" component={DIAvatars} exact />
              <PrivateRoute component={ChangePassword} path="/change-password" exact />


        <PrivateRoute component={WQEDCOMC} path="/WQEDCOMC" exact />
        <PrivateRoute component={WQEDCOMF} path="/WQEDCOMF" exact />
        <PrivateRoute component={Irb} path="/irb" exact />
        <PrivateRoute component={NoPccStudies} path="/no-pcc-studies" exact />

        <PrivateRoute
          component={CoverageGovernment}
          path="/coverage"
          exact
        />
        <PrivateRoute component={Logout} path="/logout" exact />
        <PublicRoute path="/login" render={() => <Redirect to="/" />} />
        <PublicRoute path="/" render={() => <Redirect to="di-team-dashboard" />} />
        <PublicRoute path="/" render={() => <Redirect to="/di-team-dashboard-reminders" />} />

        <Route
          path="*"
          component={NotFound}
          render={() => <Redirect to="/notfound" />}
        />
      </Switch>
    

        )
        
        
        }

      
      </AnimatePresence>
    </Suspense>
  );
}
