
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Onboarding from "../pages/Onboarding/Onboarding";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";

import Dashboard from "../pages/Dashboard/Dashboard";
import Transfer from "../pages/Transfer/Transfer";
import Transactions from "../pages/Transactions/Transactions";
import Analytics from "../pages/Dashboard/Analytics";

import Profile from "../pages/Profile/Profile";
import AppPreferences from "../pages/Profile/AppPreferences";
import PersonalInformation from "../pages/Profile/PersonalInformation";
import Security from "../pages/Profile/Security";
import HelpSupport from "../pages/Profile/HelpSupport";
import Notifications from "../pages/Profile/Notifications";

import ChangePassword from "../pages/Profile/Security/Password/ChangePassword";
import PasswordChangeSuccess from "../pages/Profile/Security/Password/PasswordChangeSuccess";

import TransferConfirmation from "../pages/Transfer/TransferConfirmation";
import TransferPin from "../pages/Transfer/TransferPin";
import TransferProcessing from "../pages/Transfer/TransferProcessing";
import TransferSuccess from "../pages/Transfer/TransferSuccess";

import Airtime from "../pages/Airtime/Airtime";
import AirtimeConfirmation from "../pages/Airtime/AirtimeConfirmation";
import AirtimePin from "../pages/Airtime/AirtimePin";
import AirtimeProcessing from "../pages/Airtime/AirtimeProcessing";
import AirtimeSuccess from "../pages/Airtime/AirtimeSuccess";

import Data from "../pages/Data/Data";
import DataConfirmation from "../pages/Data/DataConfirmation";
import DataPin from "../pages/Data/DataPin";
import DataProcessing from "../pages/Data/DataProcessing";
import DataSuccess from "../pages/Data/DataSuccess";

import TransactionDetails from "../pages/Transactions/TransactionDetails";
import TransactionPin from "../pages/Transactions/TransactionPin";
import ChangeTransactionPin from "../pages/ChangeTransactionPin";
import ResetTransactionPin from "../pages/ResetTransactionPin";

import MainLayout from "../layouts/MainLayout";

import { ThemeProvider } from "../context/ThemeContext";
import Landing from "../pages/Landing";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          {/* AUTHENTICATION */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* MAIN NAVIGATION */}
          <Route
            path="/dashboard"
            element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            }
          />

          <Route
            path="/transactions"
            element={
              <MainLayout>
                <Transactions />
              </MainLayout>
            }
          />

          <Route
            path="/transfer"
            element={
              <MainLayout>
                <Transfer />
              </MainLayout>
            }
          />

          <Route
            path="/analytics"
            element={
              <MainLayout>
                <Analytics />
              </MainLayout>
            }
          />

          <Route
            path="/profile"
            element={
              <MainLayout>
                <Profile />
              </MainLayout>
            }
          />

          {/* TRANSFER FLOW */}
          <Route
            path="/transfer/confirm"
            element={<TransferConfirmation />}
          />
          <Route path="/transfer/pin" element={<TransferPin />} />
          <Route
            path="/transfer/processing"
            element={<TransferProcessing />}
          />
          <Route
            path="/transfer/success"
            element={<TransferSuccess />}
          />

          {/* AIRTIME FLOW */}
          <Route path="/airtime" element={<Airtime />} />
          <Route
            path="/airtime/confirm"
            element={<AirtimeConfirmation />}
          />
          <Route path="/airtime/pin" element={<AirtimePin />} />
          <Route
            path="/airtime/processing"
            element={<AirtimeProcessing />}
          />
          <Route
            path="/airtime/success"
            element={<AirtimeSuccess />}
          />

          {/* DATA — MOCK CATALOGUE FOR NOW */}
         {/* DATA FLOW */}
            <Route
              path="/data"
              element={
                <MainLayout>
                  <Data />
                </MainLayout>
              }
            />
            <Route path="/data/confirm" element={<DataConfirmation />} />
            <Route path="/data/pin" element={<DataPin />} />
            <Route path="/data/processing" element={<DataProcessing />} />
            <Route path="/data/success" element={<DataSuccess />} />
            
          {/* TRANSACTIONS */}
          <Route
            path="/transactions/details"
            element={
              <MainLayout>
                <TransactionDetails />
              </MainLayout>
            }
          />

          <Route
            path="/transaction-pin"
            element={
              <MainLayout>
                <TransactionPin />
              </MainLayout>
            }
          />

          <Route
            path="/transaction-pin/change"
            element={
              <MainLayout>
                <ChangeTransactionPin />
              </MainLayout>
            }
          />

          <Route
            path="/transaction-pin/reset"
            element={
              <MainLayout>
                <ResetTransactionPin />
              </MainLayout>
            }
          />

          {/* PROFILE */}
          <Route
            path="/profile/preferences"
            element={
              <MainLayout>
                <AppPreferences />
              </MainLayout>
            }
          />

          <Route
            path="/profile/personal"
            element={
              <MainLayout>
                <PersonalInformation />
              </MainLayout>
            }
          />

          <Route
            path="/profile/notifications"
            element={
              <MainLayout>
                <Notifications />
              </MainLayout>
            }
          />

          <Route
            path="/profile/security"
            element={
              <MainLayout>
                <Security />
              </MainLayout>
            }
          />

          <Route
            path="/profile/help"
            element={
              <MainLayout>
                <HelpSupport />
              </MainLayout>
            }
          />

          {/* PASSWORD */}
          <Route
            path="/profile/security/password"
            element={
              <MainLayout>
                <ChangePassword />
              </MainLayout>
            }
          />

          <Route
            path="/profile/security/password/success"
            element={<PasswordChangeSuccess />}
          />

          {/* CATCH ALL */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}