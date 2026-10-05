import MobileLayout from "./layouts/MobileLayout";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <>
      <MobileLayout>
        <AppRoutes />
      </MobileLayout>
      <Toaster />
    </>
  );
}

export default App;
