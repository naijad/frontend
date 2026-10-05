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
          {/* =========================
              AUTHENTICATION
          ========================= */}

          <Route path="/" element={<Landing />} />

          <Route path="/login" element={<Login />} />

          <Route path="/signup" element={<Signup />} />

          <Route path="/onboarding" element={<Onboarding />} />

          {/* =========================
              MAIN NAVIGATION
          ========================= */}

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

          {/* =========================
              TRANSFER FLOW
          ========================= */}

          <Route path="/transfer/confirm" element={<TransferConfirmation />} />

          <Route path="/transfer/pin" element={<TransferPin />} />

          <Route path="/transfer/processing" element={<TransferProcessing />} />

          <Route path="/transfer/success" element={<TransferSuccess />} />

          {/* =========================
              TRANSACTIONS
          ========================= */}

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

          {/* =========================
              PROFILE
          ========================= */}

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

          {/* =========================
              PASSWORD
          ========================= */}

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

          {/* Catch-all — unknown / not-yet-built routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}
