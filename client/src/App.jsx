import ContactDetails from "./components/ContactDetails";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="w-screen flex justify-center">
      <ToastContainer autoClose={1000} />
      <ContactDetails />
    </div>
  );
}

export default App;
